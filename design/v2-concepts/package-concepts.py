from pathlib import Path
from PIL import Image
import re, json, zipfile

root=Path(__file__).parent
images=['01-home-and-shop-final.png','02-meal-details.png','03-linked-spice-and-tool.png','04-cart-checkout-confirmation.png','05-academy-final.png','06-customer-workflow.png','07-shop-category-states.png']
report=[]
for name in images:
    p=root/name
    assert p.is_file() and p.stat().st_size>0,name
    with Image.open(p) as im:
        w,h=im.size
        im.verify()
    report.append({'file':name,'width':w,'height':h,'bytes':p.stat().st_size})
html=(root/'index.html').read_text(encoding='utf-8')
targets=re.findall(r'(?:href|src)="([^"#]+)"',html)
missing=sorted({t for t in targets if not (root/t).is_file()})
assert not missing,missing
files=images+['index.html','interaction-spec.md']
archive=root/'ChefShop-customer-designs.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for name in files:z.write(root/name,name)
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
(root/'delivery-manifest.json').write_text(json.dumps({'corePages':7,'screenStates':15,'designBoards':6,'workflowImages':1,'images':report,'archiveEntries':len(files),'missingGalleryLinks':missing},indent=2),encoding='utf-8')
print(json.dumps({'images':len(images),'screenStates':15,'archive':str(archive),'archiveBytes':archive.stat().st_size,'missingLinks':missing},indent=2))
