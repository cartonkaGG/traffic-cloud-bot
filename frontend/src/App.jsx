import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api, initTelegram } from './api';
import { LoadingScreen } from './components/ui';
import PanelBrand from './components/brand/PanelBrand';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import OffersPage from './pages/OffersPage';
import ChannelsPage from './pages/ChannelsPage';
import PayoutPage from './pages/PayoutPage';
import AdminPage from './pages/AdminPage';
import { pageVariants } from './utils';

export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setStats(data.stats);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    initTelegram();
    const params = new URLSearchParams(window.location.search);
    const initialPage = params.get('page');
    if (initialPage) setPage(initialPage);

    refresh().finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <p className="text-red-400 mb-2 font-medium">Помилка авторизації</p>
        <p className="text-zinc-500 text-sm">{error}</p>
        <p className="text-zinc-600 text-xs mt-4">Відкрийте через Telegram бота</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage user={user} stats={stats} onNavigate={setPage} />;
      case 'offers':
        return <OffersPage onNavigate={setPage} />;
      case 'channels':
        return <ChannelsPage />;
      case 'payout':
        return <PayoutPage user={user} onRefresh={refresh} />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage user={user} stats={stats} onNavigate={setPage} />;
    }
  };

  return (
    <div className="min-h-screen pb-28 relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="vu-glow vu-glow--cyan absolute -left-[10%] top-[5%] h-64 w-64 rounded-full bg-accent/20 blur-[80px] opacity-45" />
        <div className="absolute -right-[5%] bottom-[20%] h-56 w-56 rounded-full bg-indigo-500/15 blur-[80px] opacity-40" />
      </div>

      <header className="relative z-10 max-w-lg mx-auto px-4 pt-5 pb-2">
        <PanelBrand />
      </header>

      <main className="relative z-10 max-w-lg mx-auto px-4 pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav
        active={page}
        onChange={setPage}
        isAdmin={user?.is_admin}
        onAdmin={() => setPage('admin')}
      />
    </div>
  );
}
