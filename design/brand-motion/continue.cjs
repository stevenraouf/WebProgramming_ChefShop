const fs=require('node:fs');const path=require('node:path');
let code=fs.readFileSync(path.join(__dirname,'build.js'),'utf8').replace('__RECIPES__',fs.readFileSync(path.join(__dirname,'recipes.json'),'utf8'));
code=code.replace("if(page.children.some(n=>n.name==='ChefShop / Brand & Meal Motion'))throw new Error('This revision is already present. Inspect it before rerunning.');",'');
code=code.replace("st.textAlignHorizontal='LEFT';",'');
const a=code.indexOf('// Remove only the exact partial nodes');const b=code.indexOf('const allText=',a);code=code.slice(0,a)+code.slice(b);
const start=code.indexOf('// Vector brand:');const end=code.indexOf('// Preview / usage board',start);
code=code.slice(0,start)+"const logo=await figma.getNodeByIdAsync('23:391'),mark=await figma.getNodeByIdAsync('23:383');const navs=page.findAll(n=>n.name==='ChefShop / Three kitchens logo');const partial=await figma.getNodeByIdAsync('23:649');if(partial)partial.remove();\n"+code.slice(end);
fs.writeFileSync(path.join(__dirname,'continue-builder.js'),code);fs.writeFileSync(path.join(__dirname,'../figma-plugin/code.js'),code);console.log('Prepared continuation from the completed logo update.');
