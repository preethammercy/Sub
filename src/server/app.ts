import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import express, { NextFunction, Request, Response } from 'express';
import QRCode from 'qrcode';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  MERCHANT_UPI_ID,
  PAYMENT_WINDOW_SECONDS,
  buildUpiPaymentUri,
  calculateCommission,
  computeAnalyticsSummary,
  isPaymentWindowExpired,
  resolveProductPlan,
  validateUtrNumber,
} from '../lib/paymentLogic';
import { Order, OrderCredentials, PlanOption, Product, SubscriptionCategory, User, UserRole } from '../types';
import { db, ensureDbReady, getDbMode } from './db';

const ADMIN_EMAILS = new Set(['santoshmetihubli@gmail.com', 'admin@ottsub.in', 'admin@subsplit.in']);

interface AuthenticatedRequest extends Request {
  user?: User;
  authToken?: string;
}

function sanitizeProductForPublic(product: Product): Product {
  const { defaultCredentials: _dc, ...rest } = product;
  return {
    ...rest,
    baseCostInr: 0,
    plans: (rest.plans || []).map((pl) => ({
      ...pl,
      baseCostInr: 0,
    })),
  };
}

function sanitizeOrderForUser(order: Order): Order {
  const safeBase: Order = {
    ...order,
    baseCostInr: 0,
    commissionInr: 0,
  };
  if (order.status === 'approved') {
    return safeBase;
  }
  const { credentials: _c, ...rest } = safeBase;
  return rest;
}

async function generateQrDataUrl(upiUri: string): Promise<string> {
  return QRCode.toDataURL(upiUri, {
    width: 320,
    margin: 2,
    color: {
      dark: '#09090B',
      light: '#FFFFFF',
    },
  });
}

async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) {
      res.status(401).json({ error: 'Authentication required. Please sign in with Google.' });
      return;
    }
    const user = await db.getSessionUser(token);
    if (!user) {
      res.status(401).json({ error: 'Session expired. Please sign in again.' });
      return;
    }
    req.user = user;
    req.authToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }
  next();
}

