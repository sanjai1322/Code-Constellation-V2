(() => {
  const section = document.querySelector('#services');
  if (!section) return;
  const hosts = [...section.querySelectorAll('.service-icon-film')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = section.querySelector('.service-motion-toggle');
  const visible = new Set();
  let paused = false;
  const probe = document.createElement('video');
  const useFallback = !probe.canPlayType('video/webm; codecs="vp9"') || /Apple/.test(navigator.vendor);

  function update() {
    const stopped = paused || reduced.matches;
    hosts.forEach(host => {
      const video = host.querySelector('video');
      const image = host.querySelector('img');
      const fallback = useFallback || host.dataset.failed === 'true';
      const animate = !stopped && !document.hidden && visible.has(host);
      video.hidden = fallback || reduced.matches;
      image.hidden = !fallback && !reduced.matches;
      if (fallback || reduced.matches) {
        video.pause();
        const source = animate ? image.dataset.animation : image.dataset.poster;
        if (image.getAttribute('src') !== source) image.src = source;
      } else if (animate) {
        if (!video.getAttribute('src')) video.src = video.dataset.animation;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
      host.dataset.playing = String(animate);
    });
    toggle.textContent = stopped ? 'Play service animations' : 'Pause service animations';
    toggle.setAttribute('aria-pressed', String(!stopped));
    toggle.disabled = reduced.matches;
    toggle.title = reduced.matches ? 'Animations follow your reduced-motion preference' : '';
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    update();
  }, { threshold: 0.05 });
  hosts.forEach(host => {
    observer.observe(host);
    host.querySelector('video').addEventListener('error', () => {
      host.dataset.failed = 'true';
      update();
    });
    const image = host.querySelector('img');
    image.addEventListener('error', () => {
      if (image.getAttribute('src') !== image.dataset.poster) {
        image.src = image.dataset.poster;
        host.dataset.playing = 'false';
      }
    });
  });
  toggle.addEventListener('click', () => { paused = !paused; update(); });
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  update();
})();
