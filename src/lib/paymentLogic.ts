import { AnalyticsSummary, Order, OrderStatus, PlanOption, Product } from '../types';

export const MERCHANT_UPI_ID = 'preethamrishu@axl';
export const MERCHANT_DISPLAY_NAME = 'ottsub';
export const PAYMENT_WINDOW_SECONDS = 300; // 5 minutes

export interface BuildUpiUriParams {
  upiId?: string;
  merchantName?: string;
  amountInr: number;
  orderRef: string;
  productName: string;
}

/**
 * Generates an NPCI-compliant UPI deep link URI whose amount (`am`) and transaction
 * reference (`tr`) are dynamically bound to the product plan price and order reference.
 */
export function buildUpiPaymentUri({
  upiId = MERCHANT_UPI_ID,
  merchantName = MERCHANT_DISPLAY_NAME,
  amountInr,
  orderRef,
  productName,
}: BuildUpiUriParams): string {
  const safeAmount = Number.isFinite(amountInr) && amountInr > 0 ? amountInr : 1;
  const formattedAmount = safeAmount.toFixed(2);
  const note = `ottsub ${productName}`.slice(0, 50);

  const params = new URLSearchParams({
    pa: upiId,
    pn: merchantName,
    tr: orderRef,
    tn: note,
    am: formattedAmount,
    cu: 'INR',
  });

  return `upi://pay?${params.toString()}`;
}

export function computeRemainingSeconds(expiresAtIso: string, nowMs: number = Date.now()): number {
  const expiresMs = Date.parse(expiresAtIso);
  if (Number.isNaN(expiresMs)) return 0;
  const diffSeconds = Math.ceil((expiresMs - nowMs) / 1000);
  return Math.max(0, diffSeconds);
}

export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function isPaymentWindowExpired(
  expiresAtIso: string,
  status: string,
  nowMs: number = Date.now()
): boolean {
  if (status === 'expired') return true;
  if (status !== 'awaiting_payment') return false;
  return computeRemainingSeconds(expiresAtIso, nowMs) <= 0;
}

export function validateUtrNumber(rawUtr: string): { valid: boolean; normalized: string; error?: string } {
  const normalized = rawUtr.trim().toUpperCase().replace(/\s+/g, '');
  if (!normalized) {
    return { valid: false, normalized: '', error: 'Please enter your UPI UTR / Reference number.' };
  }
  if (!/^[A-Z0-9]{8,24}$/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'UTR / Reference number must be 8–24 alphanumeric characters (typically 12 digits).',
    };
  }
  return { valid: true, normalized };
}

export function calculateSavingsPercent(splitPriceInr: number, retailPriceInr: number): number {
  if (!retailPriceInr || retailPriceInr <= 0 || splitPriceInr >= retailPriceInr) return 0;
  return Math.round(((retailPriceInr - splitPriceInr) / retailPriceInr) * 100);
}

export function calculateCommission(sellingPriceInr: number, baseCostInr: number): number {
  const sell = Number.isFinite(sellingPriceInr) ? sellingPriceInr : 0;
  const cost = Number.isFinite(baseCostInr) ? baseCostInr : 0;
  return Math.max(0, Math.round(sell - cost));
}

export function calculateMarginPercent(sellingPriceInr: number, baseCostInr: number): number {
  if (!sellingPriceInr || sellingPriceInr <= 0) return 0;
  const profit = calculateCommission(sellingPriceInr, baseCostInr);
  return Math.round((profit / sellingPriceInr) * 100);
}

export function resolveProductPlan(product: Product, planId?: string): PlanOption {
  const plans = Array.isArray(product.plans) && product.plans.length > 0 ? product.plans : [];
  if (planId) {
    const matched = plans.find((pl) => pl.id === planId);
    if (matched) return matched;
  }
  if (plans.length > 0) return plans[0];
  return {
    id: 'default',
    label: product.billingCycle || '1 Month',
    durationMonths: 1,
    baseCostInr: product.baseCostInr ?? Math.round(product.splitPriceInr * 0.7),
    splitPriceInr: product.splitPriceInr,
    retailPriceInr: product.retailPriceInr,
  };
}

export function formatPlanChipLabel(plan: Pick<PlanOption, 'label' | 'durationMonths'>): string {
  const lower = (plan.label || '').toLowerCase();
  if (lower.includes('lifetime')) return 'Life';
  if (lower.includes('one-time') || lower.includes('onetime') || lower.includes('method')) return '1x';
  if (lower.includes('shared')) return 'Shared';
  if (lower.includes('private')) return 'Private';
  if (lower.includes('combo')) {
    if (plan.durationMonths >= 12) return `${Math.round(plan.durationMonths / 12)}Y`;
    if (plan.durationMonths > 0) return `${plan.durationMonths}M`;
  }
  if (plan.durationMonths === 0) return '1x';
  if (plan.durationMonths >= 12 && plan.durationMonths % 12 === 0) {
    return `${plan.durationMonths / 12}Y`;
  }
  return `${plan.durationMonths}M`;
}

