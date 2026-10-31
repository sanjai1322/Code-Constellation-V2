// Scalable service illustrations animate only while they are on screen.
const serviceObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.target.classList.toggle('is-active', entry.isIntersecting));
}, { threshold: .2 });
document.querySelectorAll('.service-stop').forEach(stop => serviceObserver.observe(stop));

// Sound is opt-in on every visit. All tones are synthesized locally.
const soundButton = document.querySelector('.sound-toggle');
let audioContext, master, ambient, enabled = false, lastSound = 0;
const audioNodes = [];
function createSoundscape() {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return false;
  audioContext = new AudioEngine();
  master = audioContext.createGain();
  master.gain.value = 0;
  master.connect(audioContext.destination);
  ambient = audioContext.createGain();
  ambient.gain.value = .11;
  ambient.connect(master);
  [110, 165, 220.4].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const voice = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    voice.gain.value = .055 / (index + 1);
    oscillator.connect(voice).connect(ambient);
    const lfo = audioContext.createOscillator();
    const depth = audioContext.createGain();
    lfo.frequency.value = .07 + index * .025;
    depth.gain.value = .008;
    lfo.connect(depth).connect(voice.gain);
    oscillator.start();
    lfo.start();
    audioNodes.push(oscillator, lfo);
  });
  return true;
}
function chime(frequency = 660, duration = .22, volume = .055) {
  if (!enabled || !audioContext || audioContext.state !== 'running') return;
  const now = audioContext.currentTime;
  if (now - lastSound < .12) return;
  lastSound = now;
  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.25, now + duration * .7);
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(volume, now + .012);
  envelope.gain.exponentialRampToValueAtTime(.0001, now + duration);
  oscillator.connect(envelope).connect(master);
  oscillator.start(now);
  oscillator.stop(now + duration + .02);
  oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
}
soundButton.addEventListener('click', async () => {
  try {
    if (!audioContext && !createSoundscape()) throw new Error('Audio unavailable');
    await audioContext.resume();
    enabled = !enabled;
    master.gain.cancelScheduledValues(audioContext.currentTime);
    master.gain.setTargetAtTime(enabled ? .65 : 0, audioContext.currentTime, .18);
    soundButton.setAttribute('aria-pressed', String(enabled));
    soundButton.setAttribute('aria-label', enabled ? 'Mute space ambience and interface sounds' : 'Enable space ambience and interface sounds');
    soundButton.querySelector('span').textContent = enabled ? 'Sound on' : 'Sound off';
    if (enabled) chime(523.25, .55, .07);
  } catch {
    enabled = false;
    soundButton.setAttribute('aria-pressed', 'false');
    soundButton.querySelector('span').textContent = 'Sound unavailable';
  }
});
document.addEventListener('pointerdown', event => {
  if (event.target.closest('.sound-toggle')) return;
  if (event.target.closest('button, summary, a')) chime(523.25, .2, .05);
});
document.querySelectorAll('.service-stop').forEach((stop, index) => {
  stop.addEventListener('pointerenter', () => chime([523.25, 587.33, 659.25, 783.99, 880, 987.77, 1046.5][index], .35, .025));
});
document.addEventListener('visibilitychange', () => {
  if (!audioContext) return;
  if (document.hidden) audioContext.suspend();
  else if (enabled) audioContext.resume();
});
window.addEventListener('pagehide', () => {
  audioNodes.forEach(node => { try { node.stop(); } catch {} });
  if (audioContext) audioContext.close();
}, { once: true });
if(matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches){
 const cursor=document.createElement('span');cursor.className='orbital-cursor';cursor.setAttribute('aria-hidden','true');cursor.textContent='↓';document.body.append(cursor);
 const deck=document.querySelector('.proof-deck');let direction=1;
 deck.addEventListener('pointermove',e=>{const r=deck.getBoundingClientRect();direction=e.clientY<r.top+r.height/2?-1:1;cursor.textContent=direction===1?'↓':'↑';cursor.style.transform=`translate(${e.clientX-32}px,${e.clientY-32}px)`;cursor.classList.add('visible');});
 deck.addEventListener('pointerleave',()=>cursor.classList.remove('visible'));
 deck.addEventListener('click',()=>moveProof(direction));
}

// Local letter response mirrors the reference's playful typographic hover.
if(window.gsap && matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches){
 document.querySelectorAll('.section-heading h2,.work-end h3').forEach(heading=>{
  const label=heading.innerText.trim();heading.setAttribute('aria-label',label);
  heading.replaceChildren(...label.split(/\s+/).flatMap((word,index)=>{
   const wrapper=document.createElement('span');wrapper.className='heading-word';wrapper.setAttribute('aria-hidden','true');
   [...word].forEach(letter=>{const span=document.createElement('span');span.className='hover-letter';span.textContent=letter;wrapper.append(span);});
   return index?[document.createTextNode(' '),wrapper]:[wrapper];
  }));
  const letters=[...heading.querySelectorAll('.hover-letter')];let positions=[];
  heading.addEventListener('pointerenter',()=>{positions=letters.map(el=>{const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});});
  heading.addEventListener('pointermove',event=>letters.forEach((el,i)=>{const p=positions[i];if(!p)return;const force=Math.max(0,1-Math.hypot(event.clientX-p.x,event.clientY-p.y)/130);gsap.to(el,{y:-force*18,rotation:(event.clientX-p.x)*force*.12,scaleY:1+force*.12,duration:.3,overwrite:true});}));
  heading.addEventListener('pointerleave',()=>gsap.to(letters,{y:0,rotation:0,scaleY:1,duration:.8,ease:'elastic.out(1,.35)',stagger:.008,overwrite:true}));
 });
}

