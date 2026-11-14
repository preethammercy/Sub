import { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AppView, Navbar } from './components/Navbar';
import { Storefront } from './components/Storefront';
import { UserOrdersView } from './components/UserOrdersView';
import { api, getStoredToken, setStoredToken } from './lib/api';
import { signOutFirebase, testFirestoreConnection } from './lib/firebase';
import { Order, Product, User } from './types';

function resolveViewFromLocation(): AppView {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/admin') return 'admin';
  if (window.location.hash === '#orders') return 'orders';
  return 'storefront';
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>(resolveViewFromLocation);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authPrompt, setAuthPrompt] = useState<string | undefined>(undefined);
  const [pendingSelectionAfterAuth, setPendingSelectionAfterAuth] = useState<{
    product: Product;
    planId?: string;
  } | null>(null);

  const [buyingProductId, setBuyingProductId] = useState<string | null>(null);
  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  const [bannerError, setBannerError] = useState('');

  useEffect(() => {
    testFirestoreConnection();

    const onRouteChange = () => {
      setActiveView(resolveViewFromLocation());
    };
    window.addEventListener('popstate', onRouteChange);
    window.addEventListener('hashchange', onRouteChange);
    return () => {
      window.removeEventListener('popstate', onRouteChange);
      window.removeEventListener('hashchange', onRouteChange);
    };
  }, []);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await api.getProducts();
      setProducts(res.products);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Unable to load subscriptions');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadMyOrders = useCallback(async () => {
    if (!getStoredToken()) {
      setOrders([]);
      return;
    }
    setLoadingOrders(true);
    try {
      const res = await api.getMyOrders();
      setOrders(res.orders);
    } catch {
      // Ignore silent background poll failures
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    const token = getStoredToken();
    if (token) {
      api
        .me()
        .then((res) => {
          setUser(res.user);
        })
        .catch(() => {
          setStoredToken(null);
        });
    }
  }, [loadProducts]);

  useEffect(() => {
    if (user) {
      loadMyOrders();
    } else {
      setOrders([]);
    }
  }, [user, loadMyOrders]);

  useEffect(() => {
    const hasPending = orders.some((o) => o.status === 'pending_approval');
    if (!user || !hasPending) return;
    const timer = window.setInterval(() => {
      loadMyOrders();
    }, 4000);
    return () => window.clearInterval(timer);
  }, [user, orders, loadMyOrders]);

  const startCheckoutForProduct = async (product: Product, planId?: string) => {
    setBannerError('');
    setBuyingProductId(product.id);
    try {
      const res = await api.createOrder(product.id, planId);
      setCheckoutOrder(res.order);
      await loadMyOrders();
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Unable to create order');
    } finally {
      setBuyingProductId(null);
    }
  };

  const handleSelectProduct = (product: Product, planId?: string) => {
    if (!user) {
      setPendingSelectionAfterAuth({ product, planId });
      setAuthPrompt(`Sign in with Google to reserve a seat for ${product.name}`);
      setAuthModalOpen(true);
      return;
    }
    startCheckoutForProduct(product, planId);
  };

  const handleAuthenticated = (authedUser: User) => {
    setUser(authedUser);
    setAuthPrompt(undefined);
    if (pendingSelectionAfterAuth) {
      const { product, planId } = pendingSelectionAfterAuth;
      setPendingSelectionAfterAuth(null);
      startCheckoutForProduct(product, planId);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    }
    await signOutFirebase();
    setStoredToken(null);
    setUser(null);
    setOrders([]);
    setCheckoutOrder(null);
    if (activeView === 'orders') {
      window.history.pushState({}, '', '/');
      setActiveView('storefront');
    }
  };

  const handleNavigate = (view: AppView, sectionId?: string) => {
    if (view === 'orders' && !user) {
      setAuthPrompt('Sign in with Google to view your orders and 3-part credentials');
      setAuthModalOpen(true);
      return;
    }
    setActiveView(view);
    if (view === 'orders') {
      window.history.pushState({}, '', '/#orders');
      window.scrollTo({ top: 0 });
    } else if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
      window.scrollTo({ top: 0 });
    } else if (sectionId) {
      window.history.pushState({}, '', `/#${sectionId}`);
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 40);
    } else {
      window.history.pushState({}, '', '/');
      window.scrollTo({ top: 0 });
    }
  };

  const handlePaymentSubmitted = (updated: Order) => {
    setCheckoutOrder(null);
    setOrders((prev) => [updated, ...prev.filter((o) => o.id !== updated.id)]);
    window.history.pushState({}, '', '/#orders');
    setActiveView('orders');
  };

  const handleRestartExpiredOrder = async (productId: string, planId?: string) => {
    const prod = products.find((p) => p.id === productId);
    setCheckoutOrder(null);
    if (prod) {
      await startCheckoutForProduct(prod, planId);
    }
  };

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'awaiting_payment' || o.status === 'pending_approval'
  ).length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
        <Navbar
          activeView={activeView}
          onNavigate={handleNavigate}
          user={user}
          pendingOrdersCount={pendingOrdersCount}
          onOpenAuth={() => {
            setPendingSelectionAfterAuth(null);
            setAuthPrompt(undefined);
            setAuthModalOpen(true);
          }}
          onLogout={handleLogout}
        />

        {bannerError && (
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
            <div className="p-3 text-sm text-red-200 bg-red-950/70 border border-red-500/40 rounded-xl flex items-center justify-between">
              <span>{bannerError}</span>
              <button
                type="button"
                onClick={() => setBannerError('')}
                className="text-xs font-semibold underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <main className="flex-1">
          {activeView === 'storefront' && (
            <Storefront
              products={products}
              loading={loadingProducts}
              onSelectProduct={handleSelectProduct}
              buyingProductId={buyingProductId}
            />
          )}

          {activeView === 'orders' && (
            <UserOrdersView
              orders={orders}
              loading={loadingOrders}
              onRefresh={loadMyOrders}
              onResumeCheckout={(ord) => setCheckoutOrder(ord)}
              onBrowsePlans={() => handleNavigate('storefront', 'catalog')}
            />
          )}

          {activeView === 'admin' && (
            <AdminPanel
              user={user}
              onAuthenticated={handleAuthenticated}
              onCatalogMutated={loadProducts}
            />
          )}
        </main>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => {
            setAuthModalOpen(false);
            setPendingSelectionAfterAuth(null);
          }}
          onAuthenticated={handleAuthenticated}
          initialPrompt={authPrompt}
        />

        <CheckoutModal
          order={checkoutOrder}
          onClose={() => setCheckoutOrder(null)}
          onPaymentSubmitted={handlePaymentSubmitted}
          onRestartOrder={handleRestartExpiredOrder}
        />
      </div>
    </MotionConfig>
  );
}
