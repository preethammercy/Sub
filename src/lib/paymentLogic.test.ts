import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MERCHANT_DISPLAY_NAME,
  MERCHANT_UPI_ID,
  PAYMENT_WINDOW_SECONDS,
  buildUpiPaymentUri,
  calculateCommission,
  calculateMarginPercent,
  calculateSavingsPercent,
  computeAnalyticsSummary,
  computeRemainingSeconds,
  formatCountdown,
  formatPlanChipLabel,
  isPaymentWindowExpired,
  resolveDbPersistenceMode,
  resolveProductPlan,
  resolveRedisConfigFromEnv,
  validateUtrNumber,
} from './paymentLogic';
import { createSeedProducts } from '../server/seedData';
import { Order, Product } from '../types';

test('buildUpiPaymentUri encodes preethamrishu@axl, ottsub merchant name, and exact plan amount', () => {
  const uri = buildUpiPaymentUri({
    amountInr: 229,
    orderRef: 'OTT-1042',
    productName: 'Netflix 4K UHD (1 Month)',
  });

  assert.equal(uri.startsWith('upi://pay?'), true);
  const query = new URLSearchParams(uri.replace('upi://pay?', ''));
  assert.equal(query.get('pa'), MERCHANT_UPI_ID);
  assert.equal(query.get('pn'), MERCHANT_DISPLAY_NAME);
  assert.equal(query.get('pn'), 'ottsub');
  assert.equal(query.get('am'), '229.00');
  assert.equal(query.get('cu'), 'INR');
  assert.equal(query.get('tr'), 'OTT-1042');
});

test('5-minute countdown timer computes and formats MM:SS accurately', () => {
  const base = Date.UTC(2026, 10, 14, 12, 0, 0);
  const expiresAt = new Date(base + PAYMENT_WINDOW_SECONDS * 1000).toISOString();

  assert.equal(computeRemainingSeconds(expiresAt, base), 300);
  assert.equal(formatCountdown(300), '05:00');
  assert.equal(formatCountdown(computeRemainingSeconds(expiresAt, base + 65_000)), '03:55');
  assert.equal(computeRemainingSeconds(expiresAt, base + 310_000), 0);
  assert.equal(formatCountdown(0), '00:00');
});

test('isPaymentWindowExpired detects expired awaiting_payment orders only', () => {
  const base = Date.UTC(2026, 10, 14, 12, 0, 0);
  const expiresAt = new Date(base + 300_000).toISOString();

  assert.equal(isPaymentWindowExpired(expiresAt, 'awaiting_payment', base + 100_000), false);
  assert.equal(isPaymentWindowExpired(expiresAt, 'awaiting_payment', base + 300_000), true);
  assert.equal(isPaymentWindowExpired(expiresAt, 'pending_approval', base + 500_000), false);
  assert.equal(isPaymentWindowExpired(expiresAt, 'approved', base + 500_000), false);
});

test('validateUtrNumber accepts valid 12-digit UTRs and rejects malformed ones', () => {
  const ok = validateUtrNumber(' 431982736451 ');
  assert.equal(ok.valid, true);
  assert.equal(ok.normalized, '431982736451');

  const short = validateUtrNumber('12345');
  assert.equal(short.valid, false);

  const symbols = validateUtrNumber('UTR-1234-5678');
  assert.equal(symbols.valid, false);
});

test('calculateSavingsPercent and reseller commission math work accurately', () => {
  assert.equal(calculateSavingsPercent(229, 649), 65);
  assert.equal(calculateSavingsPercent(500, 500), 0);
  assert.equal(calculateCommission(229, 149), 80);
  assert.equal(calculateCommission(100, 150), 0);
  assert.equal(calculateMarginPercent(200, 140), 30);
});

