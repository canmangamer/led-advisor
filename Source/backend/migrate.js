const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(async () => {
  // 1. Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Create subscriptions table
  db.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      plan_type TEXT DEFAULT 'free',
      status TEXT DEFAULT 'active',
      start_date DATETIME,
      end_date DATETIME,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // 3. Add user_id to user_filters
  db.run(`ALTER TABLE user_filters ADD COLUMN user_id INTEGER`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('user_id column already exists in user_filters');
      } else {
        console.error('Error altering user_filters:', err);
      }
    } else {
      console.log('Added user_id to user_filters');
    }
  });

  // 4. Add user_id to user_data_v2
  db.run(`ALTER TABLE user_data_v2 ADD COLUMN user_id INTEGER`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('user_id column already exists in user_data_v2');
      } else {
        console.error('Error altering user_data_v2:', err);
      }
    } else {
      console.log('Added user_id to user_data_v2');
    }
  });

  // 5. Seed default admin user
  const adminEmail = 'admin@yokpai.com';
  const adminPassword = 'adminpassword';
  const hash = bcrypt.hashSync(adminPassword, 10);

  db.get(`SELECT id FROM users WHERE email = ?`, [adminEmail], (err, row) => {
    if (!row) {
      db.run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`, 
      [adminEmail, hash, 'admin'], function(err) {
        if (err) console.error(err);
        else console.log('Admin user created: admin@yokpai.com / adminpassword');
        
        // Give admin 10 years of VIP
        const now = new Date();
        const tenYearsLater = new Date();
        tenYearsLater.setFullYear(now.getFullYear() + 10);
        
        db.run(`INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date) VALUES (?, ?, ?, ?, ?)`,
        [this.lastID, 'vip', 'active', now.toISOString(), tenYearsLater.toISOString()]);
      });
    } else {
      console.log('Admin user already exists');
    }
  });

  console.log('Migration script completed.');
});
