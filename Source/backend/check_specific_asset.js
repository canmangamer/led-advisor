const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.all("SELECT LED_ID, price_numeric, \"ราคาประเมินของเจ้าพนักงานบังคับคดี\" as p1, \"ราคาประเมินของเจ้าพนักงานประเมินราคาทรัพย์\" as p2, \"ราคาประเมินผู้เชี่ยวชาญ/อื่นๆ (1,2,4,6,7,8,9)\" as p3 FROM assets WHERE \"ราคาประเมินของเจ้าพนักงานบังคับคดี\" LIKE '%3251550%'", (err, rows) => {
  console.log(rows);
  db.close();
});
