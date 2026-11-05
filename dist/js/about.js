/* Code Constellation — About page motion.
   Ownership: hero intro -> title/portrait; scrub tweens -> rings star, mission words,
   value cards, journey star; marquee ticker -> .gallery-track. */
(() => {
  const CC = window.CC || { reduced: true, onReveal: (fn) => fn() };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const galleryBtn = $(".gallery-toggle");
  const steps = $$(".journey-steps li");

  if (CC.reduced) {
    steps.forEach((li) => li.classList.add("is-lit"));
    const vp = $(".gallery-viewport");
    if (vp) vp.style.overflowX = "auto";
    if (galleryBtn) galleryBtn.hidden = true;
    return;
  }

  /* Hero entrance */
  gsap.set(".about-title .line-mask > span", { yPercent: 110 });
  gsap.set(".about-eyebrow, .about-intro > *", { opacity: 0, y: 18 });
  gsap.set(".portrait-frame", { clipPath: "inset(18% 10% 0% 10% round 48px)" });
  gsap.set(".portrait-frame img", { yPercent: 14 });
  CC.onReveal(() => {
    gsap
      .timeline({ defaults: { ease: "power4.out" } })
      .to(".about-eyebrow", { opacity: 1, y: 0, duration: 0.6 }, 0)
      .to(".about-title .line-mask > span", { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.05)
      .to(".about-intro > *", { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.35)
      .to(".portrait-frame", { clipPath: "inset(0% 0% 0% 0% round 36px)", duration: 1.4, ease: "expo.out" }, 0.3)
      .to(".portrait-frame img", { yPercent: 0, duration: 1.4, ease: "expo.out" }, 0.3);
  });

  /* Portrait: the duo rises slightly as the frame leaves; the star travels its orbit */
  gsap.to(".portrait-frame img", {
    yPercent: -4,
    ease: "none",
    scrollTrigger: { trigger: ".about-portrait", start: "top 40%", end: "bottom top", scrub: true },
  });
  const ringStar = $(".ring-star");
  if (ringStar) {
    const p = { a: -150 };
    const place = () => {
      const r = (p.a * Math.PI) / 180;
      ringStar.setAttribute("cx", (1180 + 515 * Math.cos(r)).toFixed(1));
      ringStar.setAttribute("cy", (680 + 515 * Math.sin(r)).toFixed(1));
    };
    place();
    gsap.to(p, {
      a: -96,
      ease: "none",
      onUpdate: place,
      scrollTrigger: { trigger: ".about-portrait", start: "top 85%", end: "bottom top", scrub: true },
    });
  }

  /* Mission and vision: words light up as they cross the viewport */
  $$(".mission-copy").forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.replaceChildren(
      ...text.split(/\s+/).flatMap((w, i) => {
        const s = document.createElement("span");
        s.className = "word";
        s.setAttribute("aria-hidden", "true");
        s.textContent = w;
        return i ? [document.createTextNode(" "), s] : [s];
      }),
    );
    gsap.fromTo(
      $$(".word", el),
      { opacity: 0.16 },
      { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: true } },
    );
  });

  /* Story rows: presenter steps in from the side they present from */
  $$(".story-row").forEach((row) => {
    const person = $(".story-person", row);
    const fromLeft = !row.classList.contains("is-reverse");
    gsap
      .timeline({ scrollTrigger: { trigger: row, start: "top 78%", once: true }, defaults: { ease: "power3.out" } })
      .from(person, { x: fromLeft ? -60 : 60, opacity: 0, duration: 1 }, 0)
      .from($(".story-text", row).children, { y: 40, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.1);
  });

  /* Values: each card settles back as the next one stacks over it */
  const cards = $$(".value-card");
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, { scale: 0.95, ease: "none", scrollTrigger: { trigger: next, start: "top 88%", end: "top 30%", scrub: true } });
  });

  /* Journey: the star travels the dotted line; each stage lights as it passes */
  const track = $(".journey-track");
  const star = $(".journey-star");
  if (track && star) {
    const vertical = () => matchMedia("(max-width: 900px)").matches;
    ScrollTrigger.create({
      trigger: track,
      start: "top 75%",
      end: "bottom 55%",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        if (vertical()) gsap.set(star, { x: 0, y: p * (track.offsetHeight - 14) });
        else gsap.set(star, { y: 0, x: p * (track.offsetWidth - 14) });
        steps.forEach((li, i) => li.classList.toggle("is-lit", p >= i / steps.length + 0.02));
      },
    });
  }

  /* Team: cards rise in; on fine pointers the portrait tilts toward the cursor
     (max 5deg) while the text stays flat and crisp. Focus gets the same lift. */
  gsap.from(".team-card", {
    y: 60,
    opacity: 0,
    duration: 1,
    stagger: 0.12,
    ease: "power3.out",
    scrollTrigger: { trigger: ".team-grid", start: "top 82%", once: true },
  });
  $$(".team-card").forEach((card) => {
    const portrait = $(".team-portrait", card);
    gsap.set(portrait, { transformPerspective: 900 });
    const rx = gsap.quickTo(portrait, "rotationX", { duration: 0.6, ease: "power3" });
    const ry = gsap.quickTo(portrait, "rotationY", { duration: 0.6, ease: "power3" });
    const lift = (on) => gsap.to(card, { y: on ? -6 : 0, duration: on ? 0.5 : 0.7, ease: "power3.out", overwrite: "auto" });
    card.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = portrait.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      ry((px - 0.5) * 10);
      rx((0.5 - py) * 8);
      card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    });
    card.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && lift(true));
    card.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "mouse") return;
      rx(0);
      ry(0);
      lift(false);
    });
    card.addEventListener("focus", () => {
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "28%");
      lift(true);
    });
    card.addEventListener("blur", () => lift(false));
  });

  gsap.from(".pillar", {
    y: 50,
    opacity: 0,
    duration: 0.9,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".pillar-grid", start: "top 82%", once: true },
  });

  /* Gallery marquee: steady drift that speeds up with scroll velocity */
  const gtrack = $(".gallery-track");
  if (gtrack) {
    const originals = [...gtrack.children];
    originals.forEach((n) => {
      const c = n.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.querySelectorAll("img").forEach((img) => (img.alt = ""));
      gtrack.append(c);
    });
    let unit = 0;
    const measure = () => (unit = gtrack.children[originals.length].offsetLeft - gtrack.children[0].offsetLeft);
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
      gtrack.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    });
    galleryBtn?.addEventListener("click", () => {
      paused = !paused;
      galleryBtn.textContent = paused ? "Play motion" : "Pause motion";
      galleryBtn.setAttribute("aria-pressed", String(paused));
    });
  }
})();
