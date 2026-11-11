(async()=>{
const page=figma.currentPage;
const core=page.children.filter(n=>n.type==='FRAME'&&/^\d{2} · .*iPhone 17$/.test(n.name));
if(core.length!==19)throw new Error('Expected 19 rebuilt iPhone frames; found '+core.length);
const owned=page.children.filter(n=>core.includes(n)||n.name.startsWith('ChefShop Mobile /')||n.name.startsWith('ChefShop Mobile/'));
const allText=[...new Map(owned.flatMap(n=>n.findAll(x=>x.type==='TEXT')).map(n=>[n.id,n])).values()];
const before=allText.filter(n=>n.height<Math.max(8,n.fontSize*.7)).length;
const names=new Map();for(const t of allText){for(const s of t.getStyledTextSegments(['fontName']))names.set(s.fontName.family+'/'+s.fontName.style,s.fontName);}
await Promise.all([...names.values()].map(f=>figma.loadFontAsync(f)));
for(const t of allText){const w=t.width;t.resize(w,Math.max(20,t.height));t.textAutoResize='HEIGHT';if(t.parent&&'layoutMode'in t.parent&&t.parent.layoutMode!=='NONE')t.layoutSizingVertical='HUG';}
// Horizontal containers hug their HEIGHT, while their width remains responsive.
// The original horizontal helper inherited the vertical helper's fixed counter axis.
const horizontalFixed=new Set(['iPhone 17 / Safe area','Mobile web navigation']);
for(const root of owned){for(const n of root.findAll(n=>'layoutMode'in n&&n.layoutMode==='HORIZONTAL')){
  if(horizontalFixed.has(n.name)||n.name.startsWith('Button / ')||n.name.startsWith('ChefShop Mobile/Button/'))continue;
  n.primaryAxisSizingMode='FIXED';n.counterAxisSizingMode='AUTO';n.layoutSizingVertical='HUG';
}}
for(const root of owned){for(const n of root.findAll(n=>n.type==='INSTANCE'&&n.name.startsWith('Product / '))){n.layoutSizingVertical='HUG';}}
await new Promise(r=>setTimeout(r,100));
// Self-navigation is intentionally inert; native Figma rejects links to the current frame.
let clearedSelf=0;for(const root of owned){for(const n of root.findAll(n=>'reactions'in n)){const keep=n.reactions.filter(r=>!r.actions?.some(a=>a.type==='NODE'&&a.navigation==='NAVIGATE'&&a.destinationId===root.id));if(keep.length!==n.reactions.length){await n.setReactionsAsync(keep);clearedSelf++;}}}
const cream={r:248/255,g:243/255,b:233/255};
const toastNames=[['Meal added to cart','Add meal to cart'],['Spice added to cart','Add spice to cart'],['Tool added to cart','Add tool to cart']];
let overlays=0,overlayErrors=[];
for(const [title,button] of toastNames){const template=page.findOne(n=>n.type==='COMPONENT'&&n.name==='ChefShop Mobile / '+title);if(!template)continue;const name='ChefShop Mobile / Overlay / '+title;let overlay=page.children.find(n=>n.type==='FRAME'&&n.name===name);if(!overlay){overlay=figma.createFrame();overlay.name=name;overlay.resize(362,template.height);overlay.layoutMode='VERTICAL';overlay.primaryAxisSizingMode='AUTO';overlay.counterAxisSizingMode='FIXED';overlay.itemSpacing=16;overlay.paddingLeft=overlay.paddingRight=overlay.paddingTop=overlay.paddingBottom=20;overlay.fills=[{type:'SOLID',color:cream}];overlay.cornerRadius=16;for(const ch of template.children){const clone=ch.clone();overlay.appendChild(clone);clone.layoutSizingHorizontal='FILL';if(clone.type==='TEXT')clone.layoutSizingVertical='HUG';}overlay.x=6500;overlay.y=-1500+overlays*400;}
for(const root of owned){for(const n of root.findAll(n=>n.type==='INSTANCE'&&n.name==='Button / '+button)){try{await n.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:overlay.id,navigation:'OVERLAY',transition:null}]}]);}catch(e){overlayErrors.push(String(e));}}}overlays++;
}
await new Promise(r=>setTimeout(r,100));
const after=allText.filter(n=>n.height<Math.max(8,n.fontSize*.7)).length;
const report={status:'repaired',viewport:'402 × 874',frames:core.map(n=>({id:n.id,name:n.name,w:n.width,h:n.height,contentHeight:n.findOne(x=>x.name==='Responsive content').height})),textNodes:allText.length,collapsedTextBefore:before,collapsedTextAfter:after,overlays,overlayErrors,clearedSelf};
figma.currentPage.selection=[core.find(n=>n.name.startsWith('01'))];figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection);
figma.showUI('<body style="background:#f8f3e9;color:#263d29;padding:20px;font:14px Arial"><h2 style="font:25px Georgia">ChefShop · Mobile QA</h2><p>19 frames repaired. Text sizing and cart overlays checked.</p><textarea aria-label="Build report" id="report" readonly style="width:100%;height:230px">'+JSON.stringify(report).replace(/</g,'&lt;')+'</textarea><p><button onclick="parent.postMessage({pluginMessage:{type:\'close\'}},\'*\')">Close and review</button></p></body>',{width:500,height:400});
figma.ui.onmessage=m=>{if(m.type==='close')figma.closePlugin();};
})().catch(e=>{figma.showUI('<body style="padding:20px;font:16px Arial"><h2>ChefShop QA</h2><p>'+String(e.message).replace(/[<>&]/g,'')+'</p></body>',{width:500,height:250});});
