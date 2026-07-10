const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.all("SELECT id, \"ราคาประเมินของเจ้าพนักงานบังคับคดี\", \"ราคาประเมินของเจ้าพนักงานประเมินราคาทรัพย์\", \"ราคาประเมินผู้เชี่ยวชาญ/อื่นๆ (1,2,4,6,7,8,9)\" FROM assets", (err, rows) => {
    let updateCount = 0;
    
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        const stmt = db.prepare("UPDATE assets SET price_numeric = ? WHERE id = ?");

        rows.forEach(row => {
            let max = 0;
            const val1 = Number(String(row['ราคาประเมินของเจ้าพนักงานบังคับคดี'] || '0').replace(/,/g, ''));
            if (!isNaN(val1) && val1 > max) max = val1;
            
            const val2 = Number(String(row['ราคาประเมินของเจ้าพนักงานประเมินราคาทรัพย์'] || '0').replace(/,/g, ''));
            if (!isNaN(val2) && val2 > max) max = val2;
            
            const str3 = String(row['ราคาประเมินผู้เชี่ยวชาญ/อื่นๆ (1,2,4,6,7,8,9)'] || '');
            if (str3 && str3.trim() !== '0') {
                const parts = str3.split(',');
                for (const p of parts) {
                    const val3 = Number(p.trim().replace(/,/g, ''));
                    if (!isNaN(val3) && val3 > max) max = val3;
                }
            }
            
            stmt.run(max, row.id);
            updateCount++;
        });

        stmt.finalize();
        db.run("COMMIT", () => {
            console.log(`Successfully updated ${updateCount} rows using ID.`);
            db.close();
        });
    });
});
