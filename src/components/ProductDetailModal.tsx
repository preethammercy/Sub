import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, X } from 'lucide-react';
import { calculateSavingsPercent, formatInr, resolveProductPlan } from '../lib/paymentLogic';
import { Product } from '../types';
import { ProductPosterArtwork } from './ProductPosterArtwork';

interface ProductDetailModalProps {
  product: Product | null;
  initialPlanId?: string;
  relatedProducts: Product[];
  buyingProductId: string | null;
  onClose: () => void;
  onBuyNow: (product: Product, planId: string) => void;
  onSelectRelated: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  initialPlanId,
  relatedProducts,
  buyingProductId,
  onClose,
  onBuyNow,
  onSelectRelated,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('1m');

  useEffect(() => {
    if (product) {
      const resolved = resolveProductPlan(product, initialPlanId);
      setSelectedPlanId(resolved.id);
    }
  }, [product, initialPlanId]);

  if (!product) return null;

  const plans = product.plans && product.plans.length > 0 ? product.plans : [resolveProductPlan(product)];
  const activePlan = resolveProductPlan(product, selectedPlanId);
  const savings = calculateSavingsPercent(activePlan.splitPriceInr, activePlan.retailPriceInr);
  const soldOut = product.availableSlots <= 0;
  const isBusy = buyingProductId === product.id;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 18 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-[#0D0D11] border border-white/15 rounded-2xl overflow-hidden shadow-[0_32px_90px_rgba(0,0,0,0.9)] my-auto max-h-[92vh] flex flex-col"
        >
          <div className="h-1 w-full bg-[#E50914] shrink-0" />

          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#121216] shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E50914]">
                {product.category}
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400 truncate">ottsub Verified Seat</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close product plans"
              className="p-1.5 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Poster & Price Summary matching Reference Photo 1 */}
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-stretch">
              <div className="w-44 h-44 sm:w-48 sm:h-48 shrink-0 rounded-2xl overflow-hidden border border-white/15 shadow-2xl group">
                <ProductPosterArtwork
                  brandKey={product.brandKey}
                  name={product.name}
                  imageUrl={product.imageUrl}
                  discountPercent={savings}
                />
              </div>

              <div className="flex-1 flex flex-col justify-center text-center sm:text-left space-y-2.5 min-w-0">
                <h2 id="product-detail-title" className="font-display text-2xl font-extrabold text-white">
                  {product.name}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  <span className="font-display text-3xl font-black text-white tabular-nums">
                    {formatInr(activePlan.splitPriceInr)}
                  </span>
                  <span className="text-sm text-zinc-500 line-through tabular-nums">
                    {formatInr(activePlan.retailPriceInr)}
                  </span>
                  {savings > 0 && (
                    <span className="px-2.5 py-0.5 text-[11px] font-bold bg-[#1F1F26] text-zinc-200 border border-white/10 rounded-md">
                      {savings}% OFF
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{product.description}</p>
                <div className="pt-1 flex items-center justify-center sm:justify-start gap-3 text-xs">
                  <span className={soldOut ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                    {soldOut ? 'Currently Full' : `${product.availableSlots}/${product.totalSlots} seats open`}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-400 font-mono">UPI: preethamrishu@axl</span>
                </div>
              </div>
            </div>

            {/* Choose a plan — Full 2-Column Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Choose a plan</h3>
                <span className="text-[11px] text-zinc-400">
                  {plans.length === 1
                    ? '1 verified plan available'
                    : `${plans.length} durations & account tiers available`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {plans.map((plan) => {
                  const selected = plan.id === activePlan.id;
                  return (
                    <motion.button
                      key={plan.id}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#2A090D]/90 border-[#E50914] shadow-[0_0_20px_rgba(229,9,20,0.22)]'
                          : 'bg-[#141419] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-zinc-200 leading-snug">
                          {plan.label}
                        </span>
                        {selected && (
                          <Check className="w-3.5 h-3.5 text-[#E50914] shrink-0 mt-0.5" aria-hidden="true" />
                        )}
                      </div>
                      <div className="mt-1.5 flex items-baseline justify-between gap-2">
                        <span className="font-display text-base font-extrabold text-white tabular-nums">
                          {formatInr(plan.splitPriceInr)}
                        </span>
                        {plan.badge && (
                          <span className="text-[10px] font-medium text-zinc-400">{plan.badge}</span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Giant Primary CTA */}
            <motion.button
              type="button"
              disabled={soldOut || isBusy}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onBuyNow(product, activePlan.id)}
              className="w-full py-3.5 px-5 flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#E50914] hover:bg-[#F40612] disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl transition-colors cursor-pointer shadow-[0_10px_30px_rgba(229,9,20,0.35)]"
            >
              <span>
                {soldOut
                  ? 'Currently Sold Out'
                  : isBusy
                    ? 'Creating 5-Minute UPI Checkout...'
                    : `Buy Now · ${formatInr(activePlan.splitPriceInr)}`}
              </span>
              {!soldOut && !isBusy && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
            </motion.button>

            {/* Description & features matching Reference Photo 2 */}
            <div className="bg-[#121216] border border-white/10 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white">Description &amp; features</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {product.name} · {activePlan.label}. Verified shared seat or Full Account delivery via your
                ottsub Orders Vault with 3 protected credentials right after UPI verification.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-xs text-zinc-200">
                    <Check className="w-3.5 h-3.5 text-[#E50914] shrink-0" aria-hidden="true" />
                    <span>{feat}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-xs text-zinc-200">
                  <Check className="w-3.5 h-3.5 text-[#E50914] shrink-0" aria-hidden="true" />
                  <span>5-Minute Instant UPI QR Checkout</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-zinc-200">
                  <Check className="w-3.5 h-3.5 text-[#E50914] shrink-0" aria-hidden="true" />
                  <span>3-Credential Verified Access</span>
                </li>
              </ul>
            </div>

            {/* Related Products matching Reference Photo 2 */}
            {relatedProducts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">Related products</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {relatedProducts.slice(0, 3).map((rel) => {
                    const relPlan = resolveProductPlan(rel);
                    const relSavings = calculateSavingsPercent(relPlan.splitPriceInr, relPlan.retailPriceInr);
                    return (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={() => onSelectRelated(rel)}
                        className="group bg-[#121216] border border-white/10 hover:border-[#E50914]/60 rounded-xl overflow-hidden text-left transition-colors cursor-pointer"
                      >
                        <div className="h-24 w-full">
                          <ProductPosterArtwork
                            brandKey={rel.brandKey}
                            name={rel.name}
                            imageUrl={rel.imageUrl}
                            discountPercent={relSavings}
                            compact
                          />
                        </div>
                        <div className="p-2.5 space-y-1">
                          <p className="text-xs font-bold text-white truncate">{rel.name}</p>
                          <p className="text-xs font-mono font-bold text-[#E50914]">
                            {formatInr(relPlan.splitPriceInr)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
