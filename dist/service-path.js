(() => {
 const journey=document.querySelector('.service-journey');
 if(!journey)return;
 let frame=0;
 function rebuild(){
  const svg=journey.querySelector('.service-path'),path=svg.querySelector('.draw-path'),ghost=svg.querySelector('.path-ghost');
  if(window.ScrollTrigger) ScrollTrigger.getAll().filter(t=>t.trigger===journey).forEach(t=>t.kill());
  if(window.gsap)gsap.killTweensOf(path);
  const box=journey.getBoundingClientRect();
  svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
  svg.setAttribute('preserveAspectRatio','none');
  const points=[...journey.querySelectorAll('.service-icon')].map(el=>{const r=el.getBoundingClientRect();return {x:r.left-box.left+r.width/2,y:r.top-box.top+r.height/2};});
  let d=`M ${box.width*.95} 0`;
  let prev={x:box.width*.95,y:0};
  for(const p of [...points,{x:box.width*.1,y:box.height}]){
   const mid=(prev.y+p.y)/2;
   d+=` C ${prev.x} ${mid}, ${p.x} ${mid}, ${p.x} ${p.y}`;prev=p;
  }
  path.setAttribute('d',d);ghost.setAttribute('d',d);path.setAttribute('pathLength','1');
  const dot=svg.querySelector('circle');
  function draw(){
   frame=0;
   const target=Math.max(0,Math.min(box.height,innerHeight*.65-journey.getBoundingClientRect().top));
   const len=path.getTotalLength();let a=0,b=len;
   for(let i=0;i<18;i++){const m=(a+b)/2;if(path.getPointAtLength(m).y<target)a=m;else b=m;}
   const progress=matchMedia('(prefers-reduced-motion:reduce)').matches?1:b/len;
   path.style.setProperty('stroke-dasharray','1','important');path.style.setProperty('stroke-dashoffset',String(1-progress),'important');
   if(dot){const p=path.getPointAtLength(progress*len);dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);}
  }
  journey._draw=draw;draw();
 }
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(()=>journey._draw?.());},{passive:true});
 let timer;addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(rebuild,150);});
 addEventListener('load',rebuild);document.fonts.ready.then(rebuild);
})();
