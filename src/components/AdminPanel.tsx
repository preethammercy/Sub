import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  CheckCircle2,
  Database,
  Download,
  Edit3,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { api, setStoredToken } from '../lib/api';
import { signInWithGooglePopup } from '../lib/firebase';
import { calculateCommission, calculateMarginPercent, formatInr } from '../lib/paymentLogic';
import { PRESET_PRODUCT_MEDIA, resolveProductImageSrc } from '../lib/productMedia';
import {
  AdminOverview,
  Order,
  OrderCredentials,
  PlanOption,
  Product,
  SubscriptionCategory,
  User,
  UserRole,
} from '../types';
import { BRAND_OPTIONS, ServiceBrandMark } from './ServiceBrandMark';

interface AdminPanelProps {
  user: User | null;
  onAuthenticated: (user: User) => void;
  onCatalogMutated: () => void;
}

type AdminTab = 'analytics' | 'approvals' | 'products' | 'users' | 'deployment';

const CATEGORIES: SubscriptionCategory[] = [
  'Streaming',
  'Combos',
  'AI & Tools',
  'Productivity',
  'Learning',
  'Music',
  'Security',
];

const EMPTY_CREDS: OrderCredentials = {
  credential1: { label: 'Account Email / ID', value: '' },
  credential2: { label: 'Account Password', value: '' },
  credential3: { label: 'Profile Name & PIN / Key', value: '' },
  deliveryNote: '',
};

