const fs=require('node:fs'),path=require('node:path');
function build(root){
  const data=require('./courier-api.cjs').readRates(root);
  let source=fs.readFileSync(path.join(root,'scripts/courier-api.cjs'),'utf8');
  source=source.slice(source.indexOf('const aliases'),source.indexOf('function createCourierApi'));
  source=source.replace(/function readRates\(root\) \{[\s\S]*?\n\}/,'');
  source=source.replace("now.toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'})","Utilities.formatDate(now,'Asia/Kolkata','yyyy-MM-dd')");
  source=source.replace('crypto.randomUUID()','Utilities.getUuid()');
  // Local file only. This generated file contains confidential supplier costs.
  const output=path.join(root,'.local/courier-deployment.gs');
  const wrapper=fs.readFileSync(path.join(root,'integrations/courier/Endpoint.gs'),'utf8');
  fs.writeFileSync(output,'const PRIVATE_RATES = '+JSON.stringify(data)+';\n'+source+'\n'+wrapper);
  return output;
}
if(require.main===module)console.log(build(path.resolve(__dirname,'..')));
module.exports={build};
