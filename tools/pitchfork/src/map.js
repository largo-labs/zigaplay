/* ---------- maps: built from each battle's list of drawing ops; flow fields for pathfinding ---------- */
function buildMap(spec){
  const r=rng(spec.seed||7),t=[];for(let y=0;y<MH;y++)t.push(new Array(MW).fill('.'));
  const houses=[];const set=(x,y,c)=>{if(x>=0&&y>=0&&x<MW&&y<MH)t[y][x]=c};
  let floor='.';
  for(const op of spec.map){const k=op[0],a=op.slice(1);
    if(k==='fill'){floor=a[0];for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)t[y][x]=a[0]}
    else if(k==='rect'){const[c,x0,y0,w,h]=a;for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)set(x,y,c)}
    else if(k==='frame'){const[c,x0,y0,w,h]=a;for(let x=x0;x<x0+w;x++){set(x,y0,c);set(x,y0+h-1,c)}for(let y=y0;y<y0+h;y++){set(x0,y,c);set(x0+w-1,y,c)}}
    else if(k==='border'){const[c,n]=a;for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const d=Math.min(x,y,MW-1-x,MH-1-y);if((d<n||(d===n&&r()<.45))&&t[y][x]===floor)t[y][x]=c}}
    else if(k==='scatter'){const[c,p,x0=0,y0=0,w=MW,h=MH]=a;for(let y=y0;y<y0+h&&y<MH;y++)for(let x=x0;x<x0+w&&x<MW;x++)if(t[y][x]===floor&&r()<p)t[y][x]=c}
    else if(k==='line'){const[c,pts,wd=1]=a;for(let i=0;i<pts.length-1;i++){const[x0,y0]=pts[i],[x1,y1]=pts[i+1];const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))*2||1;
      for(let s=0;s<=n;s++){const x=Math.round(x0+(x1-x0)*s/n),y=Math.round(y0+(y1-y0)*s/n);for(let dy=0;dy<wd;dy++)for(let dx=0;dx<wd;dx++)set(x+dx,y+dy,c)}}}
    else if(k==='house'){const[x0,y0,w,h,c='H']=a;for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)set(x,y,c);houses.push({x:x0,y:y0,w,h,c})}
  }
  const pass=floor==='.'||floor==='s'?floor:'.';
  // every way in and out of the map must be open ground
  const opens=[...Object.values(spec.spawns||{}),spec.exit,spec.start,spec.end].filter(Boolean);
  for(const[x,y]of opens){const dx=x<=0?1:x>=MW-1?-1:0,dy=y<=0?1:y>=MH-1?-1:0;
    for(let i=0;i<5;i++)for(let j=-1;j<=1;j++){const cx=x+dx*i+(dx?0:j),cy=y+dy*i+(dy?0:j);if(cx<0||cy<0||cx>=MW||cy>=MH)continue;if(TILE_SOLID[t[cy][cx]]&&t[cy][cx]!=='~')t[cy][cx]=pass}
    if(!dx&&!dy)for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const cx=x+i,cy=y+j;if(cx>=0&&cy>=0&&cx<MW&&cy<MH&&TILE_SOLID[t[cy][cx]]&&t[cy][cx]!=='~')t[cy][cx]=pass}}
  for(const g of spec.guards||[]){const[x,y]=g;if(TILE_SOLID[t[y][x]])t[y][x]=pass}
  if(spec.boss){const{x,y}=spec.boss;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(TILE_SOLID[t[y+j][x+i]]&&t[y+j][x+i]!=='~'&&t[y+j][x+i]!=='W')t[y+j][x+i]=pass}
  const m={t,houses,floor:pass,solid:new Uint8Array(MW*MH),breakable:new Map(),cache:null,canopy:null,dirty:[]};
  if(spec.gate){let n=0;for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(t[y][x]==='G')n++;
    const g={kind:'gate',hp:spec.gate.hp,max:spec.gate.hp,tiles:[]};for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(t[y][x]==='G'){g.tiles.push(y*MW+x);m.breakable.set(y*MW+x,g)}m.gate=g}
  if(spec.protect){const p=spec.protect;for(let y=p.y;y<p.y+p.h;y++)for(let x=p.x;x<p.x+p.w;x++)if(TILE_SOLID[t[y][x]])t[y][x]=pass}
  recomputeSolid(m,spec);
  return m;
}
function recomputeSolid(m,spec){for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const c=m.t[y][x];m.solid[y*MW+x]=TILE_SOLID[c]?(c==='~'?2:1):0}
  if(spec&&spec.protect){const p=spec.protect;for(let y=p.y;y<p.y+p.h;y++)for(let x=p.x;x<p.x+p.w;x++)m.solid[y*MW+x]=3}
  for(const k of m.breakable.keys())m.solid[k]=1}
