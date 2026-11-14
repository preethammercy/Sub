export type UserRole = 'customer' | 'admin';

export type SubscriptionCategory =
  | 'Streaming'
  | 'Combos'
  | 'AI & Tools'
  | 'Music'
  | 'Productivity'
  | 'Learning'
  | 'Security';

export type OrderStatus =
  | 'awaiting_payment'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
  createdAt: string;
}

export interface CredentialItem {
  label: string;
  value: string;
}

export interface OrderCredentials {
  credential1: CredentialItem;
  credential2: CredentialItem;
  credential3: CredentialItem;
  deliveryNote?: string;
}

export interface PlanOption {
  id: string;
  label: string;
  durationMonths: number;
  baseCostInr: number;
  splitPriceInr: number;
  retailPriceInr: number;
  badge?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brandKey: string;
  category: SubscriptionCategory;
  description: string;
  imageUrl?: string;
  billingCycle: string;
  baseCostInr: number;
  splitPriceInr: number;
  retailPriceInr: number;
  plans: PlanOption[];
  totalSlots: number;
  availableSlots: number;
  features: string[];
  active: boolean;
  defaultCredentials?: OrderCredentials;
  createdAt: string;
}

export interface Order {
  id: string;
  orderRef: string;
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  productName: string;
  brandKey: string;
  planId?: string;
  planLabel?: string;
  billingCycle: string;
  amountInr: number;
  baseCostInr: number;
  commissionInr: number;
  upiId: string;
  upiUri: string;
  qrDataUrl?: string;
  utrNumber?: string;
  payerUpiId?: string;
  status: OrderStatus;
  adminNote?: string;
  credentials?: OrderCredentials;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
  approvedAt?: string;
}

export interface CategoryRevenuePoint {
  category: string;
  orders: number;
  revenueInr: number;
  baseCostInr: number;
  commissionInr: number;
}

export interface TopProductPoint {
  productId: string;
  productName: string;
  brandKey: string;
  orders: number;
  revenueInr: number;
  commissionInr: number;
}

export interface DailySeriesPoint {
  date: string;
  orders: number;
  revenueInr: number;
  commissionInr: number;
}

export interface AnalyticsSummary {
  totalRevenueInr: number;
  totalBaseCostInr: number;
  totalCommissionInr: number;
  avgMarginPercent: number;
  conversionRatePercent: number;
  statusCounts: Record<OrderStatus, number>;
  categoryBreakdown: CategoryRevenuePoint[];
  topProducts: TopProductPoint[];
  dailySeries: DailySeriesPoint[];
}

export type DbPersistenceMode = 'vercel-redis';

export interface AdminOverview {
  dbMode: DbPersistenceMode;
  upiId: string;
  metrics: {
    pendingApprovals: number;
    approvedOrders: number;
    totalRevenueInr: number;
    totalBaseCostInr: number;
    totalCommissionInr: number;
    avgMarginPercent: number;
    totalUsers: number;
    activeProducts: number;
    openSlots: number;
  };
  analytics: AnalyticsSummary;
  orders: Order[];
  products: Product[];
  users: Array<
    User & {
      orderCount: number;
      approvedCount: number;
      totalSpentInr: number;
      commissionGeneratedInr: number;
    }
  >;
}
