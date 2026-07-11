const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');
const reqQuery = {
    mainStatuses: 'ready',
    auctionDateStart: '2026-07-13',
    auctionDateEnd: '2026-07-19'
};

// ... copy buildQuery logic
function buildQuery(reqQuery) {
    let query = 'SELECT a.rowid as id, a.* FROM assets a WHERE 1=1';
    let params = [];

    // Asset Status (Ready / Closed)
    if (reqQuery.mainStatuses) {
        const statuses = reqQuery.mainStatuses.split(',').filter(Boolean);
        
        const lastDateCoalesce = `COALESCE(
            NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 8"), ''), '-'),
            NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 7"), ''), '-'),
            NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 6"), ''), '-'),
            NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 5"), ''), '-'),
            NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 4"), ''), '-'),
            NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 3"), ''), '-'),
            NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 2"), ''), '-'),
            NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 1"), ''), '-')
        )`;
        const lastDateIso = `(CAST(SUBSTR(${lastDateCoalesce}, 7, 4) AS INTEGER) - 543) || '-' || SUBSTR(${lastDateCoalesce}, 4, 2) || '-' || SUBSTR(${lastDateCoalesce}, 1, 2)`;

        if (statuses.length === 1) {
            if (statuses[0] === 'ready') {
                query += ` AND (a.'สถานะทรัพย์ (ป้ายแดง)' IS NULL OR a.'สถานะทรัพย์ (ป้ายแดง)' NOT IN ('ขายไปแล้ว', 'ปิดการประมูล (แดง)', 'ถอนการยึด', 'งดขายทุกนัด', 'ทรัพย์หมดประมูลแล้ว')) AND (${lastDateIso} >= date('now', 'localtime') OR ${lastDateIso} IS NULL)`;
            } else if (statuses[0] === 'closed') {
                query += ` AND (a.'สถานะทรัพย์ (ป้ายแดง)' IN ('ขายไปแล้ว', 'ปิดการประมูล (แดง)', 'ถอนการยึด', 'งดขายทุกนัด', 'ทรัพย์หมดประมูลแล้ว') OR ${lastDateIso} < date('now', 'localtime'))`;
            }
        }
    }

    if (reqQuery.auctionDateStart && reqQuery.auctionDateEnd) {
        const parseThai = (dateStr) => {
            const [y, m, d] = dateStr.split('-');
            return `${parseInt(y) + 543}${m}${d}`;
        };
        const start = parseThai(reqQuery.auctionDateStart);
        const end = parseThai(reqQuery.auctionDateEnd);
        const today = new Date();
        const todayStr = `${today.getFullYear() + 543}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
        const actualStart = start > todayStr ? start : todayStr;
        let dateConditions = [];
        for (let i = 1; i <= 8; i++) {
            const col = `"วันที่นัดที่ ${i}"`;
            const yyyymmdd = `(substr(a.${col}, 7, 4) || substr(a.${col}, 4, 2) || substr(a.${col}, 1, 2))`;
            dateConditions.push(`(a.${col} IS NOT NULL AND ${yyyymmdd} >= '${actualStart}' AND ${yyyymmdd} <= '${end}')`);
        }
        query += ` AND (${dateConditions.join(' OR ')})`;
    }

    return { query, params };
}

const { query, params } = buildQuery(reqQuery);
console.log(query);
console.log(params);

db.all(query + ' LIMIT 5', params, (err, rows) => {
    if (err) console.error(err);
    else console.log(`Found ${rows.length} rows`);
});
