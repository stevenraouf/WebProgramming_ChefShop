"""Texture-derived 3D relief meshes; preserve food photography while adding real depth.
Not a reconstructed, freely orbitable volumetric food scan.
"""
import sys,os,math,json,time
from pathlib import Path
BASE=Path(__file__).resolve().parent
sys.path.insert(0,str(BASE/'runtime'))
import bpy,numpy as np
from mathutils import Vector
key=sys.argv[1] if len(sys.argv)>1 else 'alfredo'
mode=sys.argv[2] if len(sys.argv)>2 else 'poster'
sources={r['key']:(BASE.parent/'brand-motion'/(r['key']+'-layers.png'),r['bounds']) for r in json.loads((BASE.parent/'brand-motion/recipes.json').read_text())}
for k in ['alfredo','ful','hawawshi','liver','spanakopita','gyro','halloumi']:sources[k]=(BASE.parent/'catalog-v4'/(k+'-explode.png'),[0,440,780,1120,1536])
out=BASE/'renders'/key;out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.render.engine=os.environ.get('CHEFSHOP_RENDER_ENGINE','CYCLES');scene.cycles.samples=16;scene.cycles.use_denoising=True;scene.render.threads_mode='FIXED';scene.render.threads=6
if os.environ.get('CHEFSHOP_FAST')=='1':scene.cycles.use_denoising=False;scene.cycles.samples=8;scene.cycles.max_bounces=2
scene.render.resolution_x=480;scene.render.resolution_y=600;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.film_transparent=True
scene.view_settings.view_transform='Standard';scene.view_settings.look='Medium High Contrast';scene.view_settings.exposure=0;scene.view_settings.gamma=1
world=bpy.data.worlds.new('Charcoal studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.08,.1,.085,1);world.node_tree.nodes['Background'].inputs[1].default_value=.3;scene.world=world
image=bpy.data.images.load(str(sources[key][0]));W,H=image.size;pixels=np.array(image.pixels[:],dtype=np.float32).reshape(H,W,4)
def material(name):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;p=n.get('Principled BSDF');p.inputs['Roughness'].default_value=.48;p.inputs['Coat Weight'].default_value=.12;p.inputs['Coat Roughness'].default_value=.3
 tex=n.new('ShaderNodeTexImage');tex.image=image;tex.interpolation='Linear';l.new(tex.outputs['Color'],p.inputs['Base Color']);p.inputs['Emission Strength'].default_value=.18;l.new(tex.outputs['Color'],p.inputs['Emission Color']);return m
mat=material('Photographic food / softbox relight')
def mesh_layer(index,y0,y1):
 # The source alpha defines the silhouette; luminance supplies shallow surface relief.
 step=4;xs=list(range(0,W,step));ys=list(range(y0,y1,step));verts=[];uvs=[]
 for y in ys:
  for x in xs:
   c=pixels[H-1-min(H-1,y),x];lum=float(c[:3].mean());verts.append(((x/W-.5)*5,-(.05+.12*lum),-(y-(y0+y1)/2)/W*5));uvs.append((x/W,1-y/H))
 faces=[];nx=len(xs)
 for j in range(len(ys)-1):
  for i in range(nx-1):
   x,y=xs[i],ys[j]
   if min(float(pixels[H-1-min(H-1,yy),xx,3]) for xx,yy in [(x,y),(xs[i+1],y),(x,ys[j+1]),(xs[i+1],ys[j+1])])>.68:
    a=j*nx+i;faces.append((a,a+nx,a+nx+1,a+1))
 mesh=bpy.data.meshes.new('Relief topology '+str(index));mesh.from_pydata(verts,[],faces);mesh.update();ob=bpy.data.objects.new('Ingredient '+str(index+1)+' / textured relief',mesh);scene.collection.objects.link(ob);ob.data.materials.append(mat)
 uv=mesh.uv_layers.new(name='Source food photograph')
 for poly in mesh.polygons:
  poly.use_smooth=True
  for li in poly.loop_indices:uv.data[li].uv=uvs[mesh.loops[li].vertex_index]
 sol=ob.modifiers.new('Physical edge thickness','SOLIDIFY');sol.thickness=.035;return ob
bounds=sources[key][1];objects=[mesh_layer(i,bounds[i],bounds[i+1]) for i in range(4)]
for i,ob in enumerate(objects):ob.location.z=[5.6,4.05,2.55,1.1][i]
def area(name,loc,power,size,color,target=(0,0,3.3)):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color;o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
area('Key / ivory softbox',(-4,-7,8),650,7,(1,.91,.78));area('Rim / warm amber',(4,2,6),900,5,(1,.48,.2));area('Fill / olive bounce',(4,-5,3),220,6,(.66,.8,.72))
camera_data=bpy.data.cameras.new('Slow orbital camera');camera=bpy.data.objects.new('Slow orbital camera',camera_data);scene.collection.objects.link(camera);scene.camera=camera;camera_data.lens=55
def pose(t):
 # Fast outward burst, slow held drift, fast inward return; identical loop endpoints.
 if t<.25:p=0
 elif t<.7:p=1-(1-(t-.25)/.45)**4
 elif t<3.2:p=1+.012*math.sin((t-.7)/2.5*math.pi)
 elif t<3.7:p=1-((t-3.2)/.5)**4
 else:p=0
 for i,o in enumerate(objects):
  end=[5.6,4.05,2.55,1.1][i];start=1.1+(3-i)*.23;o.location.z=start+(end-start)*p;o.location.x=(i%2*2-1)*.08*p;o.location.y=(i-1.5)*.15*p;o.rotation_euler=(math.radians((i-1.5)*3*p),math.radians((i%2*2-1)*5*p),math.radians((i-1.5)*2*p))
 angle=math.radians(-3+6*math.sin(math.pi*min(1,max(0,(t-.25)/3.45))))*p
 camera.location=(math.sin(angle)*17,-math.cos(angle)*17,5.0);camera.rotation_euler=(Vector((0,0,3.35))-camera.location).to_track_quat('-Z','Y').to_euler()
 if mode=='poster':pose_t=1.7
pose(1.7)
scene.frame_start=1;scene.frame_end=96;scene.render.fps=24
for fr in range(96):
 pose(fr/24)
 for ob in objects+[camera]:
  ob.keyframe_insert(data_path='location',frame=fr+1);ob.keyframe_insert(data_path='rotation_euler',frame=fr+1)
pose(1.7)
bpy.ops.wm.save_as_mainfile(filepath=str(out/(key+'-relief.blend')))
if mode=='bake':pass
elif mode=='poster':
 scene.frame_set(42);pose(41/24);scene.render.filepath=str(out/'poster.png');bpy.ops.render.render(write_still=True)
else:
 for frame in range(96):
  dest=out/('frame-%03d.png'%frame)
  if dest.exists():continue
  scene.frame_set(frame+1);pose(frame/24);scene.render.filepath=str(dest);bpy.ops.render.render(write_still=True);print('FRAME',key,frame,flush=True)
print('DONE',key,mode,flush=True)
