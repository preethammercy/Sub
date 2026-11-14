import React from 'react';
import { motion } from 'motion/react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

export type AppView = 'storefront' | 'orders' | 'admin';

interface NavbarProps {
  activeView: AppView;
  onNavigate: (view: AppView, sectionId?: string) => void;
  user: User | null;
  pendingOrdersCount: number;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  user,
  pendingOrdersCount,
  onOpenAuth,
  onLogout,
}) => {
  const navItems: Array<{ id: string; label: string; active: boolean; action: () => void }> = [
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      active: activeView === 'storefront',
      action: () => onNavigate('storefront', 'catalog'),
    },
    {
      id: 'how-it-works',
      label: 'How It Works',
      active: false,
      action: () => onNavigate('storefront', 'how-it-works'),
    },
    {
      id: 'orders',
      label: pendingOrdersCount > 0 ? `My Orders (${pendingOrdersCount})` : 'My Orders',
      active: activeView === 'orders',
      action: () => onNavigate('orders'),
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070709]/88 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('storefront')}
          className="font-display text-2xl font-extrabold tracking-tight whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] rounded"
        >
          <span className="text-white">ott</span>
          <span className="text-[#E50914]">sub</span>
        </motion.button>

        {/* Zone 2: Clean single-line links (Admin Panel intentionally hidden from public nav) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400" aria-label="Primary">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={`relative whitespace-nowrap shrink-0 py-1.5 transition-colors cursor-pointer ${
                item.active ? 'text-white font-semibold' : 'hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              {item.active && (
                <motion.div
                  layoutId="nav-active-underline"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-[#E50914] rounded-full"
                />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate(activeView === 'admin' ? 'admin' : 'orders')}
                className="flex items-center gap-2 text-sm font-medium text-zinc-200 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full border border-white/20 object-cover"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-[#E50914]" aria-hidden="true" />
                )}
                <span className="max-w-[140px] truncate">{user.name}</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                aria-label="Sign Out"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenAuth}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#E50914] hover:bg-[#F40612] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-[0_0_20px_rgba(229,9,20,0.35)]"
            >
              Sign In
            </motion.button>
          )}
        </div>
      </div>

      {/* Mobile secondary compact nav (no Admin link) */}
      <nav
        className="flex md:hidden items-center justify-around border-t border-white/10 px-2 py-2 text-xs font-medium text-zinc-400"
        aria-label="Mobile navigation"
      >
        <button
          type="button"
          onClick={() => onNavigate('storefront', 'catalog')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeView === 'storefront' ? 'bg-[#E50914]/15 text-white font-semibold' : ''
          }`}
        >
          Subscriptions
        </button>
        <button
          type="button"
          onClick={() => onNavigate('storefront', 'how-it-works')}
          className="px-3 py-1.5 rounded-md whitespace-nowrap"
        >
          How It Works
        </button>
        <button
          type="button"
          onClick={() => onNavigate('orders')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeView === 'orders' ? 'bg-[#E50914]/15 text-white font-semibold' : ''
          }`}
        >
          My Orders
        </button>
      </nav>
    </header>
  );
};
