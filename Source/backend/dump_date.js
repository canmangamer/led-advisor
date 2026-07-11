const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');
db.get('SELECT "วันที่นัดที่ 1" as date1 FROM assets WHERE "วันที่นัดที่ 1" IS NOT NULL AND "วันที่นัดที่ 1" != "" LIMIT 1', (err, row) => {
    console.log(row.date1);
});
