from pathlib import Path
import sys,json
base=Path(__file__).resolve().parent
sys.path.insert(0,str(base/'runtime'))
import bpy
report=[]
for path in sorted((base/'renders').glob('*/*-relief.blend')):
 bpy.ops.wm.open_mainfile(filepath=str(path))
 for image in bpy.data.images:
  if image.source=='FILE' and image.filepath:
   image.reload();image.pack()
 bpy.context.preferences.filepaths.save_version=0
 bpy.ops.wm.save_as_mainfile(filepath=str(path))
 report.append({'meal':path.parent.name,'file':str(path.relative_to(base)),'meshes':sum(o.type=='MESH' for o in bpy.data.objects),'animatedObjects':sum(bool(o.animation_data and o.animation_data.action) for o in bpy.data.objects),'frames':bpy.context.scene.frame_end,'fps':bpy.context.scene.render.fps,'packedImages':sum(bool(i.packed_file) for i in bpy.data.images)})
(base/'source-model-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
