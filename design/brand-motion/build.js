// Run in the installed ChefShop local development plugin.
(async()=>{
const page=figma.currentPage, ledger={created:[],updated:[],errors:[]};
if(page.children.some(n=>n.name==='ChefShop / Brand & Meal Motion'))throw new Error('This revision is already present. Inspect it before rerunning.');
const recipes=__RECIPES__;
const core=page.children.filter(n=>n.type==='FRAME'&&/^\d{2} · .*iPhone 17$/.test(n.name));
if(core.length!==19)throw new Error('Expected 19 original mobile screens.');
const collections=await figma.variables.getLocalVariableCollectionsAsync();const collection=collections.find(c=>c.name==='ChefShop / Mobile v2');
if(!collection)throw new Error('Mobile v2 tokens missing.');
const variables=(await figma.variables.getLocalVariablesAsync()).filter(v=>v.variableCollectionId===collection.id), tokens={};
for(const v of variables)tokens[v.name]=v;
const hex={cream:'#F8F3E9',white:'#FFFEFA',ink:'#263D29',olive:'#506330',rust:'#AC4526',sage:'#E6E9D5',muted:'#6E715F',line:'#DDDCCF',gold:'#CAA469',sea:'#4D7180'};
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
if(!tokens['color/sea']){const v=figma.variables.createVariable('color/sea',collection,'COLOR');v.scopes=['FRAME_FILL','SHAPE_FILL','TEXT_FILL','STROKE_COLOR'];v.setValueForMode(collection.defaultModeId,rgb(hex.sea));v.setVariableCodeSyntax('WEB','var(--chefshop-sea)');tokens['color/sea']=v;}
const p=k=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb(hex[k])},'color',tokens['color/'+k]);
const styles=await figma.getLocalTextStylesAsync(),styleMap=new Map(styles.map(s=>[s.name,s]));
const fontNames=new Map();for(const r of page.children)if(core.includes(r)||r.name.startsWith('ChefShop Mobile'))for(const t of r.findAll(n=>n.type==='TEXT'))for(const s of t.getStyledTextSegments(['fontName']))fontNames.set(s.fontName.family+'/'+s.fontName.style,s.fontName);
for(const f of [{family:'Arial',style:'Regular'},{family:'Arial',style:'Bold'},{family:'Georgia',style:'Bold'}])fontNames.set(f.family+'/'+f.style,f);
await Promise.all([...fontNames.values()].map(f=>figma.loadFontAsync(f)));
// Remove only the exact partial nodes returned by the interrupted-build diagnostic.
for(const r of recipes){const n=await figma.getNodeByIdAsync(r.assetNodeId);if(n&&n.parent.name==='ChefShop / Motion image sources')page.appendChild(n);}
for(const id of ['23:368','23:333','23:311','23:312','23:346','23:347']){const n=await figma.getNodeByIdAsync(id);if(n)n.remove();}
const allText=[],styleJobs=[];
function keep(n){ledger.created.push(n.id);return n;}
function frame(parent,name,w,h,bg=null){const n=keep(figma.createFrame());parent.appendChild(n);n.name=name;n.resize(w,h);n.fills=bg?[p(bg)]:[];n.clipsContent=false;return n;}
function column(parent,name,w,gap=12,pad=0,bg=null){const n=frame(parent,name,w,1,bg);n.layoutMode='VERTICAL';n.primaryAxisSizingMode='AUTO';n.counterAxisSizingMode='FIXED';n.itemSpacing=gap;n.paddingLeft=n.paddingRight=n.paddingTop=n.paddingBottom=pad;if(tokens['space/'+gap])n.setBoundVariable('itemSpacing',tokens['space/'+gap]);return n;}
function text(parent,name,s,x,y,w,size=14,color='ink',bold=false,serif=false){const n=keep(figma.createText());parent.appendChild(n);n.name=name;n.fontName={family:serif?'Georgia':'Arial',style:bold?'Bold':'Regular'};n.fontSize=size;n.characters=s;n.lineHeight={unit:'PIXELS',value:Math.ceil(size*(serif?1.2:1.4))};n.textAlignHorizontal='LEFT';n.resize(w,Math.ceil(size*1.4));n.textAutoResize='HEIGHT';n.fills=[p(color)];n.x=x;n.y=y;const sn='ChefShop Mobile/'+(serif?'Editorial':'Interface')+'/'+size+'/'+(bold?'Bold':'Regular');let st=styleMap.get(sn);if(!st){st=figma.createTextStyle();st.name=sn;st.fontName=n.fontName;st.fontSize=size;st.lineHeight=n.lineHeight;styleMap.set(sn,st);}styleJobs.push(n.setTextStyleIdAsync(st.id));allText.push(n);return n;}
const action=(id,navigation='CHANGE_TO',duration=.72)=>({type:'NODE',destinationId:id,navigation,transition:duration?{type:'SMART_ANIMATE',duration,easing:{type:'EASE_IN_AND_OUT'}}:null});
async function click(n,id,navigation='CHANGE_TO',duration=.72){await n.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[action(id,navigation,duration)]}]);}
function button(parent,name,label,x,y,w=330){const n=frame(parent,name,w,48,'rust');n.x=x;n.y=y;n.cornerRadius=8;n.setBoundVariable('cornerRadius',tokens['radius/8']);const t=text(n,'Action label',label,12,14,w-24,14,'white',true);t.textAlignHorizontal='CENTER';return n;}

