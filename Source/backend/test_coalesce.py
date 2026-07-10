import sqlite3

conn = sqlite3.connect('database.sqlite')
cursor = conn.cursor()

query = '''
SELECT 
  LED_ID,
  "วันที่นัดที่ 1", "วันที่นัดที่ 2", "วันที่นัดที่ 3", "วันที่นัดที่ 4", "วันที่นัดที่ 5", "วันที่นัดที่ 6", "วันที่นัดที่ 7", "วันที่นัดที่ 8",
  COALESCE(
    NULLIF(NULLIF(TRIM("วันที่นัดที่ 8"), ''), '-'),
    NULLIF(NULLIF(TRIM("วันที่นัดที่ 7"), ''), '-'),
    NULLIF(NULLIF(TRIM("วันที่นัดที่ 6"), ''), '-'),
    NULLIF(NULLIF(TRIM("วันที่นัดที่ 5"), ''), '-'),
    NULLIF(NULLIF(TRIM("วันที่นัดที่ 4"), ''), '-'),
    NULLIF(NULLIF(TRIM("วันที่นัดที่ 3"), ''), '-'),
    NULLIF(NULLIF(TRIM("วันที่นัดที่ 2"), ''), '-'),
    NULLIF(NULLIF(TRIM("วันที่นัดที่ 1"), ''), '-')
  ) AS last_date
FROM assets
LIMIT 10
'''

cursor.execute(query)
for row in cursor.fetchall():
    print(f"ID: {row[0]}, Last Date: {row[-1]}")

