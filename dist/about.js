if(window.gsap&&window.ScrollTrigger&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
 gsap.registerPlugin(ScrollTrigger);
 const intro=gsap.timeline({defaults:{ease:'power3.out'}});
 intro.from('.studio-hero h1 span',{y:100,opacity:0,duration:1,stagger:.15}).from('.studio-sticker',{scale:.5,opacity:0,duration:.6,stagger:.1,ease:'back.out(2)'},.4).from('.studio-intro',{y:50,opacity:0,duration:.8},.5);
 gsap.to('.story-symbol',{rotation:100,ease:'none',scrollTrigger:{trigger:'.studio-story',start:'top bottom',end:'center top',scrub:1}});
 gsap.utils.toArray('.story-row>div:not(.story-symbol),.section-heading,.team-card').forEach(el=>gsap.from(el,{y:60,opacity:0,duration:.9,scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
 const track=document.querySelector('.gallery-track');[...track.children].forEach(el=>{const clone=el.cloneNode(true);clone.setAttribute('aria-hidden','true');track.append(clone)});
 const gallery=gsap.to(track,{x:()=>-(track.scrollWidth+18)/2,duration:30,repeat:-1,ease:'none'});
 const button=document.querySelector('.gallery-pause');button.addEventListener('click',()=>{const paused=!gallery.paused();gallery.paused(paused);button.textContent=paused?'Resume gallery':'Pause gallery';button.setAttribute('aria-pressed',String(paused));});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)gallery.pause();else if(button.getAttribute('aria-pressed')==='false')gallery.play();});
 gsap.from('.capability-cloud a',{y:25,opacity:0,scale:.9,stagger:.035,duration:.5,scrollTrigger:{trigger:'.capability-cloud',start:'top 90%',once:true}});
 document.fonts.ready.then(()=>ScrollTrigger.refresh());
}else{document.querySelector('.gallery-pause').hidden=true;}
