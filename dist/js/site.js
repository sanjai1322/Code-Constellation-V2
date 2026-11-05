/* Code Constellation — shared runtime.
   This file is the only owner of Lenis and the ScrollTrigger <-> Lenis bridge.
   Page scripts (home.js, about.js, case.js) register their own triggers and
   read shared state from window.CC. */
(() => {
  const root = document.documentElement;
  const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(pointer: fine)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const CC = (window.CC = {
    reduced: reducedQuery.matches || !hasGsap,
    finePointer,
    lenis: null,
    revealed: false,
    headerOffset: () => (innerWidth <= 900 ? 72 : 88),
  });

  const ARROW =
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.querySelectorAll(".arrow-chip:empty").forEach((chip) => (chip.innerHTML = ARROW + ARROW));

  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll (single controller) ---------- */
  if (!CC.reduced && window.Lenis) {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95, syncTouch: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    CC.lenis = lenis;
  }
  CC.scrollTo = (target, opts = {}) => {
    const offset = opts.offset ?? -CC.headerOffset();
    if (CC.lenis) {
      CC.lenis.scrollTo(target, { offset, duration: opts.immediate ? 0 : 1.3, immediate: !!opts.immediate, force: true });
    } else {
      const y = typeof target === "number" ? target : target.getBoundingClientRect().top + scrollY + offset;
      scrollTo({ top: y, behavior: opts.immediate || CC.reduced ? "auto" : "smooth" });
    }
  };

  /* ---------- Header: hide on scroll down, show on scroll up ---------- */
  const header = document.querySelector(".site-header");
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 40);
      const goingDown = y > lastY + 2;
      const goingUp = y < lastY - 2;
      if (goingDown && y > 240 && !header.contains(document.activeElement)) header.classList.add("is-hidden");
      else if (goingUp || y < 240) header.classList.remove("is-hidden");
    }
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  header?.addEventListener("focusin", () => header.classList.remove("is-hidden"));
  onScroll();

  /* ---------- Brush hover on navigation pills ---------- */
  document.querySelectorAll(".site-header nav .pill").forEach((pill) => {
    const label = document.createElement("span");
    label.textContent = pill.textContent.trim();
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "brush");
    svg.setAttribute("viewBox", "0 0 150 60");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<path pathLength="1" d="M-14 38C14 6 34 58 60 26S100 54 122 20 160 40 172 24"/>';
    pill.replaceChildren(svg, label);
  });

  /* ---------- Active state for in-page "Work" link ---------- */
  const workLink = document.querySelector('.site-header a[data-nav="work"]');
  const workSection = document.querySelector("#work");
  if (workLink && workSection && "IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) workLink.setAttribute("aria-current", "location");
        else workLink.removeAttribute("aria-current");
      },
      { rootMargin: "-45% 0px -45% 0px" },
    ).observe(workSection);
  }

  /* ---------- Curtain: first-visit loader and page transitions ---------- */
  const curtain = document.querySelector(".curtain");
  const revealListeners = [];
  CC.onReveal = (fn) => (CC.revealed ? fn() : revealListeners.push(fn));
  const markRevealed = () => {
    if (CC.revealed) return;
    CC.revealed = true;
    revealListeners.splice(0).forEach((fn) => fn());
  };

  function uncover() {
    const mode = root.dataset.enter;
    if (!curtain || !root.classList.contains("is-covered") || CC.reduced) {
      root.classList.remove("is-covered");
      requestAnimationFrame(markRevealed);
      return;
    }
    curtain.dataset.mode = mode || "page";
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        root.classList.remove("is-covered");
        gsap.set(curtain, { clearProps: "all" });
        gsap.set(curtain.querySelectorAll("*"), { clearProps: "all" });
      },
    });
    gsap.set(curtain, { yPercent: 0, visibility: "visible" });
    if (mode === "loader") {
      tl.from(curtain.querySelector("img"), { scale: 0.6, rotation: -40, opacity: 0, duration: 0.7 })
        .from(curtain.querySelectorAll(".curtain-name span"), { yPercent: 110, duration: 0.7, stagger: 0.08 }, 0.15)
        .from(curtain.querySelector(".eyebrow"), { opacity: 0, y: 10, duration: 0.5 }, 0.45)
        .to(curtain.querySelector(".curtain-inner"), { y: -40, opacity: 0, duration: 0.5, ease: "power2.in" }, 1.35);
    } else {
      tl.set(curtain.querySelectorAll(".curtain-name, .eyebrow"), { display: "none" }).from(
        curtain.querySelector("img"),
        { rotation: -30, duration: 0.5 },
      );
    }
    tl.to(curtain, { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, mode === "loader" ? 1.5 : 0.25).add(
      markRevealed,
      mode === "loader" ? 1.85 : 0.55,
    );
    try {
      sessionStorage.removeItem("cc-nav");
    } catch {}
  }

  function isTransitionLink(a, event) {
    if (!a || CC.reduced || !curtain) return false;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (a.target && a.target !== "_self") return false;
    if (a.hasAttribute("download") || a.dataset.noTransition !== undefined) return false;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return false;
    if (url.pathname === location.pathname && url.search === location.search) return false; // same page (anchors)
    return url;
  }

  document.addEventListener("click", (event) => {
    const a = event.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");

    // Same-page anchors: smooth scroll and keep history entries for back/forward.
    const url = new URL(a.href, location.href);
    if (url.pathname === location.pathname && url.search === location.search && href.includes("#")) {
      const id = decodeURIComponent(url.hash.slice(1));
      const target = id === "top" || id === "" ? 0 : document.getElementById(id);
      if (target === null) return;
      event.preventDefault();
      CC.scrollTo(target, { offset: target === 0 ? 0 : undefined });
      if (location.hash !== url.hash) history.pushState(null, "", url.hash || location.pathname);
      if (target && target.focus) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
      return;
    }

    const next = isTransitionLink(a, event);
    if (!next) return;
    event.preventDefault();
    try {
      sessionStorage.setItem("cc-nav", "1");
    } catch {}
    curtain.dataset.mode = "page";
    gsap.set(curtain.querySelectorAll(".curtain-name, .eyebrow"), { display: "none" });
    gsap.fromTo(
      curtain,
      { yPercent: 100, visibility: "visible" },
      { yPercent: 0, duration: 0.7, ease: "power4.inOut", onComplete: () => location.assign(next.href) },
    );
    CC.lenis?.stop();
  });

  // Restored from the back/forward cache: never leave the curtain covering the page.
  addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    root.classList.remove("is-covered");
    if (curtain && hasGsap) gsap.set(curtain, { clearProps: "all" });
    CC.lenis?.start();
    try {
      sessionStorage.removeItem("cc-nav");
    } catch {}
    if (hasGsap) ScrollTrigger.refresh();
  });

  /* ---------- Deep links: hold the anchor until layout has settled ---------- */
  // Pins, fonts and ScrollTrigger's own load refresh can all move the page after the
  // first jump. For a short window we re-apply the anchor after each of them, and
  // stop the moment the visitor scrolls, taps or presses a key.
  const anchorTarget = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    return (id && document.getElementById(id)) || null;
  };
  let holding = !!location.hash;
  const release = () => (holding = false);
  ["wheel", "touchstart", "keydown", "pointerdown"].forEach((ev) => addEventListener(ev, release, { once: true, passive: true }));
  const reanchor = () => {
    const target = holding && anchorTarget();
    if (!target) return;
    if (Math.abs(target.getBoundingClientRect().top - CC.headerOffset()) > 2) {
      CC.lenis?.resize?.();
      CC.scrollTo(target, { immediate: true });
    }
  };
  if (hasGsap) ScrollTrigger.addEventListener("refresh", () => requestAnimationFrame(reanchor));
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  addEventListener(
    "load",
    () =>
      fontsReady.then(() => {
        if (hasGsap) ScrollTrigger.refresh();
        requestAnimationFrame(reanchor);
        [400, 1000, 2000, 3200].forEach((t) => setTimeout(reanchor, t));
        setTimeout(release, 3600);
      }),
    { once: true },
  );
  // Covers back/forward between in-page anchors and hashes typed into the address bar.
  addEventListener("hashchange", () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    CC.scrollTo(target || 0, { offset: target ? undefined : 0 });
  });

  /* ---------- Contact dialog ---------- */
  const contact = document.querySelector("#contact");
  const openDialog = (dialog) => {
    dialog.showModal();
    CC.lenis?.stop();
  };
  document.querySelectorAll("[data-contact]").forEach((btn) => btn.addEventListener("click", () => contact && openDialog(contact)));
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.querySelector(".close")?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => CC.lenis?.start());
    dialog.addEventListener("click", (e) => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    });
  });
  document.querySelector(".contact-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = `Project enquiry — ${data.get("name")}`;
    const body = `Hello Code Constellation,\n\n${data.get("brief")}\n\nName: ${data.get("name")}\nEmail: ${data.get("email")}`;
    location.href = `mailto:codeconstellation.business@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  /* ---------- Copy email ---------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const original = btn.textContent;
    btn.addEventListener("click", async () => {
      let ok = false;
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        ok = true;
      } catch {}
      btn.textContent = ok ? "Copied" : "Press Ctrl+C";
      btn.setAttribute("aria-live", "polite");
      setTimeout(() => (btn.textContent = original), 1800);
    });
  });

  /* ---------- Cursor label for [data-cursor] targets ---------- */
  if (finePointer && !CC.reduced) {
    const cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.append(cursor);
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3" });
    addEventListener("pointermove", (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    });
    document.querySelectorAll("[data-cursor]").forEach((el) => {
      el.addEventListener("pointerenter", () => {
        cursor.textContent = el.dataset.cursor;
        gsap.to(cursor, { scale: 1, duration: 0.45, ease: "back.out(1.7)", overwrite: "auto" });
      });
      el.addEventListener("pointerleave", () => gsap.to(cursor, { scale: 0, duration: 0.3, ease: "power2.in", overwrite: "auto" }));
    });
    CC.cursor = cursor;

    /* Magnetic call-to-action buttons */
    document.querySelectorAll(".cta").forEach((btn) => {
      const xb = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
      const yb = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        xb((e.clientX - r.left - r.width / 2) * 0.22);
        yb((e.clientY - r.top - r.height / 2) * 0.3);
      });
      btn.addEventListener("pointerleave", () => gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" }));
    });
  }

  /* ---------- Shared scroll reveals and footer entrance ---------- */
  if (!CC.reduced) {
    gsap.utils.toArray("[data-reveal]").forEach((el) => {
      gsap.from(el, {
        y: 48,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });

    const footer = document.querySelector(".site-footer");
    if (footer) {
      gsap.from(footer.querySelectorAll(".footer-cta .line > span"), {
        yPercent: 105,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.1,
        scrollTrigger: { trigger: footer, start: "top 80%", once: true },
      });
      const mark = footer.querySelector(".footer-wordmark");
      if (mark) {
        const text = mark.textContent;
        mark.replaceChildren(
          ...[...text].map((ch) => {
            const s = document.createElement("span");
            s.textContent = ch === " " ? " " : ch;
            return s;
          }),
        );
        gsap.fromTo(
          mark.children,
          { yPercent: 100, scaleY: 0.4 },
          {
            yPercent: 0,
            scaleY: 1,
            ease: "elastic.out(1, 0.55)",
            duration: 1.6,
            stagger: 0.035,
            scrollTrigger: { trigger: mark, start: "top 98%", toggleActions: "play none none reverse" },
          },
        );
      }
    }
  }

  /* ---------- Footer wordmark always spans the footer exactly ---------- */
  const wordmark = document.querySelector(".footer-wordmark");
  if (wordmark) {
    const fit = () => {
      wordmark.style.fontSize = "100px";
      const natural = wordmark.scrollWidth;
      const avail = wordmark.parentElement.clientWidth - parseFloat(getComputedStyle(wordmark.parentElement).paddingLeft) * 2;
      if (natural) wordmark.style.fontSize = `${Math.floor((100 * avail) / natural)}px`;
    };
    fit();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
    addEventListener("resize", fit);
  }

  reducedQuery.addEventListener("change", () => location.reload());

  /* ---------- Start ---------- */
  uncover();
})();
