import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ArrowLeft,
  Target,
  DollarSign,
  Layers,
  CheckCircle2,
  Bot,
  Link2,
  Wallet,
} from 'lucide-react';
import { api } from '../api';
import { Card, Badge, Button, EmptyState, PageTitle } from '../components/ui';
import { IconByName, formatMoney, staggerContainer, fadeUp } from '../utils';

const STEPS = [
  { icon: Target, text: 'Обери напрямок і джерело трафіку' },
  { icon: CheckCircle2, text: 'Підключи офер до свого каналу' },
  { icon: Wallet, text: 'Отримуй оплату за кожного підписника' },
];

const NEXT_STEPS = [
  { icon: Bot, text: 'Додай бота адміністратором у свій Telegram-канал' },
  { icon: Link2, text: 'Відкрий вкладку «Канали» і прив\'яжи цей офер' },
  { icon: DollarSign, text: 'Заробляй за кожного нового підписника' },
];

function FilterTile({ active, onClick, icon, label, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 cursor-pointer transition-all duration-200 ${
        active
          ? 'border-accent/40 bg-accent/10 shadow-[inset_0_0_0_1px_rgba(94,200,255,0.25)]'
          : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.05]'
      }`}
      style={active && color ? { borderColor: `${color}66`, backgroundColor: `${color}18` } : undefined}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]"
        style={color ? { color: active ? color : undefined } : undefined}
      >
        {icon}
      </div>
      <span className={`text-xs font-medium text-center leading-tight ${active ? 'text-white' : 'text-zinc-400'}`}>
        {label}
      </span>
      {active && (
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgba(94,200,255,0.8)]" />
      )}
    </button>
  );
}

function OfferCard({ offer, onClick }) {
  return (
    <Card onClick={onClick} className="hover:border-accent/25">
      <div className="flex gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10"
          style={{ backgroundColor: `${offer.source_color}18` }}
        >
          <IconByName name={offer.source_icon} className="w-5 h-5" style={{ color: offer.source_color }} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white text-sm leading-snug pr-2">{offer.title}</p>

          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-600 w-14 shrink-0">Куди</span>
              <Badge color={offer.category_color}>{offer.category_name}</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-600 w-14 shrink-0">Звідки</span>
              <Badge color={offer.source_color}>{offer.source_name}</Badge>
            </div>
          </div>

          {offer.description && (
            <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{offer.description}</p>
          )}
        </div>

        <div className="flex flex-col items-end justify-between shrink-0">
          <div className="text-right">
            <p className="text-accent font-bold text-lg leading-none">{formatMoney(offer.price_per_user)}</p>
            <p className="text-[10px] text-zinc-500 mt-1">за 1 підп.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-600 mt-2" />
        </div>
      </div>
    </Card>
  );
}

export default function OffersPage({ onNavigate }) {
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [campaignStarted, setCampaignStarted] = useState(false);

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

  const toggleCategory = (slug) => {
    setSelectedCategory((prev) => (prev === slug ? null : slug));
  };

  const toggleSource = (slug) => {
    setSelectedSource((prev) => (prev === slug ? null : slug));
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSource(null);
  };

  const startCampaign = async () => {
    if (!selectedOffer) return;
    setCampaignLoading(true);
    setMessage('');
    try {
      await api.createCampaign({ offer_id: selectedOffer.id });
      setCampaignStarted(true);
      setMessage('Кампанію створено!');
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
          type="button"
          onClick={() => {
            setSelectedOffer(null);
            setCampaignStarted(false);
            setMessage('');
          }}
          className="flex items-center gap-2 text-zinc-500 hover:text-white cursor-pointer transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> До списку оферів
        </button>

        <Card glow className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 mb-3">Обраний офер</p>

          <div className="flex items-start gap-3 mb-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10"
              style={{ backgroundColor: `${selectedOffer.category_color}18` }}
            >
              <IconByName name={selectedOffer.category_icon} className="w-6 h-6" style={{ color: selectedOffer.category_color }} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-snug">{selectedOffer.title}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge color={selectedOffer.category_color}>Куди: {selectedOffer.category_name}</Badge>
                <Badge color={selectedOffer.source_color}>Звідки: {selectedOffer.source_name}</Badge>
              </div>
            </div>
          </div>

          {selectedOffer.description && (
            <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{selectedOffer.description}</p>
          )}

          <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 mb-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Твій заробіток</p>
            <p className="billing-price-sale text-3xl font-bold mt-1">{formatMoney(selectedOffer.price_per_user)}</p>
            <p className="text-sm text-zinc-400 mt-1">за кожного нового підписника в канал</p>
            {selectedOffer.min_subscribers > 0 && (
              <p className="text-xs text-zinc-500 mt-2">
                Мінімум для старту: {selectedOffer.min_subscribers} підписників
              </p>
            )}
          </div>

          {!campaignStarted ? (
            <>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 mb-4 space-y-3">
                <p className="text-sm font-medium text-white">Що буде далі:</p>
                {NEXT_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent text-xs font-bold">
                        {i + 1}
                      </div>
                      <div className="flex items-start gap-2 min-w-0">
                        <Icon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <p className="text-sm text-zinc-400 leading-snug">{step.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {message && !message.includes('створено') && (
                <p className="text-sm text-red-400 mb-3">{message}</p>
              )}

              <Button variant="gold" className="w-full" onClick={startCampaign} disabled={campaignLoading}>
                {campaignLoading ? 'Створення...' : 'Почати кампанію'}
              </Button>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-medium text-emerald-300">Кампанію активовано!</p>
                  <p className="text-sm text-zinc-400 mt-0.5">Залишилось підключити канал</p>
                </div>
              </div>

              <Card className="space-y-3">
                <p className="text-sm font-medium text-white">Наступні кроки:</p>
                {NEXT_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-accent font-bold text-sm w-4">{i + 1}.</span>
                      <Icon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <p className="text-sm text-zinc-400">{step.text}</p>
                    </div>
                  );
                })}
              </Card>

              {onNavigate && (
                <Button variant="gold" className="w-full" onClick={() => onNavigate('channels')}>
                  Перейти до каналів →
                </Button>
              )}
            </motion.div>
          )}
        </Card>
      </motion.div>
    );
  }

  const hasFilters = selectedCategory || selectedSource;
  const catName = categories.find((c) => c.slug === selectedCategory)?.name;
  const srcName = sources.find((s) => s.slug === selectedSource)?.name;

  return (
    <div className="space-y-5">
      <PageTitle title="Офери" subtitle="Обери куди лити трафік і з якого джерела" />

      <Card className="p-4">
        <p className="text-sm font-medium text-white mb-3">Як це працює</p>
        <div className="space-y-2.5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent text-xs font-bold">
                  {i + 1}
                </div>
                <Icon className="w-4 h-4 text-zinc-500 shrink-0" />
                <p className="text-sm text-zinc-400">{step.text}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-white">Крок 1 — Куди лити?</p>
            <p className="text-xs text-zinc-500 mt-0.5">Тематика каналу, куди підуть люди</p>
          </div>
          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-accent cursor-pointer hover:text-cyan-200"
            >
              Скинути
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <FilterTile
              key={cat.id}
              active={selectedCategory === cat.slug}
              onClick={() => toggleCategory(cat.slug)}
              color={cat.color}
              label={cat.name}
              icon={<IconByName name={cat.icon} className="w-5 h-5" style={{ color: cat.color }} />}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-white">Крок 2 — Звідки трафік?</p>
            <p className="text-xs text-zinc-500 mt-0.5">Платформа, з якої заливаєш аудиторію</p>
          </div>
          {selectedSource && (
            <button
              type="button"
              onClick={() => setSelectedSource(null)}
              className="text-xs text-accent cursor-pointer hover:text-cyan-200"
            >
              Скинути
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {sources.map((src) => (
            <FilterTile
              key={src.id}
              active={selectedSource === src.slug}
              onClick={() => toggleSource(src.slug)}
              color={src.color}
              label={src.name}
              icon={<IconByName name={src.icon} className="w-5 h-5" style={{ color: src.color }} />}
            />
          ))}
        </div>
      </section>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
          <span className="text-xs text-zinc-500">Фільтр:</span>
          {catName && <Badge color={categories.find((c) => c.slug === selectedCategory)?.color}>Куди: {catName}</Badge>}
          {srcName && <Badge color={sources.find((s) => s.slug === selectedSource)?.color}>Звідки: {srcName}</Badge>}
          <button type="button" onClick={clearFilters} className="text-xs text-zinc-500 hover:text-white ml-auto cursor-pointer">
            Очистити все
          </button>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-white">Крок 3 — Обери офер</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {offers.length > 0
                ? `Знайдено ${offers.length} ${offers.length === 1 ? 'офер' : offers.length < 5 ? 'офери' : 'оферів'}`
                : 'Підбери фільтри вище або переглянь усі'}
            </p>
          </div>
          {!hasFilters && offers.length > 0 && (
            <span className="text-xs text-zinc-600">Усі офери</span>
          )}
        </div>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
          <AnimatePresence>
            {offers.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="Немає оферів за цими фільтрами"
                description="Спробуй інший напрямок або джерело трафіку"
              />
            ) : (
              offers.map((offer) => (
                <motion.div key={offer.id} variants={fadeUp}>
                  <OfferCard offer={offer} onClick={() => setSelectedOffer(offer)} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
}