function renderMapCache(m){
  const c=document.createElement('canvas');c.width=MW*TS;c.height=MH*TS;const g=c.getContext('2d');
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)drawTile(g,m,x,y);drawBuildings(g,m);m.cache=c;
  const k=document.createElement('canvas');k.width=MW*TS;k.height=MH*TS;drawCrowns(k.getContext('2d'),m);m.canopy=k}
function redrawTile(m,x,y){const g=m.cache.getContext('2d');drawTile(g,m,x,y)}
const tileAt=(m,px,py)=>{const x=px>>4,y=py>>4;return(x<0||y<0||x>=MW||y>=MH)?'T':m.t[y][x]};
const solidAtPx=(m,px,py)=>{const x=Math.floor(px/TS),y=Math.floor(py/TS);if(x<0||y<0||x>=MW||y>=MH)return 1;return m.solid[y*MW+x]};

/* flow fields: Dijkstra from many sources over the tile grid, with 8-way moves.
   Breakable tiles (gates, barricades) can be pathed through at a high cost; units that reach one attack it. */
function flowField(m,sources,opts={}){
  const N=MW*MH,d=new Float32Array(N).fill(1e9),heap=[];
  const push=(i,v)=>{heap.push([v,i]);let k=heap.length-1;while(k>0){const p=(k-1)>>1;if(heap[p][0]<=heap[k][0])break;[heap[p],heap[k]]=[heap[k],heap[p]];k=p}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let s=k;if(l<heap.length&&heap[l][0]<heap[s][0])s=l;if(r<heap.length&&heap[r][0]<heap[s][0])s=r;if(s===k)break;[heap[s],heap[k]]=[heap[k],heap[s]];k=s}}return top};
  for(const i of sources){if(i>=0&&i<N&&d[i]>0){d[i]=0;push(i,0)}}
  const cost=i=>{const s=m.solid[i];if(!s)return m.t[(i/MW)|0][i%MW]==='m'?18:10;if(m.breakable.has(i))return opts.noBreak||(opts.side==='p'&&m.breakable.get(i).kind==='barricade')?Infinity:90;if(s===3)return opts.throughObj?10:Infinity;return Infinity};
  while(heap.length){const[v,i]=pop();if(v>d[i])continue;const x=i%MW,y=(i/MW)|0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=MW||ny>=MH)continue;const j=ny*MW+nx;
      let c=cost(j);if(c===Infinity)continue;
      if(dx&&dy){if(m.solid[y*MW+nx]||m.solid[ny*MW+x])continue;c*=1.41}
      const nv=v+c;if(nv<d[j]){d[j]=nv;push(j,nv)}}}
  return d;
}
// next point to walk toward from (px,py) down a field; null when already at the bottom
function flowNext(m,f,px,py){const x=Math.floor(px/TS),y=Math.floor(py/TS);if(x<0||y<0||x>=MW||y>=MH)return null;const i=y*MW+x;let best=f[i],bi=-1;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=MW||ny>=MH)continue;
    if(dx&&dy&&(m.solid[y*MW+nx]||m.solid[ny*MW+x]))continue;const j=ny*MW+nx;if(f[j]<best){best=f[j];bi=j}}
  if(bi<0)return null;return{x:(bi%MW)*TS+8,y:((bi/MW)|0)*TS+8,i:bi}}
