const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');
db.all('SELECT DISTINCT "สถานที่จำหน่าย" FROM assets WHERE "สถานที่จำหน่าย" IS NOT NULL', (err, rows) => {
    console.log(rows.map(r=>r['สถานที่จำหน่าย']));
});
