const fs=require('node:fs');const path=require('node:path');
const inventory=JSON.parse(fs.readFileSync(path.join(__dirname,'inventory.json'),'utf8'));
const receipts=JSON.parse(fs.readFileSync(path.join(__dirname,'upload-receipt.json'),'utf8'));
const definitions=[
 ['alfredo','Pasta Alfredo','Italy',['Parsley & black pepper','Parmesan shavings','Creamy fettuccine','Served in a warm bowl'],[0,440,730,1100,1536]],
 ['bolognese','Pasta Bolognese','Italy',['Basil & parmesan','Tomato & beef ragù','Golden spaghetti','Served in a warm bowl'],[0,380,715,1060,1536]],
 ['pesto','Pesto Pasta','Italy',['Basil & pine nuts','Parmesan shavings','Pesto-coated penne','Served in a warm bowl'],[0,440,740,1100,1536]],
 ['pizza','Margherita Pizza','Italy',['Fresh basil','Mozzarella','Tomato sauce','Golden pizza crust'],[0,440,780,1120,1536]],
 ['souvlaki','Chicken Souvlaki Pita','Greece',['Tomato, onion & parsley','Grilled chicken','Cucumber tzatziki','Soft grilled pita'],[0,470,800,1100,1536]],
 ['taameya','Taameya Sandwich','Egypt',['Salad & pickles','Fava bean taameya','Tahini sauce','Baladi bread'],[0,455,820,1100,1536]]
];
const recipes=definitions.map(([key,name,region,labels,bounds])=>{const receipt=receipts.find(r=>r.key===key);const root=key==='alfredo'?inventory.roots.find(r=>r.name.startsWith('03 ·')):inventory.roots.find(r=>r.name.endsWith('/ '+name));if(!root||!receipt?.body?.success)throw new Error('Missing source for '+key);return {key,name,region,labels,bounds,rootId:root.id,hash:receipt.body.imageHash,assetNodeId:receipt.body.placedOnNodeId};});
const code=fs.readFileSync(path.join(__dirname,'build.js'),'utf8').replace('__RECIPES__',JSON.stringify(recipes));
fs.writeFileSync(path.join(__dirname,'ready-builder.js'),code);fs.writeFileSync(path.join(__dirname,'../figma-plugin/code.js'),code);fs.writeFileSync(path.join(__dirname,'recipes.json'),JSON.stringify(recipes,null,2));console.log('Prepared regional branding and six meal animation components.');
