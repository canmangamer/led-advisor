const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.all("PRAGMA table_info(assets);", (err, rows) => {
    if (err) console.error(err);
    else console.log(rows.map(r => r.name).filter(n => n.includes('ราคาประเมิน')));
    db.close();
});
