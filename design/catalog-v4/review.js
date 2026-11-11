(async()=>{
const page=figma.currentPage,r=JSON.parse(page.getPluginData('catalogV4')),get=id=>figma.getNodeByIdAsync(id),problems=[];
await Promise.all([{family:'Manrope',style:'Regular'},{family:'Manrope',style:'Bold'},{family:'Bebas Neue',style:'Regular'}].map(f=>figma.loadFontAsync(f)));
const collection=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==='ChefShop / Mobile v2'),vars=(await figma.variables.getLocalVariablesAsync()).filter(v=>v.variableCollectionId===collection.id);
const ink={r:245/255,g:237/255,b:221/255},bg={r:16/255,g:20/255,b:16/255};
const paint=(name,color)=>figma.variables.setBoundVariableForPaint({type:'SOLID',color},'color',vars.find(v=>v.name==='color/'+name));
const shops=Object.fromEntries(await Promise.all(Object.entries(r.shops).map(async([k,id])=>[k,await get(id)])));
const boards=[];
for(const [ci,[category,root]] of Object.entries(shops).entries()){
 const tabs=root.findOne(n=>n.name==='Category tabs');tabs.layoutMode='HORIZONTAL';tabs.itemSpacing=8;tabs.primaryAxisSizingMode='FIXED';tabs.counterAxisSizingMode='AUTO';tabs.resize(362,48);
 for(const [i,n] of tabs.children.entries()){n.resize(115,48);const label=n.findOne(n=>n.type==='TEXT');label.fontSize=13;const k=['meal','spice','tool'][i],s={meal:'Meals',spice:'Spices',tool:'Tools'}[k];const prop=Object.keys(n.componentProperties).find(k=>k.startsWith('Label#'));n.setProperties({[prop]:(category===k?'● ':'')+s+' · 12'});}
 const cards=root.findOne(n=>n.name==='Catalog / '+category+' / 12 items').children;if(cards.length!==12)problems.push(category+' card count');
 let board=page.children.find(n=>n.name==='ChefShop Catalog / Review / '+category);if(board)board.remove();board=figma.createFrame();page.appendChild(board);board.name='ChefShop Catalog / Review / '+category;board.resize(1280,980);board.fills=[paint('cream',bg)];board.x=6800+ci*1380;board.y=4200;board.clipsContent=true;
 const heading=figma.createText();board.appendChild(heading);heading.name='Catalog heading';heading.fontName={family:'Bebas Neue',style:'Regular'};heading.fontSize=54;heading.characters={meal:'12 MEALS. THREE ROOTS.',spice:'12 SPICES & HERBS.',tool:'12 KITCHEN ESSENTIALS.'}[category];heading.fills=[paint('ink',ink)];heading.x=72;heading.y=48;
 for(const [i,c] of cards.entries()){const copy=c.clone();board.appendChild(copy);copy.x=72+(i%6)*189;copy.y=142+Math.floor(i/6)*365;const key=c.getPluginData('product');const d=r.details.find(p=>p.key===key);const target=c.reactions[0]?.actions[0]?.destinationId;if(target!==d?.id)problems.push('Wrong target '+key);const text=copy.findOne(n=>n.name==='Name');if(text.width>149.1||text.height<10)problems.push('Card text bounds '+key);}
 boards.push({category,id:board.id});
}
// Preserve each screen's purchasing control, but show the correct product in its confirmation.
const overlayTemplate=page.children.find(n=>n.name.includes('Cart overlay'));
const details=[];
for(const d of r.details){const n=await get(d.id),name=n.findOne(n=>n.name==='Product name'),price=n.findOne(n=>n.name==='Product price'),photo=n.findOne(n=>n.name==='Product photograph / '+d.key),purchase=n.findOne(n=>n.name==='Persistent purchase action');
 if(!name||!price||!photo)problems.push('Incomplete detail '+d.key);if(n.width!==402||n.height!==874)problems.push('Detail viewport '+d.key);
 for(const t of n.findAll(n=>n.type==='TEXT'))if(t.height<8)problems.push('Collapsed '+t.id);
 const labels=n.findAll(n=>n.name.startsWith('Ingredient label '));for(const l of labels){const t=l.findOne(n=>n.type==='TEXT');if(t){l.resize(Math.min(322,Math.ceil(t.characters.length*6.5+20)),28);t.resize(l.width-16,20);t.textAutoResize='HEIGHT';}}
 details.push({key:d.key,id:d.id,title:name?.characters,price:price?.characters,hash:photo?.fills.find(p=>p.type==='IMAGE')?.imageHash,purchase:purchase&&{id:purchase.id,children:purchase.children.map(c=>({name:c.name,id:c.id,reactions:c.reactions}))}});
}
for(const d of r.details.filter(d=>d.motion)){const set=await get(d.motion);if(set.children.length!==6)problems.push('Motion states '+d.key);for(const v of set.children)for(const l of v.findAll(n=>n.name.startsWith('Ingredient label '))){const t=l.findOne(n=>n.type==='TEXT');if(t){l.resize(Math.min(322,Math.ceil(t.characters.length*6.5+20)),28);t.resize(l.width-16,20);t.textAutoResize='HEIGHT';}}}
r.audit={status:problems.length?'needs-attention':'passed',boards,details:details.map(d=>({key:d.key,id:d.id,title:d.title,price:d.price})),originalViewports:page.children.filter(n=>/^\d{2} · .*iPhone 17$/.test(n.name)).length,motionFamilies:r.details.filter(d=>d.motion).length,problems};page.setPluginData('catalogV4',JSON.stringify(r));
page.setPluginData('catalogPurchaseAudit',JSON.stringify(details.map(d=>({key:d.key,purchase:d.purchase}))));
const motion=await get(r.motion.preview);page.selection=[boards.length?await get(boards[0].id):motion];figma.viewport.scrollAndZoomIntoView(page.selection);
figma.showUI('<body style="background:#101410;color:#f5eddd;padding:20px;font:14px Arial"><h2>ChefShop · Final review</h2><textarea aria-label="Catalog final report" id="report" style="width:100%;height:210px">'+JSON.stringify(r)+'</textarea><p><button id="meal">Meals board</button> <button id="spice">Spices board</button> <button id="tool">Tools board</button> <button id="home">Phone</button> <button id="motion">Film</button> <button id="detail">Halloumi</button> <button id="close">Close</button></p><script>for(const b of document.querySelectorAll("button"))b.onclick=()=>parent.postMessage({pluginMessage:b.id},"*")</script></body>',{width:700,height:360});figma.ui.onmessage=async m=>{if(m==='close')return figma.closePlugin();const n=m==='motion'?motion:m==='home'?await get('6:58'):m==='detail'?await get('60:4319'):await get(boards.find(b=>b.category===m).id);page.selection=[n];figma.viewport.scrollAndZoomIntoView([n]);};
})().catch(e=>figma.showUI('<pre>'+String(e.message||e).replace(/</g,'&lt;')+'</pre>',{width:600,height:300}));
