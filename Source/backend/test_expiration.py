import sqlite3

conn = sqlite3.connect('database.sqlite')
cursor = conn.cursor()

coalesce_sql = '''COALESCE(
    NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 8"), ''), '-'),
    NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 7"), ''), '-'),
    NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 6"), ''), '-'),
    NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 5"), ''), '-'),
    NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 4"), ''), '-'),
    NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 3"), ''), '-'),
    NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 2"), ''), '-'),
    NULLIF(NULLIF(TRIM(a."วันที่นัดที่ 1"), ''), '-')
)'''

iso_sql = f'''(CAST(SUBSTR({coalesce_sql}, 7, 4) AS INTEGER) - 543) || '-' || SUBSTR({coalesce_sql}, 4, 2) || '-' || SUBSTR({coalesce_sql}, 1, 2)'''

query = f'''
SELECT 
  ({iso_sql}) < date('now', 'localtime') AS is_expired
FROM assets a
WHERE a."วันที่นัดที่ 1" LIKE '%/%/%'
LIMIT 10
'''

cursor.execute(query)
for row in cursor.fetchall():
    print(row[0])
