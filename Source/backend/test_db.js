const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');
db.all('SELECT "วันที่นัดที่ 1" FROM assets WHERE "วันที่นัดที่ 1" IS NOT NULL AND "วันที่นัดที่ 1" != "" LIMIT 5', (err, rows) => console.log(rows));
db.all('SELECT "คดีหมายเลขแดงที่" FROM assets LIMIT 5', (err, rows) => console.log(rows));