function normalizePlansPayload(
  rawPlans: unknown,
  fallbackBaseCost: number,
  fallbackSplitPrice: number,
  fallbackRetailPrice: number,
  fallbackCycle: string
): PlanOption[] {
  if (Array.isArray(rawPlans) && rawPlans.length > 0) {
    const parsed: PlanOption[] = rawPlans
      .map((item, idx) => {
        const obj = (item || {}) as Record<string, unknown>;
        const splitPriceInr = Math.max(1, Math.round(Number(obj.splitPriceInr) || fallbackSplitPrice));
        const rawBaseCost = Number(obj.baseCostInr);
        const baseCostInr = Number.isFinite(rawBaseCost)
          ? Math.max(0, Math.round(rawBaseCost))
          : Math.round(splitPriceInr * 0.65);
        const retailPriceInr = Math.max(
          splitPriceInr,
          Math.round(Number(obj.retailPriceInr) || splitPriceInr * 2)
        );
        const rawMonths = Number(obj.durationMonths);
        const durationMonths = Number.isFinite(rawMonths)
          ? Math.max(0, Math.round(rawMonths))
          : idx === 1
            ? 3
            : idx === 2
              ? 12
              : 1;
        const label =
          String(obj.label || '').trim() ||
          (durationMonths === 0
            ? 'One-Time'
            : durationMonths === 12
              ? '1 Year'
              : `${durationMonths} Month${durationMonths > 1 ? 's' : ''}`);
        const badge = String(obj.badge || '').trim();
        const planId =
          String(obj.id || '').trim() ||
          `plan_${idx + 1}_${label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

        const plan: PlanOption = {
          id: planId,
          label,
          durationMonths,
          baseCostInr,
          splitPriceInr,
          retailPriceInr,
          ...(badge ? { badge } : {}),
        };
        return plan;
      })
      .filter((pl) => pl.splitPriceInr > 0);
    if (parsed.length > 0) return parsed;
  }

  return [
    {
      id: '1m',
      label: fallbackCycle || '1 Month',
      durationMonths: 1,
      baseCostInr: fallbackBaseCost,
      splitPriceInr: fallbackSplitPrice,
      retailPriceInr: fallbackRetailPrice,
    },
  ];
}

function getPublicFirebaseConfig() {
  return {
    apiKey: (process.env.FIREBASE_API_KEY || firebaseConfig.apiKey || '').trim(),
    authDomain: (process.env.FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain || '').trim(),
    databaseURL: (
      process.env.FIREBASE_DATABASE_URL ||
      'https://dhru-3d8e4-default-rtdb.firebaseio.com'
    ).trim(),
    projectId: (process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId || '').trim(),
    storageBucket: (process.env.FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || '').trim(),
    messagingSenderId: (
      process.env.FIREBASE_MESSAGING_SENDER_ID ||
      firebaseConfig.messagingSenderId ||
      ''
    ).trim(),
    appId: (process.env.FIREBASE_APP_ID || firebaseConfig.appId || '').trim(),
    measurementId: (
      process.env.FIREBASE_MEASUREMENT_ID ||
      firebaseConfig.measurementId ||
      'G-7E6C5EL4QK'
    ).trim(),
    firestoreDatabaseId: (
      process.env.FIREBASE_FIRESTORE_DATABASE_ID ||
      firebaseConfig.firestoreDatabaseId ||
      ''
    ).trim(),
  };
}

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '3mb' }));

  app.get('/api/health', async (_req, res) => {
    await ensureDbReady();
    const fb = getPublicFirebaseConfig();
    res.json({
      ok: true,
      brand: 'ottsub',
      dbMode: getDbMode(),
      upiId: MERCHANT_UPI_ID,
      firebaseProjectId: fb.projectId,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/config', (_req, res) => {
    res.json({
      brand: 'ottsub',
      upiId: MERCHANT_UPI_ID,
      dbMode: getDbMode(),
      firebase: getPublicFirebaseConfig(),
    });
  });

  app.get('/api/config/firebase', (_req, res) => {
    res.json({ firebase: getPublicFirebaseConfig() });
  });

  // --- Authentication (Firebase Google Auth for Users + Hidden /admin Sign-In) ---
  app.post('/api/auth/firebase', async (req, res, next) => {
    try {
      const idToken = String(req.body?.idToken || '').trim();
      if (!idToken) {
        res.status(400).json({ error: 'Firebase Google ID token is required.' });
        return;
      }

      const fb = getPublicFirebaseConfig();
      const lookupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(fb.apiKey)}`;
      const verifyRes = await fetch(lookupUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const verifyData = (await verifyRes.json().catch(() => ({}))) as {
        users?: Array<{
          localId: string;
          email?: string;
          emailVerified?: boolean;
          displayName?: string;
          photoUrl?: string;
        }>;
        error?: { message?: string };
      };

      const fbUser = verifyData.users?.[0];
      if (!verifyRes.ok || !fbUser || !fbUser.email) {
        res.status(401).json({
          error: verifyData.error?.message || 'Unable to verify Firebase Google token.',
        });
        return;
      }

      const email = fbUser.email.trim().toLowerCase();
      const isAdminEmail = ADMIN_EMAILS.has(email) && fbUser.emailVerified !== false;
      const existing = await db.findUserByEmail(email);

      let user: User;
      if (existing) {
        user = {
          id: existing.id,
          name: fbUser.displayName || existing.name,
          email: existing.email,
          role: isAdminEmail ? 'admin' : existing.role,
          photoUrl: fbUser.photoUrl || existing.photoUrl,
          createdAt: existing.createdAt,
        };
      } else {
        user = await db.createUser({
          id: fbUser.localId || `usr_${crypto.randomUUID().slice(0, 12)}`,
          name: fbUser.displayName || email.split('@')[0],
          email,
          role: isAdminEmail ? 'admin' : 'customer',
          photoUrl: fbUser.photoUrl,
          passwordHash: crypto.randomBytes(32).toString('hex'),
          createdAt: new Date().toISOString(),
        });
      }

      const token = crypto.randomBytes(32).toString('hex');
      await db.createSession({
        token,
        userId: user.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      });

      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/admin-login', async (req, res, next) => {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const password = String(req.body?.password || '');
      if (!email || !password) {
        res.status(400).json({ error: 'Admin email and password are required.' });
        return;
      }

      const found = await db.findUserByEmail(email);
      if (!found || found.role !== 'admin' || !(await bcrypt.compare(password, found.passwordHash))) {
        res.status(401).json({ error: 'Invalid administrator credentials.' });
        return;
      }

      const token = crypto.randomBytes(32).toString('hex');
      await db.createSession({
        token,
        userId: found.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      });

      const { passwordHash: _ph, ...user } = found;
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/logout', authMiddleware, async (req: AuthenticatedRequest, res, next) => {
    try {
      if (req.authToken) {
        await db.deleteSession(req.authToken);
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res) => {
    res.json({ user: req.user });
  });

  // --- Public Catalog ---
  app.get('/api/products', async (req, res, next) => {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : '';
      const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
      let products = await db.listProducts(false);
      if (category && category !== 'All') {
        products = products.filter((p) => p.category === category);
      }
      if (q) {
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
      }
      res.json({ products: products.map(sanitizeProductForPublic) });
    } catch (err) {
      next(err);
    }
  });

  // --- Orders & 5-Min Dynamic UPI QR Checkout ---
  app.post('/api/orders', authMiddleware, async (req: AuthenticatedRequest, res, next) => {
    try {
      const productId = String(req.body?.productId || '');
      const planId = req.body?.planId ? String(req.body.planId) : undefined;
      const product = await db.getProductById(productId);
      if (!product || !product.active) {
        res.status(404).json({ error: 'Subscription plan not found.' });
        return;
      }
      if (product.availableSlots <= 0) {
        res.status(409).json({ error: 'All slots for this subscription are currently filled.' });
        return;
      }

      const selectedPlan = resolveProductPlan(product, planId);
      const commissionInr = calculateCommission(selectedPlan.splitPriceInr, selectedPlan.baseCostInr);

      const now = Date.now();
      const orderRef = `OTT-${Math.floor(100000 + Math.random() * 900000)}`;
      const upiUri = buildUpiPaymentUri({
        upiId: MERCHANT_UPI_ID,
        amountInr: selectedPlan.splitPriceInr,
        orderRef,
        productName: `${product.name} (${selectedPlan.label})`,
      });
      const qrDataUrl = await generateQrDataUrl(upiUri);

      const order: Order = {
        id: `ord_${crypto.randomUUID().slice(0, 12)}`,
        orderRef,
        userId: req.user!.id,
        userName: req.user!.name,
        userEmail: req.user!.email,
        productId: product.id,
        productName: product.name,
        brandKey: product.brandKey,
        planId: selectedPlan.id,
        planLabel: selectedPlan.label,
        billingCycle: selectedPlan.label,
        amountInr: selectedPlan.splitPriceInr,
        baseCostInr: selectedPlan.baseCostInr,
        commissionInr,
        upiId: MERCHANT_UPI_ID,
        upiUri,
        qrDataUrl,
        status: 'awaiting_payment',
        createdAt: new Date(now).toISOString(),
        expiresAt: new Date(now + PAYMENT_WINDOW_SECONDS * 1000).toISOString(),
      };

      await db.createOrder(order);
      res.status(201).json({ order: sanitizeOrderForUser(order) });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/orders/mine', authMiddleware, async (req: AuthenticatedRequest, res, next) => {
    try {
      const orders = await db.listOrdersByUser(req.user!.id);
      const enriched = await Promise.all(
        orders.map(async (ord) => {
          const base = sanitizeOrderForUser(ord);
          if (base.status === 'awaiting_payment' && !base.qrDataUrl) {
            base.qrDataUrl = await generateQrDataUrl(base.upiUri);
          }
          return base;
        })
      );
      res.json({ orders: enriched });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/orders/:id/submit-payment', authMiddleware, async (req: AuthenticatedRequest, res, next) => {
    try {
      const order = await db.getOrderById(req.params.id);
      if (!order || order.userId !== req.user!.id) {
        res.status(404).json({ error: 'Order not found.' });
        return;
      }
      if (order.status === 'approved') {
        res.status(400).json({ error: 'This order is already approved.' });
        return;
      }
      if (isPaymentWindowExpired(order.expiresAt, order.status)) {
        await db.updateOrder(order.id, { status: 'expired' });
        res.status(410).json({ error: 'The 5-minute payment timer expired. Please start a new order.' });
        return;
      }
      if (order.status !== 'awaiting_payment') {
        res.status(400).json({ error: `Cannot submit payment for order in status "${order.status}".` });
        return;
      }

      const rawUtr = String(req.body?.utrNumber || '');
      const payerUpiId = String(req.body?.payerUpiId || '').trim();
      const utrCheck = validateUtrNumber(rawUtr);
      if (!utrCheck.valid) {
        res.status(400).json({ error: utrCheck.error });
        return;
      }

      const updated = await db.updateOrder(order.id, {
        utrNumber: utrCheck.normalized,
        payerUpiId: payerUpiId || undefined,
        status: 'pending_approval',
        paidAt: new Date().toISOString(),
      });

      res.json({ order: updated ? sanitizeOrderForUser(updated) : null });
    } catch (err) {
      next(err);
    }
  });

  // --- Admin Panel Routes ---
  app.get('/api/admin/overview', authMiddleware, requireAdmin, async (_req, res, next) => {
    try {
      const [orders, products, users] = await Promise.all([
        db.listAllOrders(),
        db.listProducts(true),
        db.listAllUsers(),
      ]);

      const pendingApprovals = orders.filter((o) => o.status === 'pending_approval').length;
      const analytics = computeAnalyticsSummary(orders, products);
      const activeProducts = products.filter((p) => p.active).length;
      const openSlots = products.filter((p) => p.active).reduce((sum, p) => sum + p.availableSlots, 0);

      const enrichedUsers = users.map((u) => {
        const userOrders = orders.filter((o) => o.userId === u.id);
        const approved = userOrders.filter((o) => o.status === 'approved');
        const totalSpentInr = approved.reduce((sum, o) => sum + o.amountInr, 0);
        const commissionGeneratedInr = approved.reduce(
          (sum, o) => sum + (o.commissionInr || calculateCommission(o.amountInr, o.baseCostInr)),
          0
        );
        return {
          ...u,
          orderCount: userOrders.length,
          approvedCount: approved.length,
          totalSpentInr,
          commissionGeneratedInr,
        };
      });

      res.json({
        dbMode: getDbMode(),
        upiId: MERCHANT_UPI_ID,
        metrics: {
          pendingApprovals,
          approvedOrders: analytics.statusCounts.approved,
          totalRevenueInr: analytics.totalRevenueInr,
          totalBaseCostInr: analytics.totalBaseCostInr,
          totalCommissionInr: analytics.totalCommissionInr,
          avgMarginPercent: analytics.avgMarginPercent,
          totalUsers: users.length,
          activeProducts,
          openSlots,
        },
        analytics,
        orders,
        products,
        users: enrichedUsers,
      });
    } catch (err) {
      next(err);
    }
  });

  app.put('/api/admin/users/:id/role', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
    try {
      const nextRole = String(req.body?.role || '') as UserRole;
      if (nextRole !== 'customer' && nextRole !== 'admin') {
        res.status(400).json({ error: 'Role must be customer or admin.' });
        return;
      }
      if (req.user!.id === req.params.id && nextRole !== 'admin') {
        res.status(400).json({ error: 'You cannot demote your own active admin account.' });
        return;
      }
      const updated = await db.updateUserRole(req.params.id, nextRole);
      if (!updated) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }
      res.json({ user: updated });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/orders/:id/approve', authMiddleware, requireAdmin, async (req, res, next) => {
    try {
      const order = await db.getOrderById(req.params.id);
      if (!order) {
        res.status(404).json({ error: 'Order not found.' });
        return;
      }
      if (order.status === 'approved') {
        res.status(400).json({ error: 'Order is already approved.' });
        return;
      }

      const incoming = req.body?.credentials as Partial<OrderCredentials> | undefined;
      const c1Label = String(incoming?.credential1?.label || '').trim();
      const c1Value = String(incoming?.credential1?.value || '').trim();
      const c2Label = String(incoming?.credential2?.label || '').trim();
      const c2Value = String(incoming?.credential2?.value || '').trim();
      const c3Label = String(incoming?.credential3?.label || '').trim();
      const c3Value = String(incoming?.credential3?.value || '').trim();

      if (!c1Label || !c1Value || !c2Label || !c2Value || !c3Label || !c3Value) {
        res.status(400).json({
          error: 'All three credential fields (labels and values) are required before approving.',
        });
        return;
      }

      const credentials: OrderCredentials = {
        credential1: { label: c1Label, value: c1Value },
        credential2: { label: c2Label, value: c2Value },
        credential3: { label: c3Label, value: c3Value },
        deliveryNote: String(incoming?.deliveryNote || '').trim() || undefined,
      };

      const adminNote = String(req.body?.adminNote || '').trim() || 'Payment verified by Admin.';

      const updated = await db.updateOrder(order.id, {
        status: 'approved',
        credentials,
        adminNote,
        approvedAt: new Date().toISOString(),
      });

      const product = await db.getProductById(order.productId);
      if (product && product.availableSlots > 0) {
        await db.updateProduct(product.id, {
          availableSlots: Math.max(0, product.availableSlots - 1),
        });
      }

      res.json({ order: updated });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/orders/:id/reject', authMiddleware, requireAdmin, async (req, res, next) => {
    try {
      const order = await db.getOrderById(req.params.id);
      if (!order) {
        res.status(404).json({ error: 'Order not found.' });
        return;
      }
      const adminNote = String(req.body?.adminNote || '').trim();
      if (!adminNote) {
        res.status(400).json({ error: 'Please provide a rejection reason for the user.' });
        return;
      }
      const updated = await db.updateOrder(order.id, {
        status: 'rejected',
        adminNote,
      });
      res.json({ order: updated });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/products', authMiddleware, requireAdmin, async (req, res, next) => {
    try {
      const b = req.body || {};
      const name = String(b.name || '').trim();
      const category = String(b.category || 'Streaming') as SubscriptionCategory;
      const splitPriceInr = Math.round(Number(b.splitPriceInr));
      const baseCostInr = Math.max(
        0,
        Math.round(Number.isFinite(Number(b.baseCostInr)) ? Number(b.baseCostInr) : splitPriceInr * 0.65)
      );
      const retailPriceInr = Math.round(
        Number.isFinite(Number(b.retailPriceInr)) && Number(b.retailPriceInr) > 0
          ? Number(b.retailPriceInr)
          : splitPriceInr * 3
      );
      const totalSlots = Number(b.totalSlots || 4);
      const availableSlots = Number(b.availableSlots ?? totalSlots);
      const description = String(b.description || '').trim();
      const billingCycle = String(b.billingCycle || '1 Month').trim();
      const brandKey = String(b.brandKey || 'custom').trim().toLowerCase();
      const imageUrl = b.imageUrl ? String(b.imageUrl).trim() : undefined;

      if (!name || !description || !Number.isFinite(splitPriceInr) || splitPriceInr <= 0) {
        res.status(400).json({ error: 'Valid product name, description, and selling price are required.' });
        return;
      }

      const plans = normalizePlansPayload(b.plans, baseCostInr, splitPriceInr, retailPriceInr, billingCycle);

      const defaultCredentials: OrderCredentials = {
        credential1: {
          label: String(b.defaultCredentials?.credential1?.label || 'Account Email').trim(),
          value: String(b.defaultCredentials?.credential1?.value || '').trim(),
        },
        credential2: {
          label: String(b.defaultCredentials?.credential2?.label || 'Password').trim(),
          value: String(b.defaultCredentials?.credential2?.value || '').trim(),
        },
        credential3: {
          label: String(b.defaultCredentials?.credential3?.label || 'Profile / PIN').trim(),
          value: String(b.defaultCredentials?.credential3?.value || '').trim(),
        },
        deliveryNote: String(b.defaultCredentials?.deliveryNote || '').trim() || undefined,
      };

      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${crypto.randomBytes(2).toString('hex')}`;
      const product: Product = {
        id: `prod_${crypto.randomUUID().slice(0, 10)}`,
        slug,
        name,
        brandKey,
        category,
        description,
        imageUrl,
        billingCycle: plans[0]?.label || billingCycle,
        baseCostInr: plans[0]?.baseCostInr ?? baseCostInr,
        splitPriceInr: plans[0]?.splitPriceInr ?? splitPriceInr,
        retailPriceInr: plans[0]?.retailPriceInr ?? retailPriceInr,
        plans,
        totalSlots: Math.max(1, Math.round(totalSlots)),
        availableSlots: Math.max(0, Math.round(availableSlots)),
        features: Array.isArray(b.features)
          ? b.features.map((f: unknown) => String(f).trim()).filter(Boolean)
          : ['Shared Verified Seat', 'Instant Credential Delivery'],
        active: b.active !== false,
        defaultCredentials,
        createdAt: new Date().toISOString(),
      };

      await db.createProduct(product);
      res.status(201).json({ product });
    } catch (err) {
      next(err);
    }
  });

  app.put('/api/admin/products/:id', authMiddleware, requireAdmin, async (req, res, next) => {
    try {
      const b = req.body || {};
      const existing = await db.getProductById(req.params.id);
      if (!existing) {
        res.status(404).json({ error: 'Product not found.' });
        return;
      }

      const nextSplit = b.splitPriceInr !== undefined ? Math.round(Number(b.splitPriceInr)) : existing.splitPriceInr;
      const nextBase = b.baseCostInr !== undefined ? Math.max(0, Math.round(Number(b.baseCostInr))) : existing.baseCostInr;
      const nextRetail = b.retailPriceInr !== undefined ? Math.round(Number(b.retailPriceInr)) : existing.retailPriceInr;
      const nextCycle = b.billingCycle !== undefined ? String(b.billingCycle).trim() : existing.billingCycle;

      const plans =
        b.plans !== undefined
          ? normalizePlansPayload(b.plans, nextBase, nextSplit, nextRetail, nextCycle)
          : existing.plans;

      const updated = await db.updateProduct(req.params.id, {
        ...(b.name !== undefined ? { name: String(b.name).trim() } : {}),
        ...(b.category !== undefined ? { category: b.category } : {}),
        ...(b.description !== undefined ? { description: String(b.description).trim() } : {}),
        ...(b.imageUrl !== undefined ? { imageUrl: String(b.imageUrl).trim() || undefined } : {}),
        billingCycle: plans[0]?.label || nextCycle,
        baseCostInr: plans[0]?.baseCostInr ?? nextBase,
        splitPriceInr: plans[0]?.splitPriceInr ?? nextSplit,
        retailPriceInr: plans[0]?.retailPriceInr ?? nextRetail,
        plans,
        ...(b.totalSlots !== undefined ? { totalSlots: Math.max(1, Math.round(Number(b.totalSlots))) } : {}),
        ...(b.availableSlots !== undefined ? { availableSlots: Math.max(0, Math.round(Number(b.availableSlots))) } : {}),
        ...(b.active !== undefined ? { active: Boolean(b.active) } : {}),
        ...(b.brandKey !== undefined ? { brandKey: String(b.brandKey).trim() } : {}),
        ...(b.features !== undefined ? { features: b.features } : {}),
        ...(b.defaultCredentials !== undefined ? { defaultCredentials: b.defaultCredentials } : {}),
      });

      res.json({ product: updated });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/admin/products/:id', authMiddleware, requireAdmin, async (req, res, next) => {
    try {
      const deleted = await db.deleteProduct(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: 'Product not found.' });
        return;
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[API Error]', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}
