(async()=>{
const page=figma.currentPage,r=JSON.parse(page.getPluginData('catalogV4')),get=id=>figma.getNodeByIdAsync(id),home=await get('6:58'),desktop=await get('54:3652'),film=await get(r.motion.preview);
await Promise.all([{family:'Manrope',style:'Regular'},{family:'Manrope',style:'Bold'},{family:'Bebas Neue',style:'Regular'}].map(f=>figma.loadFontAsync(f)));
const master=await get(r.card),name=master.findOne(n=>n.name==='Name');name.textAutoResize='NONE';name.resize(149,48);
for(const root of [home,desktop,film]){
 const hero=root.findOne(n=>n.name=== (root===home?'Cinema / Mobile hero':'Cinema / Desktop hero'));
 const first=hero.findOne(n=>n.name==='Cinema v4 / ITALY / alfredo'),full=first.findOne(n=>n.name==='Assembled / FETTUCCINE ALFREDO');
 const k=(t,v)=>({timelinePosition:t,value:{type:'FLOAT',value:v},easing:{type:'EASE_IN_AND_OUT'}});
 const replace=(n,key,fn)=>{const old=n.manualKeyframeTracks[key];if(old)n.applyManualKeyframeTrack({type:'PROPERTY',name:key},{...old,keyframes:old.keyframes.map(fn)});};
 replace(full,'OPACITY',q=>q.timelinePosition<=.5?{...q,value:{type:'FLOAT',value:1}}:q);
 replace(full,'TRANSLATION_Y',q=>q.timelinePosition<=.9||q.timelinePosition>=6.4?{...q,value:{type:'FLOAT',value:0}}:q);
 replace(full,'SCALE_XY',q=>q.timelinePosition<=1||q.timelinePosition>=6.4?{...q,value:{type:'VECTOR',value:{x:1,y:1}}}:q);
 if(root===home){first.rescale(.52/.56);first.x=15;first.y=193;}
 else{
  const h=hero.findOne(n=>n.name==='Desktop headline');for(const field of ['OPACITY','TRANSLATION_Y'])if(h.manualKeyframeTracks[field])h.removeManualKeyframeTrack({type:'PROPERTY',name:field});
  let bridge=hero.findOne(n=>n.name==='Cinema v4 / Loop bridge');if(bridge)bridge.remove();bridge=figma.createFrame();hero.appendChild(bridge);bridge.name='Cinema v4 / Loop bridge';bridge.resize(640,610);bridge.x=748;bridge.y=0;bridge.fills=[];bridge.opacity=0;const im=full.clone();bridge.appendChild(im);for(const field of ['OPACITY','TRANSLATION_Y','SCALE_XY'])if(im.manualKeyframeTracks[field])im.removeManualKeyframeTrack({type:'PROPERTY',name:field});im.opacity=1;im.x=15;im.y=12;
  bridge.applyManualKeyframeTrack({type:'PROPERTY',name:'OPACITY'},{keyframes:[k(0,0),k(17.8,0),k(18.4,1)]});
  const last=hero.findOne(n=>n.name==='Cinema v4 / GREECE / halloumi');replace(last,'OPACITY',q=>q.timelinePosition>=18.4?{...q,value:{type:'FLOAT',value:0}}:q);
  for(const kind of ['Dish','Origin']){const n=hero.findOne(n=>n.name==='Cinema v4 / '+kind+' halloumi');replace(n,'OPACITY',q=>q.timelinePosition>=18.4?{...q,value:{type:'FLOAT',value:0}}:q);const firstCaption=hero.findOne(n=>n.name==='Cinema v4 / '+kind+' alfredo');const old=firstCaption.manualKeyframeTracks.OPACITY;firstCaption.applyManualKeyframeTrack({type:'PROPERTY',name:'OPACITY'},{...old,keyframes:[...old.keyframes.map(q=>q.timelinePosition===0?{...q,value:{type:'FLOAT',value:1}}:q),k(17.8,0),k(18.4,1)]});}
 }
}
r.audit.cardAlignment='Fixed 48px title slots';r.audit.loop='Stable type; final halloumi crossfades to opening Alfredo';r.audit.mobileHero='Layers fit above price and CTA';page.setPluginData('catalogV4',JSON.stringify(r));
const summary={status:r.audit.status,counts:r.counts,cuisines:r.cuisines,originalViewports:r.audit.originalViewports,motionFamilies:r.audit.motionFamilies,motion:r.motion,boards:r.audit.boards,problems:r.audit.problems,purchase:JSON.parse(page.getPluginData('catalogPurchaseAudit')).slice(0,2)};
page.selection=[film];figma.viewport.scrollAndZoomIntoView([film]);
figma.showUI('<body style="padding:18px;font:14px Arial;background:#101410;color:#f5eddd"><h2>ChefShop · Ready for review</h2><textarea aria-label="ChefShop final audit" id="report" style="width:100%;height:220px">'+JSON.stringify(summary)+'</textarea><p><button id="film">Film</button> <button id="meal">Meals</button> <button id="spice">Spices</button> <button id="tool">Tools</button> <button id="phone">Phone</button> <button id="detail">Halloumi</button> <button id="close">Close</button></p><script>for(const b of document.querySelectorAll("button"))b.onclick=()=>parent.postMessage({pluginMessage:b.id},"*")</script></body>',{width:700,height:370});figma.ui.onmessage=async m=>{if(m==='close')return figma.closePlugin();const n=m==='film'?film:m==='phone'?home:m==='detail'?await get('60:4319'):await get(r.audit.boards.find(b=>b.category===m).id);page.selection=[n];figma.viewport.scrollAndZoomIntoView([n]);};
})().catch(e=>figma.showUI('<pre>'+String(e.message||e).replace(/</g,'&lt;')+'</pre>',{width:600,height:300}));
