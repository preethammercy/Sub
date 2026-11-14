import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ChevronDown,
  Clock,
  Headphones,
  Mail,
  Search,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';
import {
  calculateSavingsPercent,
  formatInr,
  formatPlanChipLabel,
  resolveProductPlan,
} from '../lib/paymentLogic';
import { Product, SubscriptionCategory } from '../types';
import { ProductDetailModal } from './ProductDetailModal';
import { ProductPosterArtwork } from './ProductPosterArtwork';
import { ServiceBrandMark } from './ServiceBrandMark';

interface StorefrontProps {
  products: Product[];
  loading: boolean;
  onSelectProduct: (product: Product, planId?: string) => void;
  buyingProductId: string | null;
}

const CATEGORIES = [
  'All',
  'Streaming',
  'Combos',
  'AI & Tools',
  'Productivity',
  'Learning',
  'Music',
  'Security',
] as const;
const ORDERED_SECTIONS: SubscriptionCategory[] = [
  'Streaming',
  'Combos',
  'AI & Tools',
  'Productivity',
  'Learning',
  'Music',
  'Security',
];

const MARQUEE_ROW_TOP: Array<{ brandKey: string; label: string }> = [
  { brandKey: 'netflix', label: 'Netflix Premium' },
  { brandKey: 'prime', label: 'Amazon Prime Video' },
  { brandKey: 'youtube', label: 'YouTube Premium' },
  { brandKey: 'chatgpt', label: 'ChatGPT Plus' },
  { brandKey: 'picsart', label: 'Picsart Pro' },
  { brandKey: 'duolingo', label: 'Duolingo Super' },
  { brandKey: 'claude', label: 'Claude Pro Plan' },
  { brandKey: 'canva', label: 'Canva Pro' },
  { brandKey: 'hotstar', label: 'JioHotstar Super' },
  { brandKey: 'spotify', label: 'Spotify Premium' },
  { brandKey: 'gemini', label: 'Google Gemini AI Plus' },
  { brandKey: 'appletv', label: 'Apple TV+' },
];

const MARQUEE_ROW_BOTTOM: Array<{ brandKey: string; label: string }> = [
  { brandKey: 'lionsgate', label: 'LionsGate Play' },
  { brandKey: 'hungama', label: 'Hungama Play' },
  { brandKey: 'f1tv', label: 'F1TV PREMIUM' },
  { brandKey: 'fancode', label: 'Fancode' },
  { brandKey: 'hoichoi', label: 'Hoichoi Premium' },
  { brandKey: 'sonyliv', label: 'SonyLiv Premium' },
  { brandKey: 'nordvpn', label: 'NordVPN Premium' },
  { brandKey: 'perplexity', label: 'Perplexity Pro' },
  { brandKey: 'adobe', label: 'Adobe Creative Cloud' },
  { brandKey: 'tidal', label: 'TIDAL PREMIUM' },
  { brandKey: 'microsoft365', label: 'Microsoft Office 365' },
  { brandKey: 'crunchyroll', label: 'Crunchyroll Mega Fan' },
];

const CUSTOMER_REVIEWS = [
  {
    name: 'Aarav Mehta',
    city: 'Mumbai',
    service: 'Netflix Premium · 3 Months',
    rating: 5,
    quote:
      'Paid via UPI QR within 45 seconds and got all 3 profile login details right in My Orders. Zero logout issues so far.',
  },
  {
    name: 'Sneha Kulkarni',
    city: 'Bengaluru',
    service: 'ChatGPT Plus + Canva Pro',
    rating: 5,
    quote:
      'Used ottsub for my agency workspace. Canva got activated directly on my personal Gmail and ChatGPT Plus runs fast all day.',
  },
  {
    name: 'Rohan Verma',
    city: 'Delhi NCR',
    service: 'JioHotstar 4K + F1TV',
    rating: 5,
    quote:
      'Watched the entire Grand Prix & IPL in 4K at a fraction of official renewal cost. The 5-minute timer checkout was super smooth.',
  },
  {
    name: 'Priya Iyer',
    city: 'Chennai',
    service: 'Spotify + YouTube Premium',
    rating: 5,
    quote:
      'Got invited to the family plan on my own email within minutes of submitting my 12-digit UTR number. Worth every rupee.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'How can I buy a cheap OTT subscription in India on ottsub?',
    a: 'ottsub lets you choose each platform’s verified duration (Monthly, 2 Months, 3 Months, 6 Months, Yearly, or Lifetime) across 70+ OTT, Music, AI, Learning, and Productivity plans at up to 90% off retail. Sign in with Google, scan the 5-minute dynamic UPI QR code (preethamrishu@axl), submit your UTR, and receive your 3 credentials in My Orders.',
  },
  {
    q: 'Do all products have the same durations?',
    a: 'No—each product offers its authentic supported plans (for example, Apple TV+ and Coursera Plus are Yearly, Apple Music is 6 Months, Udemy and Perplexity are Monthly, Spotify is 3M/6M/1Y, and Netflix has 1M/3M/6M/1Y Shared + Full Account 4-device plans).',
  },
  {
    q: 'Can I buy a Netflix Premium 4K subscription at a discount?',
    a: 'Yes. Select Netflix Premium, pick Monthly (1 Device), 3 Months, 6 Months, Yearly, or Full Account (4 Devices), and lock your price with instant UPI checkout.',
  },
  {
    q: 'How do I receive my account credentials after paying?',
    a: 'Once you scan the QR code and submit your 12-digit UPI UTR reference within the 5-minute window, our verification team approves the order and all 3 access credentials (Email/Invite, Password/Token, and Profile PIN) unlock automatically inside My Orders.',
  },
  {
    q: 'Are there any logout or password reset issues?',
    a: 'Every profile slot is strictly assigned to a single member and PIN-locked to prevent overlap, ensuring uninterrupted playback and replacement coverage for your active duration.',
  },
];

