(async()=>{
const page=figma.currentPage,master=await figma.getNodeByIdAsync('23:391'),r=JSON.parse(page.getPluginData('motionV5'));
const ease={type:'CUSTOM_CUBIC_BEZIER',easingFunctionCubicBezier:{x1:.08,y1:.88,x2:.22,y2:1}},soft={type:'EASE_IN_AND_OUT'};
const mark=master.children.find(n=>n.name!=='Wordmark'),word=master.findOne(n=>n.type==='TEXT'&&n.characters==='CHEFSHOP');
const inspection={master:master.id,children:master.children.map(n=>({id:n.id,name:n.name,type:n.type})),word:word?.id};
function track(n,field,pairs){n.applyManualKeyframeTrack({type:'PROPERTY',name:field},{keyframes:pairs.map(([t,v,e])=>({timelinePosition:t,value:field==='SCALE_XY'?{type:'VECTOR',value:{x:v,y:v}}:{type:'FLOAT',value:v},easing:e||ease}))});}
track(mark,'ROTATION',[[0,-10],[.65,0],[3.5,2,soft],[6.4,0,soft]]);track(mark,'SCALE_XY',[[0,.88],[.65,1],[3.5,1.035,soft],[6.4,1,soft]]);
track(word,'OPACITY',[[0,0],[.12,0],[.8,1]]);track(word,'TRANSLATION_Y',[[0,5],[.12,5],[.8,0]]);
r.identity=[mark.id];r.textAnimations=[{id:word.id,kind:'Whole-wordmark entrance',tracks:Object.keys(word.manualKeyframeTracks)}];for(const id of ['6:58','54:3652','60:10420']){const root=await figma.getNodeByIdAsync(id);const headline=root.findOne(n=>n.type==='TEXT'&&['Cinema / Headline','Desktop headline'].includes(n.name));r.textAnimations.push({id:headline.id,styles:headline.animationStyles});}
r.problems=[];r.status='passed';r.identitySource=inspection;page.setPluginData('motionV5',JSON.stringify(r));
const film=await figma.getNodeByIdAsync('60:10420');page.selection=[film];figma.viewport.scrollAndZoomIntoView([film]);figma.showUI('<body style="padding:18px;font:14px Arial"><h2>Identity source updated</h2><textarea aria-label="Identity motion report" id="report" style="width:100%;height:220px">'+JSON.stringify(r)+'</textarea><button onclick="parent.postMessage({pluginMessage:1},\'*\')">Close</button></body>',{width:720,height:330});figma.ui.onmessage=()=>figma.closePlugin();
})().catch(e=>figma.showUI('<h2>Identity check</h2><pre>'+String(e.message||e)+'</pre>',{width:640,height:300}));
