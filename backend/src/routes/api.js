import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/me', authMiddleware, (req, res) => {
  const stats = db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN ce.event_type = 'join' THEN 1 ELSE 0 END), 0) as total_joins,
        COALESCE(SUM(CASE WHEN ce.event_type = 'leave' THEN 1 ELSE 0 END), 0) as total_leaves
      FROM channel_events ce
      JOIN channels ch ON ch.id = ce.channel_id
      WHERE ch.owner_id = ?`
    )
    .get(req.user.id);

  const campaigns = db
    .prepare('SELECT COUNT(*) as count FROM campaigns WHERE user_id = ? AND status = ?')
    .get(req.user.id, 'active');

  res.json({
    user: {
      id: req.user.id,
      telegram_id: req.user.telegram_id,
      username: req.user.username,
      first_name: req.user.first_name,
      balance: req.user.balance,
      is_admin: !!req.user.is_admin,
    },
    stats: {
      total_joins: stats.total_joins,
      total_leaves: stats.total_leaves,
      net_subscribers: stats.total_joins - stats.total_leaves,
      active_campaigns: campaigns.count,
    },
  });
});

router.get('/categories', authMiddleware, (_req, res) => {
  const categories = db
    .prepare('SELECT * FROM categories ORDER BY sort_order')
    .all();
  res.json(categories);
});

router.get('/sources', authMiddleware, (_req, res) => {
  const sources = db.prepare('SELECT * FROM traffic_sources').all();
  res.json(sources);
});

router.get('/offers', authMiddleware, (req, res) => {
  const { category, source } = req.query;
  let query = `
    SELECT o.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon, c.color as category_color,
           s.name as source_name, s.slug as source_slug, s.icon as source_icon, s.color as source_color
    FROM offers o
    JOIN categories c ON c.id = o.category_id
    JOIN traffic_sources s ON s.id = o.source_id
    WHERE o.active = 1
  `;
  const params = [];

  if (category) {
    query += ' AND c.slug = ?';
    params.push(category);
  }
  if (source) {
    query += ' AND s.slug = ?';
    params.push(source);
  }

  query += ' ORDER BY o.created_at DESC';
  const offers = db.prepare(query).all(...params);
  res.json(offers);
});

router.get('/offers/:id', authMiddleware, (req, res) => {
  const offer = db
    .prepare(
      `SELECT o.*, c.name as category_name, c.slug as category_slug,
              s.name as source_name, s.slug as source_slug
       FROM offers o
       JOIN categories c ON c.id = o.category_id
       JOIN traffic_sources s ON s.id = o.source_id
       WHERE o.id = ?`
    )
    .get(req.params.id);

  if (!offer) return res.status(404).json({ error: 'Offer not found' });
  res.json(offer);
});

router.post('/campaigns', authMiddleware, (req, res) => {
  const { offer_id, channel_id } = req.body;
  if (!offer_id) return res.status(400).json({ error: 'offer_id required' });

  const offer = db.prepare('SELECT * FROM offers WHERE id = ? AND active = 1').get(offer_id);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  const result = db
    .prepare('INSERT INTO campaigns (user_id, offer_id, channel_id) VALUES (?, ?, ?)')
    .run(req.user.id, offer_id, channel_id || null);

  res.json({ id: result.lastInsertRowid, message: 'Campaign created' });
});

router.get('/campaigns', authMiddleware, (req, res) => {
  const campaigns = db
    .prepare(
      `SELECT camp.*, o.title as offer_title, o.price_per_user,
              c.name as category_name, s.name as source_name,
              ch.title as channel_title
       FROM campaigns camp
       JOIN offers o ON o.id = camp.offer_id
       JOIN categories c ON c.id = o.category_id
       JOIN traffic_sources s ON s.id = o.source_id
       LEFT JOIN channels ch ON ch.id = camp.channel_id
       WHERE camp.user_id = ?
       ORDER BY camp.created_at DESC`
    )
    .all(req.user.id);
  res.json(campaigns);
});

router.put('/channels/:id/offer', authMiddleware, (req, res) => {
  const { offer_id } = req.body;
  const channel = db
    .prepare('SELECT * FROM channels WHERE id = ? AND owner_id = ?')
    .get(req.params.id, req.user.id);

  if (!channel) return res.status(404).json({ error: 'Channel not found' });

  const offer = db.prepare('SELECT * FROM offers WHERE id = ? AND active = 1').get(offer_id);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  db.prepare('UPDATE channels SET offer_id = ? WHERE id = ?').run(offer_id, channel.id);
  res.json({ message: 'Offer linked to channel' });
});

router.get('/channels', authMiddleware, (req, res) => {
  const channels = db
    .prepare(
      `SELECT ch.*, o.title as offer_title, o.price_per_user
       FROM channels ch
       LEFT JOIN offers o ON o.id = ch.offer_id
       WHERE ch.owner_id = ?
       ORDER BY ch.created_at DESC`
    )
    .all(req.user.id);
  res.json(channels);
});

router.get('/channels/:id/stats', authMiddleware, (req, res) => {
  const channel = db
    .prepare('SELECT * FROM channels WHERE id = ? AND owner_id = ?')
    .get(req.params.id, req.user.id);

  if (!channel) return res.status(404).json({ error: 'Channel not found' });

  const daily = db
    .prepare(
      `SELECT date, joins, leaves, (joins - leaves) as net
       FROM channel_daily_stats
       WHERE channel_id = ?
       ORDER BY date DESC
       LIMIT 30`
    )
    .all(channel.id);

  const totals = db
    .prepare(
      `SELECT
        COALESCE(SUM(joins), 0) as joins,
        COALESCE(SUM(leaves), 0) as leaves
       FROM channel_daily_stats WHERE channel_id = ?`
    )
    .get(channel.id);

  const price = channel.offer_id
    ? db.prepare('SELECT price_per_user FROM offers WHERE id = ?').get(channel.offer_id)?.price_per_user || 0
    : 0;

  res.json({
    channel,
    daily: daily.reverse(),
    totals: {
      joins: totals.joins,
      leaves: totals.leaves,
      net: totals.joins - totals.leaves,
      estimated_earnings: (totals.joins - totals.leaves) * price,
    },
  });
});

router.get('/earnings/chart', authMiddleware, (req, res) => {
  const data = db
    .prepare(
      `SELECT cds.date,
        SUM(cds.joins) as joins,
        SUM(cds.leaves) as leaves,
        SUM((cds.joins - cds.leaves) * COALESCE(o.price_per_user, 0)) as earnings
       FROM channel_daily_stats cds
       JOIN channels ch ON ch.id = cds.channel_id
       LEFT JOIN offers o ON o.id = ch.offer_id
       WHERE ch.owner_id = ?
       GROUP BY cds.date
       ORDER BY cds.date DESC
       LIMIT 14`
    )
    .all(req.user.id);

  res.json(data.reverse());
});

router.post('/payouts', authMiddleware, (req, res) => {
  const { amount, wallet } = req.body;
  const payoutAmount = parseFloat(amount);

  if (!payoutAmount || payoutAmount < 10) {
    return res.status(400).json({ error: 'Minimum payout is $10' });
  }
  if (!wallet) {
    return res.status(400).json({ error: 'Wallet address required' });
  }
  if (req.user.balance < payoutAmount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  const pending = db
    .prepare("SELECT COUNT(*) as c FROM payouts WHERE user_id = ? AND status = 'pending'")
    .get(req.user.id);

  if (pending.c > 0) {
    return res.status(400).json({ error: 'You already have a pending payout' });
  }

  const result = db
    .prepare('INSERT INTO payouts (user_id, amount, wallet) VALUES (?, ?, ?)')
    .run(req.user.id, payoutAmount, wallet);

  db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(payoutAmount, req.user.id);

  res.json({ id: result.lastInsertRowid, message: 'Payout requested' });
});

router.get('/payouts', authMiddleware, (req, res) => {
  const payouts = db
    .prepare('SELECT * FROM payouts WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json(payouts);
});

// Admin routes
router.post('/admin/offers', authMiddleware, adminMiddleware, (req, res) => {
  const { category_id, source_id, title, description, price_per_user, min_subscribers } = req.body;

  if (!category_id || !source_id || !title || !price_per_user) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = db
    .prepare(
      `INSERT INTO offers (category_id, source_id, title, description, price_per_user, min_subscribers)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(category_id, source_id, title, description || '', price_per_user, min_subscribers || 0);

  res.json({ id: result.lastInsertRowid });
});