export const Storefront: React.FC<StorefrontProps> = ({
  products,
  loading,
  onSelectProduct,
  buyingProductId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanMap, setSelectedPlanMap] = useState<Record<string, string>>({});
  const [detailModalState, setDetailModalState] = useState<{
    product: Product;
    planId?: string;
  } | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brandKey.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const showGroupedBySection = selectedCategory === 'All' && searchQuery.trim() === '';

  const openModalForBrand = (brandKey: string) => {
    const match = products.find((p) => p.brandKey.toLowerCase() === brandKey.toLowerCase());
    if (match) {
      setDetailModalState({ product: match, planId: selectedPlanMap[match.id] });
    } else {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderProductCard = (product: Product, index: number) => {
    const activePlan = resolveProductPlan(product, selectedPlanMap[product.id]);
    const savings = calculateSavingsPercent(activePlan.splitPriceInr, activePlan.retailPriceInr);
    const soldOut = product.availableSlots <= 0;
    const isBusy = buyingProductId === product.id;

    // Show authentic durations for this specific service (up to 4 quick pills on card; full list in modal)
    const nonVariantDuplicates = (product.plans || []).filter(
      (pl) => !pl.id.includes('_full') && !pl.id.includes('on_number')
    );
    const quickPlans = (nonVariantDuplicates.length > 0 ? nonVariantDuplicates : product.plans || []).slice(0, 4);

    return (
      <motion.article
        key={product.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: Math.min(index * 0.02, 0.2),
          ease: [0.16, 1, 0.3, 1],
        }}
        whileHover={{ y: -5, scale: 1.015 }}
        className="group bg-[#121216] border border-white/10 hover:border-[#E50914]/65 rounded-2xl overflow-hidden flex flex-col justify-between transition-colors shadow-[0_14px_40px_rgba(0,0,0,0.55)]"
        data-testid={`product-card-${product.slug}`}
      >
        <div>
          {/* Glossy Product Poster Artwork (Click opens full Multi-Duration Plan Modal) */}
          <button
            type="button"
            onClick={() => setDetailModalState({ product, planId: activePlan.id })}
            className="w-full h-44 sm:h-48 block text-left relative cursor-pointer focus:outline-none"
            aria-label={`View all plans for ${product.name}`}
          >
            <ProductPosterArtwork
              brandKey={product.brandKey}
              name={product.name}
              imageUrl={product.imageUrl}
              discountPercent={savings}
            />
          </button>

          <div className="px-4 pt-3.5 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-sm sm:text-base font-bold text-white leading-snug line-clamp-1 group-hover:text-[#F40612] transition-colors">
                {product.name}
              </h3>
            </div>

            {/* Interactive Quick Duration Switcher OR Authentic Single-Duration Badge */}
            {quickPlans.length > 1 ? (
              <div
                className="grid gap-1 p-0.5 bg-[#0A0A0D] border border-white/10 rounded-lg"
                style={{ gridTemplateColumns: `repeat(${quickPlans.length}, minmax(0, 1fr))` }}
              >
                {quickPlans.map((plan) => {
                  const selected = plan.id === activePlan.id;
                  const shortLabel = formatPlanChipLabel(plan);
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() =>
                        setSelectedPlanMap((prev) => ({ ...prev, [product.id]: plan.id }))
                      }
                      className={`py-1 px-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer truncate ${
                        selected
                          ? 'bg-[#E50914] text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {shortLabel}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-1.5 px-2.5 py-1 bg-[#0A0A0D] border border-white/10 rounded-lg text-[10px] font-semibold text-zinc-300">
                <span className="shrink-0 text-white">{formatPlanChipLabel(activePlan)}</span>
                {activePlan.badge ? (
                  <span className="text-[#E50914] font-bold truncate text-right">{activePlan.badge}</span>
                ) : (
                  <span className="text-zinc-400 truncate text-right">{activePlan.label}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-4 pt-3 space-y-2.5">
          <div className="flex items-baseline justify-between gap-1.5">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-display text-base sm:text-xl font-black text-white tabular-nums whitespace-nowrap">
                {formatInr(activePlan.splitPriceInr)}
              </span>
              <span className="text-[10px] sm:text-[11px] text-zinc-500 line-through tabular-nums whitespace-nowrap">
                {formatInr(activePlan.retailPriceInr)}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 shrink-0 whitespace-nowrap">
              {formatPlanChipLabel(activePlan)}
            </span>
          </div>

          <motion.button
            type="button"
            disabled={soldOut || isBusy}
            whileTap={{ scale: 0.97 }}
            onClick={() => setDetailModalState({ product, planId: activePlan.id })}
            className="w-full py-2.5 px-2.5 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-[#E50914] hover:bg-[#F40612] disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl transition-colors cursor-pointer shadow-[0_6px_22px_rgba(229,9,20,0.28)] whitespace-nowrap"
          >
            <span className="truncate">
              {soldOut
                ? 'Slots Full'
                : isBusy
                  ? 'Opening UPI QR...'
                  : `Buy Now · ${formatInr(activePlan.splitPriceInr)}`}
            </span>
            {!soldOut && !isBusy && <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
          </motion.button>
        </div>
      </motion.article>
    );
  };

  return (
    <div className="relative overflow-hidden">
      {/* Subtle Crimson Cinema Spotlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[620px]"
        style={{
          background:
            'radial-gradient(ellipse 75% 58% at 50% 8%, rgba(229, 9, 20, 0.25), rgba(229, 9, 20, 0.06) 52%, transparent 78%)',
        }}
        aria-hidden="true"
      />

      {/* Replica Hero Section matching Reference Video & Screenshot */}
      <section className="relative pt-10 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          {/* Top Green Verified Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold tracking-wider uppercase text-zinc-200"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span>TRUSTED BY 10,000+ INDIANS</span>
          </motion.div>

          {/* Centered Bold 3-Line Display Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]"
          >
            Premium OTT &amp; Tools.
            <br />
            Simple. Affordable.
            <br />
            <span className="text-[#E50914]">Trusted.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed"
          >
            Instant access to 45+ premium OTT, Music &amp; AI subscriptions on <strong className="text-white">ottsub</strong>.
            From ₹39/month — Monthly, 3 Months, 6 Months &amp; Yearly seats verified via 5-minute UPI QR.
          </motion.p>

          {/* Avatar Cluster + 5 Gold Stars + 4.9 Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#121216] border border-white/10 shadow-lg"
          >
            <div className="flex -space-x-2" aria-hidden="true">
              {[
                { letter: 'A', bg: 'bg-[#E50914]' },
                { letter: 'R', bg: 'bg-amber-400 text-zinc-950' },
                { letter: 'S', bg: 'bg-emerald-500 text-zinc-950' },
                { letter: 'M', bg: 'bg-sky-400 text-zinc-950' },
              ].map((av) => (
                <span
                  key={av.letter}
                  className={`w-6 h-6 rounded-full ${av.bg} border-2 border-[#121216] text-[10px] font-black flex items-center justify-center`}
                >
                  {av.letter}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-0.5 text-amber-400" aria-label="4.9 out of 5 stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              ))}
            </div>
            <span className="text-xs font-bold text-white tabular-nums">4.9</span>
          </motion.div>

          {/* Hero Primary & Secondary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-1"
          >
            <motion.a
              href="#catalog"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-bold text-white bg-[#E50914] hover:bg-[#F40612] rounded-full transition-colors shadow-[0_0_32px_rgba(229,9,20,0.45)]"
            >
              <span>View Plans</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </motion.a>
            <a
              href="#reviews"
              className="flex-1 inline-flex items-center justify-center py-3.5 px-6 text-sm font-bold text-zinc-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 rounded-full transition-colors"
            >
              See Reviews
            </a>
          </motion.div>

          {/* 4-Badge Hero Trust Strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-zinc-300 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#E50914]" aria-hidden="true" />
              <span>Instant delivery</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Secure UPI payments</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#E50914]" aria-hidden="true" />
              <span>MSME verified</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>24/7 support</span>
            </span>
          </div>
        </div>

        {/* DUAL COUNTER-SCROLLING ANIMATED SERVICE LOGO MARQUEES (Left <-> Right) */}
        <div className="mt-10 marquee-group space-y-3 overflow-hidden relative" aria-label="Featured platforms marquee">
          {/* Edge Fade Masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#070709] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-[#070709] to-transparent z-10" />

          {/* Row 1: Right -> Left */}
          <div className="animate-marquee-left gap-3">
            {[...MARQUEE_ROW_TOP, ...MARQUEE_ROW_TOP].map((item, idx) => (
              <button
                key={`top-${item.brandKey}-${idx}`}
                type="button"
                onClick={() => openModalForBrand(item.brandKey)}
                className="inline-flex items-center gap-2.5 px-4 py-2 mx-1.5 rounded-full bg-[#121216] hover:bg-[#1A1A22] border border-white/10 hover:border-[#E50914]/50 transition-colors shrink-0 cursor-pointer"
              >
                <ServiceBrandMark brandKey={item.brandKey} name={item.label} size="sm" />
                <span className="text-xs font-semibold text-white whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Row 2: Left -> Right */}
          <div className="animate-marquee-right gap-3">
            {[...MARQUEE_ROW_BOTTOM, ...MARQUEE_ROW_BOTTOM].map((item, idx) => (
              <button
                key={`bot-${item.brandKey}-${idx}`}
                type="button"
                onClick={() => openModalForBrand(item.brandKey)}
                className="inline-flex items-center gap-2.5 px-4 py-2 mx-1.5 rounded-full bg-[#121216] hover:bg-[#1A1A22] border border-white/10 hover:border-[#E50914]/50 transition-colors shrink-0 cursor-pointer"
              >
                <ServiceBrandMark brandKey={item.brandKey} name={item.label} size="sm" />
                <span className="text-xs font-semibold text-white whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalog" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-white">All Subscriptions &amp; Plans</h2>
            <p className="text-sm text-zinc-400 mt-0.5">
              Authentic service-specific durations (Monthly, 2M, 3M, 6M, Yearly &amp; Lifetime) — click any card for all tiers &amp; instant UPI QR checkout.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Netflix, Prime, ChatGPT, Canva..."
              aria-label="Search subscriptions"
              className="w-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 bg-[#121216] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          className="flex items-center gap-1.5 p-1 bg-[#121216] border border-white/10 rounded-xl w-fit max-w-full overflow-x-auto"
          role="tablist"
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            const count =
              cat === 'All'
                ? products.length
                : products.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="category-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 bg-[#E50914] rounded-lg"
                  />
                )}
                <span className="relative z-10">
                  {cat} ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Catalog Grid (Sectioned like subsplit.in when All is selected, or filtered) */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-80 bg-[#121216] border border-white/10 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-10 text-center space-y-2">
            <p className="font-display text-base font-bold text-white">No matching subscriptions found</p>
            <p className="text-sm text-zinc-400">Try clearing your search query or switching categories.</p>
          </div>
        ) : showGroupedBySection ? (
          <div className="space-y-10">
            {ORDERED_SECTIONS.map((sec) => {
              const secProducts = filteredProducts.filter((p) => p.category === sec);
              if (secProducts.length === 0) return null;
              return (
                <div key={sec} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <h3 className="font-display text-lg sm:text-xl font-extrabold text-white">{sec}</h3>
                    <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
                      {secProducts.length} {secProducts.length === 1 ? 'ITEM' : 'ITEMS'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    {secProducts.map((product, idx) => renderProductCard(product, idx))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((product, idx) => renderProductCard(product, idx))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/10">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-extrabold text-white">How ottsub Works</h2>
          <p className="text-sm text-zinc-400 mt-1">
            A transparent 3-step checkout workflow built around direct UPI payments and instant 3-credential seat delivery.
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              step: '01. Lock Your Plan & Duration',
              body: 'Pick any subscription and choose Monthly, 3 Months, 6 Months, Yearly, or Full Account. Your checkout reserves a 5-minute QR locked to that exact INR price.',
            },
            {
              step: '02. Pay UPI & Submit UTR',
              body: 'Scan the generated dynamic QR code paying preethamrishu@axl using PhonePe, GPay, or Paytm and submit your 12-digit UTR reference number.',
            },
            {
              step: '03. Unlock 3 Verified Credentials',
              body: 'Once verified, all 3 access credentials (Account Email/Invite, Password/Token, and Profile PIN) unlock immediately inside your ottsub Orders Vault.',
            },
          ].map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-2"
            >
              <h3 className="font-display text-base font-bold text-white">{item.step}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Customer Stories / Real Reviews */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/35 text-[11px] font-bold text-[#E50914]">
            <Star className="w-3 h-3 fill-current" aria-hidden="true" />
            <span>Customer Stories</span>
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-white">
            Real Reviews from <span className="text-[#E50914]">Happy Customers</span>
          </h2>
          <p className="text-sm text-zinc-400">
            See what thousands of ottsub members say about fast UPI approvals and reliable seats.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {CUSTOMER_REVIEWS.map((rev, idx) => (
            <motion.div
              key={rev.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              className="bg-[#121216] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400">Verified Buyer</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">“{rev.quote}”</p>
              </div>
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs font-bold text-white">{rev.name}</p>
                <p className="text-[11px] text-zinc-400">
                  {rev.city} · {rev.service}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section matching Reference Photo 16 */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 border-t border-white/10">
        <div className="text-center space-y-2 mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-black text-white leading-tight">
            Have Questions?
            <br />
            <span className="text-[#E50914]">We&apos;ve Got You Covered!</span>
          </h2>
          <p className="text-sm text-zinc-400">
            Everything you need to know about buying shared OTT, Music, and AI subscriptions on ottsub.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={item.q}
                className="bg-[#121216] border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-bold text-white">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#E50914] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rich MSME-Verified Footer matching Reference Photo 17 (Zero Admin Links) */}
      <footer className="border-t border-white/10 bg-[#050507]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-4">
              <div className="font-display text-xl font-black tracking-tight">
                <span className="text-white">ott</span>
                <span className="text-[#E50914]">sub</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                Your trusted destination for premium OTT, Music, AI &amp; Productivity subscriptions at unbeatable prices.
                Entertainment, creativity, and productivity — all in one place.
              </p>
              <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#121216] border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">MSME Verified</p>
                  <p className="text-[11px] text-zinc-400">Udyam Registered India</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2.5 text-xs">
              <p className="font-bold text-white uppercase tracking-wider text-[11px]">Company</p>
              <ul className="space-y-1.5 text-zinc-400">
                <li><a href="#catalog" className="hover:text-white transition-colors">All Subscriptions</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How Verification Works</a></li>
                <li><a href="#reviews" className="hover:text-white transition-colors">Customer Stories</a></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-2.5 text-xs">
              <p className="font-bold text-white uppercase tracking-wider text-[11px]">Support</p>
              <ul className="space-y-1.5 text-zinc-400">
                <li><a href="#faq" className="hover:text-white transition-colors">Help Center &amp; FAQ</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Delivery Info</a></li>
                <li><span className="text-zinc-400">3-Credential Vault</span></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2.5 text-xs">
              <p className="font-bold text-white uppercase tracking-wider text-[11px]">Contact &amp; UPI</p>
              <div className="space-y-2 text-zinc-400">
                <p className="inline-flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#E50914]" aria-hidden="true" />
                  <span>help.ottsub@gmail.com</span>
                </p>
                <p className="font-mono text-zinc-300">Merchant UPI: preethamrishu@axl</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>© 2026 ottsub India. Verified shared subscription marketplace.</p>
            <p className="font-mono text-zinc-400">5-Minute Dynamic UPI Checkout · 1M / 3M / 6M / 1Y</p>
          </div>
        </div>
      </footer>

      {/* Multi-Plan Selector Modal matching Reference Photos 1 & 2 */}
      <ProductDetailModal
        product={detailModalState?.product || null}
        initialPlanId={detailModalState?.planId}
        relatedProducts={
          detailModalState
            ? products.filter(
                (p) =>
                  p.id !== detailModalState.product.id &&
                  p.category === detailModalState.product.category
              )
            : []
        }
        buyingProductId={buyingProductId}
        onClose={() => setDetailModalState(null)}
        onBuyNow={(prod, planId) => {
          setDetailModalState(null);
          onSelectProduct(prod, planId);
        }}
        onSelectRelated={(rel) => setDetailModalState({ product: rel })}
      />
    </div>
  );
};