// Vector brand: a shared plate containing papyrus/water, pasta fork and olive branch.
const emblemSvg=`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="28" stroke="#506330" stroke-width="2.4"/><path d="M21 33C15 28 17 24 21 19M21 28V12M21 19C15 19 12 15 12 12C17 11 21 14 21 19ZM21 19C27 19 30 15 30 12C25 11 21 14 21 19Z" stroke="#CAA469" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M40 11V22C40 28 49 28 49 22V11M44.5 11V35C44.5 39 36 39 36 35C36 31 40 31 40 34" stroke="#AC4526" stroke-width="2.1" stroke-linecap="round"/><path d="M17 45C23 42 27 48 32 45C37 42 41 46 47 42" stroke="#4D7180" stroke-width="2.1" stroke-linecap="round"/><path d="M22 51C30 49 36 45 43 39" stroke="#506330" stroke-width="1.8" stroke-linecap="round"/><path d="M29 48C24 47 24 43 25 41C29 41 31 44 29 48ZM35 45C34 40 37 37 40 36C42 40 39 44 35 45ZM36 45C40 45 43 47 43 50C39 52 36 50 36 45Z" fill="#506330"/></svg>`;
const brandShelf=frame(page,'ChefShop / Brand masters',900,250,'cream');brandShelf.x=-1800;brandShelf.y=-6100;
const sourceShelf=frame(page,'ChefShop / Motion image sources',1800,430);sourceShelf.x=-6500;sourceShelf.y=-7000;sourceShelf.layoutMode='HORIZONTAL';sourceShelf.primaryAxisSizingMode='AUTO';sourceShelf.counterAxisSizingMode='AUTO';sourceShelf.itemSpacing=20;
for(const r of recipes){const n=await figma.getNodeByIdAsync(r.assetNodeId);if(n){sourceShelf.appendChild(n);n.name='Motion source / '+r.key;n.resize(256,384);ledger.updated.push(n.id);}}
const mark=keep(figma.createComponent());brandShelf.appendChild(mark);mark.name='ChefShop Brand/Three kitchens emblem';mark.resize(64,64);mark.fills=[];mark.description='One plate, three culinary roots. Papyrus and water evoke Egypt; a pasta fork evokes Italy; an olive sprig evokes Greece. Use the full wordmark at small sizes.';mark.appendChild(keep(figma.createNodeFromSvg(emblemSvg)));
for(const v of mark.findAll(n=>n.type==='VECTOR'))for(const prop of ['fills','strokes'])if(Array.isArray(v[prop]))v[prop]=v[prop].map(paint=>{if(paint.type!=='SOLID')return paint;const match=Object.keys(hex).find(k=>{const c=rgb(hex[k]);return Math.abs(c.r-paint.color.r)<.015&&Math.abs(c.g-paint.color.g)<.015&&Math.abs(c.b-paint.color.b)<.015;});return match?figma.variables.setBoundVariableForPaint(paint,'color',tokens['color/'+match]):paint;});
const logo=keep(figma.createComponent());brandShelf.appendChild(logo);logo.name='ChefShop Brand/Regional wordmark';logo.resize(244,48);logo.x=100;logo.fills=[];logo.layoutMode='HORIZONTAL';logo.primaryAxisSizingMode='FIXED';logo.counterAxisSizingMode='FIXED';logo.counterAxisAlignItems='CENTER';logo.itemSpacing=8;logo.description='Master ChefShop customer-facing identity. The tagline names the three cuisines without combining national flags. All screen logos are instances of this master.';const mi=keep(mark.createInstance());logo.appendChild(mi);mi.resize(44,44);const wc=column(logo,'Wordmark',190,0);const wt=text(wc,'ChefShop','ChefShop',0,0,190,25,'ink',true,true);wt.layoutSizingVertical='HUG';const tag=text(wc,'Three culinary roots','EGYPT · ITALY · GREECE',0,0,190,9,'olive',true);tag.layoutSizingVertical='HUG';
const navs=page.findAll(n=>n.name==='Mobile web navigation'&&'children'in n&&n.children.some(c=>c.name==='ChefShop wordmark'));
for(const nav of navs){const old=nav.children.filter(n=>n.name==='Icon / leaf'||n.name==='ChefShop wordmark');const inst=keep(logo.createInstance());nav.insertChild(0,inst);inst.name='ChefShop / Three kitchens logo';const home=core.find(r=>r.name.startsWith('01 ·'));if(nav.parent.id!==home.id)await click(inst,home.id,'NAVIGATE',0);for(const n of old){ledger.updated.push(n.id);n.remove();}ledger.updated.push(nav.id);}
// Preview / usage board follows the existing phone-first collection.
const board=column(page,'ChefShop / Brand & Meal Motion',1420,28,40,'cream');board.x=180;board.y=4500;
text(board,'Brand revision','Three kitchens. One table.',0,0,1340,36,'ink',true,true);
text(board,'Direction','Egyptian warmth, Italian craft, Greek freshness — one ChefShop identity.',0,0,1340,16,'muted');
const br=frame(board,'Logo and regional cues',1340,190,'white');br.cornerRadius=12;const big=keep(logo.createInstance());br.appendChild(big);big.x=28;big.y=52;big.rescale(1.65);
text(br,'Egypt cue','EGYPT',510,30,220,11,'rust',true);text(br,'Egypt meaning','Papyrus + Nile-inspired water',510,52,220,14);
text(br,'Italy cue','ITALY',770,30,200,11,'rust',true);text(br,'Italy meaning','Fork + a curl of pasta',770,52,200,14);
text(br,'Greece cue','GREECE',1030,30,230,11,'sea',true);text(br,'Greece meaning','Olive sprig + sea accent',1030,52,230,14);
text(br,'Logo usage','A shared plate holds all three symbols. Keep the full wordmark legible; use the emblem alone for compact brand moments.',510,106,760,13,'muted');
text(board,'Motion collection','Meet the meal, layer by layer.',0,0,1340,30,'ink',true,true);
text(board,'Motion instructions','Present a meal screen, then tap “See the ingredients”. Tap “Put it together” to reverse. “Still view” reveals the same layers instantly.',0,0,1340,14,'muted');
const demos=frame(board,'Six meal animations',1340,1200);demos.layoutMode='HORIZONTAL';demos.layoutWrap='WRAP';demos.primaryAxisSizingMode='FIXED';demos.counterAxisSizingMode='AUTO';demos.itemSpacing=30;demos.counterAxisSpacing=30;demos.counterAxisAlignItems='MIN';
const motionSets=[], mealResults=[];
for(let ri=0;ri<recipes.length;ri++){
 const r=recipes[ri];const source=await figma.getNodeByIdAsync(r.rootId);if(!source)throw new Error('Missing meal '+r.name);
 const hero=source.findOne(n=>n.name==='Photo / '+r.key);if(!hero)throw new Error('Missing hero '+r.key);
 const heroFill=hero.fills.find(p=>p.type==='IMAGE');const image=figma.getImageByHash(r.hash);if(!image)throw new Error('Uploaded image not synced: '+r.key);const dim=await image.getSizeAsync();
 const variants=[];
 for(const state of ['Assembled','Exploded','Still']){
  const c=keep(figma.createComponent());page.appendChild(c);c.name='State='+state;c.resize(362,516);c.fills=[p('cream')];c.clipsContent=true;c.description=r.name+' ingredient reveal. Smart Animate uses identically named image layers; the Still state uses instant transitions.';
  text(c,'Cuisine',r.region.toUpperCase()+' · STUDENT KITCHEN',0,0,240,10,'rust',true);
  const still=text(c,'Still view','Still view',285,0,77,11,'olive',true);
  const stage=frame(c,'Ingredient stage',362,396);stage.x=0;stage.y=24;stage.clipsContent=true;
  const dish=frame(stage,'Finished meal',362,260);dish.y=65;dish.cornerRadius=12;dish.clipsContent=true;dish.fills=[{type:'IMAGE',imageHash:heroFill.imageHash,scaleMode:'FILL'}];dish.opacity=state==='Assembled'?1:0;
  // Reverse stacking puts garnish in front when the strata converge.
  for(let i=3;i>=0;i--){
   const scale=286/dim.width;const layer=frame(stage,'Ingredient layer '+(i+1),286,(r.bounds[i+1]-r.bounds[i])*scale);layer.x=38;layer.y=state==='Assembled'?135+i*7:r.bounds[i]*scale-18;layer.clipsContent=true;layer.opacity=state==='Assembled'?0:1;
   const photo=frame(layer,'Food cutout',286,dim.height*scale);photo.y=-r.bounds[i]*scale;photo.fills=[{type:'IMAGE',imageHash:r.hash,scaleMode:'FILL'}];
   const label=frame(stage,'Ingredient label '+(i+1),Math.min(320,36+r.labels[i].length*6.4),24,'cream');label.x=8;label.y=[73,166,259,352][i];label.cornerRadius=6;label.opacity=state==='Assembled'?0:1;text(label,'Label text',String(i+1).padStart(2,'0')+'  '+r.labels[i],8,4,label.width-16,11,'ink',true);
  }
  text(c,'Caption',state==='Assembled'?'Made by students. Discover every layer.':state==='Still'?'All the layers, shown without movement.':'A closer look at what makes this meal.',0,426,362,13,'muted');
  button(c,'Toggle ingredients',state==='Assembled'?'See the ingredients  ↗':'Put it together  ↙',0,466,362);
  variants.push(c);
 }
 const set=keep(figma.combineAsVariants(variants,page));set.name='ChefShop Motion/'+r.name;set.description='States: Assembled → Exploded in 720 ms; reverse in 580 ms. Still view uses instant transitions. Four independently moving ingredient strata retain matching names. Generated food imagery is illustrative; product ingredient and allergen copy remains the source of truth.';set.x=-4000+ri*450;set.y=-4000;set.layoutMode='VERTICAL';set.primaryAxisSizingMode='AUTO';set.counterAxisSizingMode='FIXED';set.paddingLeft=set.paddingRight=set.paddingTop=set.paddingBottom=20;set.itemSpacing=20;set.resize(402,set.height);set.fills=[];variants.forEach(v=>{v.layoutSizingHorizontal='FIXED';v.layoutSizingVertical='FIXED';});motionSets.push(set);
 await click(variants[0].findOne(n=>n.name==='Toggle ingredients'),variants[1].id);
 await click(variants[1].findOne(n=>n.name==='Toggle ingredients'),variants[0].id,'CHANGE_TO',.58);
 await click(variants[2].findOne(n=>n.name==='Toggle ingredients'),variants[0].id,'CHANGE_TO',0);
 for(const v of variants.slice(0,2))await click(v.findOne(n=>n.name==='Still view'),variants[2].id,'CHANGE_TO',0);
 const parent=hero.parent,index=parent.children.indexOf(hero);const actual=keep(variants[0].createInstance());parent.insertChild(index,actual);actual.name='Meal ingredient animation / '+r.name;actual.layoutSizingHorizontal='FILL';actual.layoutSizingVertical='FIXED';ledger.updated.push(hero.id);hero.remove();ledger.updated.push(source.id);
 const card=column(demos,'Motion demo / '+r.name,420,12,20,'white');card.cornerRadius=12;text(card,'Meal title',r.name,0,0,380,23,'ink',true,true);text(card,'Cuisine subtitle',r.region,0,0,380,12,'olive',true);const demo=keep(variants[0].createInstance());card.appendChild(demo);demo.layoutSizingHorizontal='FILL';demo.layoutSizingVertical='FIXED';
 mealResults.push({key:r.key,name:r.name,source:source.id,setId:set.id,variants:variants.map(v=>({id:v.id,name:v.name})),instance:actual.id,photoHash:r.hash});
}
await Promise.all(styleJobs);for(const t of allText){t.textAutoResize='HEIGHT';if(t.parent.layoutMode!=='NONE')t.layoutSizingVertical='HUG';t.textAlignHorizontal=t.name==='Action label'?'CENTER':'LEFT';}
const preview=core.find(r=>r.name.startsWith('03 ·')).clone();page.appendChild(preview);preview.name='ChefShop / Meal motion preview · iPhone 17';preview.x=180;preview.y=board.y+board.height+100;await preview.setReactionsAsync([]);
const previewContent=preview.findOne(n=>n.name==='Responsive content');const previewBack=previewContent.children.find(n=>n.name.startsWith('Button / '));if(previewBack)previewBack.visible=false;
page.flowStartingPoints=[...page.flowStartingPoints,{nodeId:preview.id,name:'Meal ingredients · Interactive preview'}];
await new Promise(r=>setTimeout(r,120));
const problems=[];if(core.length!==19)problems.push('Original frame count changed');for(const r of core)if(r.width!==402||r.height!==874)problems.push(r.name+' viewport changed');for(const m of mealResults){const set=await figma.getNodeByIdAsync(m.setId);if(set.children.length!==3)problems.push(m.name+' variants missing');for(const v of set.children){if(v.findAll(n=>n.name.startsWith('Ingredient layer ')).length!==4)problems.push(m.name+' layer count');if(!v.findOne(n=>n.name==='Toggle ingredients').reactions.length)problems.push(m.name+' missing interaction');}}
ledger.result={status:problems.length?'needs-attention':'passed',logoMaster:logo.id,emblem:mark.id,updatedLogoHeaders:navs.length,mainFrames:core.length,mealAnimations:mealResults,preview:preview.id,board:board.id,problems};
figma.currentPage.selection=[board];figma.viewport.scrollAndZoomIntoView([board]);
figma.showUI('<body style="padding:20px;background:#f8f3e9;color:#263d29;font:14px Arial"><h2 style="font:26px Georgia">ChefShop · Three kitchens</h2><p>Regional logo + six interactive ingredient reveals.</p><textarea aria-label="Motion build report" id="report" readonly style="width:100%;height:230px">'+JSON.stringify(ledger.result).replace(/</g,'&lt;')+'</textarea><p><button onclick="parent.postMessage({pluginMessage:{type:\'home\'}},\'*\')">Review Home</button> <button onclick="parent.postMessage({pluginMessage:{type:\'meal\'}},\'*\')">Review meal</button> <button onclick="parent.postMessage({pluginMessage:{type:\'board\'}},\'*\')">Review collection</button> <button onclick="parent.postMessage({pluginMessage:{type:\'close\'}},\'*\')">Close</button></p></body>',{width:590,height:420});
figma.ui.onmessage=m=>{if(m.type==='close')figma.closePlugin();else{const n=m.type==='home'?core.find(n=>n.name.startsWith('01 ·')):m.type==='meal'?preview:board;figma.currentPage.selection=[n];figma.viewport.scrollAndZoomIntoView([n]);}};
})().catch(e=>figma.showUI('<body style="font:15px Arial;padding:24px"><h2>Revision stopped</h2><pre>'+String(e&&e.message||e).replace(/</g,'&lt;')+'</pre></body>',{width:650,height:350}));
