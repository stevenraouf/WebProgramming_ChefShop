"""Noise-free GPU renders of the same relief rig used by the interactive preview."""
from pathlib import Path
import sys,json,gzip,struct,math,subprocess,argparse
BASE=Path(__file__).resolve().parent
sys.path.insert(0,str(BASE/'runtime'));sys.path.insert(1,str(BASE.parent/'render-v5/runtime'))
import moderngl,numpy as np
from PIL import Image
import imageio_ffmpeg
parser=argparse.ArgumentParser();parser.add_argument('--key');parser.add_argument('--checks-only',action='store_true');args=parser.parse_args()
ROOT=BASE/'interactive';OUT=BASE/'renders';OUT.mkdir(exist_ok=True)
meals=json.loads((ROOT/'assets/meals.json').read_text(encoding='utf8'))
ctx=moderngl.create_standalone_context(require=330)
W,H=960,1200
program=ctx.program(vertex_shader='''#version 330
 uniform mat4 model;uniform mat4 viewProjection;in vec3 position;in vec3 normal;in vec2 uv;out vec2 texcoord;out vec3 worldNormal;
 void main(){gl_Position=viewProjection*model*vec4(position,1.);texcoord=uv;worldNormal=mat3(model)*normal;}
''',fragment_shader='''#version 330
 uniform sampler2D image;uniform float opacity;in vec2 texcoord;in vec3 worldNormal;out vec4 color;
 void main(){vec4 c=texture(image,texcoord);if(c.a<.035)discard;vec3 n=normalize(worldNormal);float light=.92+.08*max(0.,dot(n,normalize(vec3(-.4,-.8,.5))));color=vec4(c.rgb*light,c.a*opacity);}
''')
fbo=ctx.framebuffer(color_attachments=[ctx.renderbuffer((W,H),components=4,samples=4)])
resolve=ctx.simple_framebuffer((W,H),components=4)
ctx.enable(moderngl.BLEND);ctx.blend_func=moderngl.SRC_ALPHA,moderngl.ONE_MINUS_SRC_ALPHA
def texture(path):
 im=Image.open(ROOT/path).convert('RGBA').transpose(Image.Transpose.FLIP_TOP_BOTTOM);t=ctx.texture(im.size,4,im.tobytes());t.build_mipmaps();t.filter=(moderngl.LINEAR_MIPMAP_LINEAR,moderngl.LINEAR);return t
def geometry(path):
 b=gzip.decompress((ROOT/path).read_bytes());nv,ni=struct.unpack('<II',b[:8]);v=ctx.buffer(b[8:8+nv*32]);ix=ctx.buffer(b[8+nv*32:]);return ctx.vertex_array(program,[(v,'3f 3f 2f','position','normal','uv')],ix,index_element_size=4)
def smooth(a,b,v):
 t=max(0,min(1,(v-a)/(b-a)));return t*t*(3-2*t)
def cycle(t):
 if t<.55:return 0
 if t<1.12:return 1-(1-(t-.55)/.57)**4
 if t<4.45:return 1
 if t<5.15:return 1-((t-4.45)/.7)**4
 return 0
def model(x=0,y=0,z=0,rx=0,ry=0,rz=0):
 cx,sx,cy,sy,cz,sz=math.cos(rx),math.sin(rx),math.cos(ry),math.sin(ry),math.cos(rz),math.sin(rz)
 X=np.array([[1,0,0,0],[0,cx,-sx,0],[0,sx,cx,0],[0,0,0,1]],dtype='f4');Y=np.array([[cy,0,sy,0],[0,1,0,0],[-sy,0,cy,0],[0,0,0,1]],dtype='f4');Z=np.array([[cz,-sz,0,0],[sz,cz,0,0],[0,0,1,0],[0,0,0,1]],dtype='f4');M=X@Y@Z;M[:3,3]=[x,y,z];return M
