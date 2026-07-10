import sqlite3

conn = sqlite3.connect('database.sqlite')
cursor = conn.cursor()
cursor.execute('''
SELECT "วันที่นัดที่ 6", 
       (cast(substr("วันที่นัดที่ 6", 7, 4) as integer) - 543) || '-' || substr("วันที่นัดที่ 6", 4, 2) || '-' || substr("วันที่นัดที่ 6", 1, 2) AS iso_date 
FROM assets 
WHERE "วันที่นัดที่ 6" LIKE '%/%/%' 
LIMIT 5
''')
for row in cursor.fetchall():
    print(row)
