const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('C:/My Project_LED_Advisor/Source/backend/database.sqlite');
const hash = bcrypt.hashSync('123user', 8);

db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', ['user1234', hash, 'user'], function(err) {
    if (err) {
        console.error(err);
    } else {
        console.log('User created with ID:', this.lastID);
        const userId = this.lastID;
        const now = new Date();
        const oneYearLater = new Date();
        oneYearLater.setFullYear(now.getFullYear() + 1);
        
        db.run('INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
          [userId, 'free', 'active', now.toISOString(), oneYearLater.toISOString()], (err) => {
            if (err) console.error('Error creating free subscription:', err);
            else console.log('Subscription created');
        });
    }
});
