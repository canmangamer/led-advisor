const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.all("SELECT price_numeric, \"ราคาประเมินของเจ้าพนักงานบังคับคดี\", \"ราคาประเมินผู้เชี่ยวชาญ/อื่นๆ (1,2,4,6,7,8,9)\" FROM assets LIMIT 5", (err, rows) => {
  console.log(rows);
  db.close();
});
