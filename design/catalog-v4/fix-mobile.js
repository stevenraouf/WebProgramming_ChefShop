(async()=>{
const page=figma.currentPage,home=await figma.getNodeByIdAsync('6:58'),hero=home.findOne(n=>n.name==='Cinema / Mobile hero'),r=JSON.parse(page.getPluginData('catalogV4'));
for(const n of [...hero.children])if(n.name==='Cinema v4 / ITALY / alfredo')n.remove();
// Native Motion captures transform base values at authoring time. Build directly at phone size.
const s=.52,ease={type:'CUSTOM_CUBIC_BEZIER',easingFunctionCubicBezier:{x1:.22,y1:1,x2:.36,y2:1}},soft={type:'EASE_IN_AND_OUT'};
function f(p,name,w,h,x=0,y=0){const n=figma.createFrame();p.appendChild(n);n.name=name;n.resize(w*s,h*s);n.x=x*s;n.y=y*s;n.fills=[];n.clipsContent=false;return n;}
function track(n,field,pairs){n.applyManualKeyframeTrack({type:'PROPERTY',name:field},{keyframes:pairs.map(([t,v,e])=>({timelinePosition:t,value:field==='SCALE_XY'?{type:'VECTOR',value:{x:v,y:v}}:{type:'FLOAT',value:field.startsWith('TRANSLATION')?v*s:v},easing:e||ease}))});}
const container=f(hero,'Cinema v4 / ITALY / alfredo',640,610);container.x=15;container.y=193;
const shadow=figma.createEllipse();container.appendChild(shadow);shadow.name='Depth / contact shadow';shadow.resize(430*s,40*s);shadow.x=105*s;shadow.y=555*s;shadow.fills=[{type:'SOLID',color:{r:.02,g:.03,b:.02},opacity:.6}];track(shadow,'SCALE_XY',[[0,1],[2.3,.83],[3.8,.88,soft],[5.3,1]]);track(shadow,'OPACITY',[[0,.5],[2,.2],[4,.2],[5.3,.5]]);
const full=f(container,'Assembled / FETTUCCINE ALFREDO',610,580,15,12);full.fills=[{type:'IMAGE',imageHash:'21c5a3d085d81951ccd5dcb57e78457e12e8a929',scaleMode:'FIT'}];track(full,'OPACITY',[[0,1],[1,1],[1.6,0],[4.6,0],[5.35,1],[6.4,1]]);
const hash='__LAYER_HASH__',bounds=[0,440,780,1120,1536],spread=[-5,142,278,400],labels=['Parsley & pepper','Parmesan','Creamy fettuccine','Ceramic plate'],ratio=480/1024;
for(let i=0;i<4;i++){const n=f(container,'Independent ingredient / '+labels[i],480,(bounds[i+1]-bounds[i])*ratio,80,spread[i]);n.clipsContent=true;n.opacity=0;const im=f(n,'Ingredient render',480,1536*ratio,0,-bounds[i]*ratio);im.fills=[{type:'IMAGE',imageHash:hash,scaleMode:'FIT'}];const collapsed=250+i*8-spread[i],delay=i*.075;
track(n,'OPACITY',[[0,0],[.9+delay,0],[1.4+delay,1],[4.7+delay,1],[5.15+delay,0]]);track(n,'TRANSLATION_Y',[[0,collapsed],[.9+delay,collapsed],[2.25+delay,0],[3.5+delay,(i-1.5)*3,soft],[4.05+delay,0,soft],[5.15+delay,collapsed]]);track(n,'TRANSLATION_X',[[0,(i%2?-1:1)*16],[2.25+delay,0],[3.5+delay,(i%2?-1:1)*4,soft],[5.15+delay,0]]);track(n,'ROTATION',[[0,(i%2?-1:1)*3],[2.25+delay,0],[3.5+delay,(i%2?-1:1)*.8,soft],[5.15+delay,0]]);track(n,'SCALE_XY',[[0,.92],[2.25+delay,1],[3.5+delay,1.015,soft],[5.15+delay,.96]]);
}
for(const name of ['Cinema / Eyebrow','Cinema / Headline','Cinema / Intro','Cinema action / Explore the menu']){const n=hero.findOne(n=>n.name===name);if(n)for(const field of ['OPACITY','TRANSLATION_Y'])if(n.manualKeyframeTracks[field])n.removeManualKeyframeTrack({type:'PROPERTY',name:field});}
for(const t of home.timelines)home.setTimelineDuration(t.id,6.4);r.audit.mobileMotion='Authored at final phone dimensions; no post-animation rescaling';page.setPluginData('catalogV4',JSON.stringify(r));page.selection=[home];figma.viewport.scrollAndZoomIntoView([home]);
figma.showUI('<p style="padding:20px;font:16px Arial">Phone animation corrected at native size.</p><button onclick="parent.postMessage({pluginMessage:\'close\'},\'*\')">Close</button>',{width:400,height:140});figma.ui.onmessage=()=>figma.closePlugin();
})().catch(e=>figma.showUI('<pre>'+String(e.message||e)+'</pre>',{width:500,height:220}));