test('resolveProductPlan picks selected duration or defaults cleanly', () => {
  const sampleProduct: Product = {
    id: 'prod_nfx',
    slug: 'netflix-4k',
    name: 'Netflix 4K UHD',
    brandKey: 'netflix',
    category: 'Streaming',
    description: '4K plan',
    billingCycle: '1 Month',
    baseCostInr: 149,
    splitPriceInr: 229,
    retailPriceInr: 649,
    plans: [
      { id: '1m', label: '1 Month', durationMonths: 1, baseCostInr: 149, splitPriceInr: 229, retailPriceInr: 649 },
      { id: '12m', label: '12 Months', durationMonths: 12, baseCostInr: 1499, splitPriceInr: 2199, retailPriceInr: 7788 },
    ],
    totalSlots: 4,
    availableSlots: 2,
    features: [],
    active: true,
    createdAt: new Date().toISOString(),
  };

  assert.equal(resolveProductPlan(sampleProduct).splitPriceInr, 229);
  assert.equal(resolveProductPlan(sampleProduct, '12m').splitPriceInr, 2199);
  assert.equal(resolveProductPlan(sampleProduct, 'missing').id, '1m');
});

test('computeAnalyticsSummary aggregates revenue, wholesale cost, commission, and category breakdown', () => {
  const products: Product[] = [
    {
      id: 'p1',
      slug: 'netflix',
      name: 'Netflix 4K',
      brandKey: 'netflix',
      category: 'Streaming',
      description: '4K',
      billingCycle: '1 Month',
      baseCostInr: 149,
      splitPriceInr: 229,
      retailPriceInr: 649,
      plans: [],
      totalSlots: 4,
      availableSlots: 2,
      features: [],
      active: true,
      createdAt: '2026-11-10T00:00:00.000Z',
    },
    {
      id: 'p2',
      slug: 'chatgpt',
      name: 'ChatGPT Plus',
      brandKey: 'chatgpt',
      category: 'AI & Tools',
      description: 'AI',
      billingCycle: '1 Month',
      baseCostInr: 399,
      splitPriceInr: 599,
      retailPriceInr: 1999,
      plans: [],
      totalSlots: 4,
      availableSlots: 2,
      features: [],
      active: true,
      createdAt: '2026-11-10T00:00:00.000Z',
    },
  ];

  const orders: Order[] = [
    {
      id: 'o1',
      orderRef: 'OTT-1001',
      userId: 'u1',
      userName: 'A',
      userEmail: 'a@test.com',
      productId: 'p1',
      productName: 'Netflix 4K',
      brandKey: 'netflix',
      billingCycle: '1 Month',
      amountInr: 229,
      baseCostInr: 149,
      commissionInr: 80,
      upiId: MERCHANT_UPI_ID,
      upiUri: 'upi://pay',
      status: 'approved',
      createdAt: '2026-11-12T10:00:00.000Z',
      expiresAt: '2026-11-12T10:05:00.000Z',
      approvedAt: '2026-11-12T10:02:00.000Z',
    },
    {
      id: 'o2',
      orderRef: 'OTT-1002',
      userId: 'u2',
      userName: 'B',
      userEmail: 'b@test.com',
      productId: 'p2',
      productName: 'ChatGPT Plus',
      brandKey: 'chatgpt',
      billingCycle: '1 Month',
      amountInr: 599,
      baseCostInr: 399,
      commissionInr: 200,
      upiId: MERCHANT_UPI_ID,
      upiUri: 'upi://pay',
      status: 'approved',
      createdAt: '2026-11-13T10:00:00.000Z',
      expiresAt: '2026-11-13T10:05:00.000Z',
      approvedAt: '2026-11-13T10:02:00.000Z',
    },
    {
      id: 'o3',
      orderRef: 'OTT-1003',
      userId: 'u2',
      userName: 'B',
      userEmail: 'b@test.com',
      productId: 'p1',
      productName: 'Netflix 4K',
      brandKey: 'netflix',
      billingCycle: '1 Month',
      amountInr: 229,
      baseCostInr: 149,
      commissionInr: 80,
      upiId: MERCHANT_UPI_ID,
      upiUri: 'upi://pay',
      status: 'pending_approval',
      createdAt: '2026-11-14T10:00:00.000Z',
      expiresAt: '2026-11-14T10:05:00.000Z',
    },
  ];

  const summary = computeAnalyticsSummary(orders, products);
  assert.equal(summary.totalRevenueInr, 828);
  assert.equal(summary.totalBaseCostInr, 548);
  assert.equal(summary.totalCommissionInr, 280);
  assert.equal(summary.avgMarginPercent, 34);
  assert.equal(summary.conversionRatePercent, 67);
  assert.equal(summary.statusCounts.approved, 2);
  assert.equal(summary.statusCounts.pending_approval, 1);
  assert.equal(summary.categoryBreakdown.length, 2);
  assert.equal(summary.categoryBreakdown[0].category, 'AI & Tools');
});

