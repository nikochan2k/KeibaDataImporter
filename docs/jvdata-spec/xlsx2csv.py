# JV-Data4901.xlsx の各シートを CSV (UTF-8) にする。標準ライブラリだけで動く。
#   python3 -I xlsx2csv.py JV-Data4901.xlsx spec
# シートは先頭から cover, a-history, b-data-format, c-notes, d-code-table, e-data-types, f-timing の順。
# セルの改行は ⏎ にし、ふりがな(rPh)は除く。
import os,zipfile,re,csv,sys,xml.etree.ElementTree as ET
ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
z=zipfile.ZipFile(sys.argv[1]); out=sys.argv[2]
os.makedirs(out,exist_ok=True)
ss=[]
for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si',ns):
    M='{%s}'%ns['m']
    parts=[]
    for ch in si:
        if ch.tag==M+'t': parts.append(ch.text or '')
        elif ch.tag==M+'r':
            parts.append(''.join(t.text or '' for t in ch if t.tag==M+'t'))
    ss.append(''.join(parts))
names=['cover','a-history','b-data-format','c-notes','d-code-table','e-data-types','f-timing']
def col(r):
    n=0
    for ch in re.match('[A-Z]+',r).group(): n=n*26+ord(ch)-64
    return n-1
for i,nm in enumerate(names,1):
    root=ET.fromstring(z.read('xl/worksheets/sheet%d.xml'%i))
    rows=[]
    for row in root.iter('{%s}row'%ns['m']):
        r=int(row.get('r')); cells={}
        for c in row.findall('m:c',ns):
            v=c.find('m:v',ns); t=c.get('t')
            if t=='inlineStr': val=''.join(x.text or '' for x in c.iter('{%s}t'%ns['m']))
            elif v is None: continue
            elif t=='s': val=ss[int(v.text)]
            else: val=v.text
            cells[col(c.get('r'))]=val.replace('\r','').replace('\n','⏎')
        rows.append((r,cells))
    mx=max((max(c) for r,c in rows if c),default=0)
    with open('%s/%s.csv'%(out,nm),'w',newline='',encoding='utf-8') as f:
        w=csv.writer(f)
        last=0
        for r,c in rows:
            if not c: continue
            w.writerow([c.get(k,'') for k in range(mx+1)])
