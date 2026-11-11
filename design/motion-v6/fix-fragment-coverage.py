from pathlib import Path
import gzip,struct,json
import sys
BASE=Path(__file__).resolve().parent
sys.path.insert(0,str(BASE.parent/'render-v5/runtime'))
import numpy as np
root=BASE/'interactive';records=json.loads((root/'assets/meals.json').read_text(encoding='utf8'))
def read(path):
 b=gzip.decompress(path.read_bytes());nv,ni=struct.unpack('<II',b[:8]);return nv,np.frombuffer(b,dtype='<f4',count=nv*8,offset=8).copy(),np.frombuffer(b,dtype='<u4',count=ni,offset=8+nv*32).copy()
for meal in records:
 for part in meal['parts']:
  if not part.get('fragments'):continue
  part['fragments']=[f for f in part['fragments'] if f['seed']!=-1]
  nv,vertices,indices=read(root/part['mesh']);covered=set()
  for f in part['fragments']:
   _,_,ix=read(root/f['mesh']);covered.update(ix.reshape(-1,6)[:,0].tolist())
  cells=indices.reshape(-1,6);residual=cells[[int(c[0]) not in covered for c in cells]].ravel()
  if len(residual):
   path=(root/part['mesh']).with_name(Path(part['mesh']).name.replace('.mesh.gz','-residual.mesh.gz'));path.write_bytes(gzip.compress(struct.pack('<II',nv,len(residual))+vertices.tobytes()+residual.tobytes()));part['fragments'].append({'mesh':'assets/'+path.name,'center':[0,0,0],'seed':-1})
(root/'assets/meals.json').write_text(json.dumps(records,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print('Fragment coverage complete')
