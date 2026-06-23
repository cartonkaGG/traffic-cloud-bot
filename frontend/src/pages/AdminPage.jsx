import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Check, X, BarChart3 } from 'lucide-react';
import { api } from '../api';
import { Card, Button, Badge } from '../components/ui';
import { formatMoney, staggerContainer, fadeUp } from '../utils';

export default function AdminPage() {
  const [tab, setTab] = useState('offers');
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [offers, setOffers] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [form, setForm] = useState({
    category_id: '',
    source_id: '',
    title: '',
    description: '',
    price_per_user: '',
    min_subscribers: '0',
  });
  const [message, setMessage] = useState('');

  const load = async () => {
    const [s, cats, srcs, offs, pays] = await Promise.all([
      api.admin.getStats(),
      api.getCategories(),
      api.getSources(),
      api.getOffers(),
      api.admin.getPayouts(),
    ]);
    setStats(s);
    setCategories(cats);
    setSources(srcs);
    setOffers(offs);
    setPayouts(pays);
  };

  useEffect(() => { load(); }, []);

  const createOffer = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.admin.createOffer({
        ...form,
        category_id: parseInt(form.category_id),
        source_id: parseInt(form.source_id),
        price_per_user: parseFloat(form.price_per_user),
        min_subscribers: parseInt(form.min_subscribers) || 0,
      });
      setMessage('Офер створено!');
      setForm({ category_id: '', source_id: '', title: '', description: '', price_per_user: '', min_subscribers: '0' });
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handlePayout = async (id, status) => {
    await api.admin.updatePayout(id, status);
    load();
  };

  const tabs = [
    { id: 'offers', label: 'Офери' },
    { id: 'create', label: 'Додати' },
    { id: 'payouts', label: 'Виплати' },
  ];

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">Адмін панель</h1>
        <p className="text-muted text-sm mt-1">Керування оферами та виплатами</p>
      </div>

      {stats && (
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
          {[
            { label: 'Юзери', value: stats.users, icon: BarChart3 },
            { label: 'Офери', value: stats.offers },
            { label: 'Канали', value: stats.channels },
            { label: 'Виплати', value: stats.pending_payouts },
          ].map((s) => (
            <Card key={s.label} className="p-3 text-center">
              <p className="text-2xl font-bold text-accent">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </Card>
          ))}
        </motion.div>
      )}

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm cursor-pointer transition-colors ${
              tab === t.id ? 'bg-accent text-white' : 'glass text-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'create' && (
        <motion.div variants={fadeUp}>
          <Card>
            <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Новий офер
            </h2>
            <form onSubmit={createOffer} className="space-y-3">
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
                required
              >
                <option value="">Категорія</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={form.source_id}
                onChange={(e) => setForm({ ...form, source_id: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
                required
              >
                <option value="">Джерело трафіку</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <input
                placeholder="Назва офера"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
                required
              />
              <textarea
                placeholder="Опис"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent resize-none h-20"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ціна за підп."
                  value={form.price_per_user}
                  onChange={(e) => setForm({ ...form, price_per_user: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
                  required
                />
                <input
                  type="number"
                  placeholder="Мін. підписників"
                  value={form.min_subscribers}
                  onChange={(e) => setForm({ ...form, min_subscribers: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
                />
              </div>
              {message && <p className="text-sm text-green-400">{message}</p>}
              <Button type="submit" variant="gold" className="w-full">Створити офер</Button>
            </form>
          </Card>
        </motion.div>
      )}

      {tab === 'offers' && (
        <motion.div variants={fadeUp} className="space-y-2">
          {offers.map((o) => (
            <Card key={o.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{o.title}</p>
                <div className="flex gap-2 mt-1">
                  <Badge color={o.category_color}>{o.category_name}</Badge>
                  <span className="text-primary text-xs font-semibold">{formatMoney(o.price_per_user)}</span>
                </div>
              </div>
              <button
                onClick={async () => { await api.admin.deleteOffer(o.id); load(); }}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </motion.div>
      )}

      {tab === 'payouts' && (
        <motion.div variants={fadeUp} className="space-y-2">
          {payouts.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">Немає очікуючих виплат</p>
          ) : (
            payouts.map((p) => (
              <Card key={p.id}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{formatMoney(p.amount)}</p>
                    <p className="text-xs text-muted">@{p.username || p.first_name} · {p.wallet?.slice(0, 12)}...</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-sm py-2" onClick={() => handlePayout(p.id, 'approved')}>
                    <Check className="w-4 h-4 inline mr-1" /> Схвалити
                  </Button>
                  <Button variant="danger" className="flex-1 text-sm py-2" onClick={() => handlePayout(p.id, 'rejected')}>
                    <X className="w-4 h-4 inline mr-1" /> Відхилити
                  </Button>
                </div>
              </Card>
            ))
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
