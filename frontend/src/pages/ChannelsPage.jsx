import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, ArrowLeft, Users, UserMinus, DollarSign } from 'lucide-react';
import { api } from '../api';
import { Card, Badge, EmptyState, PageTitle } from '../components/ui';
import { SubscribersChart } from '../components/Charts';
import { formatMoney, staggerContainer, fadeUp } from '../utils';

export default function ChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [stats, setStats] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    api.getChannels().then(setChannels).finally(() => setLoading(false));
    api.getOffers().then(setOffers);
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      api.getChannelStats(selectedChannel.id).then(setStats);
    }
  }, [selectedChannel]);

  if (loading) return null;

  if (selectedChannel && stats) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
        <button
          onClick={() => { setSelectedChannel(null); setStats(null); }}
          className="flex items-center gap-2 text-zinc-500 hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>

        <Card glow>
          <h1 className="font-semibold text-white">{stats.channel.title}</h1>
          {stats.channel.offer_title && (
            <Badge color="#5ec8ff" className="mt-2">{stats.channel.offer_title}</Badge>
          )}
        </Card>

        <div className="grid grid-cols-3 gap-2">
          <Card className="text-center p-3">
            <Users className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-400">{stats.totals.joins}</p>
            <p className="text-[10px] text-zinc-500">Вхід</p>
          </Card>
          <Card className="text-center p-3">
            <UserMinus className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-400">{stats.totals.leaves}</p>
            <p className="text-[10px] text-zinc-500">Вихід</p>
          </Card>
          <Card className="text-center p-3">
            <DollarSign className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="text-lg font-bold text-accent">{formatMoney(stats.totals.estimated_earnings)}</p>
            <p className="text-[10px] text-zinc-500">Заробіток</p>
          </Card>
        </div>

        <Card>
          <h2 className="font-semibold mb-3 text-sm text-white">Динаміка підписників</h2>
          <SubscribersChart data={stats.daily} />
        </Card>

        <Card>
          <p className="text-sm text-zinc-500">
            Чистий приріст: <span className="text-white font-semibold">{stats.totals.net}</span> підписників
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            Поточних підписників (відстежено): {stats.channel.subscriber_count}
          </p>
        </Card>

        {!stats.channel.offer_id && offers.length > 0 && (
          <Card>
            <p className="text-sm font-medium mb-3">Прив'язати офер</p>
            <div className="space-y-2">
              {offers.slice(0, 5).map((o) => (
                <button
                  key={o.id}
                  disabled={linking}
                  onClick={async () => {
                    setLinking(true);
                    await api.linkChannelOffer(stats.channel.id, o.id);
                    const updated = await api.getChannelStats(stats.channel.id);
                    setStats(updated);
                    setLinking(false);
                  }}
                  className="w-full text-left rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 hover:border-accent/30 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {o.title} — {formatMoney(o.price_per_user)}
                </button>
              ))}
            </div>
          </Card>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <PageTitle title="Канали" subtitle="Додай бота адміном у канал — він автоматично з'явиться тут" />

      <Card className="border-accent/20">
        <p className="text-sm">
          <span className="text-accent font-medium">Як підключити:</span>
        </p>
        <ol className="text-xs text-zinc-500 mt-2 space-y-1 list-decimal list-inside">
          <li>Додай бота адміністратором у свій TG канал</li>
          <li>Увімкни право "Запрошувати користувачів" та "Додавати учасників"</li>
          <li>Обери офер і почни кампанію</li>
        </ol>
      </Card>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
        <AnimatePresence>
          {channels.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="Немає каналів"
              description="Додай бота адміністратором у Telegram канал"
            />
          ) : (
            channels.map((ch) => (
              <motion.div key={ch.id} variants={fadeUp}>
                <Card onClick={() => setSelectedChannel(ch)} className="hover:border-accent/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{ch.title}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {ch.subscriber_count} підписників
                        {ch.offer_title && ` · ${ch.offer_title}`}
                      </p>
                    </div>
                    {ch.price_per_user && (
                      <span className="text-accent font-semibold text-sm">
                        {formatMoney(ch.price_per_user)}
                      </span>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
