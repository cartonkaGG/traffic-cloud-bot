import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Clock, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../api';
import { Card, Button, EmptyState } from '../components/ui';
import { formatMoney, staggerContainer, fadeUp } from '../utils';

const statusConfig = {
  pending: { label: 'Очікує', icon: Clock, color: '#F59E0B' },
  approved: { label: 'Виплачено', icon: CheckCircle, color: '#10B981' },
  rejected: { label: 'Відхилено', icon: XCircle, color: '#EF4444' },
};

export default function PayoutPage({ user, onRefresh }) {
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getPayouts().then(setPayouts);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.requestPayout({ amount: parseFloat(amount), wallet });
      setMessage('Запит на виплату відправлено!');
      setAmount('');
      setWallet('');
      const updated = await api.getPayouts();
      setPayouts(updated);
      onRefresh?.();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">Виплата</h1>
        <p className="text-muted text-sm mt-1">Мінімальна сума — $10</p>
      </div>

      <motion.div variants={fadeUp}>
        <Card glow>
          <p className="text-muted text-sm">Доступно для виводу</p>
          <p className="font-heading text-3xl font-bold text-primary mt-1">
            {formatMoney(user?.balance)}
          </p>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted block mb-1">Сума ($)</label>
              <input
                type="number"
                step="0.01"
                min="10"
                max={user?.balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10.00"
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted block mb-1">Гаманець (USDT TRC20)</label>
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="T..."
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>

            {message && (
              <p className={`text-sm ${message.includes('відправлено') ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}

            <Button type="submit" variant="gold" className="w-full" disabled={loading}>
              {loading ? 'Відправка...' : 'Запросити виплату'}
            </Button>
          </form>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="font-heading font-semibold mb-3">Історія</h2>
        {payouts.length === 0 ? (
          <EmptyState icon={Wallet} title="Немає виплат" description="Тут з'являться ваші запити на виплату" />
        ) : (
          <div className="space-y-2">
            {payouts.map((p) => {
              const cfg = statusConfig[p.status] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              return (
                <Card key={p.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{formatMoney(p.amount)}</p>
                    <p className="text-xs text-muted mt-0.5">{p.created_at?.slice(0, 10)}</p>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ color: cfg.color }}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm">{cfg.label}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
