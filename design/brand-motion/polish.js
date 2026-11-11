(async()=>{
const page=figma.currentPage,changed=[],created=[],problems=[];
const core=page.children.filter(n=>n.type==='FRAME'&&/^\d{2} · .*iPhone 17$/.test(n.name));
const sets=page.children.filter(n=>n.type==='COMPONENT_SET'&&n.name.startsWith('ChefShop Motion/'));
if(core.length!==19||sets.length!==6)throw new Error('Expected 19 mobile screens and six meal families.');
const owned=page.children.filter(n=>core.includes(n)||n.name.startsWith('ChefShop Mobile')||n.name.startsWith('ChefShop Motion/')||n.name==='ChefShop / Meal motion preview · iPhone 17'||n.name==='ChefShop / Brand & Meal Motion');
const fontMap=new Map();for(const r of owned)for(const t of r.findAll(n=>n.type==='TEXT'))for(const s of t.getStyledTextSegments(['fontName']))fontMap.set(s.fontName.family+'/'+s.fontName.style,s.fontName);
await Promise.all([...fontMap.values()].map(f=>figma.loadFontAsync(f)));
const collection=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==='ChefShop / Mobile v2');
const vars=(await figma.variables.getLocalVariablesAsync()).filter(v=>v.variableCollectionId===collection.id);const token=name=>vars.find(v=>v.name===name);
const paint=k=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',token('color/'+k));
const styles=await figma.getLocalTextStylesAsync(),newStyles=new Map(),styleJobs=[];
function applyType(n,size){const bold=n.fontName.style==='Bold',serif=n.fontName.family==='Georgia';const key=[size,bold,serif].join('/');let st=newStyles.get(key)||styles.find(s=>s.name==='ChefShop Refined/'+key);if(!st){st=figma.createTextStyle();st.name='ChefShop Refined/'+key;st.fontName=n.fontName;st.fontSize=size;st.lineHeight={unit:'PIXELS',value:Math.ceil(size*(serif?1.22:1.5))};newStyles.set(key,st);}styleJobs.push(n.setTextStyleIdAsync(st.id));changed.push(n.id);}
function inside(n,name){for(let p=n.parent;p&&p.type!=='PAGE';p=p.parent)if(p.name===name||p.name.startsWith(name))return true;return false;}
// Improve readable copy without changing the approved editorial brand.
for(const r of owned)for(const t of r.findAll(n=>n.type==='TEXT')){
 if(inside(t,'ChefShop / Three kitchens logo')||inside(t,'ChefShop Brand/')||inside(t,'iPhone 17 / Safe area')||inside(t,'ChefShop Motion/'))continue;
 const size=t.fontSize;if(typeof size!=='number')continue;
 if(styles.some(s=>s.id===t.textStyleId&&s.name.startsWith('ChefShop Refined/')))continue;
 if(size===14&&t.fontName.style==='Regular'&&!inside(t,'Input'))applyType(t,16);
 else if(size===13&&t.fontName.style==='Regular')applyType(t,14);
 else if(size===12&&t.fontName.style==='Regular')applyType(t,13);
 else if(size===10&&inside(t,'Nav / '))applyType(t,12);
 else if(size===17&&t.fontName.family==='Georgia')applyType(t,18);
}
await Promise.all(styleJobs);
for(const r of owned)for(const t of r.findAll(n=>n.type==='TEXT'))if(changed.includes(t.id)){t.textAutoResize='HEIGHT';if(t.parent.layoutMode!=='NONE')t.layoutSizingVertical='HUG';}
for(const r of owned){
 const body=r.findOne(n=>n.name==='Responsive content');if(body){body.itemSpacing=24;body.setBoundVariable('itemSpacing',token('space/24'));changed.push(body.id);}
 for(const n of r.findAll(n=>n.name==='Open shop'||n.name==='Open cart')){n.resize(44,44);n.clipsContent=false;changed.push(n.id);}
 const nav=r.findOne(n=>n.name==='Mobile web navigation');if(nav){nav.itemSpacing=10;}
 for(const n of r.findAll(n=>n.name==='Input')){n.minHeight=48;changed.push(n.id);}
}
const bezier=(x1,y1,x2,y2)=>({type:'CUSTOM_CUBIC_BEZIER',easingFunctionCubicBezier:{x1,y1,x2,y2}});
const arrive=bezier(.16,1,.3,1),depart=bezier(.4,0,.7,.3),settle=bezier(.22,.75,.25,1);
function act(id,duration,easing=arrive){return {type:'NODE',destinationId:id,navigation:'CHANGE_TO',transition:duration?{type:'SMART_ANIMATE',duration,easing}:null};}
async function wire(n,id,duration,easing=arrive,trigger={type:'ON_CLICK'}){await n.setReactionsAsync([{trigger,actions:[act(id,duration,easing)]}]);changed.push(n.id);}
const motionRecords=[];
for(const set of sets){
 const assembled=set.children.find(v=>v.name==='State=Assembled'),exploded=set.children.find(v=>v.name==='State=Exploded'),still=set.children.find(v=>v.name==='State=Still');
 if(!assembled||!exploded||!still)throw new Error('Base states missing for '+set.name);
 for(const v of [assembled,exploded,still]){
  v.resize(362,540);const stage=v.findOne(n=>n.name==='Ingredient stage');stage.y=44;
  const photo=v.findOne(n=>n.name==='Finished meal');photo.y=32;photo.resize(362,330);photo.cornerRadius=16;
  const caption=v.findOne(n=>n.name==='Caption');caption.y=450;caption.fontSize=14;caption.lineHeight={unit:'PIXELS',value:21};caption.textAutoResize='HEIGHT';
  const toggle=v.findOne(n=>n.name==='Toggle ingredients');toggle.y=488;toggle.resize(362,48);const label=toggle.findOne(n=>n.name==='Action label');label.characters=v===assembled?'Explore the layers':'Bring the meal together';label.fontSize=15;label.textAutoResize='HEIGHT';label.y=13;
  let ctrl=v.findOne(n=>n.name==='Still view control');let txt=v.findOne(n=>n.type==='TEXT'&&n.name==='Still view');
  if(!ctrl){ctrl=figma.createFrame();v.appendChild(ctrl);ctrl.name='Still view control';ctrl.resize(96,44);ctrl.x=266;ctrl.y=0;ctrl.fills=[];created.push(ctrl.id);ctrl.appendChild(txt);txt.x=8;txt.y=13;txt.resize(88,18);txt.fontSize=12;txt.textAutoResize='HEIGHT';await txt.setReactionsAsync([]);}
  const cuisine=v.findOne(n=>n.name==='Cuisine');cuisine.y=12;cuisine.resize(258,20);cuisine.fontSize=11;cuisine.textAutoResize='HEIGHT';
  for(const badge of stage.findAll(n=>n.name.startsWith('Ingredient label '))){const t=badge.findOne(n=>n.type==='TEXT');badge.resize(Math.min(322,Math.ceil(t.characters.length*6.5+16)),28);badge.cornerRadius=8;badge.fills=[paint('white')];badge.strokes=[paint('line')];badge.strokeWeight=1;t.fontSize=12;t.resize(badge.width-16,20);t.textAutoResize='HEIGHT';t.y=5;}
  changed.push(v.id);
 }
 function phase(name,template){let n=set.children.find(v=>v.name==='State='+name);if(!n){n=template.clone();set.appendChild(n);n.name='State='+name;created.push(n.id);}return n;}
 const lift=phase('Lift',assembled),spread=phase('Spread',exploded),returning=phase('Return',assembled);
 for(const phase of [lift,spread,returning]){await phase.setReactionsAsync([]);await phase.findOne(n=>n.name==='Toggle ingredients').setReactionsAsync([]);phase.findOne(n=>n.name==='Action label').characters='Preparing every layer…';}
 for(let i=1;i<=4;i++){
  const target=exploded.findOne(n=>n.name==='Ingredient layer '+i);
  const a=assembled.findOne(n=>n.name==='Ingredient layer '+i);a.y=135+(i-1)*7;a.opacity=0;
  const l=lift.findOne(n=>n.name==='Ingredient layer '+i);l.y=a.y-3;l.opacity=.85;
  const s=spread.findOne(n=>n.name==='Ingredient layer '+i);s.y=target.y+[-4,-2,2,4][i-1];s.opacity=1;
  const back=returning.findOne(n=>n.name==='Ingredient layer '+i);back.y=a.y;back.opacity=1;
  for(const v of [lift,spread,returning])v.findOne(n=>n.name==='Ingredient label '+i).opacity=0;
 }
 lift.findOne(n=>n.name==='Finished meal').opacity=.12;lift.findOne(n=>n.name==='Finished meal').y=28;
 spread.findOne(n=>n.name==='Finished meal').opacity=0;returning.findOne(n=>n.name==='Finished meal').opacity=0;
 await wire(assembled.findOne(n=>n.name==='Toggle ingredients'),lift.id,.16,arrive);
 await wire(lift,spread.id,.52,arrive,{type:'AFTER_TIMEOUT',timeout:.01});
 await wire(spread,exploded.id,.22,settle,{type:'AFTER_TIMEOUT',timeout:.01});
 await wire(exploded.findOne(n=>n.name==='Toggle ingredients'),returning.id,.44,depart);
 await wire(returning,assembled.id,.14,arrive,{type:'AFTER_TIMEOUT',timeout:.01});
 await wire(still.findOne(n=>n.name==='Toggle ingredients'),assembled.id,0);
 for(const v of set.children)if(v!==still)await wire(v.findOne(n=>n.name==='Still view control'),still.id,0);
 set.description='Refined ingredient choreography: lift 160 ms, decelerating spread 520 ms, settle and label reveal 220 ms. Return 440 + 140 ms. Still view bypasses every transition. All layers preserve matching names.';
 motionRecords.push({id:set.id,name:set.name,states:set.children.map(v=>({id:v.id,name:v.name})),timing:{lift:.16,spread:.52,settle:.22,return:.58}});
}
// Separate native Motion timelines offer the fuller staggered editorial treatment.
const tracks=[],cinematic=[];const key=(time,value,easing=arrive)=>({timelinePosition:time,value:{type:'FLOAT',value},easing});
function track(node,name,keyframes){if(name==='SCALE_XY')keyframes=keyframes.map(k=>({...k,value:{type:'VECTOR',value:{x:k.value.value,y:k.value.value}}}));node.applyManualKeyframeTrack({type:'PROPERTY',name},{keyframes});tracks.push({id:node.id,field:name});changed.push(node.id);}
const source=core.find(r=>r.name.startsWith('03 ·'));
for(let i=0;i<sets.length;i++){
 const set=sets[i],name=set.name.replace('ChefShop Motion/',''),fullName='ChefShop / Motion study / '+name;
 let root=page.children.find(n=>n.name===fullName);
 if(!root){root=figma.createFrame();page.appendChild(root);root.name=fullName;root.resize(402,874);root.fills=[paint('cream')];root.cornerRadius=40;root.clipsContent=true;root.x=180+i*470;root.y=7700;created.push(root.id);
  for(const n of source.children.filter(n=>n.name==='iPhone 17 / Safe area'||n.name==='Mobile web navigation')){const c=n.clone();root.appendChild(c);c.x=0;c.y=n.name==='iPhone 17 / Safe area'?0:54;}
  const exp=set.children.find(v=>v.name==='State=Exploded');const scene=figma.createFrame();root.appendChild(scene);scene.name='Cinematic ingredient scene';scene.resize(362,540);scene.x=20;scene.y=158;scene.fills=[];
  for(const child of exp.children){const copy=child.clone();scene.appendChild(copy);}
  const control=scene.findOne(n=>n.name==='Toggle ingredients');control.visible=false;scene.findOne(n=>n.name==='Still view control').visible=false;
  const caption=scene.findOne(n=>n.name==='Caption');caption.characters='Crafted layer by layer. Made by our student kitchen.';
 }
 const scene=root.findOne(n=>n.name==='Cinematic ingredient scene'),dish=scene.findOne(n=>n.name==='Finished meal');
 track(dish,'OPACITY',[key(0,1),key(.2,1),key(.43,0),key(2.92,0),key(3.2,1)]);
 track(dish,'SCALE_XY',[key(0,1),key(.43,1.025),key(2.92,1.025),key(3.2,1)]);
 track(dish,'TRANSLATION_Y',[key(0,0),key(.43,-4),key(2.92,-4),key(3.2,0)]);
 for(let j=1;j<=4;j++){
  const n=scene.findOne(n=>n.name==='Ingredient layer '+j),delay=.23+(j-1)*.055,from=135+(j-1)*7-n.y;
  track(n,'TRANSLATION_Y',[key(0,from),key(delay,from),key(delay+.8,0),key(2.45,0),key(3.02,from,depart)]);
  track(n,'OPACITY',[key(0,0),key(delay,0),key(delay+.16,1),key(2.93,1),key(3.15,0)]);
  track(n,'SCALE_XY',[key(0,.94),key(delay,.94),key(delay+.8,1),key(2.45,1),key(3.02,.94,depart)]);
  const label=scene.findOne(n=>n.name==='Ingredient label '+j);
  track(label,'OPACITY',[key(0,0),key(.88+j*.045,0),key(1.08+j*.045,1),key(2.4,1),key(2.64,0)]);
  track(label,'TRANSLATION_Y',[key(0,6),key(.88+j*.045,6),key(1.08+j*.045,0)]);
 }
 const cap=scene.findOne(n=>n.name==='Caption');track(cap,'OPACITY',[key(0,0),key(1.1,0),key(1.36,1),key(2.6,1),key(3.12,0)]);
 const timelines=root.timelines;for(const t of timelines)if(t.duration<3.4)root.setTimelineDuration(t.id,3.4);
 cinematic.push({id:root.id,name:root.name,timelines:root.timelines,tracks:scene.findAll(n=>Object.keys(n.manualKeyframeTracks||{}).length>0).length});
}
const board=page.children.find(n=>n.name==='ChefShop / Brand & Meal Motion');if(board){const t=board.findOne(n=>n.name==='Motion instructions');t.characters='Tap Explore the layers: lift → spread → settle. Bring the meal together reverses the reveal. Still view skips movement. Native Motion studies below add stagger, zoom and label fades.';t.textAutoResize='HEIGHT';}
await new Promise(r=>setTimeout(r,100));
for(const r of core){if(r.width!==402||r.height!==874)problems.push(r.name+' viewport changed');for(const t of r.findAll(n=>n.type==='TEXT'))if(t.height<8)problems.push('Collapsed text '+t.id);}
const report={status:problems.length?'needs-attention':'passed',originalFrames:core.length,refinedText:changed.length,sets:motionRecords,nativeMotion:cinematic,nativeTrackCount:tracks.length,problems};
const preview=await figma.getNodeByIdAsync('23:1455');figma.currentPage.selection=[preview];figma.viewport.scrollAndZoomIntoView([preview]);
figma.showUI('<body style="background:#f8f3e9;color:#263d29;font:14px Arial;padding:20px"><h2>ChefShop · Smooth motion refinement</h2><textarea aria-label="Polish report" id="report" readonly style="width:100%;height:240px">'+JSON.stringify(report).replace(/</g,'&lt;')+'</textarea><p><button onclick="parent.postMessage({pluginMessage:{type:\'home\'}},\'*\')">Home</button> <button onclick="parent.postMessage({pluginMessage:{type:\'meal\'}},\'*\')">Meal</button> <button onclick="parent.postMessage({pluginMessage:{type:\'motion\'}},\'*\')">Native motion</button> <button onclick="parent.postMessage({pluginMessage:{type:\'close\'}},\'*\')">Close</button></p></body>',{width:620,height:400});
figma.ui.onmessage=async m=>{if(m.type==='close'){figma.closePlugin();return;}const n=m.type==='home'?core.find(r=>r.name.startsWith('01 ·')):m.type==='motion'?await figma.getNodeByIdAsync(cinematic[0].id):preview;figma.currentPage.selection=[n];figma.viewport.scrollAndZoomIntoView([n]);};
})().catch(e=>figma.showUI('<body style="padding:20px"><h2>Refinement stopped</h2><pre>'+String(e.message||e).replace(/</g,'&lt;')+'</pre></body>',{width:650,height:300}));
