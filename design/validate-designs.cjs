const fs=require('fs'),path=require('path');
const {screens}=JSON.parse(fs.readFileSync(path.join(__dirname,'screens.json'),'utf8'));
let nodes=0,links=0;const problems=[];
const ids=new Set(screens.map(s=>s.id));
function walk(a,parent,screen){nodes++;if(a.to){links++;if(!ids.has(a.to))problems.push(`${screen}: unresolved ${a.to}`);}if(a.w<=0||a.h<=0)problems.push(`${screen}: invalid dimensions ${a.name}`);
  if(parent && a.type==='text' && (a.x+a.w>parent.w+2||a.y+a.h>parent.h+2))problems.push(`${screen}: text exceeds parent: ${a.name}`);
  for(const c of a.children||[])walk(c,a,screen);
}
screens.forEach(s=>walk(s,null,s.id));
console.log(JSON.stringify({screenCount:screens.length,nodes,links,problems},null,2));
const svgs=screens.map(s=>`<section data-screen="${s.id}">${fs.readFileSync(path.join(__dirname,'previews',s.id+'.svg'),'utf8')}</section>`).join('');
const widths=[];function scan(a,s){if(a.type==='text')widths.push({screen:s,text:a.text,w:a.w});for(const c of a.children||[])scan(c,s);}screens.forEach(s=>scan(s,s.id));
fs.writeFileSync(path.join(__dirname,'previews','validate.html'),`<!doctype html><meta charset="utf-8"><style>section{position:absolute;visibility:hidden;left:0;top:0}</style>${svgs}<pre id="result"></pre><script>const expected=${JSON.stringify(widths)};const actual=[...document.querySelectorAll('text')];const overflow=actual.map((t,i)=>({screen:expected[i].screen,text:expected[i].text,width:t.getBBox().width,available:expected[i].w})).filter(t=>t.width>t.available+1);document.querySelector('#result').textContent=JSON.stringify({checked:actual.length,overflow},null,2);</script>`);
fs.writeFileSync(path.join(__dirname,'previews','contact-sheet.html'),`<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:20px;background:#e5e7df;font:18px Arial;color:#183d32}main{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}article{padding:10px;background:white}img{width:100%}.mobile img{width:175px}h2{font:18px Georgia}</style><main>${screens.map(s=>`<article class="${s.w<500?'mobile':''}"><h2>${s.name}</h2><img src="${s.id}.svg"></article>`).join('')}</main>`);
