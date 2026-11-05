/* Code Constellation — case-study page motion. */
(() => {
  const CC = window.CC || { reduced: true, onReveal: (fn) => fn() };
  if (CC.reduced) return;
  gsap.config({ nullTargetWarn: false }); // the 404 page shares this script without a cover or meta

  gsap.set(".case-title .line-mask > span", { yPercent: 110 });
  gsap.set(".case-label, .case-lead, .case-meta > div, .case-topline, .lost-actions, .lost-mascot", { opacity: 0, y: 24 });
  gsap.set(".cover-mask", { clipPath: "inset(12% 8% 0% 8% round 48px)" });
  gsap.set(".cover-mask img", { scale: 1.25 });

  CC.onReveal(() => {
    gsap
      .timeline({ defaults: { ease: "power4.out" } })
      .to(".case-topline", { opacity: 1, y: 0, duration: 0.6 }, 0)
      .to(".lost-mascot", { opacity: 1, y: 0, duration: 1, ease: "back.out(1.6)" }, 0.3)
      .to(".case-label", { opacity: 1, y: 0, duration: 0.6 }, 0.05)
      .to(".case-title .line-mask > span", { yPercent: 0, duration: 1.1 }, 0.1)
      .to(".case-lead, .lost-actions", { opacity: 1, y: 0, duration: 0.9 }, 0.3)
      .to(".case-meta > div", { opacity: 1, y: 0, duration: 0.8, stagger: 0.07 }, 0.4)
      .to(".cover-mask", { clipPath: "inset(0% 0% 0% 0% round 32px)", duration: 1.5, ease: "expo.out" }, 0.35)
      .to(".cover-mask img", { scale: 1.08, duration: 1.5, ease: "expo.out" }, 0.35);
  });

  // Cover drifts as it scrolls past.
  const img = document.querySelector(".cover-mask img");
  if (img) {
    gsap.fromTo(
      img,
      { yPercent: -3 },
      { yPercent: 4, ease: "none", scrollTrigger: { trigger: ".case-cover", start: "top bottom", end: "bottom top", scrub: true } },
    );
  }

  // Image slots open from a soft inset, row by row.
  gsap.utils.toArray(".slot-grid .slot").forEach((el) =>
    gsap.fromTo(
      el,
      { clipPath: "inset(8% 6% round 40px)", opacity: 0.4 },
      {
        clipPath: "inset(0% 0% round 0px)",
        opacity: 1,
        duration: 1.1,
        ease: "expo.out",
        clearProps: "clipPath",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      },
    ),
  );

  gsap.utils.toArray(".case-body .case-col, .case-results li, .case-notes, .case-next, .unofficial-banner").forEach((el) =>
    gsap.from(el, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    }),
  );
})();
