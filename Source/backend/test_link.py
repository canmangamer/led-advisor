import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('database.sqlite')
cursor = conn.cursor()
cursor.execute('SELECT DISTINCT "ติดต่อ สำนักงานบังคับคดี/กอง" FROM assets LIMIT 50;')

liveLinks = {
  "ส่วนกลาง": "https://live.led.go.th/?branch=center",
  "แพ่งกรุงเทพมหานคร 3": "https://live.led.go.th/?branch=bkk3",
  "กำแพงเพชร": "https://live.led.go.th/?branch=kamphaengphet",
  "ชัยภูมิ": "https://live.led.go.th/?branch=chaiyaphum",
  "นครนายก": "https://live.led.go.th/?branch=nakonnayok",
  "นครปฐม": "https://live.led.go.th/?branch=nakhonpathom",
  "นครสวรรค์": "https://live.led.go.th/?branch=nakhonsawan",
  "นนทบุรี": "https://live.led.go.th/?branch=nonthaburi",
  "ปทุมธานี สาขาธัญบุรี": "https://live.led.go.th/?branch=thanyaburi",
  "ปทุมธานี": "https://live.led.go.th/?branch=pathumthani",
  "ชลบุรี สาขาพัทยา": "https://live.led.go.th/?branch=pattaya",
  "ชลบุรี": "https://live.led.go.th/?branch=chonburi",
  # ... other keys
}

for row in cursor.fetchall():
    branchName = row[0]
    if not branchName: continue
    
    clean_branch = ' '.join(branchName.split())
    liveUrl = None
    
    if 'แพ่งกรุงเทพมหานคร 3' in clean_branch:
        liveUrl = liveLinks['แพ่งกรุงเทพมหานคร 3']
    elif 'แพ่งกรุงเทพมหานคร' in clean_branch or 'ส่วนกลาง' in clean_branch or 'ล้มละลาย' in clean_branch:
        liveUrl = liveLinks['ส่วนกลาง']
    else:
        for k, v in liveLinks.items():
            if k == clean_branch or k in clean_branch:
                liveUrl = v
                break
                
    print(f"{clean_branch} -> {liveUrl}")
