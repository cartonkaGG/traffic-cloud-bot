import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { api } from '../api';
import { Card, Badge, Button, EmptyState, PageTitle } from '../components/ui';
import { IconByName, formatMoney, staggerContainer, fadeUp } from '../utils';
import { Layers } from 'lucide-react';

export default function OffersPage() {
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([api.getCategories(), api.getSources()])
      .then(([cats, srcs]) => {
        setCategories(cats);
        setSources(srcs);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (selectedSource) params.source = selectedSource;
    api.getOffers(params).then(setOffers);
  }, [selectedCategory, selectedSource]);

  const startCampaign = async () => {
    if (!selectedOffer) return;
    setCampaignLoading(true);
    setMessage('');
    try {
      await api.createCampaign({ offer_id: selectedOffer.id });
      setMessage('Кампанію створено! Додай бота в канал для відстеження.');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setCampaignLoading(false);
    }
  };

  if (loading) return null;

  if (selectedOffer) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
        <button
          onClick={() => setSelectedOffer(null)}
          className="flex items-center gap-2 text-zinc-500 hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>

        <Card glow>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${selectedOffer.category_color}22` }}
            >
              <IconByName name={selectedOffer.category_icon} style={{ color: selectedOffer.category_color }} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">{selectedOffer.title}</h1>
              <div className="flex gap-2 mt-1">
                <Badge color={selectedOffer.category_color}>{selectedOffer.category_name}</Badge>
                <Badge color={selectedOffer.source_color}>{selectedOffer.source_name}</Badge>
              </div>
            </div>
          </div>

          <p className="text-zinc-500 text-sm mb-4">{selectedOffer.description}</p>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 mb-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Ціна за підписника</p>
            <p className="billing-price-sale text-3xl font-bold mt-1">
              {formatMoney(selectedOffer.price_per_user)}
            </p>
            {selectedOffer.min_subscribers > 0 && (
              <p className="text-xs text-zinc-500 mt-1">Мін. підписників: {selectedOffer.min_subscribers}</p>
            )}
          </div>

          {message && (
            <p className={`text-sm mb-3 ${message.includes('створено') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}

          <Button variant="gold" className="w-full" onClick={startCampaign} disabled={campaignLoading}>
            {campaignLoading ? 'Створення...' : 'Почати залив трафіку'}
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <PageTitle title="Офери" subtitle="Обери напрямок та джерело трафіку" />

      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 mb-2">Напрямок</p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 px-3 py-2 rounded-xl text-sm cursor-pointer transition-colors ${
              !selectedCategory ? 'bg-accent/20 text-accent border border-accent/35 shadow-[inset_0_0_0_1px_rgba(94,200,255,0.2)]' : 'border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Всі
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer transition-colors ${
                selectedCategory === cat.slug ? 'text-white border border-white/10' : 'border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
              }`}
              style={selectedCategory === cat.slug ? { backgroundColor: cat.color } : {}}
            >
              <IconByName name={cat.icon} className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 mb-2">Джерело трафіку</p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <button
            onClick={() => setSelectedSource(null)}
            className={`shrink-0 px-3 py-2 rounded-xl text-sm cursor-pointer transition-colors ${
              !selectedSource ? 'bg-accent/20 text-accent border border-accent/35' : 'border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Всі
          </button>
          {sources.map((src) => (
            <button
              key={src.id}
              onClick={() => setSelectedSource(src.slug)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer transition-colors ${
                selectedSource === src.slug ? 'text-white border border-white/10' : 'border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
              }`}
              style={selectedSource === src.slug ? { backgroundColor: src.color } : {}}
            >
              <IconByName name={src.icon} className="w-4 h-4" />
              {src.name}
            </button>
          ))}
        </div>
      </div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
        <AnimatePresence>
          {offers.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="Немає оферів"
              description="Спробуй змінити фільтри або зачекай поки адмін додасть нові"
            />
          ) : (
            offers.map((offer) => (
              <motion.div key={offer.id} variants={fadeUp}>
                <Card onClick={() => setSelectedOffer(offer)} className="hover:border-accent/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${offer.source_color}22` }}
                      >
                        <IconByName name={offer.source_icon} style={{ color: offer.source_color }} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{offer.title}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <Badge color={offer.category_color}>{offer.category_name}</Badge>
                          <span className="text-accent font-semibold text-sm">
                            {formatMoney(offer.price_per_user)}/підп.
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600" />
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
