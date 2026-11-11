(async()=>{
const page=figma.currentPage,report=JSON.parse(page.getPluginData('catalogV4')||'{}'),uploads=__UPLOADS__;
const hashes=Object.fromEntries(uploads.map(u=>[u.key,u.body.imageHash]));hashes.alfredo='21c5a3d085d81951ccd5dcb57e78457e12e8a929';
const get=id=>figma.getNodeByIdAsync(id),home=await get('6:58'),desktop=await get('54:3652');
await Promise.all([{family:'Manrope',style:'Regular'},{family:'Manrope',style:'Bold'},{family:'Bebas Neue',style:'Regular'}].map(f=>figma.loadFontAsync(f)));
const allVars=await figma.variables.getLocalVariablesAsync(),collection=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==='ChefShop / Mobile v2'),vars=allVars.filter(v=>v.variableCollectionId===collection.id);
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255}),colors={cream:'#101410',white:'#1C231D',ink:'#F5EDDD',rust:'#E9A065',muted:'#B7BEAF',line:'#425044',sage:'#28362B',olive:'#C7D3B0'};
const paint=k=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb(colors[k])},'color',vars.find(v=>v.name==='color/'+k));
// Bind new content to the existing cinematic collection, resolving duplicate names from legacy tokens.
let repaired=0;for(const r of page.children.filter(n=>/^\d{2} · .*iPhone 17$/.test(n.name)||/^ChefShop (Catalog|Mobile|Motion|Cinema)/.test(n.name)))for(const n of [r,...r.findAll(()=>true)])for(const prop of ['fills','strokes'])if(Array.isArray(n[prop]))n[prop]=n[prop].map(p=>{if(p.type!=='SOLID'||!p.boundVariables?.color)return p;const v=allVars.find(v=>v.id===p.boundVariables.color.id),name=v?.name.replace('color/','');if(!colors[name])return p;repaired++;return {...paint(name),opacity:p.opacity??1,visible:p.visible??true};});
function f(parent,name,w,h){const n=figma.createFrame();parent.appendChild(n);n.name=name;n.resize(w,h);n.fills=[];n.clipsContent=false;return n;}
function txt(parent,name,s,x,y,w,size=16,color='ink',display=false){const n=figma.createText();parent.appendChild(n);n.name=name;n.fontName={family:display?'Bebas Neue':'Manrope',style:'Regular'};n.fontSize=size;n.characters=s;n.fills=[paint(color)];n.resize(w,size*1.4);n.textAutoResize='HEIGHT';n.x=x;n.y=y;return n;}
function img(parent,name,hash,w,h,x=0,y=0){const n=f(parent,name,w,h);n.fills=[{type:'IMAGE',imageHash:hash,scaleMode:'FIT'}];n.x=x;n.y=y;n.clipsContent=true;return n;}
const ease={type:'CUSTOM_CUBIC_BEZIER',easingFunctionCubicBezier:{x1:.22,y1:1,x2:.36,y2:1}},soft={type:'EASE_IN_AND_OUT'};let tracks=0;
function track(n,field,pairs){n.applyManualKeyframeTrack({type:'PROPERTY',name:field},{keyframes:pairs.map(([t,v,e])=>({timelinePosition:t,value:field==='SCALE_XY'?{type:'VECTOR',value:{x:v,y:v}}:{type:'FLOAT',value:v},easing:e||ease}))});tracks++;}
const sceneData=[['alfredo','FETTUCCINE ALFREDO','ITALY',160,['Parsley & pepper','Parmesan','Creamy fettuccine','Ceramic plate']],['hawawshi','HAWAWSHI','EGYPT',95,['Crisp baladi lid','Spiced beef','Peppers & onion','Baladi base']],['halloumi','HALLOUMI VEG PITA','GREECE',135,['Fresh vegetables','Grilled halloumi','Herb yogurt','Grilled pita']]];
async function cinematic(hero,root,mobile){
 for(const n of [...hero.children])if(n.name==='Cinema / Floating Alfredo'||n.name==='Cinema / Desktop floating Alfredo'||n.name.startsWith('Cinema v4 /')||(!mobile&&['Desktop dish caption','Desktop dish cost'].includes(n.name)))n.remove();
 if(mobile){for(const [name,copy] of [['Cinema / Feature title','FETTUCCINE ALFREDO'],['Cinema / Feature price','EGP 160']]){const t=hero.findOne(n=>n.name===name);if(t)t.characters=copy;}}
 const data=mobile?[sceneData[0]]:sceneData;
 for(const [si,[key,name,region,price,labels]] of data.entries()){
  const start=si*6,end=start+6.4,container=f(hero,'Cinema v4 / '+region+' / '+key,640,610);container.x=mobile?2:748;container.y=mobile?202:0;
  const glow=figma.createEllipse();container.appendChild(glow);glow.name='Atmosphere / warm halo';glow.resize(620,550);glow.x=10;glow.y=40;glow.fills=[{type:'GRADIENT_RADIAL',gradientTransform:[[1,0,0],[0,1,0]],gradientStops:[{position:0,color:{...rgb('#E9A065'),a:.15}},{position:1,color:{...rgb('#E9A065'),a:0}}]}];track(glow,'OPACITY',[[start,.3],[start+2,1],[start+3.7,.65,soft],[end,.3,soft]]);
  const shadow=figma.createEllipse();container.appendChild(shadow);shadow.name='Depth / contact shadow';shadow.resize(430,40);shadow.x=105;shadow.y=555;shadow.fills=[{type:'SOLID',color:rgb('#050805'),opacity:.6}];track(shadow,'SCALE_XY',[[start,1],[start+2.3,.83],[start+3.8,.88,soft],[start+5.3,1]]);track(shadow,'OPACITY',[[start,.5],[start+2,.2],[start+4,.2],[start+5.3,.5]]);
  const full=img(container,'Assembled / '+name,hashes[key],610,580,15,12);
  track(full,'OPACITY',[[start,0],[start+.5,1],[start+1,1],[start+1.6,0],[start+4.6,0],[start+5.35,1],[end,1]]);
  track(full,'TRANSLATION_Y',[[start,35],[start+.9,0],[start+5.35,0],[end,-4,soft]]);track(full,'SCALE_XY',[[start,.93],[start+1,1],[start+5.35,1],[end,1.015,soft]]);
  const bounds=[0,440,780,1120,1536],s=480/1024,spread=[-5,142,278,400];
  for(let i=0;i<4;i++){
   const h=(bounds[i+1]-bounds[i])*s,n=f(container,'Independent ingredient / '+labels[i],480,h);n.x=80;n.y=spread[i];n.clipsContent=true;n.opacity=0;img(n,'Ingredient render',hashes[key+'-explode'],480,1536*s,0,-bounds[i]*s);
   const collapsed=250+i*8-spread[i],delay=i*.075;
   track(n,'OPACITY',[[start,0],[start+.9+delay,0],[start+1.4+delay,1],[start+4.7+delay,1],[start+5.15+delay,0]]);
   track(n,'TRANSLATION_Y',[[start,collapsed],[start+.9+delay,collapsed],[start+2.25+delay,0],[start+3.5+delay,(i-1.5)*3,soft],[start+4.05+delay,0,soft],[start+5.15+delay,collapsed]]);
   track(n,'TRANSLATION_X',[[start,(i%2?-1:1)*16],[start+2.25+delay,0],[start+3.5+delay,(i%2?-1:1)*4,soft],[start+5.15+delay,0]]);
   track(n,'ROTATION',[[start,(i%2?-1:1)*3],[start+2.25+delay,0],[start+3.5+delay,(i%2?-1:1)*.8,soft],[start+5.15+delay,0]]);
   track(n,'SCALE_XY',[[start,.92],[start+2.25+delay,1],[start+3.5+delay,1.015,soft],[start+5.15+delay,.96]]);
   if(!mobile){const t=txt(container,'Ingredient caption / '+labels[i],labels[i],i%2?450:22,spread[i]+h*.65,180,12,'muted');t.opacity=0;track(t,'OPACITY',[[start,0],[start+2.3+delay,0],[start+2.7+delay,1],[start+3.8,1],[start+4.2,0]]);track(t,'TRANSLATION_X',[[start,i%2?10:-10],[start+2.7+delay,0]]);}
  }
  if(mobile){container.rescale(.56);container.x=2;container.y=202;}else{const title=txt(hero,'Cinema v4 / Dish '+key,name,880,630,480,32,'ink',true),cost=txt(hero,'Cinema v4 / Origin '+key,region+' · EGP '+price+' · STUDENT KITCHEN',880,674,460,12,'rust');for(const n of [title,cost]){n.opacity=si===0?1:0;track(n,'OPACITY',[[start,0],[start+.6,1],[start+5.7,1],[end,si===2?1:0]]);}}
  container.opacity=si===0?1:0;const fade=[[start,si===0?1:0],[start+.45,1],[start+5.9,1],[end,si===data.length-1?1:0]];track(container,'OPACITY',fade);
 }
 for(const t of root.timelines)root.setTimelineDuration(t.id,mobile?6.4:18.4);
}
await cinematic(home.findOne(n=>n.name==='Cinema / Mobile hero'),home,true);await cinematic(desktop.findOne(n=>n.name==='Cinema / Desktop hero'),desktop,false);
let preview=page.children.find(n=>n.name==='ChefShop Cinema / Three-cuisine motion');if(preview)preview.remove();preview=f(page,'ChefShop Cinema / Three-cuisine motion',1440,820);preview.fills=[paint('cream')];preview.clipsContent=true;preview.x=3600;preview.y=7200;for(const name of ['Cinema / Desktop navigation','Cinema / Desktop hero']){const node=desktop.findOne(n=>n.name===name).clone();preview.appendChild(node);node.x=0;node.y=name.includes('navigation')?0:104;}
for(const t of preview.timelines)preview.setTimelineDuration(t.id,18.4);
page.flowStartingPoints=[...page.flowStartingPoints.filter(p=>p.name!=='ChefShop · Three-cuisine motion'),{nodeId:preview.id,name:'ChefShop · Three-cuisine motion'}];
report.motion={preview:preview.id,duration:18.4,sceneCount:3,newTracks:tracks,home:home.id,desktop:desktop.id,timelines:preview.timelines};report.repairedBindings=repaired;
page.setPluginData('catalogV4',JSON.stringify(report));
page.selection=[preview];figma.viewport.scrollAndZoomIntoView([preview]);
figma.showUI('<body style="background:#101410;color:#f5eddd;padding:20px;font:14px Arial"><h2>ChefShop · Layered cuisine film</h2><textarea aria-label="Motion build report" id="report" style="width:100%;height:200px">'+JSON.stringify(report)+'</textarea><p><button id="preview">Motion film</button> <button id="home">Phone Home</button> <button id="shop">Shop</button> <button id="close">Close</button></p><script>for(const b of document.querySelectorAll("button"))b.onclick=()=>parent.postMessage({pluginMessage:b.id},"*")</script></body>',{width:680,height:330});figma.ui.onmessage=m=>{if(m==='close')return figma.closePlugin();const n=m==='preview'?preview:m==='home'?home:page.children.find(n=>n.id==='6:431');page.selection=[n];figma.viewport.scrollAndZoomIntoView([n]);};
})().catch(e=>figma.showUI('<h2>Motion stopped</h2><pre>'+String(e.message||e).replace(/</g,'&lt;')+'</pre>',{width:680,height:300}));
