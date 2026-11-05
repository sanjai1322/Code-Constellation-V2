/* Code Constellation — Work index: entrance, type filters, card reveals.
   The blob hover on cards lives in site.js (shared with the homepage list). */
(() => {
  const CC = window.CC || { reduced: true, onReveal: (fn) => fn() };
  const all = (s, el = document) => [...el.querySelectorAll(s)];
  const cards = all(".work-index .project-card");
  const chips = all(".filter-chip");
  const status = document.querySelector("[data-filter-status]");

  function apply(filter) {
    let shown = 0;
    cards.forEach((card) => {
      const on = filter === "all" || card.dataset.kind === filter;
      card.hidden = !on;
      if (on) shown++;
    });
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === filter)));
    if (status) status.textContent = `Showing ${shown} ${shown === 1 ? "project" : "projects"}`;
    if (!CC.reduced) {
      gsap.fromTo(
        cards.filter((c) => !c.hidden),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power3.out", overwrite: "auto" },
      );
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
  }
  chips.forEach((chip) => chip.addEventListener("click", () => apply(chip.dataset.filter)));

  if (CC.reduced) return;

  gsap.set(".work-page-title .line-mask > span", { yPercent: 110 });
  gsap.set(".work-hero .eyebrow, .work-intro p, .work-filters", { opacity: 0, y: 18 });
  gsap.set(".work-mascot", { opacity: 0, y: 40, rotation: -8 });
  CC.onReveal(() => {
    gsap
      .timeline({ defaults: { ease: "power4.out" } })
      .to(".work-hero .eyebrow", { opacity: 1, y: 0, duration: 0.6 }, 0)
      .to(".work-page-title .line-mask > span", { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.05)
      .to(".work-mascot", { opacity: 1, y: 0, rotation: 0, duration: 1, ease: "back.out(1.6)" }, 0.3)
      .to(".work-intro p", { opacity: 1, y: 0, duration: 0.8 }, 0.35)
      .to(".work-filters", { opacity: 1, y: 0, duration: 0.8 }, 0.45);
  });

  // Cards open from a soft inset as they enter, row by row.
  cards.forEach((card, i) => {
    gsap.fromTo(
      card.querySelector(".project-mask"),
      { clipPath: "inset(12% 10% 12% 10% round 32px)", scale: 1.1 },
      {
        clipPath: "inset(0% 0% 0% 0% round 0px)",
        scale: 1,
        duration: 1.1,
        ease: "expo.out",
        delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: card, start: "top 88%", once: true },
      },
    );
    gsap.from(card.querySelector(".project-meta"), {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: (i % 3) * 0.08 + 0.15,
      scrollTrigger: { trigger: card, start: "top 88%", once: true },
    });
  });
})();
