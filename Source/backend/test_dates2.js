const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('C:/My Project_LED_Advisor/Source/backend/database.sqlite');
db.all('SELECT "วันที่นัดที่ 1", "วันที่นัดที่ 6" FROM assets WHERE "จังหวัด" = "นนทบุรี" AND "เขต/อำเภอ" = "บางกรวย"', [], (err, rows) => {
    let hasFuture = false;
    for(let r of rows) {
        if (r['วันที่นัดที่ 6']) { console.log(r); hasFuture = true; }
    }
    console.log("Has future dates:", hasFuture);
});
