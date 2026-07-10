import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('database.sqlite')
cursor = conn.cursor()
cursor.execute('SELECT DISTINCT "ติดต่อ สำนักงานบังคับคดี/กอง" FROM assets LIMIT 20;')
for row in cursor.fetchall():
    print(row[0])
