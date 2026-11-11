(async()=>{
const page=figma.currentPage;
const core=page.children.filter(n=>n.type==='FRAME'&&/^\d{2} · .*iPhone 17$/.test(n.name)).sort((a,b)=>a.name.localeCompare(b.name));
if(core.length!==19)throw new Error('Expected the 19 rebuilt frames.');
const owned=page.children.filter(n=>core.includes(n)||n.name.startsWith('ChefShop Mobile /')||n.name.startsWith('ChefShop Mobile/'));
const white={r:1,g:254/255,b:250/255};
const fontSet=new Map();for(const root of owned)for(const t of root.findAll(n=>n.type==='TEXT'))for(const seg of t.getStyledTextSegments(['fontName']))fontSet.set(seg.fontName.family+'/'+seg.fontName.style,seg.fontName);
await Promise.all([...fontSet.values()].map(f=>figma.loadFontAsync(f)));
for(const root of owned){
  for(const t of root.findAll(n=>n.type==='TEXT')){let p=t.parent,center=false;while(p&&p!==root){if(p.name.startsWith('Button / ')||p.name.startsWith('ChefShop Mobile/Button/')||p.name.startsWith('Nav / '))center=true;p=p.parent;}t.textAlignHorizontal=center?'CENTER':'LEFT';}
  if(root.width===402&&root.height===874){for(const child of root.children){child.layoutSizingHorizontal='FILL';}const vp=root.findOne(n=>n.name==='Scrollable mobile content');if(vp){vp.counterAxisAlignItems='CENTER';const body=vp.findOne(n=>n.name==='Responsive content');body.maxWidth=1120;}}
  for(const n of root.findAll(n=>n.name==='Status / All'))for(const t of n.findAll(n=>n.type==='TEXT'))t.fills=[{type:'SOLID',color:white}];
  for(const t of root.findAll(n=>n.type==='TEXT'&&n.characters==='CULINARY INSTITUTE')){t.fontSize=9;t.lineHeight={unit:'PIXELS',value:13};t.textAutoResize='HEIGHT';t.layoutSizingVertical='HUG';}
  for(const n of root.findAll(n=>['Three shopping categories','Shopping categories','Cuisine filters','Filter and sort','Navigation items','Price and action'].includes(n.name))){n.layoutSizingHorizontal='FILL';}
}
await new Promise(r=>setTimeout(r,120));
const problems=[],photos=new Set();let textCount=0,links=0,scrollable=0;
for(const root of core){
  if(root.width!==402||root.height!==874)problems.push(root.name+' wrong dimensions');
  const vp=root.findOne(n=>n.name==='Scrollable mobile content');if(vp?.overflowDirection==='VERTICAL')scrollable++;
  for(const n of root.findAll(()=>true)){
    if(n.type==='TEXT'){textCount++;if(n.height<Math.max(8,n.fontSize*.7))problems.push(root.name+' collapsed '+n.name);}
    if(Array.isArray(n.fills))for(const p of n.fills)if(p.type==='IMAGE'){if(!p.imageHash||!figma.getImageByHash(p.imageHash))problems.push('Missing image '+n.id);else photos.add(p.imageHash);}
    if('reactions'in n)links+=n.reactions.length;
  }
}
const responsiveTest=core[0].clone();page.appendChild(responsiveTest);responsiveTest.x=-15000;responsiveTest.y=-15000;responsiveTest.resize(1200,874);await new Promise(r=>setTimeout(r,60));const largerViewport=responsiveTest.children.find(n=>n.name==='Scrollable mobile content');const largerBody=largerViewport.findOne(n=>n.name==='Responsive content');const responsive={testWidth:1200,viewportWidth:largerViewport.width,contentWidth:largerBody.width};if(largerViewport.width!==1200||largerBody.width>1120||largerBody.width<402)problems.push('Responsive width check failed');responsiveTest.remove();
const result={status:problems.length?'needs-attention':'passed',viewport:'iPhone 17 · 402 × 874',frameCount:core.length,scrollableFrames:scrollable,editableTextNodes:textCount,photoAssets:photos.size,prototypeConnections:links,responsive,problems,frames:core.map(n=>({id:n.id,name:n.name,width:n.width,height:n.height}))};
figma.currentPage.selection=[core[0]];figma.viewport.scrollAndZoomIntoView([core[0]]);
figma.showUI('<body style="background:#f8f3e9;color:#263d29;padding:20px;font:14px Arial"><h2 style="font:25px Georgia">ChefShop · Final mobile review</h2><p>19 original frames rebuilt as editable iPhone 17 layouts.</p><textarea aria-label="Build report" id="report" readonly style="width:100%;height:220px">'+JSON.stringify(result).replace(/</g,'&lt;')+'</textarea><p><button onclick="parent.postMessage({pluginMessage:{type:\'home\'}},\'*\')">Review Home</button> <button onclick="parent.postMessage({pluginMessage:{type:\'meal\'}},\'*\')">Review Meal</button> <button onclick="parent.postMessage({pluginMessage:{type:\'overview\'}},\'*\')">Review Reports</button> <button onclick="parent.postMessage({pluginMessage:{type:\'all\'}},\'*\')">View 19</button> <button onclick="parent.postMessage({pluginMessage:{type:\'close\'}},\'*\')">Close</button></p></body>',{width:570,height:410});
figma.ui.onmessage=m=>{const target=m.type==='meal'?core[2]:m.type==='overview'?core[11]:core[0];if(m.type==='all'){figma.currentPage.selection=core;figma.viewport.scrollAndZoomIntoView(core);}else if(m.type==='close'){figma.closePlugin();}else{figma.currentPage.selection=[target];figma.viewport.scrollAndZoomIntoView([target]);}};
})().catch(e=>{figma.showUI('<body style="padding:20px;font:16px Arial"><p>'+String(e.message).replace(/[<>&]/g,'')+'</p></body>',{width:500,height:240});});
