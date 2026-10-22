"""Draws the ZigaPlay home-screen icon (a little grey console on a navy desk) at 512, 192 and 180 px."""
import sys
from PIL import Image, ImageDraw
out=sys.argv[1] if len(sys.argv)>1 else '.'
S=1024
im=Image.new('RGB',(S,S),'#121a33');d=ImageDraw.Draw(im)
for i in range(S):  # soft glow from the top
  t=i/S;c=(int(0x24*(1-t)+0x0d*t),int(0x30*(1-t)+0x12*t),int(0x66*(1-t)+0x22*t));d.line([(0,i),(S,i)],fill=c)
# console body
bx0,by0,bx1,by1=232,96,792,944
d.rounded_rectangle([bx0+14,by0+20,bx1+14,by1+20],radius=70,fill='#070a14')
d.rounded_rectangle([bx0,by0,bx1,by1],radius=70,fill='#c9cad6')
d.rounded_rectangle([bx0,by0,bx1,by1-40],radius=70,fill='#d6d7e2')
d.rectangle([bx0,by0+70,bx1,by1-120],fill='#d6d7e2')
# screen bezel and LCD
d.rounded_rectangle([286,160,738,520],radius=30,fill='#4b4d66')
d.rounded_rectangle([340,200,684,480],radius=8,fill='#9bbc0f')
# pixel art on the LCD: a big Z
px=24;Z=["#########","#########","      ###","     ### ","    ###  ","   ###   ","  ###    "," ###     ","#########","#########"]
ox,oy=512-len(Z[0])*px//2,340-len(Z)*px//2
for r,row in enumerate(Z):
  for c,ch in enumerate(row):
    if ch=='#':d.rectangle([ox+c*px,oy+r*px,ox+c*px+px-1,oy+r*px+px-1],fill='#0f380f')
d.ellipse([300,208,320,228],fill='#e0364f')
# d-pad
cx,cy,w,l=380,700,52,150
d.rounded_rectangle([cx-l//2,cy-w//2,cx+l//2,cy+w//2],radius=10,fill='#22232e')
d.rounded_rectangle([cx-w//2,cy-l//2,cx+w//2,cy+l//2],radius=10,fill='#22232e')
# A and B
for (x,y) in [(600,735),(690,680)]:
  d.ellipse([x-44,y-44+6,x+44,y+44+6],fill='#6b1530');d.ellipse([x-44,y-44,x+44,y+44],fill='#b8285a')
# start/select pills
for x in (452,560):d.rounded_rectangle([x-40,840,x+40,862],radius=11,fill='#8a8ca0')
for n,sz in [('icon-512.png',512),('icon-192.png',192),('apple-touch-icon.png',180)]:
  im.resize((sz,sz),Image.LANCZOS).save(f'{out}/{n}',optimize=True)
print('icons written to',out)
