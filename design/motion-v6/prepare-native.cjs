const fs=require('node:fs'),path=require('node:path');
const keys=process.argv.slice(2);if(!keys.length)throw Error('Specify meals');
const assets=keys.map(key=>({key,gif:fs.readFileSync(path.join(__dirname,'renders',key+'-motion.gif')).toString('base64'),poster:fs.readFileSync(path.join(__dirname,'renders',key+'-assembled.png')).toString('base64')}));
fs.writeFileSync(path.join(__dirname,'../figma-plugin/code.js'),fs.readFileSync(path.join(__dirname,'apply-native.js'),'utf8').replace('__ASSETS__',JSON.stringify(assets)));console.log('Prepared',keys.join(', '));
