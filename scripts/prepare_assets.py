from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import shutil, hashlib, json, math

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/evidence'
(OUT/'originals').mkdir(parents=True,exist_ok=True)
mapping={
 'cnvd-20319':('CNVD-YCGW-202605069184.pdf',None),
 'cnvd-20312':('CNVD-YCGW-202605069881.pdf',None),
 'cnvd-30548':('CNVD-YCGW-202607049250.pdf',None),
 'cnnvd-18260050':('CNNVD-2026-18260050.pdf',None),
 'cve-10292':('CVE-2026-10292.pdf','image13.png'),
 'cve-10293':('CVE-2026-10293.pdf','image14.png'),
 'cve-87924':(None,'image15.png'), 'cve-87925':(None,'image16.png'),
 'google':('谷歌网络安全认证.pdf',None), 'pku':('北大认证.pdf',None),
 'edusrc':(None,'image12.png'), 'raicom':(None,'image17.png'),
 'challenge-care':(None,'image2.png'), 'challenge-security':(None,'image3.png'),
 'training':(None,'image4.png'), 'social':(None,'image5.png'),
 'edusrc-pending':(None,'image11.png')
}
manifest={}
for key,(pdf,img) in mapping.items():
    original=ROOT/pdf if pdf else ROOT/'research/docx-media'/img
    preview=ROOT/'research/docx-media'/img if img else ROOT/'research'/f'{Path(pdf).stem}.png'
    im=Image.open(preview).convert('RGB')
    if key in ['challenge-care','challenge-security','training']: im=im.rotate(-90,expand=True)
    im.save(OUT/f'{key}.webp',quality=94,method=6)
    thumb=im.copy(); thumb.thumbnail((650,650))
    thumb.save(OUT/f'{key}-thumb.webp',quality=82,method=6)
    shutil.copy2(original, OUT/'originals'/f'{key}{original.suffix}')
    manifest[key]={'width':im.width,'height':im.height,'preview':f'/evidence/{key}.webp','thumbnail':f'/evidence/{key}-thumb.webp','original':f'/evidence/originals/{key}{original.suffix}','source':pdf or f'叶森获奖情况.docx → word/media/{img}','sha256':hashlib.sha256(original.read_bytes()).hexdigest()}
(ROOT/'data').mkdir(exist_ok=True)
(ROOT/'data/assets.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
for domain in ['yihujia.icu','ytgy.asia','lrs1.asia']:
    Image.open(ROOT/'research'/f'{domain}.png').convert('RGB').save(ROOT/'public/projects'/f'{domain}.webp',quality=85,method=6)

# A local social preview; no dependency on an external font service.
im=Image.new('RGB',(1200,630),'#050b10'); d=ImageDraw.Draw(im)
for r in range(380,0,-1):
    t=1-r/380
    color=(int(5+t*5),int(11+t*28),int(16+t*27))
    d.ellipse((925-r,270-r,925+r,270+r),fill=color)
for x in range(40,1200,60): d.line((x,0,x,630),fill='#101e25')
for y in range(30,630,60): d.line((0,y,1200,y),fill='#101e25')
fontpath='C:/Windows/Fonts/msyh.ttc'
def font(size): return ImageFont.truetype(fontpath,size)
d.text((65,50),'YS.  /  DIGITAL HONORS EXHIBITION',font=font(20),fill='#8cadac')
d.text((60,133),'叶森',font=font(104),fill='#ecf4f4')
d.text((66,276),'个人技术成果与荣誉档案',font=font(37),fill='#e0eeea')
d.text((68,345),'学业 · 网络安全 · 工程实践',font=font(23),fill='#93abae')
d.line((68,452,1125,452),fill='#32524f',width=1)
d.text((68,486),'CNVD   /   CNNVD   /   CVE',font=font(34),fill='#8edcc2')
d.text((70,563),'每一份成果，都有迹可循。',font=font(18),fill='#93abae')
for r in [110,140,173]: d.ellipse((937-r,248-r,937+r,248+r),outline='#568b7e',width=1)
for angle in range(0,360,30):
    a=angle*math.pi/180; x=937+140*math.cos(a); y=248+140*math.sin(a)
    d.ellipse((x-3,y-3,x+3,y+3),fill='#b9ead7')
d.text((902,205),'YS',font=font(48),fill='#d7f4e9')
im.save(ROOT/'public/og-image.jpg',quality=92)
print(f'Prepared {len(manifest)} evidence entries, 3 project screenshots and OG image.')
