import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('database.sqlite')
cursor = conn.cursor()
cursor.execute('SELECT "ประเภททรัพย์", "ราคาประเมิน (กรมธนารักษ์)", "เนื้อที่ (ตร.วา/ตร.ม.)", "ราคาประเมินของเจ้าพนักงานบังคับคดี" FROM assets WHERE "ประเภททรัพย์" LIKE \'%ห้องชุด%\' AND "ราคาประเมิน (กรมธนารักษ์)" IS NOT NULL LIMIT 5')
for row in cursor.fetchall():
    print(row)
