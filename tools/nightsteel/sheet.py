import json,sys
from PIL import Image,ImageDraw
# sheet.py in.json out.png scale cols [bg]
d=json.load(open(sys.argv[1]));S=int(sys.argv[3]);cols=int(sys.argv[4]);bg=sys.argv[5] if len(sys.argv)>5 else '#2a3060'
def hx(c):return tuple(int(c[i:i+2],16) for i in (1,3,5))
W=max(x['w'] for x in d)*S+6;H=max(x['h'] for x in d)*S+16;rows=(len(d)+cols-1)//cols
im=Image.new('RGB',(cols*W,rows*H),hx(bg));dr=ImageDraw.Draw(im)
for k,it in enumerate(d):
  ox=(k%cols)*W+3;oy=(k//cols)*H+3
  for i,c in enumerate(it['d']):
    if c is None:continue
    x,y=i%it['w'],i//it['w'];dr.rectangle([ox+x*S,oy+y*S,ox+x*S+S-1,oy+y*S+S-1],fill=hx(c))
  dr.text((ox,oy+it['h']*S),it['n'][:18],fill=(255,255,255))
im.save(sys.argv[2])
