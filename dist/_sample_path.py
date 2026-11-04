from pathlib import Path
import re
import math

html = Path("index.html").read_text(encoding="utf-8", errors="replace")
m = re.search(r'class="draw-path"[^>]*\sd="([^"]+)"', html)
if not m:
    m = re.search(r'd="([^"]+)"[^>]*class="draw-path"', html)
d = m.group(1)
tokens = re.findall(r"[MC]|-?\d*\.?\d+(?:e[-+]?\d+)?", d, flags=re.I)
points = []
i = 0
cx = cy = 0
while i < len(tokens):
    t = tokens[i]
    if t in ("M", "m"):
        i += 1
        x = float(tokens[i]); y = float(tokens[i+1]); i += 2
        cx, cy = x, y
        points.append((cx, cy))
    elif t in ("C", "c"):
        i += 1
        vals = [float(tokens[i+j]) for j in range(6)]
        i += 6
        x1,y1,x2,y2,x,y = vals
        p0=(cx,cy); p1=(x1,y1); p2=(x2,y2); p3=(x,y)
        for s in range(1, 25):
            u=s/24; mu=1-u
            bx=mu**3*p0[0]+3*mu**2*u*p1[0]+3*mu*u**2*p2[0]+u**3*p3[0]
            by=mu**3*p0[1]+3*mu**2*u*p1[1]+3*mu*u**2*p2[1]+u**3*p3[1]
            points.append((bx,by))
        cx,cy=x,y
    else:
        i += 1

lens=[0.0]
for a,b in zip(points,points[1:]):
    lens.append(lens[-1]+math.hypot(b[0]-a[0],b[1]-a[1]))
total=lens[-1]
W,H=1616.0,2187.0

def at_frac(f):
    target=f*total
    j=0
    while j<len(lens)-1 and lens[j+1]<target:
        j+=1
    return points[j]

# print denser samples for visual docking decisions
for pct in range(0,101,2):
    x,y=at_frac(pct/100)
    print(f"{pct:3d}%  x={x/W*100:5.1f}%  y={y/H*100:5.1f}%")
