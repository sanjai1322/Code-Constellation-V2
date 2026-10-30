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
