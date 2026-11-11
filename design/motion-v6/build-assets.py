from pathlib import Path
import sys,json,gzip,struct,tarfile,shutil
BASE=Path(__file__).resolve().parent
sys.path.insert(0,str(BASE/'runtime'));sys.path.insert(1,str(BASE.parent/'render-v5/runtime'))
from PIL import Image,ImageFilter
import numpy as np
root=BASE/'interactive';assets=root/'assets';assets.mkdir(parents=True,exist_ok=True)
with tarfile.open(BASE/'three.tgz') as archive:
 for name in ['package/build/three.module.js','package/build/three.core.js','package/LICENSE']:
  with archive.extractfile(name) as src:(root/'vendor'/Path(name).name).write_bytes(src.read())
old={r['key']:r for r in json.loads((BASE.parent/'brand-motion/recipes.json').read_text())}
records=[('alfredo','Fettuccine Alfredo','Italy',160,['Parsley & pepper','Parmesan','Creamy fettuccine','Black ceramic plate']),('bolognese','Spaghetti Bolognese','Italy',175,['Basil & parmesan','Beef ragù','Spaghetti','Black ceramic plate']),('pesto','Pesto Penne','Italy',165,['Basil & pine nuts','Parmesan','Pesto penne','Black ceramic plate']),('pizza','Margherita Pizza','Italy',190,['Basil','Mozzarella','Tomato sauce','Pizza crust']),('souvlaki','Chicken Souvlaki Pita','Greece',140,['Salad','Grilled chicken','Tzatziki','Grilled pita']),('spanakopita','Spanakopita','Greece',90,['Phyllo lid','Feta cheese','Spinach & dill','Phyllo base']),('gyro','Chicken Gyro Pita','Greece',150,['Salad & fries','Roast chicken','Tzatziki','Grilled pita']),('halloumi','Halloumi Veg Pita','Greece',135,['Vegetables','Grilled halloumi','Herb yogurt','Grilled pita']),('taameya','Taameya Baladi','Egypt',35,['Salad & pickles','Fava-bean taameya','Tahini','Baladi bread']),('ful','Ful Baladi','Egypt',45,['Tomato & parsley','Fava beans','Tahini & olive oil','Baladi bread']),('hawawshi','Hawawshi','Egypt',95,['Baladi lid','Spiced beef','Peppers & onion','Baladi base']),('liver','Alexandrian Liver Sandwich','Egypt',85,['Fino lid','Garlic & peppers','Beef liver','Fino base'])]
def make_mesh(im,bounds,width,path):
 rgba=np.array(im);H,W=rgba.shape[:2];y0,y1=bounds;mask=rgba[y0:y1,:,3]>190;yy,xx=np.where(mask)
 if not len(xx):raise ValueError(path)
 x0,x1=max(0,int(xx.min())-3),min(W-1,int(xx.max())+3);b0,b1=max(y0,y0+int(yy.min())-3),min(y1-1,y0+int(yy.max())+3)
 sx=width/(x1-x0);step=4;xs=np.arange(x0,x1+1,step);ys=np.arange(b0,b1+1,step);X,Y=np.meshgrid(xs,ys);nx,ny=len(xs),len(ys)
 lum=np.array(im.convert('L').filter(ImageFilter.GaussianBlur(10)),dtype=np.float32)/255
 depth=.035*(lum[Y,X]-.5)
 dx=np.gradient(depth,axis=1)/max(step*sx,.001);dz=-np.gradient(depth,axis=0)/max(step*sx,.001)
 norm=np.stack((-dx,-np.ones_like(dx),-dz),axis=-1);norm/=np.linalg.norm(norm,axis=-1,keepdims=True)
 vertices=np.concatenate((np.stack(((X-(x0+x1)/2)*sx,-depth,-(Y-(b0+b1)/2)*sx),axis=-1),norm,np.stack((X/W,1-Y/H),axis=-1)),axis=-1).astype('<f4').reshape(-1,8)
 alpha=rgba[Y,X,3];ok=(alpha[:-1,:-1]>160)|(alpha[1:,:-1]>160)|(alpha[:-1,1:]>160)|(alpha[1:,1:]>160)
 a=np.arange(nx*ny,dtype=np.uint32).reshape(ny,nx)[:-1,:-1][ok];indices=np.stack((a,a+nx,a+nx+1,a,a+nx+1,a+1),axis=-1).astype('<u4').ravel()
 blob=struct.pack('<II',len(vertices),len(indices))+vertices.tobytes()+indices.tobytes();path.write_bytes(gzip.compress(blob,compresslevel=7))
 result={'mesh':'assets/'+path.name,'width':width,'height':(b1-b0)*sx,'vertices':len(vertices),'triangles':len(indices)//3}
 # Give detached garnish/cheese pieces independent pivots while sharing the original texture.
 if '-part0.' in path.name or '-part1.' in path.name:
  visited=np.zeros(ok.shape,bool);regions=[]
  for row,col in zip(*np.where(ok)):
   if visited[row,col]:continue
   todo=[(int(row),int(col))];visited[row,col]=True;cells=[]
   while todo:
    rr,cc=todo.pop();cells.append(rr*nx+cc)
    for r2,c2 in ((rr-1,cc),(rr+1,cc),(rr,cc-1),(rr,cc+1)):
     if 0<=r2<ok.shape[0] and 0<=c2<ok.shape[1] and ok[r2,c2] and not visited[r2,c2]:visited[r2,c2]=True;todo.append((r2,c2))
   if len(cells)>=12:regions.append(cells)
  regions.sort(key=len,reverse=True)
  if 2<=len(regions)<=30:
   fragments=[]
   for ri,cells in enumerate(regions[:12]):
    a=np.array(cells,dtype=np.uint32);ix=np.stack((a,a+nx,a+nx+1,a,a+nx+1,a+1),axis=-1).astype('<u4').ravel();p=path.with_name(path.name.replace('.mesh.gz','-fragment'+str(ri)+'.mesh.gz'));p.write_bytes(gzip.compress(struct.pack('<II',len(vertices),len(ix))+vertices.tobytes()+ix.tobytes(),compresslevel=7));center=vertices[np.unique(ix),:3].mean(axis=0).tolist();fragments.append({'mesh':'assets/'+p.name,'center':center,'seed':ri})
   result['fragments']=fragments
 return result
manifest=[]
for key,name,region,price,labels in records:
 layer=BASE.parent/'brand-motion'/(key+'-layers.png');bounds=old[key]['bounds'] if key in old else [0,440,780,1120,1536]
 if key in ['alfredo','ful','hawawshi','liver','spanakopita','gyro','halloumi']:layer=BASE.parent/'catalog-v4'/(key+'-explode.png');bounds=[0,440,780,1120,1536]
 full=BASE/(key+'-assembled.png')
 if not full.exists():full=BASE.parent/('cinematic-v3/alfredo-hero.png' if key=='alfredo' else 'catalog-v4/'+key+'.png')
 im=Image.open(layer).convert('RGBA');meal=Image.open(full).convert('RGBA')
 im.save(assets/(key+'-layers.webp'),lossless=True,method=4);meal.save(assets/(key+'-meal.webp'),lossless=True,method=4)
 parts=[];widths=[3.8,4.3,4.7,5.2] if region=='Italy' and key!='pizza' else [4.1,4.3,3.7,4.8]
 if key in ['hawawshi','spanakopita']:widths=[4.8,4.2,4.2,4.8]
 if key=='pizza':widths=[3.7,4.5,4.7,5.2]
 for i in range(4):parts.append({**make_mesh(im,(bounds[i],bounds[i+1]),widths[i],assets/(key+'-part'+str(i)+'.mesh.gz')),'label':labels[i],'texture':'assets/'+key+'-layers.webp','index':i})
 z=.7+parts[3]['height']/2
 for i in range(3,-1,-1):
  if i<3:z+=(parts[i]['height']+parts[i+1]['height'])/2+.24
  parts[i]['openZ']=z;parts[i]['closedZ']=1.3+(3-i)*.24
 whole=make_mesh(meal,(0,meal.height),5.35,assets/(key+'-whole.mesh.gz'));whole.update({'texture':'assets/'+key+'-meal.webp','centerZ':.45+whole['height']/2})
 top=parts[0]['openZ']+parts[0]['height']/2
 manifest.append({'key':key,'name':name,'region':region,'price':price,'parts':parts,'whole':whole,'top':top,'duration':5.6})
(assets/'meals.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')),encoding='utf8')
(BASE/'asset-report.json').write_text(json.dumps([{'key':r['key'],'parts':len(r['parts']),'wholeVertices':r['whole']['vertices'],'naturalEnd':True} for r in manifest],indent=2))
print('Prepared',len(manifest),'meal rigs and natural finished states')
