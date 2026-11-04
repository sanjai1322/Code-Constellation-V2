from pathlib import Path

css_path = Path("style.css")
css = css_path.read_text(encoding="utf-8", errors="replace")

# Drop icon opacity lock so GSAP can fade stops in
css = css.replace(
    "  display:inline-flex !important;\n  opacity:1 !important;\n}",
    "  display:inline-flex !important;\n}",
)

marker = "/* ===== FINAL journey dock + scroll-draw ===== */"
if marker in css:
    css = css[: css.index(marker)]

final = r"""
/* ===== FINAL journey dock + scroll-draw ===== */
#services .service-path .path-ghost{
  stroke:#c9caee !important;
  stroke-width:16 !important;
  opacity:.42 !important;
}
#services .service-path .draw-path{
  stroke:#2b45d8 !important;
  stroke-width:16 !important;
  opacity:1 !important;
  stroke-linecap:round !important;
  stroke-linejoin:round !important;
  stroke-dasharray:1;
  stroke-dashoffset:1;
}

#services .service-journey{
  position:relative !important;
  height:clamp(1600px, 145vw, 2100px) !important;
  overflow:visible !important;
}

#services .service-stop{
  position:absolute !important;
  z-index:2 !important;
  width:max-content !important;
  max-width:min(520px, 48vw) !important;
  margin:0 !important;
  padding:0 !important;
  /* center title/icon on the path point */
  transform:translate(-50%, -42%) !important;
}

/* Docked to real path bends (viewBox 1616x2187 samples) */
#services .stop-1{ left:76.5% !important; top:6.5% !important; }
#services .stop-2{ left:33% !important; top:20% !important; }
#services .stop-3{ left:51.5% !important; top:33.5% !important; }
#services .stop-4{ left:84% !important; top:48% !important; }
#services .stop-5{ left:42% !important; top:63% !important; }
#services .stop-6{ left:68% !important; top:74% !important; }
#services .stop-7{ left:26% !important; top:90% !important; }

#services .service-title{
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  gap:8px !important;
  flex-wrap:nowrap !important;
}
#services .service-title h3{
  font-size:clamp(24px, 3.6vw, 52px) !important;
  font-weight:500 !important;
  text-transform:uppercase !important;
  color:#2b45d8 !important;
  letter-spacing:-.04em !important;
  line-height:.95 !important;
  white-space:nowrap !important;
  margin:0 !important;
}
#services .service-icon{
  width:clamp(56px, 7vw, 96px) !important;
  height:clamp(56px, 7vw, 96px) !important;
  flex:0 0 clamp(56px, 7vw, 96px) !important;
  display:inline-flex !important;
}

#services .service-bubble,
#services .service-stop > p{
  display:block !important;
  width:max-content !important;
  max-width:min(240px, 72vw) !important;
  background:#f7f8ff !important;
  color:#2b45d8 !important;
  border:1px solid #2b45d8 !important;
  border-radius:999px !important;
  padding:10px 16px !important;
  font-size:12px !important;
  line-height:1.35 !important;
  margin:12px auto 0 !important;
  box-shadow:none !important;
  text-align:center !important;
}
#services .stop-1 .service-bubble,
#services .stop-3 .service-bubble,
#services .stop-5 .service-bubble,
#services .stop-7 .service-bubble{
  transform:rotate(-5deg) !important;
}
#services .stop-2 .service-bubble,
#services .stop-4 .service-bubble,
#services .stop-6 .service-bubble{
  transform:rotate(4deg) !important;
}

@media(max-width:900px){
  #services .service-journey{ height:1750px !important; }
  #services .service-stop{
    max-width:88vw !important;
    left:50% !important;
    transform:translate(-50%, -30%) !important;
  }
  #services .stop-1{ top:4% !important; }
  #services .stop-2{ top:17% !important; }
  #services .stop-3{ top:31% !important; }
  #services .stop-4{ top:45% !important; }
  #services .stop-5{ top:59% !important; }
  #services .stop-6{ top:73% !important; }
  #services .stop-7{ top:88% !important; }
  #services .service-path .path-ghost,
  #services .service-path .draw-path{ stroke-width:12 !important; }
}
@media(max-width:600px){
  #services .service-journey{ height:1550px !important; }
  #services .service-title h3{ font-size:clamp(20px, 6.5vw, 28px) !important; }
  #services .service-icon{
    width:44px !important;
    height:44px !important;
    flex-basis:44px !important;
  }
  #services .service-bubble,
  #services .service-stop > p{
    font-size:11px !important;
    max-width:78vw !important;
  }
}
"""

css_path.write_text(css.rstrip() + "\n" + final, encoding="utf-8")
print("patched css, len", css_path.stat().st_size)