def viewprojection(d,p,t):
 height=(d['whole']['height']+1.9)+(d['top']+1.25-d['whole']['height']-1.9)*p;height=max(height,6.3/(W/H))
 center=d['whole']['centerZ']+.15+((d['top']+.25)/2-d['whole']['centerZ']-.15)*p;yaw=math.sin(t*.31)*.035*p
 eye=np.array([math.sin(yaw)*20,-math.cos(yaw)*20,center+2.1]);target=np.array([0,0,center]);forward=(target-eye);forward/=np.linalg.norm(forward);right=np.cross(forward,np.array([0,0,1.]));right/=np.linalg.norm(right);up=np.cross(right,forward)
 V=np.eye(4,dtype='f4');V[0,:3]=right;V[1,:3]=up;V[2,:3]=-forward;V[:3,3]=-V[:3,:3]@eye
 P=np.diag([2/(height*W/H),2/height,-2/(100-.1),1]).astype('f4');P[2,3]=-(100+.1)/(100-.1);return P@V
def draw(vao,tex,M,alpha):
 if alpha<.001:return
 tex.use(0);program['image']=0;program['opacity']=alpha;program['model'].write(M.T.astype('f4').tobytes());vao.render(moderngl.TRIANGLES)
def saveimage(raw,path):Image.frombytes('RGB',(W,H),raw).transpose(Image.Transpose.FLIP_TOP_BOTTOM).save(path)
report=[]
for d in meals:
 if args.key and d['key']!=args.key:continue
 key=d['key'];print('Rendering',key,flush=True);whole=geometry(d['whole']['mesh']);wholeTex=texture(d['whole']['texture']);partTex=texture(d['parts'][0]['texture']);parts=[]
 for part in d['parts']:
  if part.get('fragments'):parts.append([(geometry(f['mesh']),f) for f in part['fragments']])
  else:parts.append([(geometry(part['mesh']),None)])
 def frame(t,override=None):
  p=cycle(t) if override is None else override;fbo.use();ctx.viewport=(0,0,W,H);ctx.clear(16/255,20/255,16/255,1);program['viewProjection'].write(viewprojection(d,p,t).T.astype('f4').tobytes())
  aw=1-smooth(.10,.32,p);ap=smooth(.18,.38,p)
  for i in [3,2,1,0]:
   part=d['parts'][i];travel=smooth(i*.012,1,p);M=model((1 if i%2 else -1)*.14*travel,(i-1.5)*.13*travel,part['closedZ']+(part['openZ']-part['closedZ'])*travel+math.sin(t*.65+i*.7)*.025*p,(i-1.5)*.018*travel,(1 if i%2 else -1)*.045*travel,(i-1.5)*.018*travel)
   for vao,f in parts[i]:
    FM=M
    if f:
     e=math.sin(t*.8+f['seed']*1.9)*.016*travel;cx,cy,cz=f['center'];FM=M@model(cx+e*.6,cy,cz+e,e*.7,e*.8,e)@model(-cx,-cy,-cz)
    draw(vao,partTex,FM,ap)
  draw(whole,wholeTex,model(z=d['whole']['centerZ']),aw);ctx.copy_framebuffer(resolve,fbo);return resolve.read(components=3,alignment=1)
 start=frame(0);end=frame(5.59);assert start==end,key+' end state mismatch'
 for name,p in [('assembled',0),('handoff',.29),('expanded',1)]:saveimage(frame(2.5,p),OUT/(key+'-'+name+'.png'))
 if not args.checks_only:
  ff=imageio_ffmpeg.get_ffmpeg_exe();mp4=OUT/(key+'-motion.mp4');log=(OUT/(key+'-ffmpeg.log')).open('wb');proc=subprocess.Popen([ff,'-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r','30','-i','-','-vf','vflip','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',str(mp4)],stdin=subprocess.PIPE,stderr=log)
  for i in range(168):proc.stdin.write(frame(i/30))
  proc.stdin.close();code=proc.wait();log.close();assert code==0
  gif=OUT/(key+'-motion.gif');subprocess.run([ff,'-y','-v','error','-i',str(mp4),'-filter_complex','[0:v]fps=25,scale=720:900:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a',str(gif)],check=True)
 report.append({'key':key,'closedMatchesStart':True,'sourceResolution':[W,H],'gifResolution':[720,900],'frames':168,'duration':5.6,'parts':4,'format':'photo-derived relief with canonical finished appearance'})
 (OUT/(key+'-report.json')).write_text(json.dumps(report[-1],indent=2))
 whole.release();wholeTex.release();partTex.release()
 for group in parts:
  for vao,_ in group:vao.release()
(OUT/'render-report.json').write_text(json.dumps(report,indent=2));print('Complete',len(report),ctx.info['GL_RENDERER'],flush=True)