test('formatPlanChipLabel formats variable durations and lifetime/one-time tiers cleanly', () => {
  assert.equal(formatPlanChipLabel({ label: 'Monthly', durationMonths: 1 }), '1M');
  assert.equal(formatPlanChipLabel({ label: '2 Months', durationMonths: 2 }), '2M');
  assert.equal(formatPlanChipLabel({ label: '6 Months', durationMonths: 6 }), '6M');
  assert.equal(formatPlanChipLabel({ label: 'Yearly', durationMonths: 12 }), '1Y');
  assert.equal(formatPlanChipLabel({ label: '18 Months + 5TB', durationMonths: 18 }), '18M');
  assert.equal(formatPlanChipLabel({ label: 'Lifetime Access', durationMonths: 0 }), 'Life');
  assert.equal(formatPlanChipLabel({ label: 'One-Time Pass', durationMonths: 0 }), '1x');
});

test('seed catalog carries authentic per-service durations and positive reseller margins', () => {
  const products = createSeedProducts();
  assert.ok(products.length >= 65);

  for (const prod of products) {
    assert.ok(prod.plans.length >= 1, `${prod.name} missing plans`);
    for (const plan of prod.plans) {
      assert.ok(
        plan.splitPriceInr > plan.baseCostInr,
        `${prod.name} (${plan.label}) must have sell > cost`
      );
    }
  }

  const appleMusic = products.find((p) => p.slug === 'apple-music-on-email');
  assert.equal(appleMusic?.plans.length, 1);
  assert.equal(appleMusic?.plans[0].durationMonths, 6);

  const coursera = products.find((p) => p.slug === 'coursera-plus');
  assert.equal(coursera?.plans.length, 1);
  assert.equal(coursera?.plans[0].durationMonths, 12);

  const spotify = products.find((p) => p.slug === 'spotify-premium');
  assert.deepEqual(
    spotify?.plans.map((pl) => pl.durationMonths),
    [3, 6, 12]
  );

  const netflix = products.find((p) => p.slug === 'netflix-4k-uhd');
  assert.equal(netflix?.plans.length, 8);
});

test('resolveRedisConfigFromEnv resolves REST credentials and rediss:// KV_URL / REDIS_URL', () => {
  assert.equal(resolveDbPersistenceMode(), 'vercel-redis');

  assert.deepEqual(
    resolveRedisConfigFromEnv({
      KV_REST_API_URL: 'https://dynamic-ladybird-71466.upstash.io',
      KV_REST_API_TOKEN: 'tok_abc',
    }),
    { url: 'https://dynamic-ladybird-71466.upstash.io', token: 'tok_abc' }
  );

  assert.deepEqual(
    resolveRedisConfigFromEnv({
      REDIS_URL: 'rediss://default:tok_xyz@dynamic-ladybird-71466.upstash.io:6379',
    }),
    { url: 'https://dynamic-ladybird-71466.upstash.io', token: 'tok_xyz' }
  );

  assert.equal(resolveRedisConfigFromEnv({}), null);
});


