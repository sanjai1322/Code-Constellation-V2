/* Code Constellation — homepage behaviour.
   Ownership (one controller per element):
   hero intro + scroll parallax -> .character / .companion containers
   hero pointer parallax         -> .character img, .companion-video
   ribbon                        -> textPath startOffset (ticker)
   intro pin                     -> .intro, .intro-copy chars
   marquee                       -> .showcase-track (ticker)
   project reveal                -> .project-mask (CSS hover owns .project-media/img)
   services journey              -> .journey-svg + .service.is-reached classes
   clips                         -> every <video> on the page */
(() => {
  const CC = window.CC || { reduced: true, onReveal: (fn) => fn() };
  const reduced = CC.reduced;
  const mobileQuery = matchMedia("(max-width: 700px)");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ================= Clips: play only while visible ================= */
  const Clips = (() => {
    const ua = navigator.userAgent;
    const isSafari = /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(ua);
    const probe = document.createElement("video");
    const alphaWebm = !isSafari && !!probe.canPlayType('video/webm; codecs="vp9"');
    const clips = [];
    const groups = new Map(); // name -> paused flag
    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) =>
              entries.forEach((e) => {
                const clip = clips.find((c) => c.host === e.target);
                if (clip) {
                  clip.visible = e.isIntersecting;
                  update(clip);
                }
              }),
            { rootMargin: "80px 0px" },
          )
        : null;

    function toImage(clip) {
      const v = clip.el;
      const img = document.createElement("img");
      img.alt = "";
      img.width = v.width;
      img.height = v.height;
      img.decoding = "async";
      img.src = v.poster;
      img.className = v.className;
      img.dataset.poster = v.poster;
      img.dataset.anim = v.dataset.fallback;
      img.setAttribute("aria-hidden", "true");
      v.replaceWith(img);
      clip.el = img;
      clip.mode = "image";
    }

    function update(clip) {
      const play = !reduced && !document.hidden && clip.visible && !groups.get(clip.group);
      if (clip.mode === "video") {
        const v = clip.el;
        if (play) {
          if (!v.getAttribute("src")) v.src = v.dataset.src;
          const p = v.play();
          if (p) p.catch(() => {});
        } else if (!v.paused) v.pause();
      } else {
        const img = clip.el;
        const want = play ? img.dataset.anim : img.dataset.poster;
        if (img.getAttribute("src") !== want) img.src = want;
      }
    }

    function add(video, group, host = video.parentElement) {
      const clip = { el: video, host, group, visible: false, mode: "video" };
      clips.push(clip);
      if (!alphaWebm) toImage(clip);
      else
        video.addEventListener("error", () => {
          toImage(clip);
          update(clip);
        });
      if (io) io.observe(host);
      else clip.visible = true;
      update(clip);
      return clip;
    }
    const setPaused = (group, paused) => {
      groups.set(group, paused);
      clips.filter((c) => c.group === group).forEach(update);
    };
    document.addEventListener("visibilitychange", () => clips.forEach(update));
    return { add, setPaused, update, clips };
  })();

  /* ================= Split helpers ================= */
  function splitChars(el, cls = "char") {
    const text = el.textContent.replace(/\s+/g, " ").trim();
    el.setAttribute("aria-label", text);
    el.replaceChildren(
      ...text.split(" ").flatMap((word, i) => {
        const w = document.createElement("span");
        w.className = "word";
        w.setAttribute("aria-hidden", "true");
        for (const ch of word) {
          const c = document.createElement("span");
          c.className = cls;
          c.textContent = ch;
          w.append(c);
        }
        return i ? [document.createTextNode(" "), w] : [w];
      }),
    );
    return $$("." + cls, el);
  }

  /* ================= Hero ================= */
  const hero = $(".hero");
  const companionVideo = $(".companion-video");
  const companionClip = companionVideo ? Clips.add(companionVideo, "hero", $(".companion")) : null;

  $(".companion-hello")?.addEventListener("click", () => {
    if (companionClip && companionClip.mode === "video" && !reduced) {
      companionClip.el.currentTime = 0;
      Clips.update(companionClip);
    }
    if (!reduced && window.gsap) gsap.fromTo(".companion", { y: 0 }, { y: -18, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" });
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const s = new SpeechSynthesisUtterance("Hi!");
      s.lang = "en-IN";
      s.pitch = 1.35;
      s.rate = 0.9;
      s.volume = 0.7;
      speechSynthesis.speak(s);
    }
  });

  if (!reduced && hero) {
    // Entrance (waits for the curtain).
    gsap.set(".hero-title .line-mask > span", { yPercent: 110 });
    gsap.set([".hero-eyebrow", ".sticker"], { opacity: 0 });
    gsap.set(".character, .companion", { yPercent: 30, opacity: 0 });
    gsap.set(".ribbon", { yPercent: 60, opacity: 0 });
    CC.onReveal(() => {
      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .to(".hero-eyebrow", { opacity: 1, duration: 0.6 }, 0)
        .to(".hero-title .line-mask > span", { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.05)
        .to(".ribbon", { yPercent: 0, opacity: 1, duration: 1.1 }, 0.25)
        .to(".character", { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: "expo.out" }, 0.35)
        .to(".companion", { yPercent: 0, opacity: 1, duration: 1, ease: "back.out(1.6)" }, 0.6)
        .fromTo(".sticker", { scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: "back.out(2.2)" }, 0.7);
    });

    // Scroll: the duo drifts apart as the hero leaves.
    const spread = () => (mobileQuery.matches ? 8 : 6);
    gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      })
      .to(".hero-title", { yPercent: -18 }, 0)
      .to(".character-coder", { xPercent: () => -spread() * 10, rotation: -4 }, 0)
      .to(".character-designer", { xPercent: () => spread() * 10, rotation: 4 }, 0)
      .to(".companion", { y: -60 }, 0)
      .to(".sticker", { y: -80, stagger: 0.02 }, 0);

    // Pointer: light parallax on the inner images only.
    if (CC.finePointer) {
      const movers = [
        [$(".character-coder img"), 18, 2],
        [$(".character-designer img"), -16, -2],
        [$(".companion-video"), 26, 0],
      ].map(([el, amp, rot]) => ({
        amp,
        rot,
        x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }),
        r: gsap.quickTo(el, "rotation", { duration: 0.9, ease: "power3" }),
      }));
      hero.addEventListener("pointermove", (e) => {
        const nx = e.clientX / innerWidth - 0.5;
        const ny = e.clientY / innerHeight - 0.5;
        movers.forEach((m) => {
          m.x(nx * m.amp);
          m.y(ny * Math.abs(m.amp) * 0.5);
          m.r(nx * m.rot);
        });
      });
      hero.addEventListener("pointerleave", () => movers.forEach((m) => (m.x(0), m.y(0), m.r(0))));
    }
  }

  /* ================= Ribbon text ================= */
  const textPath = $(".ribbon textPath");
  if (textPath && !reduced) {
    const text = textPath.parentElement;
    let unit = 0;
    const measure = () => {
      unit = text.getComputedTextLength() / 5; // five repeated phrase pairs
    };
    measure();
    document.fonts?.ready.then(measure);
    let drift = 0;
    let visible = true;
    ScrollTrigger.create({ trigger: ".ribbon", start: "top bottom", end: "bottom top", onToggle: (s) => (visible = s.isActive) });
    gsap.ticker.add((_t, dt) => {
      if (!visible || !unit) return;
      drift += dt * 0.035;
      const off = -((drift + scrollY * 0.45) % unit);
      textPath.setAttribute("startOffset", off.toFixed(2));
    });
  }

  /* ================= Pinned studio introduction ================= */
  const introCopy = $(".intro-copy");
  if (introCopy && !reduced) {
    const chars = splitChars(introCopy);
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".intro",
        start: "top top",
        end: () => "+=" + innerHeight * (mobileQuery.matches ? 1.1 : 1.6),
        pin: true,
        scrub: 0.4,
        invalidateOnRefresh: true,
      },
    });
    tl.fromTo(chars, { color: "#c9caee" }, { color: "#2f6bff", stagger: 0.02, duration: 0.15 }, 0)
      .to(chars, { color: "#0a1033", stagger: 0.02, duration: 0.3 }, 0.15)
      .from(".intro-values li", { scale: 0.3, opacity: 0, y: 30, stagger: 0.35, duration: 0.6, ease: "back.out(2)" }, ">-0.6");
  }

  /* ================= Velocity marquee ================= */
  const track = $(".showcase-track");
  const marqueeBtn = $(".marquee-toggle");
  if (track && !reduced) {
    const originals = [...track.children];
    for (let i = 0; i < 2; i++)
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
    let dir = 1;
    let speed = 1;
    let paused = false;
    let visible = false;
    let lastY = scrollY;
    ScrollTrigger.create({ trigger: ".showcase", start: "top bottom", end: "bottom top", onToggle: (s) => (visible = s.isActive) });
    gsap.ticker.add((_t, dt) => {
      const y = scrollY;
      const dy = y - lastY;
      lastY = y;
      if (Math.abs(dy) > 0.5) dir = dy > 0 ? 1 : -1;
      const target = 1 + Math.min(Math.abs(dy) * 0.6, 14);
      speed += (target - speed) * 0.08;
      if (paused || !visible || !unit) return;
      x -= dir * speed * dt * 0.05;
      x = ((x % unit) - unit) % unit;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    });
    marqueeBtn?.addEventListener("click", () => {
      paused = !paused;
      marqueeBtn.textContent = paused ? "Play motion" : "Pause motion";
      marqueeBtn.setAttribute("aria-pressed", String(paused));
    });
  } else if (track) {
    $(".showcase-viewport").style.overflowX = "auto";
    if (marqueeBtn) marqueeBtn.hidden = true;
  }

  /* ================= Headings: reveal + playful letter hover ================= */
  $$(".split-heading").forEach((heading) => {
    const chars = splitChars(heading);
    if (reduced) return;
    gsap.from(chars, {
      yPercent: 70,
      rotation: 8,
      opacity: 0,
      duration: 0.9,
      ease: "back.out(1.6)",
      stagger: 0.018,
      scrollTrigger: { trigger: heading, start: "top 88%", once: true },
    });
    if (!CC.finePointer) return;
    let centres = [];
    heading.addEventListener("pointerenter", () => {
      centres = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2];
      });
    });
    heading.addEventListener("pointermove", (e) =>
      chars.forEach((c, i) => {
        const [cx, cy] = centres[i] || [0, 0];
        const f = Math.max(0, 1 - Math.hypot(e.clientX - cx, e.clientY - cy) / 120);
        gsap.to(c, { y: -f * 16, rotation: (e.clientX - cx) * f * 0.1, duration: 0.3, overwrite: "auto" });
      }),
    );
    heading.addEventListener("pointerleave", () =>
      gsap.to(chars, { y: 0, rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.35)", stagger: 0.006, overwrite: "auto" }),
    );
  });

  /* ================= Project cards ================= */
  if (!reduced) {
    $$(".project-card").forEach((card, i) => {
      gsap.fromTo(
        $(".project-mask", card),
        { clipPath: "inset(14% 12% 14% 12% round 36px)", scale: 1.12 },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: card, start: "top bottom", end: "top 45%", scrub: true },
        },
      );
      gsap.from($(".project-meta", card), {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: (i % 2) * 0.08,
        scrollTrigger: { trigger: card, start: "top 70%", once: true },
      });
    });
    gsap.from(".end-pills li", {
      scale: 0.4,
      opacity: 0,
      y: 20,
      stagger: 0.12,
      duration: 0.7,
      ease: "back.out(2)",
      scrollTrigger: { trigger: ".work-end", start: "top 80%", once: true },
    });
  }

  /* ================= Services journey ================= */
  (() => {
    const journey = $(".journey");
    if (!journey) return;
    const svg = $(".journey-svg", journey);
    const line = $(".journey-line", svg);
    const ghost = $(".journey-ghost", svg);
    const marker = $(".journey-marker", svg);
    const mask = $("#journey-mask", svg);
    const maskBg = $(".journey-mask-bg", svg);
    const services = $$(".service", journey);
    const NS = "http://www.w3.org/2000/svg";

    // Clips + pause control.
    services.forEach((s) => {
      const v = $("video", s);
      if (v) Clips.add(v, "services", $(".service-art", s));
    });
    const toggle = $(".service-toggle");
    if (toggle) {
      if (reduced) {
        toggle.disabled = true;
        toggle.textContent = "Animations off (reduced motion)";
        toggle.setAttribute("aria-pressed", "true");
      } else {
        toggle.addEventListener("click", () => {
          const paused = toggle.getAttribute("aria-pressed") !== "true";
          toggle.setAttribute("aria-pressed", String(paused));
          toggle.textContent = paused ? "Play animations" : "Pause animations";
          Clips.setPaused("services", paused);
        });
      }
    }

    let geo = null; // { total, ys: Float32Array, step, stops: [{el, y}], holes }

    function build() {
      const box = journey.getBoundingClientRect();
      const W = box.width;
      const H = box.height;
      if (!W || !H) return;
      const mobile = mobileQuery.matches;
      const rel = (r) => ({ left: r.left - box.left, top: r.top - box.top, width: r.width, height: r.height });
      const pts = [];
      const holes = [];
      const stops = [];

      pts.push(mobile ? { x: W * 0.93, y: -30, t: [0, 1] } : { x: W + 40, y: -20, t: [-1, 0] });
      services.forEach((s) => {
        const art = rel($(".service-art", s).getBoundingClientRect());
        const cap = rel($(".service-caption", s).getBoundingClientRect());
        const right = s.dataset.channel === "right";
        const cx = art.left + art.width / 2;
        const cy = art.top + art.height / 2;
        if (mobile) {
          pts.push({ x: cx, y: art.top + art.height * 0.12, t: [0, 1] });
          pts.push({ x: right ? art.left + art.width * 0.9 : art.left + art.width * 0.1, y: art.top + art.height * 0.6, t: [right ? 1 : -1, 0] });
          pts.push({ x: right ? W * 0.935 : W * 0.065, y: cap.top + cap.height * 0.6, t: [0, 1] });
        } else {
          pts.push({ x: cx, y: cy, t: [0, 1] });
          const reach = Math.max(art.width * 0.82, 200);
          pts.push({ x: right ? Math.min(W - 12, cx + reach) : Math.max(12, cx - reach), y: cap.top + cap.height / 2, t: [0, 1] });
        }
        holes.push({ cx, cy: art.top + art.height * 0.52, rx: art.width * 0.4, ry: art.height * 0.42 });
        stops.push({ el: s, y: art.top + art.height * 0.3 });
      });
      const last = pts[pts.length - 1];
      pts.push({ x: last.x, y: H - 8, t: [0, 1] });

      // Cubic segments with tangent handles: y never decreases along the path,
      // so a viewport line maps to exactly one point on it.
      let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i - 1];
        const q = pts[i];
        const dx = Math.abs(q.x - p.x);
        const dy = Math.abs(q.y - p.y);
        const h1 = 0.5 * (Math.abs(p.t[0]) * dx + p.t[1] * dy);
        const h2 = 0.5 * (Math.abs(q.t[0]) * dx + q.t[1] * dy);
        const c1 = [p.x + p.t[0] * h1, p.y + p.t[1] * h1];
        const c2 = [q.x - q.t[0] * h2, q.y - q.t[1] * h2];
        d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
      }

      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      line.setAttribute("d", d);
      ghost.setAttribute("d", d);

      // Mask: the line slips behind each illustration instead of crossing it.
      mask.setAttribute("x", -100);
      mask.setAttribute("y", -100);
      mask.setAttribute("width", W + 200);
      mask.setAttribute("height", H + 200);
      maskBg.setAttribute("x", -100);
      maskBg.setAttribute("y", -100);
      maskBg.setAttribute("width", W + 200);
      maskBg.setAttribute("height", H + 200);
      $$("ellipse", mask).forEach((e) => e.remove());
      holes.forEach((h) => {
        const e = document.createElementNS(NS, "ellipse");
        e.setAttribute("cx", h.cx);
        e.setAttribute("cy", h.cy);
        e.setAttribute("rx", h.rx);
        e.setAttribute("ry", h.ry);
        e.setAttribute("fill", "url(#journey-hole)");
        mask.append(e);
      });

      const total = line.getTotalLength();
      const step = 3;
      const n = Math.ceil(total / step) + 1;
      const ys = new Float32Array(n);
      for (let i = 0; i < n; i++) ys[i] = line.getPointAtLength(Math.min(total, i * step)).y;
      line.style.strokeDasharray = `${total} ${total + 10}`;
      geo = { total, ys, step, n, stops, holes };
    }

    function lengthAtY(y) {
      const { ys, n, step, total } = geo;
      if (y <= ys[0]) return 0;
      if (y >= ys[n - 1]) return total;
      let lo = 0;
      let hi = n - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (ys[mid] < y) lo = mid;
        else hi = mid;
      }
      const span = ys[hi] - ys[lo];
      const f = span > 0 ? (y - ys[lo]) / span : 0;
      return Math.min(total, (lo + f) * step);
    }

    function draw() {
      if (!geo) return;
      const top = journey.getBoundingClientRect().top;
      const target = reduced ? Infinity : innerHeight * 0.62 - top;
      const L = reduced ? geo.total : lengthAtY(target);
      line.style.strokeDashoffset = String(geo.total - L);
      const p = line.getPointAtLength(L);
      marker.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
      const inside = geo.holes.some((h) => ((p.x - h.cx) / h.rx) ** 2 + ((p.y - h.cy) / h.ry) ** 2 < 0.55);
      marker.classList.toggle("is-hidden", reduced || L <= 0.5 || inside);
      geo.stops.forEach((s) => s.el.classList.toggle("is-reached", reduced || target >= s.y));
    }

    const rebuild = () => {
      build();
      draw();
    };
    if (!reduced) journey.classList.add("is-live");
    rebuild();
    if (window.ScrollTrigger && !reduced) {
      ScrollTrigger.create({
        trigger: journey,
        start: "top bottom",
        end: "bottom top",
        onUpdate: draw,
        onRefresh: rebuild,
      });
    } else {
      addEventListener("resize", rebuild);
    }
    document.fonts?.ready.then(rebuild);
    let raf = 0;
    if ("ResizeObserver" in window) {
      let lastW = 0;
      let lastH = 0;
      new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        if (Math.abs(width - lastW) < 1 && Math.abs(height - lastH) < 1) return;
        lastW = width;
        lastH = height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(rebuild);
      }).observe(journey);
    }
  })();

  /* ================= Proof deck: drag, swipe, buttons, keys ================= */
  (() => {
    const deck = $(".deck");
    if (!deck) return;
    const cards = $$(".deck-card", deck);
    const count = $(".deck-count");
    const tilt = [0, -6, 5, -4, 7];
    let order = cards.map((_, i) => i);
    let busy = false;

    function layout(animate) {
      order.forEach((idx, pos) => {
        const card = cards[idx];
        card.style.zIndex = String(cards.length - pos);
        card.setAttribute("aria-hidden", String(pos !== 0));
        card.inert = pos !== 0;
        const props = { x: 0, y: pos * 10, rotation: pos ? tilt[pos] : 0, scale: 1 - pos * 0.035, opacity: pos < 4 ? 1 : 0 };
        if (window.gsap && animate && !reduced) gsap.to(card, { ...props, duration: 0.6, ease: "power3.out" });
        else if (window.gsap) gsap.set(card, props);
        else card.style.transform = `translateY(${props.y}px) rotate(${props.rotation}deg) scale(${props.scale})`;
      });
      count.textContent = `${String(order[0] + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
    }

    function go(dir, fromX = 0, fromR = 0) {
      if (busy) return;
      const top = cards[order[0]];
      const finish = () => {
        if (dir > 0) order.push(order.shift());
        else order.unshift(order.pop());
        layout(true);
        busy = false;
      };
      if (reduced || !window.gsap) return finish();
      busy = true;
      if (dir > 0) {
        gsap.fromTo(
          top,
          { x: fromX, rotation: fromR },
          {
            x: (fromX >= 0 ? 1 : -1) * deck.offsetWidth * 1.15,
            rotation: (fromX >= 0 ? 1 : -1) * 18,
            duration: 0.45,
            ease: "power2.in",
            onComplete: () => {
              top.style.zIndex = "0";
              finish();
            },
          },
        );
      } else {
        const incoming = cards[order[order.length - 1]];
        gsap.set(incoming, { zIndex: cards.length + 1, opacity: 1 });
        gsap.fromTo(
          incoming,
          { x: -deck.offsetWidth * 1.15, rotation: -18 },
          { x: 0, rotation: 0, y: 0, scale: 1, duration: 0.55, ease: "power3.out", onComplete: finish },
        );
      }
    }

    layout(false);
    $$("[data-deck]").forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.deck))));
    deck.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") (e.preventDefault(), go(1));
      if (e.key === "ArrowLeft") (e.preventDefault(), go(-1));
    });

    // Pointer drag on the top card.
    let drag = null;
    deck.addEventListener("pointerdown", (e) => {
      const top = cards[order[0]];
      if (busy || !top.contains(e.target) || !window.gsap) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, card: top, moved: false };
      top.setPointerCapture(e.pointerId);
    });
    deck.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x0;
      const dy = e.clientY - drag.y0;
      if (!drag.moved && Math.abs(dy) > Math.abs(drag.dx) && Math.abs(dy) > 8) {
        drag = null; // vertical intent: let the page scroll
        return;
      }
      if (Math.abs(drag.dx) > 4) drag.moved = true;
      gsap.set(drag.card, { x: drag.dx, rotation: drag.dx * 0.06 });
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const { dx, card } = drag;
      drag = null;
      if (Math.abs(dx) > Math.min(120, deck.offsetWidth * 0.25)) go(1, dx, dx * 0.06);
      else gsap.to(card, { x: 0, rotation: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
    };
    deck.addEventListener("pointerup", end);
    deck.addEventListener("pointercancel", end);

    if (!reduced) {
      gsap.from(deck, {
        y: 80,
        rotation: -6,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: deck, start: "top 85%", once: true },
      });
    }
  })();

  /* ================= FAQ: animated open / close, one at a time ================= */
  (() => {
    const items = $$(".faq-list details");
    const animate = (el, from, to, done) => {
      if (reduced || !el.animate) return done();
      el.style.overflow = "hidden";
      const a = el.animate({ height: [from + "px", to + "px"] }, { duration: 520, easing: "cubic-bezier(.22,1,.36,1)" });
      a.onfinish = () => {
        el.style.overflow = "";
        done();
      };
      return a;
    };
    const close = (d) => {
      if (!d.open || d.dataset.busy) return;
      d.dataset.busy = "1";
      const from = d.offsetHeight;
      const to = d.querySelector("summary").offsetHeight;
      d.classList.add("is-closing");
      animate(d, from, to, () => {
        d.open = false;
        d.classList.remove("is-closing");
        delete d.dataset.busy;
        window.ScrollTrigger?.refresh();
      });
    };
    const open = (d) => {
      if (d.dataset.busy) return;
      d.dataset.busy = "1";
      const from = d.offsetHeight;
      d.open = true;
      const to = d.offsetHeight;
      animate(d, from, to, () => {
        delete d.dataset.busy;
        window.ScrollTrigger?.refresh();
      });
    };
    items.forEach((d) => {
      d.querySelector("summary").addEventListener("click", (e) => {
        e.preventDefault();
        if (d.open) close(d);
        else {
          items.forEach((o) => o !== d && close(o));
          open(d);
        }
      });
    });
    if (!reduced) {
      gsap.from(".faq-list details", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: { trigger: ".faq-list", start: "top 85%", once: true },
      });
      gsap.from(".faq-companion", {
        y: 80,
        rotation: 14,
        opacity: 0,
        duration: 1.1,
        ease: "back.out(1.5)",
        scrollTrigger: { trigger: ".faq", start: "top 75%", once: true },
      });
    }
  })();
})();
