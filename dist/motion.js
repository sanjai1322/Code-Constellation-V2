/* Reference audit: reveal loader, masked hero, curved ribbon, pinned intro,
   velocity marquee, masked project cards, drawn services, deck, FAQ, elastic footer. */
if(window.gsap && window.ScrollTrigger){
 gsap.registerPlugin(ScrollTrigger);
 const mm=gsap.matchMedia();
 mm.add({desktop:'(min-width: 701px)',mobile:'(max-width: 700px)',reduced:'(prefers-reduced-motion: reduce)'},context=>{
  if(context.conditions.reduced)return;
  const desktop=context.conditions.desktop,cleanups=[];
  let lenis;
  if(window.Lenis){lenis=new Lenis({duration:1.25,smoothWheel:true,syncTouch:false,wheelMultiplier:.9,prevent:node=>!!node.closest('dialog')});lenis.on('scroll',ScrollTrigger.update);const tick=time=>lenis.raf(time*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);cleanups.push(()=>{gsap.ticker.remove(tick);lenis.destroy();});const anchor=e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const href=a.getAttribute('href');const target=href==='#'?0:document.querySelector(href);if(target===null)return;e.preventDefault();lenis.scrollTo(target,{offset:href==='#'?0:-(desktop?90:120),duration:1.2});history.replaceState(null,'',href);};document.addEventListener('click',anchor);cleanups.push(()=>document.removeEventListener('click',anchor));const observer=new MutationObserver(()=>{if(document.body.classList.contains('modal-open'))lenis.stop();else lenis.start();});observer.observe(document.body,{attributes:true,attributeFilter:['class']});cleanups.push(()=>observer.disconnect());}
  const loader=document.querySelector('.site-loader');
  const seen=sessionStorage.getItem('cc-intro-seen');
  const intro=gsap.timeline({defaults:{ease:'power3.out'}});
  if(!seen){loader.hidden=false;intro.from(loader.querySelector('img'),{scale:.7,opacity:0,duration:.45}).from(loader.querySelector('span'),{y:20,opacity:0,duration:.4},.2).to(loader,{yPercent:-100,duration:.7,ease:'power3.inOut',onComplete:()=>{loader.hidden=true;}},.65);sessionStorage.setItem('cc-intro-seen','true');}
  intro.from('.hero-type>.eyebrow',{opacity:0,y:15,duration:.5},seen?0:1)
   .from('.line-mask>span',{yPercent:115,opacity:0,stagger:.12,duration:.95,ease:'back.out(1.25)'},seen?.1:1.05)
   .from('.sticker',{scale:.4,opacity:0,y:20,stagger:.15,duration:.7,ease:'back.out(2.1)'},seen?.4:1.4)
   .from('.mascot-scene',{opacity:0,y:60,duration:1},seen?.35:1.35);
  const hero=gsap.timeline({scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.8},defaults:{ease:'none'}});
  hero.to('.hero-type',{y:-60},0).to('.mascot-coder',{x:desktop?-110:-18,rotation:-7,y:25},0).to('.mascot-designer',{x:desktop?110:18,rotation:7,y:-12},0).to('.companion',{y:-80,rotation:-9,scale:1.15},0);
  gsap.fromTo('.ribbon textPath',{attr:{startOffset:'0%'}},{attr:{startOffset:'-20%'},ease:'none',scrollTrigger:{trigger:'.ribbon',start:'top bottom',end:'bottom top',scrub:.6}});
  const copy=document.querySelector('.about-copy'),original=copy.textContent;
  copy.setAttribute('aria-label',original);copy.replaceChildren(...original.split(' ').flatMap((word,i)=>{const w=document.createElement('span');w.className='word';w.setAttribute('aria-hidden','true');for(const c of word){const ch=document.createElement('span');ch.className='about-char';ch.textContent=c;w.append(ch);}return i?[document.createTextNode(' '),w]:[w];}));
  const chars=copy.querySelectorAll('.about-char');
  const about=gsap.timeline({scrollTrigger:{trigger:'.about',start:desktop?'top 85px':'top 114px',end:desktop?'+=1800':'+=900',pin:true,scrub:.6,anticipatePin:1,invalidateOnRefresh:true}});
  gsap.set(chars,{color:'#adb4e9'});
  chars.forEach((char,i)=>{const t=i/chars.length*8;about.to(char,{color:'#2f6bff',scale:1.1,rotation:(i%3-1)*3,duration:.3},t).to(char,{color:'#0a1033',scale:1,rotation:0,duration:.4},t+.3);});
  about.from('.values span',{scale:.6,opacity:0,y:20,stagger:1.8,duration:.65,ease:'back.out(2)'},3.1);
  const track=document.querySelector('.showcase-track'),originalSlides=[...track.children];
  for(let i=0;i<2;i++)originalSlides.forEach(slide=>{const clone=slide.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.classList.add('show-clone');track.append(clone);});
  let width=0,x=0,direction=-1,speed=1,paused=false,inView=false;
  const measure=()=>{width=track.children[originalSlides.length].offsetLeft-track.children[0].offsetLeft;};measure();window.addEventListener('resize',measure);cleanups.push(()=>window.removeEventListener('resize',measure));
  ScrollTrigger.create({trigger:'.showcase',start:'top bottom',end:'bottom top',onToggle:s=>{inView=s.isActive;},onUpdate:s=>{direction=-s.direction;speed=Math.min(8,1+Math.abs(s.getVelocity())/600);}});
  const marqueeTick=(time,delta)=>{if(paused||!inView||!width)return;speed+=(1-speed)*.035;x+=direction*speed*.06*Math.min(delta,50);x=((x%width)-width)%width;gsap.set(track,{x});};gsap.ticker.add(marqueeTick);cleanups.push(()=>gsap.ticker.remove(marqueeTick));
  const pauseButton=document.querySelector('.marquee-toggle');const pause=()=>{paused=!paused;pauseButton.textContent=paused?'Resume motion':'Pause motion';pauseButton.setAttribute('aria-pressed',String(paused));};pauseButton.addEventListener('click',pause);cleanups.push(()=>pauseButton.removeEventListener('click',pause));
  gsap.utils.toArray('.section-heading,.work-end h3,.faq h2').forEach(el=>gsap.from(el,{y:45,opacity:0,duration:1,ease:'back.out(1.2)',scrollTrigger:{trigger:el,start:'top 93%',once:true}}));
  gsap.utils.toArray('.project').forEach((project,index)=>{const art=project.querySelector('.project-art');gsap.fromTo(art,{clipPath:'inset(42.5% 42.5% 42.5% 42.5% round 36px)',scale:1.08,rotationX:12,rotationY:index%2?8:-8},{clipPath:'inset(0% 0% 0% 0% round 16px)',scale:1,rotationX:0,rotationY:0,duration:1.1,ease:'power3.out',scrollTrigger:{trigger:project,start:'top 88%',toggleActions:'play none none reverse'}});});
  gsap.from('.end-pills span',{scale:.4,opacity:0,y:20,stagger:.15,duration:.7,ease:'back.out(2)',scrollTrigger:{trigger:'.work-end',start:'top 80%',once:true}});
  gsap.fromTo('.draw-path',{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'.service-journey',start:'top 65%',end:'bottom 65%',scrub:1.1}});
  gsap.utils.toArray('.service-stop').forEach(stop=>{const tl=gsap.timeline({scrollTrigger:{trigger:stop,start:'top 80%',end:'center 55%',scrub:.6}});tl.from(stop.querySelector('.service-icon'),{scale:0,opacity:0,rotation:-45,duration:1,ease:'back.out(2.5)'},0).from(stop.querySelector('p'),{scale:.6,opacity:0,rotation:0,duration:1,ease:'back.out(2)'},.1);});
  gsap.from('.proof-deck',{y:70,opacity:0,rotation:-5,duration:1,ease:'power3.out',scrollTrigger:{trigger:'.proof-stage',start:'top 80%',once:true}});
  gsap.from('.faq-companion',{y:80,rotation:15,opacity:0,duration:1,ease:'back.out(1.4)',scrollTrigger:{trigger:'.faq',start:'top 85%',once:true}});
  gsap.utils.toArray('.questions details').forEach(el=>gsap.from(el,{y:25,opacity:0,duration:.65,scrollTrigger:{trigger:el,start:'top 96%',once:true}}));
  gsap.from('.footer-cta',{y:70,opacity:0,duration:1,ease:'back.out(1.3)',scrollTrigger:{trigger:'footer',start:'top 85%',once:true}});
  gsap.fromTo('.footer-wordmark',{scaleY:.18},{scaleY:1,ease:'elastic.out(1,.5)',scrollTrigger:{trigger:'.footer-wordmark',start:'top bottom',end:'bottom bottom',scrub:.8}});
  if(desktop){document.querySelectorAll('.section-heading h2').forEach(h=>{h.classList.add('heading-echo');const move=e=>{const r=h.getBoundingClientRect();h.style.setProperty('--hx',`${(e.clientX-r.left-r.width/2)/r.width*6}px`);h.style.setProperty('--hy',`${(e.clientY-r.top-r.height/2)/r.height*6}px`);};const leave=()=>{h.style.setProperty('--hx','0px');h.style.setProperty('--hy','0px');};h.addEventListener('pointermove',move);h.addEventListener('pointerleave',leave);cleanups.push(()=>{h.removeEventListener('pointermove',move);h.removeEventListener('pointerleave',leave);});});
   document.querySelectorAll('.talk').forEach(button=>{let center;const enter=()=>{const r=button.getBoundingClientRect();center={x:r.left+r.width/2,y:r.top+r.height/2};};const move=e=>{if(center)gsap.to(button,{x:(e.clientX-center.x)*.18,y:(e.clientY-center.y)*.18,duration:.3,overwrite:'auto'});};const leave=()=>gsap.to(button,{x:0,y:0,duration:.7,ease:'elastic.out(1,.4)',overwrite:'auto'});button.addEventListener('pointerenter',enter);button.addEventListener('pointermove',move);button.addEventListener('pointerleave',leave);cleanups.push(()=>{button.removeEventListener('pointerenter',enter);button.removeEventListener('pointermove',move);button.removeEventListener('pointerleave',leave);});});
  }
  return()=>{cleanups.forEach(fn=>fn());copy.textContent=original;copy.removeAttribute('aria-label');track.querySelectorAll('.show-clone').forEach(el=>el.remove());loader.hidden=true;};
 });
 document.querySelectorAll('.questions details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open&&!matchMedia('(prefers-reduced-motion: reduce)').matches)gsap.fromTo(item.querySelector('p'),{opacity:0,y:8},{opacity:1,y:0,duration:.35});ScrollTrigger.refresh();}));
 document.fonts.ready.then(()=>ScrollTrigger.refresh());window.addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
}
