from pathlib import Path
from zipfile import ZipFile
import json, shutil, subprocess
from pypdf import PdfReader
from lxml import etree
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'research'
MEDIA = OUT / 'docx-media'
OUT.mkdir(exist_ok=True)
MEDIA.mkdir(exist_ok=True)
records = []
for source in sorted(ROOT.glob('*.pdf')):
    reader = PdfReader(source)
    record = {'file': source.name, 'pages': [], 'links': []}
    for page in reader.pages:
        record['pages'].append(page.extract_text())
        for ref in page.get('/Annots', []):
            obj = ref.get_object()
            action = obj.get('/A', {})
            if action.get('/URI'): record['links'].append(str(action['/URI']))
    records.append(record)
    subprocess.run(['pdftoppm', '-f', '1', '-singlefile', '-scale-to', '1800', '-png', str(source), str(OUT / source.stem)], check=True, capture_output=True)
for source in ROOT.glob('*.docx'):
    with ZipFile(source) as z:
        ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
        root=etree.fromstring(z.read('word/document.xml'))
        rels=etree.fromstring(z.read('word/_rels/document.xml.rels'))
        relmap={r.get('Id'):r.get('Target') for r in rels}
        paragraphs=[]
        for p in root.findall('.//w:p',ns):
            text=''.join(p.xpath('.//w:t/text()',namespaces=ns))
            images=[relmap.get(r) for r in p.xpath('.//a:blip/@r:embed',namespaces=ns)]
            if text or images: paragraphs.append({'text':text,'images':images})
        records.append({'file':source.name,'paragraphs':paragraphs,'links':[r.get('Target') for r in rels if r.get('TargetMode')=='External']})
        for name in z.namelist():
            if name.startswith('word/media/'):
                (MEDIA / Path(name).name).write_bytes(z.read(name))
(OUT / 'extracted.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
files=list(MEDIA.glob('*'))
for batch in range(0,len(files),12):
    group=files[batch:batch+12]
    sheet=Image.new('RGB',(1440,390*((len(group)+3)//4)), '#e1e6e9')
    draw=ImageDraw.Draw(sheet)
    for i,path in enumerate(group):
        im=Image.open(path).convert('RGB')
        im.thumbnail((344,350))
        x=(i%4)*360; y=(i//4)*390
        sheet.paste(im,(x+(360-im.width)//2,y+24))
        draw.text((x+8,y+5),path.name,fill='black')
    sheet.save(OUT / f'contact-{batch//12+1}.jpg')
print(json.dumps(records,ensure_ascii=False,indent=2))
