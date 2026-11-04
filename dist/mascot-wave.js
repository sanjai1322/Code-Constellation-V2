(() => {
  const host = document.querySelector('.companion-animated');
  const wave = host?.querySelector('.mascot-wave');
  const hello = host?.querySelector('.mascot-hello');
  if (!host || !wave || !hello) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let display = wave;

  if (reduced.matches && display instanceof HTMLImageElement) {
    display.src = 'assets/mascot-wave-poster.png';
  }

  hello.addEventListener('click', () => {
    if (!reduced.matches && display instanceof HTMLImageElement) {
      const restart = display.cloneNode(true);
      display.replaceWith(restart);
      display = restart;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance('Hi!');
      speech.lang = 'en-IN';
      speech.pitch = 1.35;
      speech.rate = 0.85;
      speech.volume = 0.7;
      speechSynthesis.speak(speech);
    }
  });
})();
