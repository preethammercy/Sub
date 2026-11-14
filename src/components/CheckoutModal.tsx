import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import QRCode from 'qrcode';
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { api } from '../lib/api';
import {
  MERCHANT_UPI_ID,
  PAYMENT_WINDOW_SECONDS,
  computeRemainingSeconds,
  formatCountdown,
  formatInr,
} from '../lib/paymentLogic';
import { Order } from '../types';
import { ServiceBrandMark } from './ServiceBrandMark';

interface CheckoutModalProps {
  order: Order | null;
  onClose: () => void;
  onPaymentSubmitted: (updated: Order) => void;
  onRestartOrder: (productId: string, planId?: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  order,
  onClose,
  onPaymentSubmitted,
  onRestartOrder,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(PAYMENT_WINDOW_SECONDS);
  const [qrSrc, setQrSrc] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [payerUpiId, setPayerUpiId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!order) return;
    setUtrNumber('');
    setPayerUpiId('');
    setError('');
    setRemainingSeconds(computeRemainingSeconds(order.expiresAt));

    if (order.qrDataUrl) {
      setQrSrc(order.qrDataUrl);
    } else if (order.upiUri) {
      QRCode.toDataURL(order.upiUri, {
        width: 320,
        margin: 2,
        color: { dark: '#09090B', light: '#FFFFFF' },
      })
        .then(setQrSrc)
        .catch(() => setQrSrc(''));
    }
  }, [order]);

  useEffect(() => {
    if (!order || order.status !== 'awaiting_payment') return;
    const tick = () => {
      setRemainingSeconds(computeRemainingSeconds(order.expiresAt));
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [order]);

  const isExpired =
    Boolean(order) &&
    (order!.status === 'expired' || (order!.status === 'awaiting_payment' && remainingSeconds <= 0));
  const isUrgent = !isExpired && remainingSeconds <= 60;
  const progressRatio = Math.max(0, Math.min(1, remainingSeconds / PAYMENT_WINDOW_SECONDS));

  const handleCopyUpi = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.upiId || MERCHANT_UPI_ID);
      setCopiedUpi(true);
      window.setTimeout(() => setCopiedUpi(false), 1800);
    } catch {
      // Ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await api.submitOrderPayment(order.id, {
        utrNumber,
        payerUpiId: payerUpiId || undefined,
      });
      onPaymentSubmitted(res.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit payment verification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl bg-[#121216] border border-white/10 rounded-2xl shadow-[0_24px_90px_rgba(0,0,0,0.9)] overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <ServiceBrandMark brandKey={order.brandKey} name={order.productName} size="sm" />
                <div className="min-w-0">
                  <h2 id="checkout-modal-title" className="font-display text-base font-bold text-white truncate">
                    {order.productName}
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono tabular-nums">
                    Order {order.orderRef} · {order.planLabel || order.billingCycle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold tabular-nums border ${
                    isExpired
                      ? 'bg-red-950/70 text-red-300 border-red-500/40'
                      : isUrgent
                        ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                        : 'bg-white/5 text-white border-white/15'
                  }`}
                  data-testid="checkout-countdown"
                >
                  <Clock className="w-4 h-4 text-[#E50914]" aria-hidden="true" />
                  <span>{isExpired ? '00:00 Expired' : formatCountdown(remainingSeconds)}</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close checkout dialog"
                  className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 5-Minute Timer Progress Strip */}
            <div className="h-1 w-full bg-white/10 overflow-hidden">
              <div
                className={`h-full origin-left transition-transform duration-500 ${
                  isExpired ? 'bg-red-700' : isUrgent ? 'bg-amber-500' : 'bg-[#E50914]'
                }`}
                style={{ transform: `scaleX(${progressRatio})` }}
              />
            </div>

            {isExpired ? (
              <div className="p-8 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-950/70 text-[#E50914] flex items-center justify-center border border-red-500/30">
                  <AlertCircle className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-display text-lg font-bold text-white">5-Minute Payment Window Expired</h3>
                  <p className="text-sm text-zinc-400">
                    For slot reservation integrity, dynamic UPI QR codes lock after 5 minutes. Generate a fresh QR code to continue your order.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-sm font-medium text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onRestartOrder(order.productId, order.planId)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#E50914] hover:bg-[#F40612] rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    <span>Generate Fresh 5-Min QR</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
                {/* Left Column: Dynamic QR & UPI ID */}
                <div className="p-6 flex flex-col items-center text-center bg-[#0C0C10]">
                  <p className="text-xs font-medium text-zinc-400">Scan with GPay, PhonePe, Paytm, or BHIM</p>
                  <p className="font-display text-3xl font-extrabold text-white tabular-nums mt-1">
                    {formatInr(order.amountInr)}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">{order.planLabel || order.billingCycle} Plan</p>

                  <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-4 p-3 bg-white rounded-xl shadow-[0_0_32px_rgba(229,9,20,0.2)]"
                  >
                    {qrSrc ? (
                      <img
                        src={qrSrc}
                        alt={`UPI QR code for ${formatInr(order.amountInr)} to ${order.upiId}`}
                        className="w-48 h-48 object-contain"
                        data-testid="upi-qr-image"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-zinc-100 flex items-center justify-center text-xs text-zinc-600">
                        Generating QR...
                      </div>
                    )}
                  </motion.div>

                  <div className="mt-4 w-full space-y-2">
                    <div className="flex items-center justify-between px-3 py-2 bg-[#141418] border border-white/10 rounded-lg">
                      <div className="text-left min-w-0">
                        <span className="block text-[11px] text-zinc-400">Payee UPI ID</span>
                        <span
                          className="font-mono text-xs font-semibold text-white truncate block"
                          data-testid="checkout-upi-id"
                        >
                          {order.upiId}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-200 bg-white/10 hover:bg-white/15 rounded-md transition-colors shrink-0 cursor-pointer"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#E50914]" aria-hidden="true" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <a
                      href={order.upiUri}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Open in Mobile UPI App</span>
                    </a>
                  </div>
                </div>

                {/* Right Column: Submit Payment UTR */}
                <div className="p-6 flex flex-col justify-between">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <h3 className="font-display text-base font-bold text-white">Confirm Your UPI Payment</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Complete the {formatInr(order.amountInr)} transfer to{' '}
                        <span className="font-mono font-medium text-white">{order.upiId}</span> before the 5-minute timer runs out, then submit your 12-digit UTR number below.
                      </p>
                    </div>

                    {error && (
                      <div
                        className="p-3 text-xs text-red-200 bg-red-950/70 border border-red-500/40 rounded-lg"
                        role="alert"
                      >
                        {error}
                      </div>
                    )}

                    <div>
                      <label htmlFor="utr-input" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        12-Digit UPI UTR / Reference Number *
                      </label>
                      <input
                        id="utr-input"
                        type="text"
                        required
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. 431982736451"
                        className="w-full px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-zinc-500 bg-[#0A0A0D] border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                      />
                    </div>

                    <div>
                      <label htmlFor="payer-upi-input" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Your UPI ID (Optional)
                      </label>
                      <input
                        id="payer-upi-input"
                        type="text"
                        value={payerUpiId}
                        onChange={(e) => setPayerUpiId(e.target.value)}
                        placeholder="yourname@okaxis"
                        className="w-full px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 bg-[#0A0A0D] border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#E50914] hover:bg-[#F40612] disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-[0_0_24px_rgba(229,9,20,0.35)]"
                    >
                      {submitting ? 'Submitting UTR...' : 'Submit Payment for Verification'}
                    </motion.button>
                  </form>

                  <div className="mt-5 pt-4 border-t border-white/10 flex items-start gap-2.5 text-xs text-zinc-400">
                    <ShieldCheck className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      Once submitted, our admin verifies your UTR and dispatches all 3 account credentials directly to your ottsub Orders Vault.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