router.put('/admin/offers/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { title, description, price_per_user, min_subscribers, active } = req.body;
  db.prepare(
    `UPDATE offers SET title = COALESCE(?, title), description = COALESCE(?, description),
     price_per_user = COALESCE(?, price_per_user), min_subscribers = COALESCE(?, min_subscribers),
     active = COALESCE(?, active) WHERE id = ?`
  ).run(title, description, price_per_user, min_subscribers, active, req.params.id);
  res.json({ message: 'Updated' });
});

router.delete('/admin/offers/:id', authMiddleware, adminMiddleware, (req, res) => {
  db.prepare('UPDATE offers SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deactivated' });
});

router.post('/admin/categories', authMiddleware, adminMiddleware, (req, res) => {
  const { name, slug, icon, color } = req.body;
  const result = db
    .prepare('INSERT INTO categories (name, slug, icon, color) VALUES (?, ?, ?, ?)')
    .run(name, slug, icon || 'folder', color || '#8B5CF6');
  res.json({ id: result.lastInsertRowid });
});

router.post('/admin/sources', authMiddleware, adminMiddleware, (req, res) => {
  const { name, slug, icon, color } = req.body;
  const result = db
    .prepare('INSERT INTO traffic_sources (name, slug, icon, color) VALUES (?, ?, ?, ?)')
    .run(name, slug, icon || 'globe', color || '#F59E0B');
  res.json({ id: result.lastInsertRowid });
});

router.get('/admin/payouts', authMiddleware, adminMiddleware, (_req, res) => {
  const payouts = db
    .prepare(
      `SELECT p.*, u.username, u.first_name, u.telegram_id
       FROM payouts p JOIN users u ON u.id = p.user_id
       WHERE p.status = 'pending'
       ORDER BY p.created_at ASC`
    )
    .all();
  res.json(payouts);
});

router.put('/admin/payouts/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const payout = db.prepare('SELECT * FROM payouts WHERE id = ?').get(req.params.id);
  if (!payout) return res.status(404).json({ error: 'Not found' });

  if (status === 'rejected' && payout.status === 'pending') {
    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(payout.amount, payout.user_id);
  }

  db.prepare("UPDATE payouts SET status = ?, processed_at = datetime('now') WHERE id = ?").run(
    status,
    req.params.id
  );
  res.json({ message: 'Updated' });
});

router.get('/admin/stats', authMiddleware, adminMiddleware, (_req, res) => {
  const stats = {
    users: db.prepare('SELECT COUNT(*) as c FROM users').get().c,
    offers: db.prepare('SELECT COUNT(*) as c FROM offers WHERE active = 1').get().c,
    channels: db.prepare('SELECT COUNT(*) as c FROM channels').get().c,
    pending_payouts: db.prepare("SELECT COUNT(*) as c FROM payouts WHERE status = 'pending'").get().c,
    total_paid: db.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM payouts WHERE status = 'approved'").get().s,
  };
  res.json(stats);
});

export default router;
