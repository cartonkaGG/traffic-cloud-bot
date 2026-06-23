import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp, Zap } from 'lucide-react';
import { api } from '../api';
import { Card, StatCard } from '../components/ui';
import { EarningsChart } from '../components/Charts';
import { formatMoney, staggerContainer, fadeUp } from '../utils';

export default function HomePage({ user, stats, onNavigate }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    api.getEarningsChart().then(setChartData).catch(() => {});
  }, []);

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
      <motion.div variants={fadeUp}>
        <p className="text-muted text-sm">Вітаємо,</p>
        <h1 className="font-heading text-2xl font-bold text-glow">
          {user?.first_name || user?.username || 'Traffic Cloud'}
        </h1>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card glow className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          <p className="text-muted text-sm">Баланс</p>
          <p className="font-heading text-4xl font-bold text-primary mt-1">
            {formatMoney(user?.balance)}
          </p>
          <button
            onClick={() => onNavigate('payout')}
            className="mt-4 text-sm text-accent hover:text-accent/80 cursor-pointer transition-colors"
          >
            Запросити виплату →
          </button>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <StatCard
          label="Підписники"
          value={stats?.net_subscribers || 0}
          sub={`+${stats?.total_joins || 0} / -${stats?.total_leaves || 0}`}
          icon={Users}
          color="#10B981"
        />
        <StatCard
          label="Кампанії"
          value={stats?.active_campaigns || 0}
          sub="активних"
          icon={Zap}
          color="#8B5CF6"
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              Заробіток
            </h2>
            <span className="text-xs text-muted">14 днів</span>
          </div>
          <EarningsChart data={chartData} />
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="font-heading font-semibold mb-3">Швидкий старт</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card onClick={() => onNavigate('offers')} className="hover:border-accent/30 transition-colors">
            <DollarSign className="w-6 h-6 text-primary mb-2" />
            <p className="font-medium text-sm">Обрати офер</p>
            <p className="text-xs text-muted mt-1">Крипто, спорт, новини</p>
          </Card>
          <Card onClick={() => onNavigate('channels')} className="hover:border-accent/30 transition-colors">
            <Users className="w-6 h-6 text-accent mb-2" />
            <p className="font-medium text-sm">Мої канали</p>
            <p className="text-xs text-muted mt-1">Статистика входу/виходу</p>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
