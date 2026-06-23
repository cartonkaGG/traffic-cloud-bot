import db from './database.js';

const categories = [
  { name: 'Крипто', slug: 'crypto', icon: 'bitcoin', color: '#F59E0B', sort_order: 1 },
  { name: 'Трейдинг', slug: 'trading', icon: 'trending-up', color: '#10B981', sort_order: 2 },
  { name: 'Афіші', slug: 'events', icon: 'calendar', color: '#8B5CF6', sort_order: 3 },
  { name: 'Спорт', slug: 'sports', icon: 'trophy', color: '#EF4444', sort_order: 4 },
  { name: 'Новини', slug: 'news', icon: 'newspaper', color: '#3B82F6', sort_order: 5 },
  { name: 'Казино', slug: 'casino', icon: 'dice', color: '#EC4899', sort_order: 6 },
];

const sources = [
  { name: 'TikTok', slug: 'tiktok', icon: 'music', color: '#FF0050' },
  { name: 'TG Спам', slug: 'tg-spam', icon: 'send', color: '#29B6F6' },
  { name: 'Reels', slug: 'reels', icon: 'film', color: '#E1306C' },
  { name: 'Shorts', slug: 'shorts', icon: 'play', color: '#FF0000' },
  { name: 'YouTube', slug: 'youtube', icon: 'youtube', color: '#FF0000' },
  { name: 'Instagram', slug: 'instagram', icon: 'instagram', color: '#E4405F' },
];

const insertCat = db.prepare(
  'INSERT OR IGNORE INTO categories (name, slug, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)'
);
const insertSrc = db.prepare(
  'INSERT OR IGNORE INTO traffic_sources (name, slug, icon, color) VALUES (?, ?, ?, ?)'
);
const insertOffer = db.prepare(`
  INSERT OR IGNORE INTO offers (category_id, source_id, title, description, price_per_user, min_subscribers)
  SELECT c.id, s.id, ?, ?, ?, ?
  FROM categories c, traffic_sources s
  WHERE c.slug = ? AND s.slug = ?
  AND NOT EXISTS (
    SELECT 1 FROM offers o WHERE o.category_id = c.id AND o.source_id = s.id AND o.title = ?
  )
`);

for (const c of categories) {
  insertCat.run(c.name, c.slug, c.icon, c.color, c.sort_order);
}
for (const s of sources) {
  insertSrc.run(s.name, s.slug, s.icon, s.color);
}

const sampleOffers = [
  ['Крипто канал — TikTok', 'Трафік з TikTok на крипто канал', 0.15, 100, 'crypto', 'tiktok'],
  ['Трейдинг — Reels', 'Reels трафік на трейдинг канал', 0.12, 50, 'trading', 'reels'],
  ['Спорт новини — Shorts', 'YouTube Shorts на спорт канал', 0.10, 200, 'sports', 'shorts'],
  ['Афіші — TG Спам', 'Telegram спам на афіші', 0.08, 500, 'events', 'tg-spam'],
  ['Новини — Instagram', 'Instagram трафік на новини', 0.11, 100, 'news', 'instagram'],
];

for (const [title, desc, price, min, cat, src] of sampleOffers) {
  insertOffer.run(title, desc, price, min, cat, src, title);
}

console.log('Database seeded successfully');
