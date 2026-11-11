(async()=>{
const page=figma.currentPage,report={phase:'start',problems:[]};
const uploads=__UPLOADS__;
const get=id=>figma.getNodeByIdAsync(id),by=name=>page.children.find(n=>n.name===name);
await Promise.all([{family:'Manrope',style:'Regular'},{family:'Manrope',style:'Bold'},{family:'Bebas Neue',style:'Regular'}].map(f=>figma.loadFontAsync(f)));
const palette={cream:'#101410',white:'#1C231D',ink:'#F5EDDD',rust:'#E9A065',muted:'#B7BEAF',line:'#425044',sage:'#28362B',olive:'#C7D3B0'};
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const vars=await figma.variables.getLocalVariablesAsync(),token=n=>vars.find(v=>v.name===n);
const paint=k=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb(palette[k])},'color',token('color/'+k));
const body={family:'Manrope',style:'Regular'},bold={family:'Manrope',style:'Bold'},display={family:'Bebas Neue',style:'Regular'};
function frame(p,name,w,h,bg){const n=figma.createFrame();p.appendChild(n);n.name=name;n.resize(w,h);n.fills=bg?[paint(bg)]:[];n.clipsContent=false;return n;}
function col(p,name,w,gap=16,pad=0,bg){const n=frame(p,name,w,1,bg);n.layoutMode='VERTICAL';n.primaryAxisSizingMode='AUTO';n.counterAxisSizingMode='FIXED';n.itemSpacing=gap;n.paddingTop=n.paddingBottom=n.paddingLeft=n.paddingRight=pad;return n;}
function text(p,name,copy,w,size=16,color='ink',font=body){const n=figma.createText();p.appendChild(n);n.name=name;n.fontName=font;n.fontSize=size;n.lineHeight={unit:'PIXELS',value:Math.ceil(size*(font.family==='Bebas Neue'?1.08:1.5))};n.characters=copy;n.fills=[paint(color)];n.resize(w,size*1.5);n.textAutoResize='HEIGHT';return n;}
async function nav(n,id){if(!id)return;await n.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:id,navigation:'NAVIGATE',transition:{type:'DISSOLVE',duration:.25,easing:{type:'EASE_OUT'}}}]}]);}
const primary=page.findOne(n=>n.type==='COMPONENT'&&n.name==='ChefShop Mobile/Button/primary');
async function btn(p,label,w,to){const n=primary.createInstance();p.appendChild(n);n.name='Action / '+label;n.resize(w,48);const prop=Object.keys(n.componentProperties).find(k=>k.startsWith('Label#'));n.setProperties({[prop]:label});if(to)await nav(n,to);return n;}
function photo(p,name,hash,w,h,light=false){const n=frame(p,name,w,h);n.fills=[...(light?[{type:'SOLID',color:rgb('#E2D7C5')}]:[]),{type:'IMAGE',imageHash:hash,scaleMode:'FIT'}];n.clipsContent=true;n.cornerRadius=12;return n;}
const hashes={alfredo:'21c5a3d085d81951ccd5dcb57e78457e12e8a929',bolognese:'a4c39f9a87bb5897faebc130d14884438e1e4bf1',pesto:'8dacb7ae875a201883638c15fe4f396988800f49',pizza:'92c9413b6bd9b6fe71541bc4405948acf2b42aa7',souvlaki:'8fbce4fd83aad7bc93e6792da57d9ca496c0c796',taameya:'081823910b5afba7772d59d19cb685058a47c6ab',pepper:'bcdc1110b47b9f4c5f860aae8422d5899765fdf2',saucepan:'452a765832684adf6881d59480a1cc2d410d0e24',oregano:'50cac94532f845472efe6fd65329cfb4c9412a8f',cumin:'5ea9448eed64044e6c9cd024b3c0ec13ad5c0cf7',coriander:'81374b47d824f407bb59d3948322428d2b619287',grill:'fcf7729c9f4dfdb7dc27a78dedf814c13e2925bc',stone:'c17b67c43fa0af32f2fd0eee311a27cc62083072'};
for(const u of uploads){hashes[u.key]=u.body.imageHash;const n=await get(u.body.placedOnNodeId);if(n){n.name='ChefShop Catalog / Source / '+u.key;n.x=-10000;n.y=14000+uploads.indexOf(u)*50;n.resize(120,120);}}
// Extract only the product photograph, excluding all reference-board UI.
const source=await get('12:528'),sourceHash=source.fills.find(p=>p.type==='IMAGE').imageHash;
for(const [key,x,y,w,h] of [['tongs',239,653,154,152],['spoon',426,653,159,152],['frying',575,653,160,152],['chili',1154,654,162,151],['basil',1339,654,160,151]]){
 const crop=frame(page,'ChefShop Catalog / Temporary photo crop',w,h);crop.clipsContent=true;const im=photo(crop,'Source',sourceHash,1536,1024);im.cornerRadius=0;im.fills=[{type:'IMAGE',imageHash:sourceHash,scaleMode:'FILL'}];im.x=-x;im.y=-y;hashes[key]=figma.createImage(await crop.exportAsync({format:'PNG',constraint:{type:'SCALE',value:2}})).hash;crop.remove();
}
const meals=[
['alfredo','Fettuccine Alfredo',160,'ITALY','Silky fettuccine, cream, parmesan and cracked black pepper.','6:686','23:753',['pepper','saucepan','tongs']],
['bolognese','Spaghetti Bolognese',175,'ITALY','Spaghetti with slow-cooked beef, tomato and aromatic herbs.','19:2969','23:882',['oregano','basil','saucepan','knife']],
['pesto','Pesto Penne',165,'ITALY','Penne tossed with basil pesto, parmesan and olive oil.','19:3052','23:1011',['basil','pepper','mortar','tongs']],
['pizza','Margherita Pizza',190,'ITALY','Tomato, mozzarella and fresh basil on a golden pizza base.','19:2729','23:1140',['basil','oregano','stone','wheel']],
['souvlaki','Chicken Souvlaki Pita',140,'GREECE','Grilled chicken pieces, tomato, onion and tzatziki in pita.','19:2812','23:1269',['oregano','thyme','grill','citrus']],
['spanakopita','Spanakopita',90,'GREECE','Flaky phyllo parcels filled with spinach, feta and dill.',null,null,['pepper','thyme','knife','board']],
['gyro','Chicken Gyro Pita',150,'GREECE','Shaved roast chicken, tomato, onion, fries and tzatziki.',null,null,['oregano','paprika','grill','knife']],
['halloumi','Halloumi Veg Pita',135,'GREECE','Greek-style pita with grilled halloumi, fresh vegetables and herb yogurt.',null,null,['sumac','oregano','grill','citrus']],
['taameya','Taameya Baladi',35,'EGYPT','Crisp fava-bean falafel, salad and tahini in baladi bread.','19:2886','23:1398',['cumin','coriander','frying','colander']],
['ful','Ful Baladi',45,'EGYPT','Warm mashed fava beans, tomato, parsley and tahini in baladi.',null,null,['cumin','dukkah','saucepan','citrus']],
['hawawshi','Hawawshi',95,'EGYPT','Crisp baladi bread stuffed with spiced beef, onion and peppers.',null,null,['cumin','paprika','board','knife']],
['liver','Alexandrian Liver Sandwich',85,'EGYPT','Garlicky beef-liver strips and green pepper in toasted fino bread.',null,null,['cumin','chili','frying','knife']]
].map(a=>({key:a[0],name:a[1],price:a[2],region:a[3],copy:a[4],id:a[5],motion:a[6],related:a[7],category:'meal',unit:'1 serving'}));
const spices=[['pepper','Black Pepper',40],['oregano','Dried Oregano',35],['cumin','Ground Cumin',30],['coriander','Ground Coriander',30],['chili','Chili Flakes',45],['basil','Dried Basil',35],['thyme','Dried Thyme',40],['rosemary','Dried Rosemary',40],['paprika','Smoked Paprika',45],['cinnamon','Ground Cinnamon',40],['sumac','Ground Sumac',50],['dukkah','Egyptian Dukkah',65]].map(a=>({key:a[0],name:a[1],price:a[2],category:'spice',unit:'50 g',id:a[0]==='pepper'?'6:1906':null,copy:a[0]==='dukkah'?'A crunchy Egyptian blend of sesame, hazelnuts, coriander and cumin. Contains nuts and sesame.':'A pantry essential for seasoning Mediterranean and Egyptian dishes. Store sealed in a cool, dry place.'}));
const tools=[['saucepan','Saucepan',450,'18 cm'],['grill','Cast-iron Grill Pan',550,'26 cm'],['stone','Pizza Stone',600,'32 cm'],['tongs','Pasta Tongs',120,'28 cm'],['spoon','Wooden Spoon',60,'30 cm'],['frying','Frying Pan',400,'26 cm'],['knife','Chef Knife',650,'20 cm'],['board','Walnut Cutting Board',320,'35 × 25 cm'],['mortar','Granite Mortar & Pestle',380,'14 cm'],['wheel','Pizza Cutter',150,'9 cm wheel'],['colander','Steel Colander',260,'24 cm'],['citrus','Citrus Press',180,'Handheld']].map(a=>({key:a[0],name:a[1],price:a[2],unit:a[3],category:'tool',id:a[0]==='saucepan'?'6:2000':null,copy:'A practical kitchen essential selected for student cooks and home kitchens. Clean and dry after use; follow the included care instructions.'}));
const products=[...meals,...spices,...tools],product=k=>products.find(p=>p.key===k);
const home=await get('6:58'),shop=await get('6:431');
const shopRoots={meal:shop,tool:by('ChefShop Mobile / Shop / Tools'),spice:by('ChefShop Mobile / Shop / Spices')};
if(!shopRoots.tool||!shopRoots.spice)throw new Error('Shop templates missing');
report.phase='details';
const template=await get('6:1906');
for(const [i,p] of products.entries()){
 let root=p.id?await get(p.id):by('ChefShop Catalog / Detail / '+p.key);
 if(!root){root=template.clone();page.appendChild(root);root.name='ChefShop Catalog / Detail / '+p.key;root.x=7000+(i%9)*460;root.y=9000+Math.floor(i/9)*1040;}
 p.id=root.id;p.root=root;root.resize(402,874);root.clipsContent=true;root.setPluginData('catalogKey',p.key);
}
report.phase='ingredient families';
const base=await get('23:753');const layerLabels={alfredo:['Parsley & pepper','Parmesan','Creamy fettuccine','Black ceramic plate'],ful:['Tomato & parsley','Fava beans','Tahini & olive oil','Baladi bread'],hawawshi:['Crisp baladi lid','Spiced beef','Peppers & onion','Baladi base'],liver:['Toasted fino lid','Garlic & peppers','Beef liver','Fino base'],spanakopita:['Golden phyllo','Feta cheese','Spinach & dill','Phyllo base'],gyro:['Salad & fries','Roast chicken','Tzatziki','Grilled pita'],halloumi:['Fresh vegetables','Grilled halloumi','Herb yogurt','Grilled pita']};
const ease={type:'CUSTOM_CUBIC_BEZIER',easingFunctionCubicBezier:{x1:.16,y1:1,x2:.3,y2:1}};
async function change(n,id,duration,trigger={type:'ON_CLICK'}){await n.setReactionsAsync([{trigger,actions:[{type:'NODE',destinationId:id,navigation:'CHANGE_TO',transition:duration?{type:'SMART_ANIMATE',duration,easing:ease}:null}]}]);}
for(const [mi,p] of meals.entries()){
 let set=p.motion?await get(p.motion):by('ChefShop Motion/'+p.name);
 if(!set){set=base.clone();page.appendChild(set);set.name='ChefShop Motion/'+p.name;set.x=12500+(mi%3)*1200;set.y=6000+Math.floor(mi/3)*1300;}
 p.motion=set.id;
 if(layerLabels[p.key])for(const v of set.children){
  v.findOne(n=>n.name==='Cuisine').characters=p.region+' / '+p.name.toUpperCase();
  const meal=v.findOne(n=>n.name==='Finished meal');meal.fills=[{type:'IMAGE',imageHash:hashes[p.key],scaleMode:'FIT'}];
  for(let i=1;i<=4;i++){const l=v.findOne(n=>n.name==='Ingredient layer '+i),im=l.findOne(n=>n.name==='Food cutout'),s=286/1024,bounds=[0,440,780,1120,1536];l.resize(286,(bounds[i]-bounds[i-1])*s);im.resize(286,1536*s);im.y=-bounds[i-1]*s;im.fills=[{type:'IMAGE',imageHash:hashes[p.key+'-explode'],scaleMode:'FIT'}];const exploded=bounds[i-1]*s-8;const state=v.name.split('=')[1];l.y=state==='Exploded'?exploded:state==='Spread'?exploded+[-4,-2,2,4][i-1]:135+(i-1)*7-(state==='Lift'?3:0);v.findOne(n=>n.name==='Ingredient label '+i).findOne(n=>n.type==='TEXT').characters=layerLabels[p.key][i-1];}
  v.findOne(n=>n.name==='Caption').characters='Four layers. One '+p.name.toLowerCase()+'.';
 }
 const s=k=>set.children.find(v=>v.name==='State='+k),toggle=k=>s(k).findOne(n=>n.name==='Toggle ingredients');
 await change(toggle('Assembled'),s('Lift').id,.18);await change(s('Lift'),s('Spread').id,.7,{type:'AFTER_TIMEOUT',timeout:.01});await change(s('Spread'),s('Exploded').id,.28,{type:'AFTER_TIMEOUT',timeout:.01});await change(toggle('Exploded'),s('Return').id,.65);await change(s('Return'),s('Assembled').id,.25,{type:'AFTER_TIMEOUT',timeout:.01});await change(toggle('Still'),s('Assembled').id,0);for(const v of set.children)if(v!==s('Still'))await change(v.findOne(n=>n.name==='Still view control'),s('Still').id,0);
}
// One reusable, editable native catalog card.
let cardMaster=by('ChefShop Catalog / Product card');
if(!cardMaster){cardMaster=figma.createComponent();page.appendChild(cardMaster);cardMaster.name='ChefShop Catalog / Product card';cardMaster.resize(173,302);cardMaster.layoutMode='VERTICAL';cardMaster.primaryAxisSizingMode='AUTO';cardMaster.counterAxisSizingMode='FIXED';cardMaster.itemSpacing=8;cardMaster.paddingTop=cardMaster.paddingBottom=cardMaster.paddingLeft=cardMaster.paddingRight=12;cardMaster.fills=[paint('white')];cardMaster.cornerRadius=16;cardMaster.x=6800;cardMaster.y=7700;photo(cardMaster,'Product photograph',hashes.alfredo,149,142,true);for(const [name,copy,size,color,font] of [['Category','ITALY',10,'rust',bold],['Name','Fettuccine Alfredo',22,'ink',display],['Price','EGP 160',15,'ink',bold]]){const t=text(cardMaster,name,copy,149,size,color,font);const prop=cardMaster.addComponentProperty(name,'TEXT',copy);t.componentPropertyReferences={characters:prop};}await btn(cardMaster,'View details',149);}
async function card(parent,p){const n=cardMaster.createInstance();parent.appendChild(n);n.name='Catalog card / '+p.key;n.setPluginData('product',p.key);const props={};for(const k of Object.keys(n.componentProperties))props[k]=k.startsWith('Name#')?p.name:k.startsWith('Price#')?'EGP '+p.price:k.startsWith('Category#')?p.region||p.unit:n.componentProperties[k].value;n.setProperties(props);n.findOne(n=>n.name==='Product photograph').fills=[{type:'SOLID',color:rgb('#E2D7C5')},{type:'IMAGE',imageHash:hashes[p.key],scaleMode:'FIT'}];await nav(n,p.id);await nav(n.findOne(n=>n.name==='Action / View details'),p.id);return n;}
function grid(p,name,w){const n=frame(p,name,w,1);n.layoutMode='HORIZONTAL';n.layoutWrap='WRAP';n.primaryAxisSizingMode='FIXED';n.counterAxisSizingMode='AUTO';n.itemSpacing=16;n.counterAxisSpacing=20;return n;}
report.phase='catalog grids';
for(const [category,root] of Object.entries(shopRoots)){
 const b=root.findOne(n=>n.name==='Responsive content');for(const n of [...b.children])n.remove();b.itemSpacing=20;
 text(b,'Catalog eyebrow','COOK. DISCOVER. RECREATE.',362,11,'rust',bold);text(b,'Shop title',category==='meal'?'STUDENT MEALS':category==='tool'?'KITCHEN TOOLS':'SPICES & HERBS',362,44,'ink',display);
 text(b,'Catalog introduction',category==='meal'?'12 dishes · 4 Egyptian · 4 Italian · 4 Greek':'12 essentials to bring the three kitchens home.',362,14,'muted');
 const tabs=col(b,'Category tabs',362,8);for(const [key,label] of [['meal','Student Meals'],['spice','Spices'],['tool','Kitchen Tools']]){const tab=await btn(tabs,(category===key?'● ':'')+label+' · 12',362,category===key?null:shopRoots[key].id);if(key===category)tab.opacity=.78;}
 const g=grid(b,'Catalog / '+category+' / 12 items',362);for(const p of products.filter(p=>p.category===category))await card(g,p);
 const student=col(b,'Student essentials',362,12,16,'sage');student.cornerRadius=16;text(student,'Student essentials title','FOR OUR STUDENTS',330,27,'ink',display);text(student,'Student essentials copy','Uniforms, knife kits and module fees are in your student portal.',330,14,'muted');await btn(student,'Open student portal',330,'6:1077');
}
const homeGrid=home.findOne(n=>n.name==='Cinema / Product grid');for(const n of [...homeGrid.children])n.remove();for(const p of meals)await card(homeGrid,p);
report.phase='product details';
for(const p of products){const root=p.root,b=root.findOne(n=>n.name==='Responsive content');for(const n of [...b.children])n.remove();b.itemSpacing=20;
 await btn(b,'← Back to '+(p.category==='meal'?'meals':p.category==='spice'?'spices':'tools'),362,shopRoots[p.category].id);
 text(b,'Product origin',p.region||p.unit,362,11,'rust',bold);text(b,'Product name',p.name.toUpperCase(),362,42,'ink',display);photo(b,'Product photograph / '+p.key,hashes[p.key],362,290,true);text(b,'Product price','EGP '+p.price+'  /  '+p.unit,362,24,'rust',bold);text(b,'Product description',p.copy,362,16,'muted');
 if(p.category==='meal'){text(b,'Meal information','Student-made · Chef-guided · Campus pickup\nAsk our team about allergens before ordering.',362,13,'muted');const set=await get(p.motion),inst=set.children.find(n=>n.name==='State=Assembled').createInstance();b.appendChild(inst);inst.name='Interactive meal layers / '+p.key;}
 else text(b,'Product availability','Available from the campus store. Prices shown are design examples.',362,13,'muted');
 // Preserve the persistent original purchase action, and label each product accurately.
 const purchase=root.findOne(n=>n.name==='Persistent purchase action');if(purchase){for(const t of purchase.findAll(n=>n.type==='TEXT')){await figma.loadFontAsync(t.fontName);if(/EGP/.test(t.characters))t.characters='EGP '+p.price;}purchase.setPluginData('product',p.key);}
 const related=p.category==='meal'?p.related.map(product):meals.filter(m=>m.related.includes(p.key));
 if(related.length){text(b,'Related heading',p.category==='meal'?'RECREATE IT AT HOME':'COOK WITH IT',362,34,'ink',display);text(b,'Related explanation',p.category==='meal'?'Explore the seasonings and tools behind this dish.':'Discover student meals that use this ingredient or tool.',362,14,'muted');const g=grid(b,'Related / '+p.key,362);for(const q of related.slice(0,4))await card(g,q);}
}
report.phase='done';report.counts={meals:meals.length,spices:spices.length,tools:tools.length};report.cuisines=Object.fromEntries(['EGYPT','ITALY','GREECE'].map(r=>[r,meals.filter(p=>p.region===r).length]));report.shops=Object.fromEntries(Object.entries(shopRoots).map(([k,r])=>[k,r.id]));report.details=products.map(p=>({key:p.key,id:p.id,motion:p.motion}));report.card=cardMaster.id;
page.setPluginData('catalogV4',JSON.stringify(report));
figma.currentPage.selection=[shop];figma.viewport.scrollAndZoomIntoView([shop]);
figma.showUI('<body style="background:#101410;color:#f5eddd;padding:20px;font:14px Arial"><h2>ChefShop · 36 products</h2><textarea aria-label="Catalog build report" id="report" style="width:100%;height:200px">'+JSON.stringify(report)+'</textarea><p><button id="home">Home</button> <button id="meal">Meals</button> <button id="spice">Spices</button> <button id="tool">Tools</button> <button id="close">Close</button></p><script>for(const b of document.querySelectorAll("button"))b.onclick=()=>parent.postMessage({pluginMessage:b.id},"*")</script></body>',{width:680,height:330});figma.ui.onmessage=m=>{if(m==='close')return figma.closePlugin();const n=m==='home'?home:shopRoots[m];if(n){page.selection=[n];figma.viewport.scrollAndZoomIntoView([n]);}};
})().catch(e=>figma.showUI('<h2>Catalog stopped</h2><pre>'+String(e.message||e).replace(/</g,'&lt;')+'</pre>',{width:680,height:300}));
