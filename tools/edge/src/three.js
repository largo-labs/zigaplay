/* ================= three.js =================
   Online the game imports 3d/three.module.min.js next to itself (or, on the ZigaPlay, Lynties' copy); the offline edition carries both three.js files
   inside the page (as text), and they are turned into modules here. */
async function loadThree(){
  if(document.readyState==='loading')await new Promise(r=>document.addEventListener('DOMContentLoaded',r,{once:true}));
  const inCore=document.getElementById('three-core'),inMod=document.getElementById('three-mod');
  if(inCore&&inMod){const core=URL.createObjectURL(new Blob([inCore.textContent],{type:'text/javascript'}));
    const mod=inMod.textContent.split('"./three.core.min.js"').join(JSON.stringify(core));
    return import(URL.createObjectURL(new Blob([mod],{type:'text/javascript'})))}
  /* on the ZigaPlay the game shares Lynties' copy of three.js */
  try{return await import(new URL('3d/three.module.min.js',document.baseURI).href)}
  catch(e){return import(new URL('../lynties/3d/three.module.min.js',document.baseURI).href)}}
const THREE=await loadThree();
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
