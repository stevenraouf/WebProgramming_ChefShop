(async()=>{
const page=figma.currentPage;
const roots=page.children.filter(n=>/^(01 · Home|03 · Meal details)/.test(n.name)||n.name.startsWith('ChefShop Mobile / Meal /'));
const vars=(await figma.variables.getLocalVariablesAsync()).filter(v=>!v.remote).map(v=>({id:v.id,name:v.name,type:v.resolvedType}));
const styles=(await figma.getLocalTextStylesAsync()).filter(s=>s.name.startsWith('ChefShop Mobile')).map(s=>({id:s.id,name:s.name,fontName:s.fontName,fontSize:s.fontSize}));
const data={page:page.id,roots:roots.map(r=>({id:r.id,name:r.name,x:r.x,y:r.y,width:r.width,height:r.height,nav:r.findAll(n=>n.name==='Mobile web navigation').map(n=>({id:n.id,children:n.children.map(c=>({id:c.id,name:c.name,type:c.type,width:c.width,height:c.height}))})),photos:r.findAll(n=>n.name.startsWith('Photo / ')).map(n=>({id:n.id,name:n.name,hash:n.fills.find(p=>p.type==='IMAGE')?.imageHash})),headings:r.findAll(n=>n.name.startsWith('Heading / ')).map(n=>n.name)})),vars,styles};
figma.showUI('<body style="font:14px Arial;padding:20px"><h2>ChefShop · Branding inventory</h2><textarea aria-label="Brand inventory" id="report" style="width:95%;height:300px">'+JSON.stringify({page:data.page,roots:data.roots.map(r=>({id:r.id,name:r.name,photos:r.photos,nav:r.nav})),vars:data.vars,styles:data.styles.slice(0,3)}).replace(/</g,'&lt;')+'</textarea><p><button onclick="parent.postMessage({pluginMessage:{type:\'close\'}},\'*\')">Close</button></p></body>',{width:600,height:440});figma.ui.onmessage=()=>figma.closePlugin();
})().catch(e=>figma.closePlugin(String(e)));
