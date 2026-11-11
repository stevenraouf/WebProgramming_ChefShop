from pathlib import Path
import os,zipfile
root=Path(__file__).resolve().parents[2]
dest=root/'design/render-v5/ChefShop-3D-design-source.zip'
files=[]
for parent,dirs,names in os.walk(root/'design'):
 dirs[:]=[d for d in dirs if d not in {'runtime','wheels','__pycache__','node_modules','.git'}]
 for name in names:
  p=Path(parent)/name
  if p.suffix in {'.zip','.whl','.log','.blend1','.dll','.pyd'} or name.startswith('frame-') or 'upload-urls' in name:continue
  files.append(p)
with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=1) as archive:
 for p in files:archive.write(p,p.relative_to(root))
print(str(dest),len(files),dest.stat().st_size)
