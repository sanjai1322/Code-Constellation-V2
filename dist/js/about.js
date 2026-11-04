/* Code Constellation — About page motion. */
(() => {
  const CC = window.CC || { reduced: true, onReveal: (fn) => fn() };
  const $$ = (s) => [...document.querySelectorAll(s)];
  const galleryBtn = document.querySelector(".gallery-toggle");

  if (CC.reduced) {
    const vp = document.querySelector(".gallery-viewport");
    if (vp) vp.style.overflowX = "auto";
    if (galleryBtn) galleryBtn.hidden = true;
    return;
  }

  /* Hero entrance */
  gsap.set(".about-title .line-mask > span", { yPercent: 110 });
  gsap.set(".about-hero .sticker, .about-eyebrow", { opacity: 0 });
  gsap.set(".portrait-mask", { clipPath: "inset(30% 22% 0% 22% round 400px)" });
  gsap.set(".portrait-mask img", { yPercent: 18 });
  CC.onReveal(() => {
    gsap
      .timeline({ defaults: { ease: "power4.out" } })
      .to(".about-eyebrow", { opacity: 1, duration: 0.6 }, 0)
      .to(".about-title .line-mask > span", { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.05)
      .to(".portrait-mask", { clipPath: "inset(0% 0% 0% 0% round 60px)", duration: 1.4, ease: "expo.out" }, 0.3)
      .to(".portrait-mask img", { yPercent: 0, duration: 1.4, ease: "expo.out" }, 0.3)
      .fromTo(".about-hero .sticker", { scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: "back.out(2.2)" }, 0.7);
  });

  /* Portrait parallax while leaving the hero */
  gsap.to(".portrait-mask img", {
    yPercent: -8,
    ease: "none",
    scrollTrigger: { trigger: ".about-portrait", start: "top 40%", end: "bottom top", scrub: true },
  });

  /* Statement: words light up as they cross the viewport */
  const statement = document.querySelector(".statement-copy");
  if (statement) {
    const text = statement.textContent.trim();
    statement.setAttribute("aria-label", text);
    statement.replaceChildren(
      ...text.split(/\s+/).flatMap((w, i) => {
        const s = document.createElement("span");
        s.className = "word";
        s.setAttribute("aria-hidden", "true");
        s.textContent = w;
        return i ? [document.createTextNode(" "), s] : [s];
      }),
    );
    gsap.fromTo(
      statement.querySelectorAll(".word"),
      { opacity: 0.14 },
      {
        opacity: 1,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: { trigger: statement, start: "top 80%", end: "bottom 45%", scrub: true },
      },
    );
  }

  /* Story rows */
  $$(".story-row").forEach((row) => {
    gsap.from(row.querySelector(".story-text"), {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: row, start: "top 80%", once: true },
    });
    const art = row.querySelector(".story-art");
    gsap.fromTo(art, { scale: 0.7, rotation: -12 }, { scale: 1, rotation: 0, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "center 55%", scrub: true } });
    gsap.to(art.querySelector("img"), { rotation: art.classList.contains("story-art-mark") ? 120 : 10, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* Founder */
  gsap.from(".founder-card", {
    clipPath: "inset(12% 8% round 60px)",
    duration: 1.2,
    ease: "expo.out",
    scrollTrigger: { trigger: ".founder", start: "top 75%", once: true },
  });
  gsap.fromTo(".founder-mono", { xPercent: 20 }, { xPercent: -10, ease: "none", scrollTrigger: { trigger: ".founder", start: "top bottom", end: "bottom top", scrub: true } });

  /* Principles: each card shrinks slightly as the next one stacks over it */
  const cards = $$(".principle-card");
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, {
      scale: 0.94,
      ease: "none",
      scrollTrigger: { trigger: next, start: "top 85%", end: "top 25%", scrub: true },
    });
  });

  /* Gallery marquee: constant drift that speeds up with scroll velocity */
  const track = document.querySelector(".gallery-track");
  if (track) {
    const originals = [...track.children];
    originals.forEach((n) => {
      const c = n.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.querySelectorAll("img").forEach((img) => (img.alt = ""));
      track.append(c);
    });
    let unit = 0;
    const measure = () => (unit = track.children[originals.length].offsetLeft - track.children[0].offsetLeft);
    measure();
    addEventListener("resize", measure);
    let x = 0;
    let boost = 0;
    let paused = false;
    let visible = false;
    let lastY = scrollY;
    ScrollTrigger.create({ trigger: ".about-gallery", start: "top bottom", end: "bottom top", onToggle: (s) => (visible = s.isActive) });
    gsap.ticker.add((_t, dt) => {
      const dy = Math.abs(scrollY - lastY);
      lastY = scrollY;
      boost += (Math.min(dy * 0.5, 10) - boost) * 0.08;
      if (paused || !visible || !unit || document.hidden) return;
      x -= (1 + boost) * dt * 0.045;
      x = ((x % unit) - unit) % unit;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    });
    galleryBtn?.addEventListener("click", () => {
      paused = !paused;
      galleryBtn.textContent = paused ? "Play motion" : "Pause motion";
      galleryBtn.setAttribute("aria-pressed", String(paused));
    });
  }

  /* Capabilities */
  gsap.from(".cap-cloud li", {
    y: 30,
    opacity: 0,
    scale: 0.85,
    duration: 0.55,
    stagger: 0.03,
    ease: "back.out(1.8)",
    scrollTrigger: { trigger: ".cap-cloud", start: "top 85%", once: true },
  });
})();
