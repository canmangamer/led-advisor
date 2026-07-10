import sqlite3
import sys
sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('database.sqlite')
cursor = conn.cursor()

# Check what the column is actually called
cursor.execute("PRAGMA table_info(assets)")
cols = cursor.fetchall()
url_cols = [c[1] for c in cols if 'url' in c[1].lower() or 'link' in c[1].lower() or 'ประกาศ' in c[1] or 'กรมบังคับคดี' in c[1]]
print("URL columns:", url_cols)

if 'URL กรมบังคับคดี (LED)' in url_cols:
    cursor.execute("SELECT `URL กรมบังคับคดี (LED)` FROM assets WHERE `URL กรมบังคับคดี (LED)` IS NOT NULL AND `URL กรมบังคับคดี (LED)` != '' LIMIT 10")
    print("Sample URLs:", cursor.fetchall())
else:
    print("Column URL กรมบังคับคดี (LED) not found")