export function computeAnalyticsSummary(orders: Order[], products: Product[]): AnalyticsSummary {
  const productMap = new Map(products.map((p) => [p.id, p]));
  const statusCounts: Record<OrderStatus, number> = {
    awaiting_payment: 0,
    pending_approval: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
  };

  for (const ord of orders) {
    if (statusCounts[ord.status] !== undefined) {
      statusCounts[ord.status] += 1;
    }
  }

  const approvedOrders = orders.filter((o) => o.status === 'approved');
  const totalRevenueInr = approvedOrders.reduce((sum, o) => sum + o.amountInr, 0);
  const totalBaseCostInr = approvedOrders.reduce((sum, o) => {
    const prod = productMap.get(o.productId);
    const fallbackCost = prod?.baseCostInr ?? Math.round(o.amountInr * 0.72);
    return sum + (o.baseCostInr > 0 ? o.baseCostInr : fallbackCost);
  }, 0);
  const totalCommissionInr = approvedOrders.reduce((sum, o) => {
    const cost =
      o.baseCostInr > 0
        ? o.baseCostInr
        : (productMap.get(o.productId)?.baseCostInr ?? Math.round(o.amountInr * 0.72));
    const comm = o.commissionInr > 0 ? o.commissionInr : calculateCommission(o.amountInr, cost);
    return sum + comm;
  }, 0);

  const avgMarginPercent =
    totalRevenueInr > 0 ? Math.round((totalCommissionInr / totalRevenueInr) * 100) : 0;
  const conversionRatePercent =
    orders.length > 0 ? Math.round((approvedOrders.length / orders.length) * 100) : 0;

  const categoryMap = new Map<
    string,
    { category: string; orders: number; revenueInr: number; baseCostInr: number; commissionInr: number }
  >();
  const topProdMap = new Map<
    string,
    {
      productId: string;
      productName: string;
      brandKey: string;
      orders: number;
      revenueInr: number;
      commissionInr: number;
    }
  >();
  const dayMap = new Map<
    string,
    { date: string; orders: number; revenueInr: number; commissionInr: number }
  >();

  for (const ord of approvedOrders) {
    const prod = productMap.get(ord.productId);
    const category = prod?.category || 'Streaming';
    const cost =
      ord.baseCostInr > 0 ? ord.baseCostInr : (prod?.baseCostInr ?? Math.round(ord.amountInr * 0.72));
    const comm =
      ord.commissionInr > 0 ? ord.commissionInr : calculateCommission(ord.amountInr, cost);

    const catRow = categoryMap.get(category) || {
      category,
      orders: 0,
      revenueInr: 0,
      baseCostInr: 0,
      commissionInr: 0,
    };
    catRow.orders += 1;
    catRow.revenueInr += ord.amountInr;
    catRow.baseCostInr += cost;
    catRow.commissionInr += comm;
    categoryMap.set(category, catRow);

    const prodRow = topProdMap.get(ord.productId) || {
      productId: ord.productId,
      productName: ord.productName,
      brandKey: ord.brandKey,
      orders: 0,
      revenueInr: 0,
      commissionInr: 0,
    };
    prodRow.orders += 1;
    prodRow.revenueInr += ord.amountInr;
    prodRow.commissionInr += comm;
    topProdMap.set(ord.productId, prodRow);

    const isoDate = (ord.approvedAt || ord.createdAt).slice(0, 10);
    const dayRow = dayMap.get(isoDate) || {
      date: isoDate,
      orders: 0,
      revenueInr: 0,
      commissionInr: 0,
    };
    dayRow.orders += 1;
    dayRow.revenueInr += ord.amountInr;
    dayRow.commissionInr += comm;
    dayMap.set(isoDate, dayRow);
  }

  return {
    totalRevenueInr,
    totalBaseCostInr,
    totalCommissionInr,
    avgMarginPercent,
    conversionRatePercent,
    statusCounts,
    categoryBreakdown: Array.from(categoryMap.values()).sort(
      (a, b) => b.commissionInr - a.commissionInr
    ),
    topProducts: Array.from(topProdMap.values())
      .sort((a, b) => b.revenueInr - a.revenueInr)
      .slice(0, 6),
    dailySeries: Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
  };
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface RedisRestCredentials {
  url: string;
  token: string;
}

export function resolveRedisConfigFromEnv(
  env: Record<string, string | undefined>
): RedisRestCredentials | null {
  const directUrl = (env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || '').trim();
  const directToken = (env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN || '').trim();
  if (directUrl && directToken) {
    return { url: directUrl, token: directToken };
  }

  const redisUri = (env.KV_URL || env.REDIS_URL || '').trim();
  if (redisUri) {
    try {
      const parsed = new URL(redisUri);
      const token = decodeURIComponent(parsed.password || '').trim();
      if (parsed.hostname && token) {
        return {
          url: `https://${parsed.hostname}`,
          token,
        };
      }
    } catch {
      return null;
    }
  }

  return null;
}

export function resolveDbPersistenceMode(): 'vercel-redis' {
  return 'vercel-redis';
}


