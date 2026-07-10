import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

try:
    conn = sqlite3.connect('database.sqlite')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print('Tables:', tables)
    for table in tables:
        tname = table[0]
        cursor.execute(f"PRAGMA table_info({tname})")
        cols = cursor.fetchall()
        print(f'\\nTable {tname}:')
        for col in cols:
            print(f'  {col[1]} ({col[2]})')
except Exception as e:
    print('Error:', e)
