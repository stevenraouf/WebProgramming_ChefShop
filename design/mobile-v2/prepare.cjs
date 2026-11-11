const fs=require('fs'),path=require('path');
const root=__dirname;
let code=fs.readFileSync(path.join(root,'builder.js'),'utf8');
code=code.replace('root._nothing;','');
code=code.replaceAll('preserveScrollPosition:false','resetScrollPosition:true');
code=code.replace("['EGP '+(pickup?650:680),'Place order','confirmation']","['EGP '+(pickup?650:680),'Place order',pickup?'confirmation':'confirmation-delivery']");
// A static design option displays its price; it does not pretend to operate a live cart.
code=code.replace("option(c,'Large · EGP 200',false,'meal-large')","option(c,'Large · EGP 200')");
code=code.replace("option(b,'100 g · EGP 70',false,'spice-large')","option(b,'100 g · EGP 70')");
// Ensure the existing old prototype buttons are never silently left over.
code=code.replace("old.layoutMode='NONE';","old.layoutMode='NONE';await old.setReactionsAsync([]);");
fs.writeFileSync(path.join(root,'ready-builder.js'),code);
fs.writeFileSync(path.join(root,'..','figma-plugin','code.js'),code);
console.log('Prepared native mobile builder in the already-installed ChefShop plugin.');
