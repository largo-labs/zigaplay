# Draws the cartridge label (top-down): serve the built game (python3 -m http.server 8792 in a folder holding nightsteel.html), then
# python3 tools/nightsteel/make-cart.py small.png  and scale it 3x with nearest-neighbour to 288x192.
import asyncio,base64,sys
from playwright.async_api import async_playwright
JS=r"""
(()=>{const {TD,MAPS,topLook,TITLE_CAST,tileAt}=__SS;const c=document.createElement('canvas');c.width=96;c.height=64;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const m=MAPS.larkfield,cx=Math.round(10.5*16+8-48),cy=7*16-6;
 for(let ty=Math.floor(cy/16);ty<=Math.ceil((cy+64)/16);ty++)for(let tx=Math.floor(cx/16);tx<=Math.ceil((cx+96)/16);tx++)g.drawImage(TD.tileImg(tileAt(m,tx,ty),1,'flood'),tx*16-cx,ty*16-cy);
 const put=(L,x,y,d,f)=>g.drawImage(TD.personImg(topLook(L),d,f),x,y);
 put(TITLE_CAST[1].look,26,32,'down',1);put(TITLE_CAST[0].look,40,28,'down',0);put(TITLE_CAST[2].look,54,32,'down',2);
 g.fillStyle='rgba(6,10,36,.42)';g.fillRect(0,0,96,64);g.globalCompositeOperation='lighter';
 const gl=(x,y,r,col)=>{const q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,col);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2)};
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(m.rows[y][x]==='+')gl(x*16+8-cx,y*16+8-cy,20,'rgba(255,200,110,.55)');
 gl(48,40,26,'rgba(150,160,220,.3)');g.globalCompositeOperation='source-over';
 /* a moon in the corner and a wanted poster nailed to the left */
 g.fillStyle='rgba(255,240,210,.12)';g.beginPath();g.arc(84,10,10,0,7);g.fill();g.fillStyle='#f6f0d4';g.beginPath();g.arc(84,10,6,0,7);g.fill();g.fillStyle='#0d1236';g.beginPath();g.arc(87,8,5.6,0,7);g.fill();
 g.fillStyle='#4a2e1a';g.fillRect(9,34,2,22);g.fillStyle='#e0cc98';g.fillRect(3,28,14,17);g.fillStyle='#8a2a1a';g.fillRect(4,29,12,2);g.fillStyle='#a08a60';g.fillRect(6,33,8,7);g.fillStyle='#6a4a30';g.fillRect(8,34,4,3);g.fillRect(7,37,6,2);g.fillStyle='#8a2a1a';g.fillRect(5,41,10,2);
 return c.toDataURL('image/png')})()
"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':640,'height':360})
        await pg.goto('http://127.0.0.1:8792/nightsteel.html#sstest');await pg.wait_for_timeout(800)
        d=await pg.evaluate(JS);open(sys.argv[1],'wb').write(base64.b64decode(d.split(',')[1]));await b.close()
asyncio.run(main())
