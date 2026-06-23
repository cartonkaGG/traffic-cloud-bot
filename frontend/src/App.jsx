import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api, initTelegram } from './api';
import { LoadingScreen } from './components/ui';
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
        <p className="text-red-400 mb-2">Помилка авторизації</p>
        <p className="text-muted text-sm">{error}</p>
        <p className="text-muted text-xs mt-4">Відкрийте через Telegram бота</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage user={user} stats={stats} onNavigate={setPage} />;
      case 'offers':
        return <OffersPage />;
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
    <div className="min-h-screen pb-28">
      <div className="fixed top-0 left-0 right-0 h-48 bg-gradient-to-b from-accent/10 to-transparent pointer-events-none z-0" />

      <main className="relative z-10 max-w-lg mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
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
