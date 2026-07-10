const express = require('express');
const { verifyToken, requireAdmin } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  // Protect all admin routes
  router.use(verifyToken);
  router.use(requireAdmin);

  // Get all users with their subscriptions
  router.get('/users', (req, res) => {
    const query = `
      SELECT u.id, u.email, u.role, u.created_at, 
             s.plan_type, s.status, s.start_date, s.end_date 
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id 
      GROUP BY u.id
      ORDER BY u.id DESC
    `;
    db.all(query, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // Upgrade or extend a user's subscription
  router.put('/users/:id/upgrade', (req, res) => {
    const userId = req.params.id;
    const { plan_type, days_to_add } = req.body;
    
    if (!plan_type || !days_to_add) return res.status(400).json({ error: 'plan_type and days_to_add required' });

    db.get('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId], (err, sub) => {
      if (err) return res.status(500).json({ error: err.message });

      const now = new Date();
      let newStartDate = now;
      let newEndDate = new Date();

      if (sub && new Date(sub.end_date) > now && sub.status === 'active') {
        // Extend existing subscription
        newStartDate = new Date(sub.start_date);
        newEndDate = new Date(sub.end_date);
        newEndDate.setDate(newEndDate.getDate() + parseInt(days_to_add));
        
        db.run('UPDATE subscriptions SET plan_type = ?, end_date = ? WHERE id = ?', 
          [plan_type, newEndDate.toISOString(), sub.id], 
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Subscription extended successfully' });
        });
      } else {
        // Create new subscription
        newEndDate.setDate(newEndDate.getDate() + parseInt(days_to_add));
        
        db.run('INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
          [userId, plan_type, 'active', newStartDate.toISOString(), newEndDate.toISOString()], 
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Subscription created successfully' });
        });
      }
    });
  });

  // Change user role or status (for simplicity we just allow role change for now)
  router.put('/users/:id/role', (req, res) => {
    const { role } = req.body;
    if (role !== 'user' && role !== 'admin') return res.status(400).json({ error: 'Invalid role' });
    
    db.run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User role updated successfully' });
    });
  });

  // Get Admin Dashboard Stats
  router.get('/stats', (req, res) => {
    const stats = {
      total_users: 0,
      active_vips: 0,
      expiring_soon: 0
    };

    db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.total_users = row.count;

      const now = new Date().toISOString();
      const inSevenDays = new Date();
      inSevenDays.setDate(inSevenDays.getDate() + 7);
      const inSevenDaysStr = inSevenDays.toISOString();

      db.get('SELECT COUNT(*) as count FROM subscriptions WHERE status = "active" AND plan_type = "vip" AND end_date > ?', [now], (err, row2) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.active_vips = row2.count;

        db.get('SELECT COUNT(*) as count FROM subscriptions WHERE status = "active" AND plan_type = "vip" AND end_date > ? AND end_date <= ?', [now, inSevenDaysStr], (err, row3) => {
          if (err) return res.status(500).json({ error: err.message });
          stats.expiring_soon = row3.count;
          
          res.json(stats);
        });
      });
    });
  });

  // Get Data Analytics Dashboard Info
  router.get('/analytics', (req, res) => {
    const analytics = {
      total_assets: 0,
      total_value: 0,
      total_favorites: 0,
      total_notes: 0,
      total_filters: 0,
      asset_types: [],
      top_provinces: [],
      round_breakdown: []
    };

    // 1. Total Assets and Total Value
    db.get('SELECT COUNT(*) as count, SUM(price_numeric) as total_value FROM assets', [], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      analytics.total_assets = row.count || 0;
      analytics.total_value = row.total_value || 0;

      // 2. Asset Type Breakdown
      db.all('SELECT "ประเภททรัพย์" as type, COUNT(*) as count FROM assets GROUP BY "ประเภททรัพย์" ORDER BY count DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        analytics.asset_types = rows.map(r => ({ type: r.type || 'ไม่ระบุ', count: r.count }));

        // 3. Top Provinces
        db.all('SELECT "จังหวัด" as province, COUNT(*) as count FROM assets GROUP BY "จังหวัด" ORDER BY count DESC LIMIT 5', [], (err, pRows) => {
          if (err) return res.status(500).json({ error: err.message });
          analytics.top_provinces = pRows.map(r => ({ province: r.province || 'ไม่ระบุ', count: r.count }));

          // 4. Round Breakdown (ประมูลหลายรอบ vs รอบแรก)
          db.all('SELECT "ประมูลหลายรอบ (Y/N)" as multi_round, COUNT(*) as count FROM assets GROUP BY "ประมูลหลายรอบ (Y/N)"', [], (err, rRows) => {
            if (err) return res.status(500).json({ error: err.message });
            analytics.round_breakdown = rRows.map(r => ({ 
              status: r.multi_round === 'Y' ? 'ประมูลหลายรอบ' : (r.multi_round === 'N' ? 'ประมูลรอบแรก' : 'ไม่ระบุ'), 
              count: r.count 
            }));

            // 5. User Activity Stats (Favorites, Notes, Filters)
            db.get('SELECT COUNT(*) as fav_count FROM user_data_v2 WHERE is_favorite = 1', [], (err, favRow) => {
              if (!err && favRow) analytics.total_favorites = favRow.fav_count;
              
              db.get('SELECT COUNT(*) as notes_count FROM user_data_v2 WHERE notes IS NOT NULL AND notes != ""', [], (err, noteRow) => {
                if (!err && noteRow) analytics.total_notes = noteRow.notes_count;
                
                db.get('SELECT COUNT(*) as filter_count FROM user_filters', [], (err, filterRow) => {
                  if (!err && filterRow) analytics.total_filters = filterRow.filter_count;
                  
                  res.json(analytics);
                });
              });
            });
          });
        });
      });
    });
  });

  return router;
};
