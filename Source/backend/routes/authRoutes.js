const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  // Register
  router.post('/register', (req, res) => {
    db.get("SELECT value FROM system_settings WHERE key = 'allow_registration'", [], (err, settingRow) => {
      if (err) return res.status(500).json({ error: err.message });
      if (settingRow && settingRow.value === 'false') {
        return res.status(403).json({ error: 'ขณะนี้ปิดรับสมัครสมาชิก' });
      }

      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

      db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) return res.status(400).json({ error: 'Email already exists' });

      const hash = bcrypt.hashSync(password, 8);
      db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        const userId = this.lastID;
        // Give a default free subscription
        const now = new Date();
        const oneYearLater = new Date();
        oneYearLater.setFullYear(now.getFullYear() + 1);
        
        db.run('INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
          [userId, 'free', 'active', now.toISOString(), oneYearLater.toISOString()], (err) => {
            if (err) console.error('Error creating free subscription:', err);
        });

        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  });

  // Login
  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const isValid = bcrypt.compareSync(password, user.password_hash);
      if (!isValid) return res.status(401).json({ error: 'Invalid password' });

      // Check subscription
      db.get('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY id DESC LIMIT 1', [user.id], (err, sub) => {
        if (err) return res.status(500).json({ error: err.message });

        let plan_type = 'free';
        let status = 'active';
        let is_vip = false;

        if (sub) {
          plan_type = sub.plan_type;
          status = sub.status;
          // Check expiration
          if (new Date(sub.end_date) > new Date() && status === 'active' && plan_type === 'vip') {
             is_vip = true;
          }
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        
        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            is_vip: is_vip,
            plan_type: plan_type,
            subscription_end: sub ? sub.end_date : null
          }
        });
      });
    });
  });

  // Get current user (me)
  router.get('/me', verifyToken, (req, res) => {
    db.get('SELECT id, email, role, created_at FROM users WHERE id = ?', [req.userId], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      db.get('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId], (err, sub) => {
        let is_vip = false;
        if (sub && new Date(sub.end_date) > new Date() && sub.status === 'active' && sub.plan_type === 'vip') {
             is_vip = true;
        }

        res.json({
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            is_vip: is_vip,
            plan_type: sub ? sub.plan_type : 'free',
            subscription_end: sub ? sub.end_date : null
          }
        });
      });
    });
  });

  return router;
};
