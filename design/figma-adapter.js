// Local design tooling, not website code. No network calls or destructive operations.
(async function () {
  const marker = 'ChefShop · v1 · Design foundations';
  const page = figma.currentPage;
  if (page.children.some(n => n.name === marker)) {
    figma.closePlugin('ChefShop designs already exist on this page. No duplicates created.');
    return;
  }
  const fonts = await figma.listAvailableFontsAsync();
  const has = (family, style) => fonts.some(f => f.fontName.family === family && f.fontName.style === style);
  const UI = has('Arial','Regular') ? 'Arial' : 'Inter';
  const SERIF = has('Georgia','Regular') ? 'Georgia' : has('Playfair Display','Regular') ? 'Playfair Display' : UI;
  const font = (family, bold) => ({family,style:has(family,bold?'Bold':'Regular')?(bold?'Bold':'Regular'):'Regular'});
  await Promise.all([font(UI,false),font(UI,true),font(SERIF,false),font(SERIF,true)].map(f=>figma.loadFontAsync(f)));
  const color = key => {
    const hex = (SPEC.colors[key] || key).replace('#','');
    return {r:parseInt(hex.slice(0,2),16)/255,g:parseInt(hex.slice(2,4),16)/255,b:parseInt(hex.slice(4,6),16)/255};
  };
  const collection = figma.variables.createVariableCollection('ChefShop / Foundations');
  const mode=collection.defaultModeId;
  const vars={}, created=[];
  for(const key of Object.keys(SPEC.colors)) {
    const primitive=figma.variables.createVariable('palette/'+key,collection,'COLOR');
    primitive.scopes=[];primitive.setValueForMode(mode,{...color(key),a:1});
    const v=figma.variables.createVariable('color/'+key,collection,'COLOR');
    v.scopes=['FRAME_FILL','SHAPE_FILL','TEXT_FILL','STROKE_COLOR'];
    v.setValueForMode(mode,{type:'VARIABLE_ALIAS',id:primitive.id});
    v.setVariableCodeSyntax('WEB','var(--color-'+key+')'); vars[key]=v;
  }
  for(const [key,value,scopes] of [['space/sm',8,['GAP']],['space/md',16,['GAP']],['space/lg',24,['GAP']],['radius/sm',8,['CORNER_RADIUS']],['radius/md',12,['CORNER_RADIUS']],['radius/lg',16,['CORNER_RADIUS']]]){
    const v=figma.variables.createVariable(key,collection,'FLOAT');v.scopes=scopes;v.setValueForMode(mode,value);v.setVariableCodeSyntax('WEB','var(--'+key.replace('/','-')+')');vars[key]=v;
  }
  const paint = key => {
    const p={type:'SOLID',color:color(key)};
    return vars[key] ? figma.variables.setBoundVariableForPaint(p,'color',vars[key]) : p;
  };
  const styles={};
  function styleFor(a){const family=a.font==='serif'?SERIF:UI;const id=[family,a.size,a.weight].join('/');if(!styles[id]){const s=figma.createTextStyle();s.name='ChefShop/'+id;s.fontName=font(family,a.weight==='Bold');s.fontSize=a.size;s.lineHeight={unit:'PIXELS',value:Math.ceil(a.size*1.35)};styles[id]=s;}return styles[id];}
  const components={}, links=[],roots=[],bounds=[];
  const library=figma.createFrame();library.name=marker;library.x=180;library.y=-1100;library.resize(1440,1000);library.fills=[paint('paper')];created.push(library.id);
  let libX=40,libY=336,rowH=0;
  function placeComponent(c){if(libX+c.width>1400){libX=40;libY+=rowH+32;rowH=0;}library.appendChild(c);c.x=libX;c.y=libY;libX+=c.width+28;rowH=Math.max(rowH,c.height);if(libY+rowH+40>library.height)library.resize(1440,libY+rowH+40);}
  function flattenTexts(a,out=[]){if(a.type==='text')out.push(a);for(const c of a.children||[])flattenTexts(c,out);return out;}
  async function create(a,parent,asDefinition=false){
    let node;
    if(a.component && !asDefinition){
      const key=a.component+'/'+a.variant;
      if(!components[key]){
        const c=figma.createComponent();c.name='ChefShop/'+key;c.resize(a.w,a.h);c.fills=a.bg?[paint(a.bg)]:[];c.cornerRadius=a.r||0;if(a.stroke)c.strokes=[paint(a.stroke)];
        for(const child of a.children||[])await create(child,c);
        if(a.component==='Button'||a.component==='Badge'){
          const label=c.findOne(n=>n.type==='TEXT');const prop=c.addComponentProperty('Label','TEXT',label.characters);label.componentPropertyReferences={characters:prop};c.description='ChefShop '+a.component.toLowerCase()+'. '+(a.component==='Button'?'Use for navigation and primary actions.':'Use for concise status labels.');
        }
        for(const child of c.children){if(child.type==='TEXT'){child.constraints={horizontal:'STRETCH',vertical:'CENTER'};}else if(child.type==='FRAME'){child.constraints={horizontal:'STRETCH',vertical:'MIN'};}}
        placeComponent(c);components[key]=c;created.push(c.id);
      }
      node=components[key].createInstance();node.name=a.name;parent.appendChild(node);node.resize(a.w,a.h);
      const actual=node.findAll(n=>n.type==='TEXT'), expected=flattenTexts(a);
      for(let i=0;i<Math.min(actual.length,expected.length);i++){actual[i].characters=expected[i].text;actual[i].name=expected[i].name;}
    }else if(a.type==='art'){
      node=figma.createNodeFromSvg(a.svg);node.name='Illustration / '+a.kind;parent.appendChild(node);node.resize(a.w,a.h);
    }else if(a.type==='text'){
      node=figma.createText();parent.appendChild(node);node.fontName=font(a.font==='serif'?SERIF:UI,a.weight==='Bold');node.characters=a.text;
      await node.setTextStyleIdAsync(styleFor(a).id);node.fills=[paint(a.color)];node.textAutoResize='HEIGHT';node.resize(a.w,a.h);
    }else{
      node=a.type==='ellipse'?figma.createEllipse():a.type==='rect'?figma.createRectangle():figma.createFrame();parent.appendChild(node);node.resize(a.w,a.h);node.fills=a.bg?[paint(a.bg)]:[];
      if(a.r && 'cornerRadius' in node){node.cornerRadius=a.r;const v=vars['radius/'+(a.r===8?'sm':a.r===12?'md':a.r===16?'lg':'')];if(v)node.setBoundVariable('cornerRadius',v);}
      if(a.stroke)node.strokes=[paint(a.stroke)];
      if(node.type==='FRAME'){
        node.clipsContent=false;
        if(a.layout){node.layoutMode=a.layout;node.primaryAxisSizingMode='FIXED';node.counterAxisSizingMode='FIXED';node.itemSpacing=a.gap||0;node.paddingTop=node.paddingBottom=node.paddingLeft=node.paddingRight=a.pad||0;const gap=vars['space/'+(a.gap===8?'sm':a.gap===16?'md':a.gap===24?'lg':'')];if(gap)node.setBoundVariable('itemSpacing',gap);}
        for(const c of a.children||[])await create(c,node);
      }
    }
    node.name=a.name;node.x=a.x||0;node.y=a.y||0;
    if(a.to)links.push({node,to:a.to});created.push(node.id);
    return node;
  }
  // Compact design foundations used by the screens.
  await create(textSpec('ChefShop / Design foundations',40,32,1360,40,'ink','serif'),library);
  await create(textSpec('Warm craft. Clear commerce. A new generation of chefs.',42,100,1360,17,'muted'),library);
  for(const [i,k] of ['ink','green','orange','gold','pale','peach','paper','white'].entries()){
    await create({type:'rect',name:'Swatch / '+k,x:40+i*166,y:162,w:144,h:72,bg:k,r:8},library);
    await create(textSpec(k+' · '+SPEC.colors[k],40+i*166,247,160,11,'muted'),library);
  }
  await create(textSpec('TYPE  Georgia / Editorial      Arial / Interface       GRID  1440 desktop · 390 mobile       DATA  Fictional EGP examples',40,291,1360,12,'muted'),library);
  function textSpec(t,x,y,w,size,color,font='ui'){return {type:'text',name:t,text:t,x,y,w,h:Math.ceil(size*1.35),size,color,font,weight:'Regular'};}
  let startX=180; if(page.children.length>1){const other=page.children.filter(n=>n.id!==library.id);startX=Math.max(180,...other.map(n=>n.x+n.width+180));library.x=startX;}
  let desktop=0,mobile=0;
  for(const s of SPEC.screens){
    const root=await create(s,page);root.name=s.name;root.clipsContent=true;
    if(s.w>500){root.x=startX+(desktop%4)*1640;root.y=180+Math.floor(desktop/4)*1790;desktop++;}
    else {root.x=startX+mobile*570;root.y=180+Math.ceil(desktop/4)*1790;mobile++;}
    roots.push({id:s.id,node:root});bounds.push({id:root.id,name:root.name,width:root.width,height:root.height});
  }
  const byId=Object.fromEntries(roots.map(r=>[r.id,r.node]));
  for(const {node,to} of links){if(byId[to])await node.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:byId[to].id,navigation:'NAVIGATE',transition:null,preserveScrollPosition:false}]}]);}
  // Keep reusable families as variant sets without changing the screen instances.
  let setY=library.height+60;
  for(const family of ['Button','Badge','ProductCard']){
    const variants=Object.entries(components).filter(([k])=>k.startsWith(family+'/'));
    if(!variants.length)continue;
    for(const [k,c] of variants)c.name=(family==='ProductCard'?'Product':'Style')+'='+k.split('/')[1];
    const set=figma.combineAsVariants(variants.map(([,c])=>c),page);set.name='ChefShop / '+family;set.description='Reusable '+family+' variants for the ChefShop design concept.';
    let xx=24,hh=0;for(const [,c] of variants){c.x=xx;c.y=50;xx+=c.width+24;hh=Math.max(hh,c.height);}
    set.resize(xx,hh+74);set.x=startX;set.y=-1100-setY;setY+=set.height+80;created.push(set.id);
  }
  page.name='ChefShop · Design v1';
  page.flowStartingPoints=[{nodeId:byId.home.id,name:'Store · Browse to order'},{nodeId:byId.student.id,name:'Student · Fees & essentials'},{nodeId:byId.overview.id,name:'Management · Costs & profit'},{nodeId:byId['mobile-home'].id,name:'Mobile · Storefront'}];
  const all=page.findAll(n=>n.type==='TEXT');
  const wrongFonts=all.filter(n=>typeof n.fontName!=='object'||![UI,SERIF].includes(n.fontName.family));
  const result={screenCount:roots.length,componentCount:Object.keys(components).length,textCount:all.length,fonts:{ui:UI,editorial:SERIF},wrongFonts:wrongFonts.length,prototypeLinks:links.length,screens:bounds};
  console.log(JSON.stringify(result));
  figma.currentPage.selection=[byId.home];figma.viewport.scrollAndZoomIntoView([byId.home]);
  figma.closePlugin('ChefShop: '+roots.length+' editable screens, '+Object.keys(components).length+' components and '+links.length+' prototype links created.');
})().catch(error=>{console.error(error);figma.closePlugin('ChefShop builder stopped: '+error.message+'. Existing content was preserved.');});
