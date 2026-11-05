/* 404 crew: keyed forward loop, with animated WebP for Safari's VP9-alpha gap. */
(() => {
  const page = document.querySelector('.lost-page');
  if (!page) return;
  const CC = window.CC;
  page.querySelectorAll('[data-character]').forEach(crew => {
  // Discourage casual saving on the decorative artwork only. This does not
  // make public browser-delivered assets inaccessible through developer tools.
  crew.addEventListener('contextmenu', event => event.preventDefault());
  crew.addEventListener('dragstart', event => event.preventDefault());
  const video = crew.querySelector('[data-lost-video]');
  const poster = crew.querySelector('.lost-poster');
  const still = poster.getAttribute('src');
  const animated = crew.dataset.animated;
  const safari = /Safari/.test(navigator.userAgent) && !/Chrome|Chromium|CriOS|Edg|Android/.test(navigator.userAgent);
  let useWebp = safari;
  let inView = true;
  let ready = CC.revealed;
  const sync = () => {
    const stopped = CC.reduced || CC.motion.paused || document.hidden || !inView || !ready;
    page.classList.toggle('is-paused', CC.reduced || CC.motion.paused || document.hidden);
    if (useWebp) {
      video.pause();
      crew.classList.remove('has-video');
      const src = stopped ? still : animated;
      if (poster.getAttribute('src') !== src) poster.src = src;
      return;
    }
    if (stopped) video.pause();
    else video.play().catch(() => { useWebp = true; sync(); });
  };
  video.addEventListener('playing', () => crew.classList.add('has-video'));
  video.addEventListener('error', () => { useWebp = true; sync(); });
  CC.motion.on(sync);
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(crew);
  CC.onReveal(() => { ready = true; sync(); });
  sync();
  });
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
