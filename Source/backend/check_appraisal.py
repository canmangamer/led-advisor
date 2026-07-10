import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('database.sqlite')
cursor = conn.cursor()
cursor.execute('SELECT "ราคาประเมิน (กรมธนารักษ์)", "เนื้อที่ (Landsmaps)", "เนื้อที่ (ไร่)", "เนื้อที่ (งาน)", "เนื้อที่ (ตร.วา/ตร.ม.)" FROM assets WHERE "ราคาประเมิน (กรมธนารักษ์)" IS NOT NULL LIMIT 5')
for row in cursor.fetchall():
    print(row)
