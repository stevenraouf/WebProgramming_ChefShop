from pathlib import Path
import sys
from PIL import Image
import json
base=Path(__file__).resolve().parent
key=sys.argv[1] if len(sys.argv)>1 else 'alfredo'
folder=base/'renders'/key
paths=sorted(folder.glob('frame-*.png'))
assert len(paths)==96,len(paths)
boxes=[Image.open(p).getchannel('A').point(lambda a:255 if a>80 else 0).getbbox() for p in paths]
box=(max(0,min(b[0] for b in boxes)-18),max(0,min(b[1] for b in boxes)-18),min(480,max(b[2] for b in boxes)+18),min(600,max(b[3] for b in boxes)+18))
frames=[]
for p in paths:
 im=Image.open(p).crop(box);bg=Image.new('RGBA',im.size,(16,20,16,255));bg.alpha_composite(im);frames.append(bg.convert('RGB').quantize(colors=256))
frames[0].save(base/(key+'-3d-relief.gif'),save_all=True,append_images=frames[1:],duration=[40,40,40,50]*24,loop=0,optimize=False,disposal=2)
poster=Image.open(paths[42]).crop(box);bg=Image.new('RGBA',poster.size,(16,20,16,255));bg.alpha_composite(poster);bg.convert('RGB').save(base/(key+'-3d-poster.png'))
(base/(key+'-render-report.json')).write_text(json.dumps({'type':'Textured 3D relief meshes','frames':96,'seconds':4.08,'crop':box,'lighting':['ivory key','amber rim','olive fill'],'camera':'Perspective orbital camera','timing':'fast burst, suspended drift, fast return','asset':key+'-3d-relief.gif'},indent=2))
print(key,(base/(key+'-3d-relief.gif')).stat().st_size,box)
