const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('C:/My Project_LED_Advisor/Source/backend/database.sqlite');
db.all('SELECT "วันที่นัดที่ 1" as date1 FROM assets WHERE "จังหวัด" = "นนทบุรี" AND "เขต/อำเภอ" = "บางกรวย" LIMIT 5', [], (err, rows) => {
    console.log(rows);
});
