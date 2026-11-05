/* 404 crew: keyed forward loop, with animated WebP for Safari's VP9-alpha gap. */
(() => {
  const page = document.querySelector('.lost-page');
  if (!page) return;
  const CC = window.CC;
  const crew = page.querySelector('.lost-crew');
  const video = page.querySelector('[data-lost-video]');
  const poster = crew.querySelector('.lost-poster');
  const still = poster.getAttribute('src');
  const animated = crew.dataset.animated;
  const safari = /Safari/.test(navigator.userAgent) && !/Chrome|Chromium|CriOS|Edg|Android/.test(navigator.userAgent);
  let useWebp = safari && !!animated;
  let revealed = CC.revealed;
  let visible = true;
  const webp = (playing) => {
    const src = playing ? animated : still;
    if (src && poster.getAttribute('src') !== src) poster.src = src;
    crew.classList.toggle('has-webp', playing);
    crew.classList.remove('has-video');
  };
  const sync = () => {
    const stopped = CC.reduced || CC.motion.paused || document.hidden || !visible || !revealed;
    page.classList.toggle('is-paused', stopped);
    if (useWebp) {
      if (video) video.pause();
      webp(!stopped);
      return;
    }
    if (!video) return;
    if (stopped) video.pause();
    else video.play().catch(fallback);
  };
  const fallback = () => {
    crew.classList.remove('has-video');
    if (animated) { useWebp = true; sync(); }
  };
  if (video) {
    video.addEventListener('playing', () => crew.classList.add('has-video'));
    video.addEventListener('error', fallback);
  }
  CC.motion.on(sync);
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(crew);
  CC.onReveal(() => { revealed = true; sync(); });
  sync();
  let reset;
  page.querySelector('.lost-signal').addEventListener('click', () => {
    clearTimeout(reset);
    page.classList.remove('is-signalling');
    requestAnimationFrame(() => page.classList.add('is-signalling'));
    page.querySelector('.lost-reply').textContent = 'Signal received. Home is one click away.';
    CC.sfx('success');
    reset = setTimeout(() => page.classList.remove('is-signalling'), 1500);
  });
})();
