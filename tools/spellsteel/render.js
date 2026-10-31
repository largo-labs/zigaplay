// node tools/render.js "<js expression returning [[label, Buf], ...]>" out.json [files...]
const fs=require('fs');const [,,expr,out,...files]=process.argv;
const src=(files.length?files:['src/buf.js','src/doll.js']).map(f=>fs.readFileSync(f,'utf8')).join('\n');
const fn=new Function('document',src+'\nreturn ('+expr+');');
const res=fn({createElement:()=>({getContext:()=>({})})});
fs.writeFileSync(out,JSON.stringify(res.map(([n,b])=>({n,w:b.w,h:b.h,d:b.d}))));
