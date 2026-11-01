(() => {
 if(!window.gsap||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const svgNS='http://www.w3.org/2000/svg';
 function pathLayer(viewBox,pathData,color){const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox',viewBox);svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');svg.innerHTML=`<path d="${pathData}" fill="none" stroke="${color}" stroke-width="0" stroke-linecap="round" stroke-linejoin="round"/>`;return svg;}
 document.querySelectorAll('header nav .pill').forEach(link=>{
  const label=document.createElement('span');label.textContent=link.textContent;link.replaceChildren(label);
  const svg=pathLayer('0 0 150 60','M-10 36C15 5 32 57 58 27S98 52 120 22 155 39 170 25','#c9caee');svg.classList.add('nav-brush');link.prepend(svg);
  const path=svg.querySelector('path'),length=path.getTotalLength();gsap.set(path,{strokeDasharray:length,strokeDashoffset:length});
  const tl=gsap.timeline({paused:true}).to(path,{strokeDashoffset:0,strokeWidth:65,duration:.5,ease:'power1.inOut'});
  link.addEventListener('pointerenter',()=>tl.timeScale(1).play());link.addEventListener('pointerleave',()=>tl.timeScale(1.4).reverse());link.addEventListener('focus',()=>tl.play());link.addEventListener('blur',()=>tl.reverse());
 });
 document.querySelectorAll('.project').forEach((card,index)=>{
  const art=card.querySelector('.generated-cover'),base=art?.querySelector('img');if(!art||!base)return;
  const d='M-100 520C260 690 720 560 430 390S-50 260 280 200 900 140 650 -90';
  const brush=pathLayer('0 0 700 500',d,'#8a90ee');brush.classList.add('project-brush');art.append(brush);
  const mask=pathLayer('0 0 700 500',d,'white');mask.classList.add('project-reveal');
  mask.innerHTML=`<defs><mask id="cc-project-${index}" maskUnits="userSpaceOnUse" x="-100" y="-100" width="900" height="700"><path d="${d}" fill="none" stroke="white" stroke-width="0" stroke-linecap="round"/></mask></defs><image href="${base.getAttribute('src')}" x="-45" y="-30" width="790" height="560" preserveAspectRatio="xMidYMid slice" mask="url(#cc-project-${index})"/>`;
  art.append(mask);
  const paths=[brush.querySelector('path'),mask.querySelector('path')];paths.forEach(p=>{const n=p.getTotalLength();gsap.set(p,{strokeDasharray:n,strokeDashoffset:n});});
  const caption=card.querySelector('.project-caption>span');const arrow=document.createElement('i');arrow.className='project-spring-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');caption.textContent=caption.textContent.replace('↗','');caption.append(arrow);
  const tl=gsap.timeline({paused:true}).to(paths[0],{strokeDashoffset:0,strokeWidth:800,duration:.95,ease:'power1.inOut'},0).to(paths[1],{strokeDashoffset:0,strokeWidth:800,duration:1.05,ease:'power1.inOut'},.35).to(arrow,{rotation:-45,duration:.28,ease:'power2.out'},0).to(arrow,{rotation:0,duration:.65,ease:'elastic.out(1.15,.35)'},.28);
  card.addEventListener('pointerenter',()=>tl.timeScale(1).play());card.addEventListener('pointerleave',()=>tl.timeScale(1.3).reverse());card.addEventListener('focus',()=>tl.play());card.addEventListener('blur',()=>tl.reverse());
 });
 const path=document.querySelector('.service-path .draw-path');
 if(path&&window.ScrollTrigger){const svg=path.ownerSVGElement;const dot=document.createElementNS(svgNS,'circle');dot.setAttribute('r','10');dot.setAttribute('fill','#2f6bff');dot.setAttribute('stroke','#0a1033');dot.setAttribute('stroke-width','2');svg.append(dot);const length=path.getTotalLength();ScrollTrigger.create({trigger:'.service-journey',start:'top 65%',end:'bottom 65%',scrub:1.1,onUpdate:self=>{const p=path.getPointAtLength(length*self.progress);dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);}});}
})();
