require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.ALLOWED_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, true); // Allow all during development — tighten in production
  },
  credentials: true
}));
app.use(express.json());

const dbPath = path.join(__dirname, 'database.sqlite');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to the SQLite database.');
        // Initialize user_data table
        db.run(`
            CREATE TABLE IF NOT EXISTS user_data (
                LED_ID TEXT PRIMARY KEY,
                is_favorite INTEGER DEFAULT 0,
                notes TEXT
            )
        `);
        // Initialize user_filters table for saving presets
        db.run("ALTER TABLE user_data_v2 ADD COLUMN is_portfolio INTEGER DEFAULT 0", (err) => {
            // Ignore error if column already exists
        });

        db.run(`
            CREATE TABLE IF NOT EXISTS user_filters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                criteria_json TEXT NOT NULL,
                last_checked DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
});

// Haversine distance calculation in KM
function getDistanceInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; // Distance in km
}

function buildQuery(reqQuery) {
    let query = 'SELECT a.rowid as id, a.*, u.is_favorite, u.is_portfolio, u.notes, u.investment_data FROM assets a LEFT JOIN user_data_v2 u ON a.rowid = u.asset_id WHERE 1=1';
    let params = [];

    const addInClause = (colName, queryStr) => {
        if (queryStr) {
            const values = queryStr.split(',').map(v => v.trim()).filter(Boolean);
            if (values.length > 0) {
                const placeholders = values.map(() => '?').join(',');
                query += ` AND TRIM(a."${colName}") IN (${placeholders})`;
                params.push(...values);
            }
        }
    };

    // Location
    if (reqQuery.province) { query += ' AND a."จังหวัด" = ?'; params.push(reqQuery.province); }
    if (reqQuery.district) { query += ' AND a."เขต/อำเภอ" = ?'; params.push(reqQuery.district); }
    if (reqQuery.subDistrict) { query += ' AND a."แขวง/ตำบล" = ?'; params.push(reqQuery.subDistrict); }
    if (reqQuery.auctionLocation) { query += ' AND a."สถานที่จำหน่าย" LIKE ?'; params.push(`%${reqQuery.auctionLocation}%`); }
    
    // Multi-select filters
    addInClause('ประเภททรัพย์', reqQuery.assetTypes);
    addInClause('จะทำการขายโดย', reqQuery.sellingConditions);
        // Deed Types (Complex logic)
    if (reqQuery.deedTypes) {
        const types = reqQuery.deedTypes.split(',').map(v => v.trim()).filter(Boolean);
        if (types.length > 0) {
            let deedConditions = [];
            for (const dt of types) {
                if (dt === 'โฉนดที่ดิน (ตัวจริง)') {
                    deedConditions.push('(a."ที่ดิน (ประเภทเอกสาร)" NOT LIKE ? AND (a."ที่ดิน (ประเภทเอกสาร)" LIKE ? OR a."ที่ดิน (ประเภทเอกสาร)" LIKE ?))');
                    params.push('%สำเนา%', '%โฉนด%', '%ตราจอง%');
                } else if (dt === 'สำเนาโฉนดที่ดิน') {
                    deedConditions.push('(a."ที่ดิน (ประเภทเอกสาร)" LIKE ? OR a."ที่ดิน (ประเภทเอกสาร)" LIKE ?)');
                    params.push('%ตามสำเนาโฉนด%', '%ตามสำเนาตราจอง%');
                } else if (dt === 'น.ส.3 ทุกประเภท') {
                    deedConditions.push('(a."ที่ดิน (ประเภทเอกสาร)" NOT LIKE ? AND a."ที่ดิน (ประเภทเอกสาร)" LIKE ?)');
                    params.push('%สำเนา%', '%น.ส.%3%');
                } else if (dt === 'สำเนา น.ส. 3 ทุกประเภท') {
                    deedConditions.push('(a."ที่ดิน (ประเภทเอกสาร)" LIKE ? OR a."ที่ดิน (ประเภทเอกสาร)" LIKE ?)');
                    params.push('%ตามสำเนา น.ส.%', '%ตามสำเนา น.ส.3%');
                } else if (dt === 'ไม่ระบุ / อื่นๆ') {
                    deedConditions.push('(a."ที่ดิน (ประเภทเอกสาร)" IS NULL OR a."ที่ดิน (ประเภทเอกสาร)" IN (\'\', \'-\', \'(blank)\'))');
                }
            }
            if (deedConditions.length > 0) {
                query += ` AND (${deedConditions.join(' OR ')})`;
            }
        }
    }

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

    // Specific Display Statuses
    if (reqQuery.displayStatuses) {
        const statuses = reqQuery.displayStatuses.split(',').map(v => v.trim()).filter(Boolean);
        if (statuses.length > 0) {
            const conditions = statuses.map(st => {
                if (st === 'ขายไปแล้ว') return "(a.'ผลการขาย (ล่าสุด)' LIKE '%ขายได้%')";
                return `(a.'ผลการขาย (ล่าสุด)' LIKE '%${st}%' OR a.'สถานะทรัพย์ (ป้ายแดง)' LIKE '%${st}%')`;
            });
            query += ' AND (' + conditions.join(' OR ') + ')';
        }
    }

    // Case Info
    if (reqQuery.ledId) { query += ' AND a."LED_ID" LIKE ?'; params.push(`%${reqQuery.ledId}%`); }
    if (reqQuery.suitNo) { query += ' AND a."คดีหมายเลขแดงที่" LIKE ?'; params.push(`%${reqQuery.suitNo}%`); }
    if (reqQuery.caseYear) { query += ' AND a."คดีหมายเลขแดงที่" LIKE ?'; params.push(`%/${reqQuery.caseYear}`); }
    if (reqQuery.plaintiff) { query += ' AND a."โจทก์" LIKE ?'; params.push(`%${reqQuery.plaintiff}%`); }
    if (reqQuery.defendant) { query += ' AND a."จำเลย" LIKE ?'; params.push(`%${reqQuery.defendant}%`); }
    
    if (reqQuery.plaintiffType) {
        if (reqQuery.plaintiffType === 'person') {
            query += " AND (a.\"โจทก์\" LIKE 'นาย%' OR a.\"โจทก์\" LIKE 'นาง%')";
        } else if (reqQuery.plaintiffType === 'juristic') {
            query += " AND a.\"โจทก์\" NOT LIKE 'นาย%' AND a.\"โจทก์\" NOT LIKE 'นาง%'";
        }
    }
    
    if (reqQuery.defendantType) {
        if (reqQuery.defendantType === 'person') {
            query += " AND (a.\"จำเลย\" LIKE 'นาย%' OR a.\"จำเลย\" LIKE 'นาง%')";
        } else if (reqQuery.defendantType === 'juristic') {
            query += " AND a.\"จำเลย\" NOT LIKE 'นาย%' AND a.\"จำเลย\" NOT LIKE 'นาง%'";
        }
    }

    if (reqQuery.deedNo) { query += ' AND a."เลขที่โฉนด" LIKE ?'; params.push(`%${reqQuery.deedNo}%`); }

    // Favorites
    if (reqQuery.favoritesOnly === 'true') { query += ' AND u.is_favorite = 1'; }
    if (reqQuery.portfolioOnly === 'true') { query += ' AND u.is_portfolio = 1'; }

    // Price Filtering
    if (reqQuery.minPrice && reqQuery.minPrice !== '0') { query += ' AND a.price_numeric >= ?'; params.push(parseFloat(reqQuery.minPrice)); }
    if (reqQuery.maxPrice && reqQuery.maxPrice !== '0') { query += ' AND a.price_numeric <= ?'; params.push(parseFloat(reqQuery.maxPrice)); }

    // Deposit Filtering
    if (reqQuery.minDeposit && reqQuery.minDeposit !== '0') { query += ' AND a."วางหลักประกันเป็นจำนวน" >= ?'; params.push(parseFloat(reqQuery.minDeposit)); }
    if (reqQuery.maxDeposit && reqQuery.maxDeposit !== '0') { query += ' AND a."วางหลักประกันเป็นจำนวน" <= ?'; params.push(parseFloat(reqQuery.maxDeposit)); }

    // Mortgage Risk Filtering
    if (reqQuery.mortgageRisk) {
        query += ` AND a."จะทำการขายโดย" LIKE '%ติดไป%'`;
        if (reqQuery.mortgageRisk === 'zero') {
            query += ` AND (a."ยอดหนี้จำนอง" IS NULL OR a."ยอดหนี้จำนอง" = 0)`;
        } else if (reqQuery.mortgageRisk === 'high') {
            query += ` AND a."ยอดหนี้จำนอง" > a.price_numeric`;
        } else if (reqQuery.mortgageRisk === 'low') {
            query += ` AND a."ยอดหนี้จำนอง" > 0 AND a."ยอดหนี้จำนอง" <= a.price_numeric`;
        }
    }

    if (reqQuery.isMultiAuction === 'true') {
        query += ` AND a."ประมูลหลายรอบ (Y/N)" = 'Y'`;
    }

    if (reqQuery.projectName) {
        query += ` AND a.project_name = ?`;
        params.push(reqQuery.projectName);
    }

    if (reqQuery.isExtraPledge === 'true') {
        query += ` AND a."ติดจำนองพิเศษ (is_extra_pledgb)" = 'T'`;
    }

    if (reqQuery.highDepositRisk === 'true') {
        const depositVal = `CAST(REPLACE(a."วางหลักประกันเป็นจำนวน", ',', '') AS FLOAT)`;
        const expectedDeposit = `
            CASE
                WHEN a.price_numeric >= 100000000 THEN 10000000
                WHEN a.price_numeric >= 50000000 THEN 5000000
                WHEN a.price_numeric >= 20000000 THEN 2500000
                WHEN a.price_numeric >= 10000000 THEN 1000000
                WHEN a.price_numeric >= 5000000 THEN 500000
                WHEN a.price_numeric >= 1000000 THEN 250000
                WHEN a.price_numeric >= 500000 THEN 50000
                ELSE a.price_numeric * 0.05
            END
        `;
        query += ` AND a.price_numeric < 200000000 AND ${depositVal} > ${expectedDeposit}`;
    }

    // Area Size Filtering
    const areaRai = parseFloat(reqQuery.areaRai) || 0;
    const areaNgan = parseFloat(reqQuery.areaNgan) || 0;
    const areaSqWa = parseFloat(reqQuery.areaSqWa) || 0;
    const computedSize = (areaRai * 400) + (areaNgan * 100) + areaSqWa;
    
    if (computedSize > 0 && reqQuery.areaCondition) {
        const areaSql = '(CAST(a."เนื้อที่ (ไร่)" AS FLOAT) * 400 + CAST(a."เนื้อที่ (งาน)" AS FLOAT) * 100 + CAST(a."เนื้อที่ (ตร.วา/ตร.ม.)" AS FLOAT))';
        if (reqQuery.areaCondition === 'equal') { query += ` AND ${areaSql} = ?`; params.push(computedSize); }
        else if (reqQuery.areaCondition === 'greater') { query += ` AND ${areaSql} >= ?`; params.push(computedSize); }
        else if (reqQuery.areaCondition === 'less') { query += ` AND ${areaSql} <= ?`; params.push(computedSize); }
    }

    // Auction Date Filtering
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

    // Discount Levels (Based on no-bid occurrences)
    if (reqQuery.discountLevels) {
        const levels = reqQuery.discountLevels.split(',');
        const noBidSql = `(
            (CASE WHEN a."สถานะนัดที่ 1" = 3 OR a."สถานะนัดที่ 1" = '3' THEN 1 ELSE 0 END) +
            (CASE WHEN a."สถานะนัดที่ 2" = 3 OR a."สถานะนัดที่ 2" = '3' THEN 1 ELSE 0 END) +
            (CASE WHEN a."สถานะนัดที่ 3" = 3 OR a."สถานะนัดที่ 3" = '3' THEN 1 ELSE 0 END) +
            (CASE WHEN a."สถานะนัดที่ 4" = 3 OR a."สถานะนัดที่ 4" = '3' THEN 1 ELSE 0 END) +
            (CASE WHEN a."สถานะนัดที่ 5" = 3 OR a."สถานะนัดที่ 5" = '3' THEN 1 ELSE 0 END) +
            (CASE WHEN a."สถานะนัดที่ 6" = 3 OR a."สถานะนัดที่ 6" = '3' THEN 1 ELSE 0 END) +
            (CASE WHEN a."สถานะนัดที่ 7" = 3 OR a."สถานะนัดที่ 7" = '3' THEN 1 ELSE 0 END) +
            (CASE WHEN a."สถานะนัดที่ 8" = 3 OR a."สถานะนัดที่ 8" = '3' THEN 1 ELSE 0 END)
        )`;
        
        let conditions = [];
        if (levels.includes('0')) conditions.push(`${noBidSql} = 0`);
        if (levels.includes('1')) conditions.push(`${noBidSql} = 1`);
        if (levels.includes('2')) conditions.push(`${noBidSql} = 2`);
        if (levels.includes('3')) conditions.push(`${noBidSql} = 3`);
        if (levels.includes('4')) conditions.push(`${noBidSql} = 4`);
        if (levels.includes('5')) conditions.push(`${noBidSql} >= 5`);
        
        if (conditions.length > 0) {
            query += ` AND (${conditions.join(' OR ')})`;
        }
    }

    // Bounding Box
    if (reqQuery.lat && reqQuery.lng && reqQuery.radius) {
        const lat = parseFloat(reqQuery.lat);
        const lng = parseFloat(reqQuery.lng);
        const radius = parseFloat(reqQuery.radius);
        const latDelta = radius / 111;
        const lngDelta = radius / (111 * Math.cos(lat * Math.PI / 180));
        query += ' AND a.latitude BETWEEN ? AND ? AND a.longitude BETWEEN ? AND ?';
        params.push(lat - latDelta, lat + latDelta, lng - lngDelta, lng + lngDelta);
    }

    return { query, params };
}


app.use('/api/auth', authRoutes(db));
app.use('/api/admin', adminRoutes(db));


app.get('/api/assets', (req, res) => {
    const { query, params } = buildQuery(req.query);

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        let filteredRows = rows;

        // Apply exact Haversine distance filter if needed
        if (req.query.lat && req.query.lng && req.query.radius) {
            const targetLat = parseFloat(req.query.lat);
            const targetLng = parseFloat(req.query.lng);
            const radius = parseFloat(req.query.radius);

            filteredRows = rows.filter(row => {
                if (row.latitude == null || row.longitude == null) return false;
                const dist = getDistanceInKm(targetLat, targetLng, row.latitude, row.longitude);
                // attach distance for UI
                row.distanceKm = dist;
                return dist <= radius;
            });
            // Sort by distance
            filteredRows.sort((a, b) => a.distanceKm - b.distanceKm);
        }

        // Apply general sorting
        if (req.query.sortBy) {
            const getArea = (row) => {
                const r = parseFloat(row['เนื้อที่ (ไร่)']) || 0;
                const g = parseFloat(row['เนื้อที่ (งาน)']) || 0;
                const w = parseFloat(row['เนื้อที่ (ตร.วา/ตร.ม.)']) || 0;
                return (r * 400) + (g * 100) + w;
            };
            
            const parseDate = (dStr) => {
                if (!dStr) return 99999999;
                const [d, m, y] = dStr.split('/');
                return parseInt(`${y}${m}${d.padStart(2, '0')}`);
            };

            const getNextDate = (row) => {
                const todayStr = (() => {
                    const t = new Date();
                    return parseInt(`${t.getFullYear() + 543}${String(t.getMonth() + 1).padStart(2, '0')}${String(t.getDate()).padStart(2, '0')}`);
                })();
                
                let minDate = 99999999;
                for (let i = 1; i <= 8; i++) {
                    const d = parseDate(row[`วันที่นัดที่ ${i}`]);
                    if (d >= todayStr && d < minDate) {
                        minDate = d;
                    }
                }
                return minDate;
            };

            filteredRows.sort((a, b) => {
                let valA, valB;
                switch (req.query.sortBy) {
                    case 'price_asc':
                        return (a.price_numeric || 0) - (b.price_numeric || 0);
                    case 'price_desc':
                        return (b.price_numeric || 0) - (a.price_numeric || 0);
                    case 'size_asc':
                        return getArea(a) - getArea(b);
                    case 'size_desc':
                        return getArea(b) - getArea(a);
                    case 'date_asc':
                        return getNextDate(a) - getNextDate(b);
                    case 'sale_order_asc':
                        return (parseInt(a['ลำดับที่การขาย']) || 0) - (parseInt(b['ลำดับที่การขาย']) || 0);
                    case 'sale_order_desc':
                        return (parseInt(b['ลำดับที่การขาย']) || 0) - (parseInt(a['ลำดับที่การขาย']) || 0);
                    default:
                        return 0;
                }
            });
        }

        // Apply pagination in JS
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const total = filteredRows.length;
        const pagedData = filteredRows.slice((page - 1) * limit, page * limit);

        res.json({
            total: total,
            page: page,
            limit: limit,
            data: pagedData
        });
    });
});



app.get('/api/similar-assets', (req, res) => {
    const id = req.query.led_id;
    if (!id) return res.status(400).json({ error: 'led_id is required' });

    db.get('SELECT LED_ID, latitude, longitude, ประเภททรัพย์, จังหวัด, [เขต/อำเภอ] AS อำเภอ FROM assets WHERE LED_ID = ?', [id], (err, target) => {
        if (err || !target) return res.status(500).json({ error: 'Failed to fetch target asset' });

        const assetType = target['ประเภททรัพย์'];
        
        if (target.latitude != null && target.longitude != null) {
            const delta = 0.1;
            const sql = `
                SELECT *
                FROM assets 
                WHERE ประเภททรัพย์ = ? AND LED_ID != ? 
                AND latitude BETWEEN ? AND ? 
                AND longitude BETWEEN ? AND ?
            `;
            db.all(sql, [assetType, target.LED_ID, target.latitude - delta, target.latitude + delta, target.longitude - delta, target.longitude + delta], (err, rows) => {
                if (err) { console.error(err); return res.status(500).json({ error: 'DB Error' }); }
                
                let similar = rows.map(row => {
                    if (row.latitude == null || row.longitude == null) return null;
                    return { ...row, distanceKm: getDistanceInKm(target.latitude, target.longitude, row.latitude, row.longitude) };
                }).filter(r => r != null);
                
                similar.sort((a, b) => a.distanceKm - b.distanceKm);
                res.json(similar.slice(0, 3));
            });
        } else {
            const sql = `
                SELECT *
                FROM assets 
                WHERE ประเภททรัพย์ = ? AND LED_ID != ? AND จังหวัด = ? AND [เขต/อำเภอ] = ?
                LIMIT 10
            `;
            db.all(sql, [assetType, target.LED_ID, target['จังหวัด'], target['อำเภอ']], (err, rows) => {
                if (err) { console.error(err); return res.status(500).json({ error: 'DB Error' }); }
                res.json(rows.slice(0, 3));
            });
        }
    });
});

app.get('/api/location-intelligence', (req, res) => {
    const id = req.query.led_id;
    
    if (!id) {
        return res.status(400).json({ error: 'led_id query parameter is required' });
    }
    
    // First get the asset's coordinates
    db.get('SELECT latitude, longitude FROM assets WHERE LED_ID = ?', [id], (err, asset) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!asset || !asset.latitude || !asset.longitude) {
            return res.json({ error: 'Asset has no coordinates' });
        }
        
        // Fetch POIs within roughly a 3km bounding box (1 deg ~ 111km -> 3km ~ 0.027 deg)
        const latDelta = 0.027;
        const lngDelta = 0.027;
        const sql = `
            SELECT id, name, category, type_th, lat, lng 
            FROM pois 
            WHERE lat BETWEEN ? AND ? 
            AND lng BETWEEN ? AND ?
        `;
        
        db.all(sql, [asset.latitude - latDelta, asset.latitude + latDelta, asset.longitude - lngDelta, asset.longitude + lngDelta], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Calculate precise Haversine distance
            const poisWithDistance = rows.map(poi => {
                const dist = getDistanceInKm(asset.latitude, asset.longitude, poi.lat, poi.lng);
                return { ...poi, distanceKm: dist };
            }).filter(poi => poi.distanceKm <= 3.0);
            
            poisWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
            
            // Group by category, keep top 3 for each
            const grouped = {};
            poisWithDistance.forEach(poi => {
                if (!grouped[poi.category]) grouped[poi.category] = [];
                if (grouped[poi.category].length < 3) {
                    grouped[poi.category].push(poi);
                }
            });
            
            res.json({
                assetLocation: { lat: asset.latitude, lng: asset.longitude },
                amenities: grouped
            });
        });
    });
});

app.get('/api/filters', (req, res) => {
    const filters = {};
    db.all('SELECT DISTINCT "จังหวัด" as province FROM assets WHERE "จังหวัด" IS NOT NULL ORDER BY "จังหวัด"', [], (err, rows) => {
        filters.provinces = rows.map(r => r.province);
        db.all('SELECT DISTINCT "ประเภททรัพย์" as type FROM assets WHERE "ประเภททรัพย์" IS NOT NULL ORDER BY "ประเภททรัพย์"', [], (err, rows) => {
            filters.assetTypes = rows.map(r => r.type);
            db.all('SELECT DISTINCT "ผลการขาย (ล่าสุด)" as saleStatus FROM assets WHERE "ผลการขาย (ล่าสุด)" IS NOT NULL ORDER BY "ผลการขาย (ล่าสุด)"', [], (err, rows) => {
                filters.saleStatuses = rows.map(r => r.saleStatus);
                db.all('SELECT DISTINCT "สถานะทรัพย์ (ป้ายแดง)" as assetStatus FROM assets WHERE "สถานะทรัพย์ (ป้ายแดง)" IS NOT NULL ORDER BY "สถานะทรัพย์ (ป้ายแดง)"', [], (err, rows) => {
                    filters.assetStatuses = rows.map(r => r.assetStatus);
                    db.all('SELECT DISTINCT "ศาล" as court FROM assets WHERE "ศาล" IS NOT NULL ORDER BY "ศาล"', [], (err, rows) => {
                        filters.courts = rows.map(r => r.court);
                        db.all('SELECT DISTINCT "สถานที่จำหน่าย" as auctionLoc FROM assets WHERE "สถานที่จำหน่าย" IS NOT NULL ORDER BY "สถานที่จำหน่าย"', [], (err, rows) => {
                            filters.auctionLocations = rows.map(r => r.auctionLoc);
                            db.get('SELECT MIN(price_numeric) as minP, MAX(price_numeric) as maxP FROM assets', [], (err, row) => {
                                filters.minPrice = row.minP || 0;
                                filters.maxPrice = row.maxP || 10000000;
                                res.json(filters);
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get('/api/locations/districts', (req, res) => {
    const province = req.query.province;
    if (!province) return res.json([]);
    db.all('SELECT DISTINCT "เขต/อำเภอ" as district FROM assets WHERE "จังหวัด" = ? AND "เขต/อำเภอ" IS NOT NULL ORDER BY "เขต/อำเภอ"', [province], (err, rows) => {
        if (err) return res.status(500).json([]);
        res.json(rows.map(r => r.district));
    });
});

app.get('/api/locations/subdistricts', (req, res) => {
    const province = req.query.province;
    const district = req.query.district;
    if (!province || !district) return res.json([]);
    db.all('SELECT DISTINCT "แขวง/ตำบล" as subDistrict FROM assets WHERE "จังหวัด" = ? AND "เขต/อำเภอ" = ? AND "แขวง/ตำบล" IS NOT NULL ORDER BY "แขวง/ตำบล"', [province, district], (err, rows) => {
        if (err) return res.status(500).json([]);
        res.json(rows.map(r => r.subDistrict));
    });
});

app.post('/api/user-data', (req, res) => {
    const { id, is_favorite, is_portfolio, notes, investment_data } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing asset id' });
    
    db.get('SELECT * FROM user_data_v2 WHERE asset_id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            const newFav = is_favorite !== undefined ? is_favorite : row.is_favorite;
            const newPort = is_portfolio !== undefined ? is_portfolio : row.is_portfolio;
            const newNotes = notes !== undefined ? notes : row.notes;
            const newInv = investment_data !== undefined ? investment_data : row.investment_data;
            db.run('UPDATE user_data_v2 SET is_favorite = ?, is_portfolio = ?, notes = ?, investment_data = ? WHERE asset_id = ?', 
                   [newFav, newPort, newNotes, newInv, id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            });
        } else {
            const newFav = is_favorite !== undefined ? is_favorite : 0;
            const newPort = is_portfolio !== undefined ? is_portfolio : 0;
            const newNotes = notes !== undefined ? notes : '';
            const newInv = investment_data !== undefined ? investment_data : null;
            db.run('INSERT INTO user_data_v2 (asset_id, is_favorite, is_portfolio, notes, investment_data) VALUES (?, ?, ?, ?, ?)', 
                   [id, newFav, newPort, newNotes, newInv], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            });
        }
    });
});

// Saved Filters API
app.post('/api/saved-filters', (req, res) => {
    const { name, criteria } = req.body;
    db.run('INSERT INTO user_filters (name, criteria_json) VALUES (?, ?)', 
        [name, JSON.stringify(criteria)], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
    });
});

app.get('/api/saved-filters', (req, res) => {
    db.all('SELECT * FROM user_filters ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Notifications Check (Mock Logic - in reality we check date compared to last_checked)
// We will just return a random number of new matches for demonstration purposes
app.get('/api/notifications', (req, res) => {
    // For a real app: iterate through user_filters, build queries with last_checked date, count results
    res.json({
        hasNotifications: true,
        count: Math.floor(Math.random() * 5) + 1,
        message: "มีทรัพย์สินใหม่ 3 รายการตรงกับตัวกรอง 'บ้านเดี่ยว กรุงเทพ' ที่คุณตั้งไว้!"
    });
});

app.post('/api/ai-analyze', (req, res) => {
    const { assetData } = req.body;
    if (!assetData) return res.status(400).json({ error: 'Missing asset data' });
    
    const priceStr = assetData['ราคาประเมินของเจ้าพนักงานบังคับคดี'] || 'ไม่ระบุ';
    const typeStr = assetData['ประเภททรัพย์'] || 'ไม่ระบุ';
    const locStr = `${assetData['จังหวัด'] || ''} ${assetData['เขต/อำเภอ'] || ''}`;
    
    const mockAnalysis = `
### 🤖 การวิเคราะห์ด้วย AI (Simulated)
**ประเภททรัพย์:** ${typeStr}
**ทำเลที่ตั้ง:** ${locStr}
**ราคาประเมิน:** ${priceStr}

**🟢 ข้อดี / โอกาส:**
- ทรัพย์สินประเภท ${typeStr} ในทำเล ${locStr} มีโอกาสเก็งกำไรได้หากราคาประมูลเริ่มต้นต่ำกว่าราคาตลาด
- เหมาะสำหรับการลงทุนระยะยาว หรือซื้อเพื่ออยู่อาศัยเอง

**🔴 ความเสี่ยง / ข้อควรระวัง:**
- ควรลงพื้นที่จริงเพื่อตรวจสอบสภาพทรัพย์ก่อนประมูลเสมอ
- ตรวจสอบว่ามีผู้บุกรุก หรือผู้อยู่อาศัยเดิมหรือไม่
- ควรศึกษาเรื่องภาระผูกพันหรือหนี้จำนองเพิ่มเติม
    `;
    
    setTimeout(() => {
        res.json({ analysis: mockAnalysis });
    }, 1500);
});

app.listen(port, () => {
    console.log(`LED Advisor API running at http://localhost:${port}`);
});
