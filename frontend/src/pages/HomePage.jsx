import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp, Zap } from 'lucide-react';
import { api } from '../api';
import { Card, StatCard, PageTitle } from '../components/ui';
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
        <PageTitle
          eyebrow="Вітаємо"
          title={user?.first_name || user?.username || 'Traffic Cloud'}
          subtitle="Керуй трафіком і заробляй"
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card glow className="p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-accent/15 blur-3xl" />
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">Баланс</p>
          <p className="billing-price-sale text-4xl font-bold mt-2">{formatMoney(user?.balance)}</p>
          <button
            onClick={() => onNavigate('payout')}
            className="mt-4 text-sm text-accent hover:text-cyan-200 cursor-pointer transition-colors font-medium"
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
        />
        <StatCard label="Кампанії" value={stats?.active_campaigns || 0} sub="активних" icon={Zap} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-white">
              <TrendingUp className="w-4 h-4 text-accent" />
              Заробіток
            </h2>
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider">14 днів</span>
          </div>
          <EarningsChart data={chartData} />
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-600 mb-3">Швидкий старт</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card onClick={() => onNavigate('offers')} className="hover:border-accent/25">
            <DollarSign className="w-6 h-6 text-accent mb-2" />
            <p className="font-medium text-sm text-white">Обрати офер</p>
            <p className="text-xs text-zinc-500 mt-1">Крипто, спорт, новини</p>
          </Card>
          <Card onClick={() => onNavigate('channels')} className="hover:border-accent/25">
            <Users className="w-6 h-6 text-accent mb-2" />
            <p className="font-medium text-sm text-white">Мої канали</p>
            <p className="text-xs text-zinc-500 mt-1">Статистика входу/виходу</p>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
