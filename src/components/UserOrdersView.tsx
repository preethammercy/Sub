import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Clock,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { computeRemainingSeconds, formatCountdown, formatInr } from '../lib/paymentLogic';
import { Order, OrderStatus } from '../types';
import { ServiceBrandMark } from './ServiceBrandMark';

interface UserOrdersViewProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  onResumeCheckout: (order: Order) => void;
  onBrowsePlans: () => void;
}

const STATUS_META: Record<OrderStatus, { label: string; colorClass: string }> = {
  awaiting_payment: {
    label: 'Awaiting Payment',
    colorClass: 'text-amber-300 bg-amber-950/60 border-amber-500/35',
  },
  pending_approval: {
    label: 'Pending Verification',
    colorClass: 'text-zinc-200 bg-white/5 border-white/20',
  },
  approved: {
    label: 'Approved & Active',
    colorClass: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/35',
  },
  rejected: {
    label: 'Rejected',
    colorClass: 'text-red-300 bg-red-950/70 border-red-500/40',
  },
  expired: {
    label: 'Timer Expired',
    colorClass: 'text-zinc-400 bg-white/5 border-white/10',
  },
};

export const UserOrdersView: React.FC<UserOrdersViewProps> = ({
  orders,
  loading,
  onRefresh,
  onResumeCheckout,
  onBrowsePlans,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const hasActiveTimer = orders.some((o) => o.status === 'awaiting_payment');
    if (!hasActiveTimer) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [orders]);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      // Ignore
    }
  };

  const toggleReveal = (key: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">My Orders & Credential Vault</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Track UPI payment verifications and access your 3 delivered subscription credentials.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>Refresh Status</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-10 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-xl bg-white/5 text-[#E50914] flex items-center justify-center border border-white/10">
            <KeyRound className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="font-display text-lg font-bold text-white">No subscription orders yet</h2>
            <p className="text-sm text-zinc-400">
              Choose any shared plan from the marketplace, complete the 5-minute UPI QR payment, and your 3 credentials will appear here.
            </p>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onBrowsePlans}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#E50914] hover:bg-[#F40612] rounded-lg transition-colors cursor-pointer"
          >
            Browse Subscription Plans
          </motion.button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order, idx) => {
            const remaining = computeRemainingSeconds(order.expiresAt, nowTick);
            const effectiveStatus: OrderStatus =
              order.status === 'awaiting_payment' && remaining <= 0 ? 'expired' : order.status;
            const statusInfo = STATUS_META[effectiveStatus];

            return (
              <motion.article
                key={order.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.25) }}
                className="bg-[#121216] border border-white/10 rounded-2xl overflow-hidden"
                data-testid={`user-order-${order.orderRef}`}
              >
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <ServiceBrandMark brandKey={order.brandKey} name={order.productName} size="md" />
                    <div className="min-w-0">
                      <h2 className="font-display text-base font-bold text-white truncate">
                        {order.productName}
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5 font-mono tabular-nums">
                        {order.orderRef} · {order.planLabel || order.billingCycle} · {formatInr(order.amountInr)}
                        {order.utrNumber ? ` · UTR ${order.utrNumber}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg ${statusInfo.colorClass}`}
                    >
                      {effectiveStatus === 'approved' && <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />}
                      {effectiveStatus === 'pending_approval' && <Clock className="w-3.5 h-3.5" aria-hidden="true" />}
                      {effectiveStatus === 'rejected' && <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />}
                      <span>{statusInfo.label}</span>
                    </span>

                    {effectiveStatus === 'awaiting_payment' && (
                      <button
                        type="button"
                        onClick={() => onResumeCheckout(order)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#F40612] rounded-lg font-mono tabular-nums cursor-pointer"
                      >
                        Pay Now ({formatCountdown(remaining)})
                      </button>
                    )}
                  </div>
                </div>

                {effectiveStatus === 'pending_approval' && (
                  <div className="px-6 py-4 bg-white/[0.03] text-sm text-zinc-300 flex items-center justify-between gap-4">
                    <span>
                      UTR <span className="font-mono font-semibold text-white">{order.utrNumber}</span> submitted to{' '}
                      <span className="font-mono text-zinc-200">{order.upiId}</span>. Your 3 credentials will unlock here immediately once verified.
                    </span>
                  </div>
                )}

                {effectiveStatus === 'rejected' && (
                  <div className="px-6 py-4 bg-red-950/35 text-sm text-red-200">
                    <span className="font-semibold">Admin Note:</span>{' '}
                    {order.adminNote || 'Payment could not be verified.'}
                  </div>
                )}

                {effectiveStatus === 'expired' && (
                  <div className="px-6 py-4 bg-white/[0.02] text-sm text-zinc-400 flex items-center justify-between gap-4">
                    <span>The 5-minute UPI payment window elapsed before UTR submission.</span>
                    <button
                      type="button"
                      onClick={onBrowsePlans}
                      className="text-xs font-semibold text-[#E50914] hover:underline cursor-pointer shrink-0"
                    >
                      Order Again
                    </button>
                  </div>
                )}

                {effectiveStatus === 'approved' && order.credentials && (
                  <div className="p-5 sm:p-6 bg-[#0C0C10] space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold text-[#E50914] uppercase tracking-wider">
                        Verified 3-Part Access Credentials
                      </h3>
                      {order.approvedAt && (
                        <span className="text-xs text-zinc-500 font-mono tabular-nums">
                          Delivered {new Date(order.approvedAt).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { idx: 1, item: order.credentials.credential1, secret: false },
                        { idx: 2, item: order.credentials.credential2, secret: true },
                        { idx: 3, item: order.credentials.credential3, secret: false },
                      ].map(({ idx: credNum, item, secret }) => {
                        const key = `${order.id}-cred-${credNum}`;
                        const isRevealed = !secret || Boolean(revealedSecrets[key]);
                        return (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: credNum * 0.06 }}
                            className="p-3.5 bg-[#141419] border border-white/10 rounded-xl flex flex-col justify-between gap-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-zinc-400">
                                0{credNum}. {item.label}
                              </span>
                              <div className="flex items-center gap-1">
                                {secret && (
                                  <button
                                    type="button"
                                    onClick={() => toggleReveal(key)}
                                    aria-label={isRevealed ? `Hide ${item.label}` : `Show ${item.label}`}
                                    className="p-1 text-zinc-400 hover:text-white rounded cursor-pointer"
                                  >
                                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleCopy(key, item.value)}
                                  aria-label={`Copy ${item.label}`}
                                  className="p-1 text-zinc-400 hover:text-white rounded cursor-pointer"
                                >
                                  {copiedKey === key ? (
                                    <Check className="w-3.5 h-3.5 text-[#E50914]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <p className="font-mono text-xs font-semibold text-white break-all select-all">
                              {isRevealed ? item.value : '••••••••••••'}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>

                    {order.credentials.deliveryNote && (
                      <p className="text-xs text-zinc-400">
                        <span className="font-semibold text-zinc-200">Usage Note:</span>{' '}
                        {order.credentials.deliveryNote}
                      </p>
                    )}
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
};