const DEFAULT_PLANS: PlanOption[] = [
  { id: '1m', label: '1 Month', durationMonths: 1, baseCostInr: 99, splitPriceInr: 149, retailPriceInr: 499 },
  { id: '3m', label: '3 Months', durationMonths: 3, baseCostInr: 269, splitPriceInr: 399, retailPriceInr: 1497 },
  { id: '12m', label: '1 Year', durationMonths: 12, baseCostInr: 949, splitPriceInr: 1399, retailPriceInr: 5988 },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  user,
  onAuthenticated,
  onCatalogMutated,
}) => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [orderFilter, setOrderFilter] = useState<string>('pending_approval');

  // Hidden /admin gate login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [gateBusy, setGateBusy] = useState(false);
  const [gateError, setGateError] = useState('');

  // Review / Approve Order Modal State
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [credsForm, setCredsForm] = useState<OrderCredentials>(EMPTY_CREDS);
  const [adminNote, setAdminNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  // Add / Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [featuresText, setFeaturesText] = useState('');

  // User Management search & filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');

  const loadOverview = async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getAdminOverview();
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, [user]);

  const handleAdminGoogleSignIn = async () => {
    setGateError('');
    setGateBusy(true);
    try {
      const { idToken } = await signInWithGooglePopup();
      const res = await api.firebaseLogin({ idToken });
      setStoredToken(res.token);
      if (res.user.role !== 'admin') {
        setGateError(`Signed in as ${res.user.email}, which does not have Admin privileges.`);
        onAuthenticated(res.user);
        return;
      }
      onAuthenticated(res.user);
    } catch (err) {
      setGateError(err instanceof Error ? err.message : 'Google Admin sign-in failed');
    } finally {
      setGateBusy(false);
    }
  };

  const handleAdminKeySignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError('');
    setGateBusy(true);
    try {
      const res = await api.adminLogin({ email: adminEmail, password: adminPassword });
      setStoredToken(res.token);
      onAuthenticated(res.user);
    } catch (err) {
      setGateError(err instanceof Error ? err.message : 'Invalid admin credentials');
    } finally {
      setGateBusy(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!overview) return [];
    const q = userSearch.trim().toLowerCase();
    return overview.users.filter((u) => {
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchesQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchesRole && matchesQ;
    });
  }, [overview, userSearch, userRoleFilter]);

  if (!user || user.role !== 'admin') {
    return (
      <section className="max-w-md mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#121216] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="h-1 w-full bg-[#E50914]" />
          <div className="p-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#E50914]/15 text-[#E50914] flex items-center justify-center border border-[#E50914]/30">
                <Lock className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold text-white">ottsub Admin Gate</h1>
                <p className="text-xs text-zinc-400">Restricted /admin portal</p>
              </div>
            </div>

            {gateError && (
              <div
                className="p-3 text-xs text-red-200 bg-red-950/70 border border-red-500/40 rounded-lg"
                role="alert"
              >
                {gateError}
              </div>
            )}

            <motion.button
              type="button"
              disabled={gateBusy}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdminGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 text-sm font-semibold text-zinc-950 bg-white hover:bg-zinc-100 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#E50914]" aria-hidden="true" />
              <span>Sign in with Admin Google Account</span>
            </motion.button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[11px] text-zinc-500">
                <span className="bg-[#121216] px-2.5">or Admin Access Credentials</span>
              </div>
            </div>

            <form onSubmit={handleAdminKeySignIn} className="space-y-3">
              <div>
                <label htmlFor="admin-email-input" className="block text-xs font-medium text-zinc-300 mb-1">
                  Admin Email
                </label>
                <input
                  id="admin-email-input"
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@ottsub.in"
                  className="w-full px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 bg-[#0A0A0D] border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>
              <div>
                <label htmlFor="admin-pass-input" className="block text-xs font-medium text-zinc-300 mb-1">
                  Admin Password
                </label>
                <input
                  id="admin-pass-input"
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 bg-[#0A0A0D] border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>
              <button
                type="submit"
                disabled={gateBusy}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#E50914] hover:bg-[#F40612] disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
              >
                {gateBusy ? 'Verifying...' : 'Unlock /admin Console'}
              </button>
            </form>
          </div>
        </motion.div>
      </section>
    );
  }

  const openReviewModal = (order: Order) => {
    const product = overview?.products.find((p) => p.id === order.productId);
    const defaults = product?.defaultCredentials;
    setReviewOrder(order);
    setCredsForm({
      credential1: {
        label: defaults?.credential1.label || 'Account Email / ID',
        value: defaults?.credential1.value || '',
      },
      credential2: {
        label: defaults?.credential2.label || 'Password',
        value: defaults?.credential2.value || '',
      },
      credential3: {
        label: defaults?.credential3.label || 'Profile & PIN / Access Key',
        value: defaults?.credential3.value || '',
      },
      deliveryNote: defaults?.deliveryNote || '',
    });
    setAdminNote('Payment verified against UPI statement.');
    setRejectReason('');
  };

  const handleApproveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;
    setActionBusy(true);
    setError('');
    try {
      await api.approveOrder(reviewOrder.id, { credentials: credsForm, adminNote });
      setReviewOrder(null);
      await loadOverview();
      onCatalogMutated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setActionBusy(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!reviewOrder) return;
    const reason = rejectReason.trim() || 'UTR could not be matched in UPI statement.';
    setActionBusy(true);
    setError('');
    try {
      await api.rejectOrder(reviewOrder.id, { adminNote: reason });
      setReviewOrder(null);
      await loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rejection failed');
    } finally {
      setActionBusy(false);
    }
  };

  const openCreateProduct = () => {
    setIsNewProduct(true);
    const initialPlans = DEFAULT_PLANS.map((p) => ({ ...p }));
    setFeaturesText('4K HDR Verified Seat, Private Profile & PIN, 30-Day Replacement Warranty');
    setEditingProduct({
      name: '',
      brandKey: 'netflix',
      category: 'Streaming',
      imageUrl: 'preset:ott-cinema',
      description: '',
      billingCycle: '1 Month',
      baseCostInr: initialPlans[0].baseCostInr,
      splitPriceInr: initialPlans[0].splitPriceInr,
      retailPriceInr: initialPlans[0].retailPriceInr,
      plans: initialPlans,
      totalSlots: 4,
      availableSlots: 4,
      features: ['4K HDR Verified Seat', 'Private Profile & PIN', '30-Day Replacement Warranty'],
      active: true,
      defaultCredentials: {
        credential1: { label: 'Account Email', value: '' },
        credential2: { label: 'Password', value: '' },
        credential3: { label: 'Profile & PIN', value: '' },
        deliveryNote: '',
      },
    });
  };

  const openEditProduct = (product: Product) => {
    setIsNewProduct(false);
    const plans =
      product.plans && product.plans.length > 0
        ? product.plans.map((pl) => ({ ...pl }))
        : [
            {
              id: '1m',
              label: product.billingCycle || '1 Month',
              durationMonths: 1,
              baseCostInr: product.baseCostInr,
              splitPriceInr: product.splitPriceInr,
              retailPriceInr: product.retailPriceInr,
            },
          ];
    setFeaturesText((product.features || []).join(', '));
    setEditingProduct({
      ...product,
      plans,
      defaultCredentials: product.defaultCredentials || EMPTY_CREDS,
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 640;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setEditingProduct((prev) => (prev ? { ...prev, imageUrl: dataUrl } : prev));
        }
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const updateEditingPlan = (index: number, field: keyof PlanOption, value: string | number) => {
    setEditingProduct((prev) => {
      if (!prev) return prev;
      const plans = [...(prev.plans || [])];
      const target = { ...plans[index], [field]: value };
      plans[index] = target;
      const first = plans[0];
      return {
        ...prev,
        plans,
        ...(first
          ? {
              billingCycle: first.label,
              baseCostInr: first.baseCostInr,
              splitPriceInr: first.splitPriceInr,
              retailPriceInr: first.retailPriceInr,
            }
          : {}),
      };
    });
  };

  const addEditingPlan = (preset?: { label: string; months: number; badge?: string }) => {
    setEditingProduct((prev) => {
      if (!prev) return prev;
      const existing = prev.plans || [];
      const baseRef = existing[0] || DEFAULT_PLANS[0];
      const months = preset ? preset.months : 1;
      const mult = months === 0 ? 10 : Math.max(1, months * 0.85);
      const nextPlan: PlanOption = {
        id: `plan_${Date.now().toString(36)}_${existing.length + 1}`,
        label: preset ? preset.label : `Custom Tier ${existing.length + 1}`,
        durationMonths: months,
        baseCostInr: Math.max(1, Math.round(baseRef.baseCostInr * mult)),
        splitPriceInr: Math.max(1, Math.round(baseRef.splitPriceInr * mult)),
        retailPriceInr: Math.max(1, Math.round(baseRef.retailPriceInr * (months === 0 ? 12 : Math.max(1, months)))),
        ...(preset?.badge ? { badge: preset.badge } : {}),
      };
      const plans = [...existing, nextPlan];
      return {
        ...prev,
        plans,
      };
    });
  };

  const removeEditingPlan = (index: number) => {
    setEditingProduct((prev) => {
      if (!prev) return prev;
      const existing = prev.plans || [];
      if (existing.length <= 1) return prev;
      const plans = existing.filter((_, idx) => idx !== index);
      const first = plans[0];
      return {
        ...prev,
        plans,
        ...(first
          ? {
              billingCycle: first.label,
              baseCostInr: first.baseCostInr,
              splitPriceInr: first.splitPriceInr,
              retailPriceInr: first.retailPriceInr,
            }
          : {}),
      };
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setActionBusy(true);
    setError('');
    try {
      const parsedFeatures = featuresText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const payload: Partial<Product> = {
        ...editingProduct,
        features: parsedFeatures.length > 0 ? parsedFeatures : ['Verified Shared Seat'],
      };
      if (isNewProduct) {
        await api.createProduct(payload);
      } else if (editingProduct.id) {
        await api.updateProduct(editingProduct.id, payload);
      }
      setEditingProduct(null);
      await loadOverview();
      onCatalogMutated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subscription');
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setActionBusy(true);
    setError('');
    try {
      await api.deleteProduct(id);
      await loadOverview();
      onCatalogMutated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subscription');
    } finally {
      setActionBusy(false);
    }
  };

  const handleToggleUserRole = async (targetUser: User) => {
    const nextRole: UserRole = targetUser.role === 'admin' ? 'customer' : 'admin';
    setActionBusy(true);
    setError('');
    try {
      await api.updateUserRole(targetUser.id, nextRole);
      await loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setActionBusy(false);
    }
  };

  const filteredOrders =
    overview?.orders.filter((o) => (orderFilter === 'all' ? true : o.status === orderFilter)) || [];

  const maxCategoryRevenue = Math.max(
    1,
    ...(overview?.analytics.categoryBreakdown.map((c) => c.revenueInr) || [1])
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">ottsub Admin Command Center</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Track reseller commissions, approve UPI payments to{' '}
            <span className="font-mono font-medium text-white">{overview?.upiId || 'preethamrishu@axl'}</span>, manage products, and control users.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/ottsub-vercel-source.zip"
            download="ottsub-vercel-source.zip"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#E50914]" aria-hidden="true" />
            <span>Download ZIP</span>
          </a>
          <button
            type="button"
            onClick={loadOverview}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={openCreateProduct}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#F40612] rounded-lg cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Product</span>
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 text-sm text-red-200 bg-red-950/70 border border-red-500/40 rounded-xl" role="alert">
          {error}
        </div>
      )}

      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121216] border border-white/10 rounded-xl p-5">
            <span className="text-xs font-medium text-zinc-400">Gross Approved Revenue</span>
            <p className="font-display text-2xl font-bold text-white tabular-nums mt-1">
              {formatInr(overview.metrics.totalRevenueInr)}
            </p>
            <p className="text-xs text-zinc-500 mt-1 font-mono tabular-nums">
              Base Cost: {formatInr(overview.metrics.totalBaseCostInr)}
            </p>
          </div>
          <div className="bg-[#121216] border border-[#E50914]/35 rounded-xl p-5">
            <span className="text-xs font-medium text-zinc-400">Net Commission Earned</span>
            <p className="font-display text-2xl font-bold text-[#E50914] tabular-nums mt-1" data-testid="admin-kpi-commission">
              {formatInr(overview.metrics.totalCommissionInr)}
            </p>
            <p className="text-xs text-emerald-400 mt-1 font-mono tabular-nums">
              {overview.metrics.avgMarginPercent}% Reseller Margin
            </p>
          </div>
          <div className="bg-[#121216] border border-white/10 rounded-xl p-5">
            <span className="text-xs font-medium text-zinc-400">Pending Approvals</span>
            <p className="font-display text-2xl font-bold text-white tabular-nums mt-1" data-testid="admin-kpi-pending">
              {overview.metrics.pendingApprovals}
            </p>
            <p className="text-xs text-zinc-500 mt-1 font-mono tabular-nums">
              {overview.metrics.approvedOrders} Delivered Orders
            </p>
          </div>
          <div className="bg-[#121216] border border-white/10 rounded-xl p-5">
            <span className="text-xs font-medium text-zinc-400">Catalog &amp; Users</span>
            <p className="font-display text-2xl font-bold text-white tabular-nums mt-1">
              {overview.metrics.activeProducts} Plans · {overview.metrics.totalUsers} Users
            </p>
            <p className="text-xs text-zinc-500 mt-1 font-mono tabular-nums">
              {overview.metrics.openSlots} Open Seats
            </p>
          </div>
        </div>
      )}

      <div
        className="flex items-center gap-1 p-1 bg-[#121216] border border-white/10 rounded-xl w-fit max-w-full overflow-x-auto"
        role="tablist"
      >
        {(
          [
            { id: 'analytics', label: 'Analytics & Commission' },
            { id: 'approvals', label: `Payment Approvals (${overview?.metrics.pendingApprovals ?? 0})` },
            { id: 'products', label: `Products & Photos (${overview?.products.length ?? 0})` },
            { id: 'users', label: `User Management (${overview?.users.length ?? 0})` },
            { id: 'deployment', label: 'Vercel, ZIP & Firebase' },
          ] as Array<{ id: AdminTab; label: string }>
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === tab.id ? 'bg-[#E50914] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Analytics & Commission Earned */}
      {activeTab === 'analytics' && overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Category Commission Breakdown */}
            <div className="lg:col-span-7 bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-5 h-5 text-[#E50914]" aria-hidden="true" />
                  <h2 className="font-display text-base font-bold text-white">
                    Category Revenue vs. Reseller Commission
                  </h2>
                </div>
                <span className="text-xs font-mono text-zinc-400 tabular-nums">
                  {overview.analytics.conversionRatePercent}% Order Conversion
                </span>
              </div>

              {overview.analytics.categoryBreakdown.length === 0 ? (
                <p className="text-sm text-zinc-400 py-6">
                  Approve paid orders to populate category revenue and commission telemetry.
                </p>
              ) : (
                <div className="space-y-4">
                  {overview.analytics.categoryBreakdown.map((cat) => {
                    const widthPct = Math.max(8, Math.round((cat.revenueInr / maxCategoryRevenue) * 100));
                    const marginPct = calculateMarginPercent(cat.revenueInr, cat.baseCostInr);
                    return (
                      <div key={cat.category} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">
                            {cat.category} ({cat.orders} {cat.orders === 1 ? 'order' : 'orders'})
                          </span>
                          <span className="font-mono text-zinc-300 tabular-nums">
                            Rev {formatInr(cat.revenueInr)} ·{' '}
                            <span className="text-[#E50914] font-semibold">
                              +{formatInr(cat.commissionInr)} ({marginPct}%)
                            </span>
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#E50914] to-[#F87171] rounded-full"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Status Funnel */}
            <div className="lg:col-span-5 bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-[#E50914]" aria-hidden="true" />
                <h2 className="font-display text-base font-bold text-white">Order Funnel Breakdown</h2>
              </div>

              <dl className="divide-y divide-white/10 text-sm">
                {[
                  { label: 'Approved & Commission Earned', count: overview.analytics.statusCounts.approved, color: 'text-emerald-400' },
                  { label: 'Pending Admin Verification', count: overview.analytics.statusCounts.pending_approval, color: 'text-amber-300' },
                  { label: 'In 5-Minute QR Window', count: overview.analytics.statusCounts.awaiting_payment, color: 'text-zinc-200' },
                  { label: 'Rejected UTRs', count: overview.analytics.statusCounts.rejected, color: 'text-red-400' },
                  { label: 'Timer Expired', count: overview.analytics.statusCounts.expired, color: 'text-zinc-500' },
                ].map((row) => (
                  <div key={row.label} className="py-3 flex items-center justify-between">
                    <dt className="text-zinc-300 text-xs sm:text-sm">{row.label}</dt>
                    <dd className={`font-mono font-bold tabular-nums ${row.color}`}>{row.count}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Earning Subscriptions */}
            <div className="lg:col-span-7 bg-[#121216] border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="font-display text-base font-bold text-white">Top Commission-Earning Plans</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-zinc-400">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4 text-right">Orders</th>
                      <th className="py-3 px-4 text-right">Revenue</th>
                      <th className="py-3 px-4 text-right">Commission Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-sm">
                    {overview.analytics.topProducts.map((item) => (
                      <tr key={item.productId} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <ServiceBrandMark brandKey={item.brandKey} name={item.productName} size="sm" />
                            <span className="font-medium text-white">{item.productName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-zinc-300 tabular-nums">
                          {item.orders}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-white tabular-nums">
                          {formatInr(item.revenueInr)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#E50914] tabular-nums">
                          +{formatInr(item.commissionInr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daily Commission Log */}
            <div className="lg:col-span-5 bg-[#121216] border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="font-display text-base font-bold text-white">Daily Revenue &amp; Profit</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-zinc-400">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Sales</th>
                      <th className="py-3 px-4 text-right">Revenue</th>
                      <th className="py-3 px-4 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-sm">
                    {overview.analytics.dailySeries.map((day) => (
                      <tr key={day.date} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-mono text-xs text-zinc-300 tabular-nums">{day.date}</td>
                        <td className="py-3 px-4 text-right font-mono text-zinc-300 tabular-nums">{day.orders}</td>
                        <td className="py-3 px-4 text-right font-mono text-white tabular-nums">
                          {formatInr(day.revenueInr)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400 tabular-nums">
                          +{formatInr(day.commissionInr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Payment Approvals */}
      {activeTab === 'approvals' && overview && (
        <div className="bg-[#121216] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-base font-bold text-white">Order Verification Queue</h2>
            <div className="flex items-center gap-1.5 text-xs">
              {[
                { key: 'pending_approval', label: 'Pending' },
                { key: 'approved', label: 'Approved' },
                { key: 'awaiting_payment', label: 'In Timer' },
                { key: 'rejected', label: 'Rejected' },
                { key: 'all', label: 'All' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setOrderFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    orderFilter === f.key
                      ? 'bg-[#E50914] text-white'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-10 text-center text-sm text-zinc-400">
              No orders matching this filter right now.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-zinc-400">
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Subscription &amp; Plan</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Profit</th>
                    <th className="py-3 px-4">UTR Reference</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                  {filteredOrders.map((ord) => {
                    const comm = ord.commissionInr || calculateCommission(ord.amountInr, ord.baseCostInr);
                    return (
                      <tr key={ord.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-white tabular-nums">
                          {ord.orderRef}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-white">{ord.userName}</div>
                          <div className="text-xs text-zinc-400">{ord.userEmail}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-white">{ord.productName}</div>
                          <div className="text-xs text-zinc-400">{ord.planLabel || ord.billingCycle}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-white tabular-nums">
                          {formatInr(ord.amountInr)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#E50914] tabular-nums">
                          +{formatInr(comm)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-zinc-200 tabular-nums">
                          {ord.utrNumber || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {ord.status === 'pending_approval' || ord.status === 'awaiting_payment' ? (
                            <button
                              type="button"
                              onClick={() => openReviewModal(ord)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#F40612] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Review &amp; Approve
                            </button>
                          ) : ord.status === 'approved' ? (
                            <span className="text-xs font-semibold text-emerald-400">3 Creds Sent</span>
                          ) : (
                            <span className="text-xs text-zinc-500">Closed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Products & Photos CRUD */}
      {activeTab === 'products' && overview && (
        <div className="bg-[#121216] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold text-white">Catalog Products, Photos &amp; Margins</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configure base cost, higher reseller price, Monthly/Quarterly/Yearly tiers, and product photos.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateProduct}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#F40612] rounded-lg cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add New Product</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-zinc-400">
                  <th className="py-3 px-4">Product &amp; Photo</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                  <th className="py-3 px-4 text-right">Sell Price</th>
                  <th className="py-3 px-4 text-right">Reseller Profit</th>
                  <th className="py-3 px-4 text-right">Slots</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm">
                {overview.products.map((prod) => {
                  const profit = calculateCommission(prod.splitPriceInr, prod.baseCostInr);
                  const margin = calculateMarginPercent(prod.splitPriceInr, prod.baseCostInr);
                  const thumb = resolveProductImageSrc(prod.imageUrl, prod.brandKey, prod.category);
                  return (
                    <tr key={prod.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={thumb}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                          />
                          <ServiceBrandMark brandKey={prod.brandKey} name={prod.name} size="sm" />
                          <div>
                            <div className="font-semibold text-white">{prod.name}</div>
                            <div className="text-xs text-zinc-400">
                              {(prod.plans?.length || 1)} plan tiers · {prod.active ? 'Active' : 'Hidden'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-zinc-400">{prod.category}</td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-zinc-400 tabular-nums">
                        {formatInr(prod.baseCostInr)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-white tabular-nums">
                        {formatInr(prod.splitPriceInr)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-[#E50914] tabular-nums">
                        +{formatInr(profit)} ({margin}%)
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-zinc-300 tabular-nums">
                        {prod.availableSlots} / {prod.totalSlots}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditProduct(prod)}
                            aria-label={`Edit ${prod.name}`}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            aria-label={`Delete ${prod.name}`}
                            className="p-1.5 text-zinc-400 hover:text-[#E50914] hover:bg-red-950/50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: User Management */}
      {activeTab === 'users' && overview && (
        <div className="bg-[#121216] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#E50914]" aria-hidden="true" />
              <h2 className="font-display text-base font-bold text-white">Registered Customers &amp; Admins</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="search"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user or email..."
                  aria-label="Search users"
                  className="pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 bg-[#0A0A0D] border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div className="flex items-center gap-1 p-0.5 bg-[#0A0A0D] border border-white/10 rounded-lg text-xs">
                {(['all', 'customer', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-2.5 py-1 rounded-md capitalize cursor-pointer ${
                      userRoleFilter === r ? 'bg-[#E50914] text-white font-semibold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-zinc-400">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Orders</th>
                  <th className="py-3 px-4 text-right">Approved Spend</th>
                  <th className="py-3 px-4 text-right">Commission Gen.</th>
                  <th className="py-3 px-4 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm">
                {filteredUsers.map((u) => {
                  const isSelf = u.id === user.id;
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-semibold text-white">{u.name}</td>
                      <td className="py-3.5 px-4 text-zinc-300 font-mono text-xs">{u.email}</td>
                      <td className="py-3.5 px-4 text-xs capitalize">
                        <span className={u.role === 'admin' ? 'text-[#E50914] font-semibold' : 'text-zinc-300'}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-zinc-200 tabular-nums">
                        {u.approvedCount}/{u.orderCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-white tabular-nums">
                        {formatInr(u.totalSpentInr)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-400 tabular-nums">
                        +{formatInr(u.commissionGeneratedInr)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={isSelf || actionBusy}
                          onClick={() => handleToggleUserRole(u)}
                          className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-white/5 hover:bg-white/10 disabled:opacity-40 border border-white/15 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {isSelf
                            ? 'Current Admin'
                            : u.role === 'admin'
                              ? 'Demote to Customer'
                              : 'Promote to Admin'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Vercel, ZIP & Firebase */}
      {activeTab === 'deployment' && overview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-[#E50914]" aria-hidden="true" />
              <h2 className="font-display text-base font-bold text-white">Firebase Auth &amp; Vercel Runtime</h2>
            </div>
            <dl className="divide-y divide-white/10 text-sm">
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-zinc-400">Website Brand</dt>
                <dd className="font-display font-bold text-white">ottsub</dd>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-zinc-400">Firebase Project ID</dt>
                <dd className="font-mono font-semibold text-white">dhru-3d8e4</dd>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-zinc-400">Active Persistence Mode</dt>
                <dd className="font-mono font-semibold text-white">Vercel Redis (Upstash KV)</dd>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-zinc-400">Auto Config API</dt>
                <dd className="font-mono text-zinc-200">/api/config</dd>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-zinc-400">Hidden Admin Route</dt>
                <dd className="font-mono text-zinc-200">/admin</dd>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-zinc-400">Configured Merchant UPI</dt>
                <dd className="font-mono font-semibold text-[#E50914]">{overview.upiId}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-base font-bold text-white">Download Source ZIP &amp; Deploy to Vercel</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Export the complete Vercel-ready source archive (including <span className="font-mono text-zinc-200">vercel.json</span>, <span className="font-mono text-zinc-200">api/index.ts</span>, <span className="font-mono text-zinc-200">@upstash/redis</span> adapter, and automatic <span className="font-mono text-zinc-200">/api/config</span> Firebase endpoint) to push to GitHub and deploy on Vercel.
            </p>
            <a
              href="/ottsub-vercel-source.zip"
              download="ottsub-vercel-source.zip"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#F40612] rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Download ottsub-vercel-source.zip</span>
            </a>
            <ol className="space-y-2 text-xs text-zinc-400 list-decimal list-inside leading-relaxed pt-2 border-t border-white/10">
              <li>Push the repository to GitHub and import it into Vercel (or run <span className="font-mono text-zinc-200">vercel --prod</span>).</li>
              <li>Connect your Vercel Upstash Redis database (<span className="font-mono text-zinc-200">KV_REST_API_URL</span>, <span className="font-mono text-zinc-200">KV_REST_API_TOKEN</span>, <span className="font-mono text-zinc-200">REDIS_URL</span>).</li>
              <li>Add your <span className="font-mono text-zinc-200">*.vercel.app</span> domain under Firebase Console &gt; Authentication &gt; Authorized domains.</li>
              <li>Open <span className="font-mono text-zinc-200">/admin</span> on your live site to manage orders, analytics, and products.</li>
            </ol>
          </div>
        </div>
      )}

      {/* MODAL: Review & Approve with 3 Credentials */}
      {reviewOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approve-modal-title"
        >
          <div className="w-full max-w-lg bg-[#121216] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 id="approve-modal-title" className="font-display text-base font-bold text-white">
                  Approve Payment &amp; Deliver 3 Credentials
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  {reviewOrder.orderRef} · {reviewOrder.userEmail} · UTR {reviewOrder.utrNumber || 'Not submitted'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewOrder(null)}
                aria-label="Close review modal"
                className="p-2 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApproveOrder} className="p-6 space-y-4">
              <div className="p-3 bg-[#0A0A0D] border border-white/10 rounded-xl flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-200">
                  {reviewOrder.productName} ({reviewOrder.planLabel || reviewOrder.billingCycle})
                </span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {formatInr(reviewOrder.amountInr)}
                </span>
              </div>

              <div className="space-y-3">
                {[1, 2, 3].map((num) => {
                  const key = `credential${num}` as 'credential1' | 'credential2' | 'credential3';
                  const cred = credsForm[key];
                  return (
                    <div key={key} className="grid grid-cols-5 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                          Credential {num} Label
                        </label>
                        <input
                          type="text"
                          required
                          value={cred.label}
                          onChange={(e) =>
                            setCredsForm((prev) => ({
                              ...prev,
                              [key]: { ...prev[key], label: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 text-xs text-white bg-[#0A0A0D] border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                          Credential {num} Value *
                        </label>
                        <input
                          type="text"
                          required
                          value={cred.value}
                          onChange={(e) =>
                            setCredsForm((prev) => ({
                              ...prev,
                              [key]: { ...prev[key], value: e.target.value },
                            }))
                          }
                          placeholder={`Enter credential ${num} value`}
                          className="w-full px-3 py-2 text-xs font-mono text-white bg-[#0A0A0D] border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Usage Note for User</label>
                <input
                  type="text"
                  value={credsForm.deliveryNote || ''}
                  onChange={(e) => setCredsForm((prev) => ({ ...prev, deliveryNote: e.target.value }))}
                  placeholder="Optional instructions (e.g. Use Profile 3 only)"
                  className="w-full px-3 py-2 text-xs text-white bg-[#0A0A0D] border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Rejection Reason (only if rejecting)
                </label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. UTR not found in UPI statement"
                  className="w-full px-3 py-2 text-xs text-white bg-[#0A0A0D] border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  disabled={actionBusy}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#F40612] disabled:opacity-50 rounded-lg cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>Approve &amp; Send 3 Credentials</span>
                </button>
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={handleRejectOrder}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-red-200 bg-red-950/60 hover:bg-red-950 border border-red-500/40 rounded-lg cursor-pointer"
                >
                  <XCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Reject</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create / Edit Subscription with Photos & Reseller Tiers */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
        >
          <div className="w-full max-w-3xl bg-[#121216] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 id="product-modal-title" className="font-display text-base font-bold text-white">
                {isNewProduct ? 'Add New Product & Photos' : `Edit ${editingProduct.name}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                aria-label="Close product modal"
                className="p-2 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* Product Photo & Logo Preview */}
              <div className="p-4 bg-[#0A0A0D] border border-white/10 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative w-36 h-24 rounded-lg overflow-hidden border border-white/15 shrink-0 bg-[#121216]">
                    <img
                      src={resolveProductImageSrc(
                        editingProduct.imageUrl,
                        editingProduct.brandKey,
                        editingProduct.category
                      )}
                      alt="Product cover preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1.5 left-1.5">
                      <ServiceBrandMark
                        brandKey={editingProduct.brandKey || 'custom'}
                        name={editingProduct.name || 'OS'}
                        size="sm"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="block text-xs font-semibold text-zinc-200">
                      Product Cover Photo (Preset, URL, or Upload)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_PRODUCT_MEDIA.map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, imageUrl: preset.key })}
                          className={`px-2.5 py-1 text-[11px] rounded-md border cursor-pointer ${
                            editingProduct.imageUrl === preset.key
                              ? 'bg-[#E50914] text-white border-[#E50914]'
                              : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                      <label className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-md cursor-pointer">
                        <Upload className="w-3 h-3" aria-hidden="true" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={editingProduct.imageUrl || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                      placeholder="preset:ott-cinema or custom image URL"
                      className="w-full px-3 py-1.5 text-xs font-mono text-white bg-[#121216] border border-white/15 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Adobe Creative Cloud"
                    className="w-full px-3 py-2 text-sm text-white bg-[#0A0A0D] border border-white/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Brand Logo</label>
                  <select
                    value={editingProduct.brandKey || 'custom'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brandKey: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white bg-[#0A0A0D] border border-white/15 rounded-lg"
                  >
                    {BRAND_OPTIONS.map((b) => (
                      <option key={b.key} value={b.key}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
                  <select
                    value={editingProduct.category || 'Streaming'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value as SubscriptionCategory,
                      })
                    }
                    className="w-full px-3 py-2 text-sm text-white bg-[#0A0A0D] border border-white/15 rounded-lg"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-white bg-[#0A0A0D] border border-white/15 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Open Slots</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editingProduct.availableSlots ?? 4}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, availableSlots: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm font-mono text-white bg-[#0A0A0D] border border-white/15 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Total Slots</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingProduct.totalSlots ?? 4}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, totalSlots: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm font-mono text-white bg-[#0A0A0D] border border-white/15 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Visibility</label>
                  <select
                    value={editingProduct.active !== false ? 'true' : 'false'}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, active: e.target.value === 'true' })
                    }
                    className="w-full px-3 py-2 text-sm text-white bg-[#0A0A0D] border border-white/15 rounded-lg"
                  >
                    <option value="true">Active on Storefront</option>
                    <option value="false">Hidden Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Plan Highlights (comma-separated)
                </label>
                <input
                  type="text"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="4K Dolby Vision, Private PIN Lock, Instant Activation"
                  className="w-full px-3 py-2 text-xs text-white bg-[#0A0A0D] border border-white/15 rounded-lg"
                />
              </div>

              {/* Multi-Duration Reseller Pricing Tiers */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-zinc-100">
                      Plan Durations &amp; Reseller Profit Margin
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Add, edit, or remove custom durations (set Months = 0 for Lifetime / One-Time).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addEditingPlan()}
                    data-testid="add-duration-btn"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#E50914] hover:bg-[#F40612] rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Add Duration</span>
                  </button>
                </div>

                {/* Quick Duration Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mr-1">
                    Quick Add:
                  </span>
                  {[
                    { label: 'Monthly', months: 1 },
                    { label: '2 Months', months: 2 },
                    { label: '3 Months', months: 3 },
                    { label: '6 Months', months: 6 },
                    { label: 'Yearly', months: 12 },
                    { label: 'Monthly Full Account', months: 1, badge: '4 Devices' },
                    { label: 'Lifetime', months: 0, badge: 'Lifetime' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => addEditingPlan(preset)}
                      className="px-2 py-1 text-[10px] font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-md cursor-pointer"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5">
                  {(editingProduct.plans || DEFAULT_PLANS).map((plan, idx) => {
                    const profit = calculateCommission(plan.splitPriceInr, plan.baseCostInr);
                    const margin = calculateMarginPercent(plan.splitPriceInr, plan.baseCostInr);
                    const canDelete = (editingProduct.plans || []).length > 1;
                    return (
                      <div
                        key={plan.id || idx}
                        className="bg-[#0A0A0D] p-3 rounded-xl border border-white/10 space-y-2.5"
                        data-testid={`duration-row-${idx}`}
                      >
                        <div className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-12 sm:col-span-4">
                            <label className="block text-[10px] text-zinc-400 mb-1">Duration Label *</label>
                            <input
                              type="text"
                              required
                              value={plan.label}
                              onChange={(e) => updateEditingPlan(idx, 'label', e.target.value)}
                              placeholder="e.g. 6 Months / Yearly"
                              className="w-full px-2.5 py-1.5 text-xs text-white bg-[#121216] border border-white/15 rounded-md"
                            />
                          </div>
                          <div className="col-span-5 sm:col-span-3">
                            <label className="block text-[10px] text-zinc-400 mb-1">Months (0=Life)</label>
                            <input
                              type="number"
                              min={0}
                              required
                              value={plan.durationMonths}
                              onChange={(e) => updateEditingPlan(idx, 'durationMonths', Number(e.target.value))}
                              className="w-full px-2 py-1.5 text-xs font-mono text-white bg-[#121216] border border-white/15 rounded-md"
                            />
                          </div>
                          <div className="col-span-5 sm:col-span-4">
                            <label className="block text-[10px] text-zinc-400 mb-1">Badge (Optional)</label>
                            <input
                              type="text"
                              value={plan.badge || ''}
                              onChange={(e) => updateEditingPlan(idx, 'badge', e.target.value)}
                              placeholder="4 Devices / Own Mail"
                              className="w-full px-2.5 py-1.5 text-xs text-white bg-[#121216] border border-white/15 rounded-md"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              disabled={!canDelete}
                              onClick={() => removeEditingPlan(idx)}
                              aria-label={`Remove ${plan.label || 'duration'}`}
                              className="p-2 text-zinc-400 hover:text-red-400 disabled:opacity-30 bg-[#121216] border border-white/10 rounded-md cursor-pointer disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-4 sm:col-span-3">
                            <label className="block text-[10px] text-zinc-400 mb-1">Base Cost (₹)</label>
                            <input
                              type="number"
                              min={0}
                              required
                              value={plan.baseCostInr}
                              onChange={(e) => updateEditingPlan(idx, 'baseCostInr', Number(e.target.value))}
                              className="w-full px-2 py-1.5 text-xs font-mono text-white bg-[#121216] border border-white/15 rounded-md"
                            />
                          </div>
                          <div className="col-span-4 sm:col-span-3">
                            <label className="block text-[10px] text-zinc-400 mb-1">ottsub Sell Price (₹)</label>
                            <input
                              type="number"
                              min={1}
                              required
                              value={plan.splitPriceInr}
                              onChange={(e) => updateEditingPlan(idx, 'splitPriceInr', Number(e.target.value))}
                              className="w-full px-2 py-1.5 text-xs font-mono text-white bg-[#121216] border border-white/15 rounded-md"
                            />
                          </div>
                          <div className="col-span-4 sm:col-span-3">
                            <label className="block text-[10px] text-zinc-400 mb-1">Retail Price (₹)</label>
                            <input
                              type="number"
                              min={1}
                              required
                              value={plan.retailPriceInr}
                              onChange={(e) => updateEditingPlan(idx, 'retailPriceInr', Number(e.target.value))}
                              className="w-full px-2 py-1.5 text-xs font-mono text-white bg-[#121216] border border-white/15 rounded-md"
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-3 text-right pt-2 sm:pt-4 font-mono text-xs font-bold text-[#E50914] tabular-nums">
                            Profit +{formatInr(profit)} ({margin}%)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-2.5">
                <p className="text-xs font-semibold text-zinc-200">Default 3-Credential Delivery Template</p>
                {[1, 2, 3].map((num) => {
                  const key = `credential${num}` as 'credential1' | 'credential2' | 'credential3';
                  const cred = editingProduct.defaultCredentials?.[key] || { label: `Credential ${num}`, value: '' };
                  return (
                    <div key={key} className="grid grid-cols-5 gap-2">
                      <input
                        type="text"
                        value={cred.label}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            defaultCredentials: {
                              ...(editingProduct.defaultCredentials || EMPTY_CREDS),
                              [key]: { ...cred, label: e.target.value },
                            },
                          })
                        }
                        placeholder={`Label ${num}`}
                        className="col-span-2 px-3 py-1.5 text-xs text-white bg-[#0A0A0D] border border-white/15 rounded-lg"
                      />
                      <input
                        type="text"
                        value={cred.value}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            defaultCredentials: {
                              ...(editingProduct.defaultCredentials || EMPTY_CREDS),
                              [key]: { ...cred, value: e.target.value },
                            },
                          })
                        }
                        placeholder={`Default value ${num}`}
                        className="col-span-3 px-3 py-1.5 text-xs font-mono text-white bg-[#0A0A0D] border border-white/15 rounded-lg"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-300 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionBusy}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#F40612] rounded-lg cursor-pointer"
                >
                  {actionBusy ? 'Saving...' : isNewProduct ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
