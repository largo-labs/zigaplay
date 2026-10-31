# Draws the cartridge label: serve the built game (python3 -m http.server 8792 in a folder holding nightsteel.html), then
# python3 tools/nightsteel/make-cart.py small.png  and scale it 2x with nearest-neighbour to 288x192.
import asyncio,base64,sys
from playwright.async_api import async_playwright
JS=r"""
(()=>{const {themeArt,heroSprite,TITLE_CAST,GROUND_Y,DOLL_W,DOLL_FX,DOLL_FY}=__SS;const c=document.createElement('canvas');c.width=144;c.height=96;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const y0=84,A=themeArt('village',false),cam=150;
 const gr=g.createLinearGradient(0,0,0,96);gr.addColorStop(0,'#05061a');gr.addColorStop(.55,'#1a1f4e');gr.addColorStop(1,'#3a2246');g.fillStyle=gr;g.fillRect(0,0,144,96);
 for(let i=0;i<40;i++){const x=(i*53)%144,y=(i*37)%46;g.fillStyle=`rgba(255,255,255,${i%3?.45:.9})`;g.fillRect(x,y,1,1)}
 g.drawImage(A.far,-cam*.2,-y0+6);g.drawImage(A.mid,-cam*.55,-y0+8);g.drawImage(A.ground,-cam,GROUND_Y-y0);
 g.fillStyle='rgba(8,10,40,.55)';g.fillRect(0,0,144,96);
 g.fillStyle='rgba(255,240,210,.10)';g.beginPath();g.arc(104,16,22,0,7);g.fill();g.fillStyle='rgba(255,240,210,.14)';g.beginPath();g.arc(104,16,15,0,7);g.fill();g.fillStyle='#f6f0d4';g.beginPath();g.arc(104,16,11,0,7);g.fill();g.fillStyle='#101438';g.beginPath();g.arc(109,13,10,0,7);g.fill();
 
 /* a lit window and the glow on the party */
 g.globalCompositeOperation='lighter';const gl=(x,y,r,col)=>{const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,col);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2)};
 gl(74,60,44,'rgba(150,120,200,.28)');g.globalCompositeOperation='source-over';
 const C=TITLE_CAST,F=77;
 const put=(m,pose,x,flip)=>{g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(x,F+1,9,2,0,0,7);g.fill();const s=heroSprite(m.look,m.w,pose,flip);g.drawImage(s,Math.round(x-(flip?DOLL_W-DOLL_FX:DOLL_FX)),F-DOLL_FY)};
 /* a wanted poster on a post */
 g.fillStyle='#4a2e1a';g.fillRect(17,44,3,34);g.fillStyle='#e0cc98';g.fillRect(9,40,19,24);g.fillStyle='#8a2a1a';g.fillRect(11,42,15,3);g.fillStyle='#a08a60';g.fillRect(13,47,11,10);g.fillStyle='#6a4a30';g.fillRect(16,49,5,5);g.fillRect(15,54,7,3);g.fillStyle='#8a2a1a';g.fillRect(12,59,13,2);
 put(C[2],'ready',112,true);put(C[1],'ready',56,false);put(C[0],'ready',84,false);
 /* Lift's eyes catch the moon */
 return c.toDataURL('image/png')})()
"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':640,'height':360})
        await pg.goto('http://127.0.0.1:8792/nightsteel.html#sstest');await pg.wait_for_timeout(800)
        d=await pg.evaluate(JS);open(sys.argv[1],'wb').write(base64.b64decode(d.split(',')[1]));await b.close()
asyncio.run(main())
