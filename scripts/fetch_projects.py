from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
from urllib.parse import urljoin
from html.parser import HTMLParser
from pathlib import Path
import json

class Metadata(HTMLParser):
    def __init__(self): super().__init__(); self.data={}; self.in_title=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='title': self.in_title=True
        if tag=='meta':
            key=a.get('property',a.get('name',''))
            if key in ['og:title','og:image','og:description','description']: self.data[key]=a.get('content','')
        if tag=='link' and 'icon' in a.get('rel',''): self.data['favicon']=a.get('href')
    def handle_endtag(self,tag):
        if tag=='title': self.in_title=False
    def handle_data(self,data):
        if self.in_title: self.data['title']=self.data.get('title','')+data

def fetch(url):
    try:
        req=Request(url,headers={'User-Agent':'Mozilla/5.0'})
        with urlopen(req,timeout=25) as response:
            raw=response.read(1500000)
            html=raw.decode('utf-8',errors='replace')
            parser=Metadata(); parser.feed(html)
            for key in ['favicon','og:image']:
                if parser.data.get(key): parser.data[key]=urljoin(response.url,parser.data[key])
            return {'url':url,'status':response.status,'resolvedUrl':response.url,**parser.data}
    except Exception as e: return {'url':url,'error':str(e)}

if __name__=='__main__':
    urls=['https://www.yihujia.icu','https://www.ytgy.asia','https://www.lrs1.asia']
    results=list(ThreadPoolExecutor(max_workers=3).map(fetch,urls))
    Path('research/project-metadata.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(results,ensure_ascii=True,indent=2))
