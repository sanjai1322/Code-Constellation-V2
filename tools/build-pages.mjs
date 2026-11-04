// Generates the static About page, case-study pages and 404 page into dist/.
// The site stays buildless at runtime; run `node tools/build-pages.mjs` after
// editing content here. Only verified project facts belong in PROJECTS.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const V = "20";
const EMAIL = "codeconstellation.business@gmail.com";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ------------------------------------------------------------------ */
/* Projects — verified content only. Unknowns are marked as awaiting.  */
/* ------------------------------------------------------------------ */
const PROJECTS = [
  {
    slug: "1xircle",
    name: "1Xircle",
    label: "Client work",
    category: "Investor storytelling",
    image: "project-1xircle",
    alt: "Illustrative cover artwork for 1Xircle",
    lead: "An AI-powered stokvel and savings-circle platform in South Africa, needing to explain its product to investors clearly and quickly.",
    meta: [
      ["Client", "1Xircle"],
      ["Market", "South Africa"],
      ["Type", "Client work"],
      ["Deliverables", "Investor pitch deck, 60-second explainer, logo clean-up"],
    ],
    overview:
      "1Xircle is building an AI-powered platform for stokvels — community savings circles. We connected three pieces of work around one investor story: the pitch deck, a 60-second explainer and a clean-up of the existing logo.",
    did: ["Investor pitch deck", "60-second explainer", "Logo clean-up"],
    results: [
      ["10/10", "Reviewer rating for the investor deck"],
      ["✓", "Successful investor meeting"],
    ],
    notes: [
      "A client quote is awaiting approval and is not shown.",
      "Permission to display the delivered deck, explainer and logo is pending. The artwork on this page is illustrative.",
    ],
  },
  {
    slug: "poppio",
    name: "Poppio",
    label: "Concept",
    category: "Brand exploration",
    image: "project-poppio",
    alt: "Illustrative cover artwork for the Poppio concept",
    lead: "An independent concept exploration by the studio.",
    meta: [
      ["Type", "Concept"],
      ["Focus", "Brand exploration"],
      ["Brief", "Awaiting content"],
      ["Deliverables", "Awaiting content"],
    ],
    overview: "Poppio is a self-initiated concept. The brief, deliverables and case-study details are still being prepared.",
    did: null,
    results: null,
    notes: ["This cover is an illustrative visual direction, not a commissioned client project."],
  },
  {
    slug: "tesla-roadster",
    name: "Tesla Roadster",
    label: "Unofficial concept",
    category: "Product storytelling",
    image: "project-roadster",
    alt: "Illustrative cover artwork for the unofficial Tesla Roadster product-page concept",
    lead: "An unofficial concept for an improved Roadster product page, exploring premium product storytelling.",
    meta: [
      ["Type", "Unofficial concept"],
      ["Focus", "Product-page storytelling"],
      ["Brief", "Self-initiated"],
      ["Deliverables", "Awaiting content"],
    ],
    overview:
      "A self-initiated exploration of how a premium product page could tell a stronger story — pacing, hierarchy and moments of emphasis around the product.",
    did: null,
    results: null,
    notes: [
      "Unofficial concept. Not commissioned by, affiliated with or endorsed by Tesla.",
      "The cover illustrates the direction; it is not a screenshot of a live website.",
    ],
  },
  {
    slug: "vespera",
    name: "Vespera",
    label: "Concept",
    category: "Creative exploration",
    image: "project-vespera",
    alt: "Illustrative cover artwork for the Vespera concept",
    lead: "An independent concept exploration by the studio.",
    meta: [
      ["Type", "Concept"],
      ["Focus", "Creative exploration"],
      ["Brief", "Awaiting content"],
      ["Deliverables", "Awaiting content"],
    ],
    overview: "Vespera is a self-initiated concept. The brief, deliverables and case-study details are still being prepared.",
    did: null,
    results: null,
    notes: ["This cover is an illustrative visual direction, not a commissioned client project."],
  },
  {
    slug: "ferrari-f1",
    name: "Ferrari F1",
    label: "Unofficial concept",
    category: "Cinematic team-site concept",
    image: "project-ferrari",
    alt: "Illustrative cover artwork for the unofficial Ferrari F1 team-site concept",
    lead: "An unofficial, cinematic team-site exploration focused on motion and speed.",
    meta: [
      ["Type", "Unofficial concept"],
      ["Focus", "Motion and speed"],
      ["Brief", "Self-initiated"],
      ["Deliverables", "Awaiting content"],
    ],
    overview: "A self-initiated exploration of how a racing team site could feel cinematic — using motion and pace to communicate speed.",
    did: null,
    results: null,
    notes: [
      "Unofficial concept. Not commissioned by, affiliated with or endorsed by Ferrari or Formula 1.",
      "The cover illustrates the concept direction.",
    ],
  },
  {
    slug: "sanjai-portfolio",
    name: "Sanjai creative portfolio",
    label: "Lab",
    category: "Interactive 3D head",
    image: "project-sanjai",
    alt: "Illustrative cover artwork for Sanjai's creative portfolio",
    lead: "A personal creative portfolio built around an interactive 3D head.",
    meta: [
      ["Type", "Lab"],
      ["Focus", "Interactive 3D"],
      ["Technology", "Awaiting documentation"],
      ["Interaction details", "Awaiting documentation"],
    ],
    overview: "A studio lab project: Sanjai K’s personal portfolio, designed around an interactive 3D head as its centrepiece.",
    did: null,
    results: null,
    notes: ["Technology stack and interaction documentation are being prepared. The cover is illustrative."],
  },
];

/* ------------------------------------------------------------------ */
/* Shared layout                                                       */
/* ------------------------------------------------------------------ */
const arrowChip = '<span class="arrow-chip"></span>';

function head({ title, description, css, base }) {
  return `<!doctype html>
<html lang="en" data-page="${css}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#F1F2FB" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="icon" href="${base}assets/cc-mark-light.svg" />
    <link rel="preload" href="${base}assets/font-1.ttf" as="font" type="font/ttf" crossorigin />
    <link rel="stylesheet" href="${base}assets/fonts.css" />
    <link rel="stylesheet" href="${base}css/site.css?v=${V}" />
    <link rel="stylesheet" href="${base}css/${css}.css?v=${V}" />
    <script src="${base}js/boot.js"></script>
    <script src="${base}assets/gsap.min.js" defer></script>
    <script src="${base}assets/ScrollTrigger.min.js" defer></script>
    <script src="${base}assets/lenis.min.js" defer></script>
    <script src="${base}js/site.js?v=${V}" defer></script>
    <script src="${base}js/${css}.js?v=${V}" defer></script>
  </head>
  <body id="top">
    <div class="curtain" aria-hidden="true">
      <div class="curtain-inner">
        <img src="${base}assets/cc-mark-light.svg" alt="" width="120" height="120" />
        <p class="curtain-name"><span>Code</span> <span>Constellation</span></p>
        <p class="eyebrow">From idea to orbit.</p>
      </div>
    </div>
    <a class="skip-link" href="#main">Skip to content</a>
`;
}

function header({ base, current }) {
  const cur = (k) => (current === k ? ' aria-current="page"' : "");
  return `    <header class="site-header">
      <nav aria-label="Main">
        <a class="pill" href="${base}index.html#work"${cur("work")}>Work</a>
        <a class="pill" href="${base}about.html"${cur("about")}>About</a>
      </nav>
      <a class="brand" href="${base}index.html" aria-label="Code Constellation home">
        <img src="${base}assets/cc-mark-light.svg" alt="" width="44" height="44" /><span>Code<br />Constellation</span>
      </a>
      <div class="header-right">
        <p class="tiny">Built in Tamil Nadu.<br />Working worldwide.</p>
        <button class="cta" type="button" data-contact><span class="label">Let’s talk</span>${arrowChip}</button>
      </div>
    </header>
`;
}

function footer({ base }) {
  return `    <footer class="site-footer">
      <p class="eyebrow">Enough scrolling. Let’s make something.</p>
      <button class="footer-cta" type="button" data-contact>
        <span class="line"><span>Your next chapter.</span></span>
        <span class="line"><span>Let’s talk <span class="arrow-glyph" aria-hidden="true">↗</span></span></span>
      </button>
      <div class="footer-grid">
        <div>
          <p class="eyebrow">Email us</p>
          <div class="email-row">
            <a class="footer-link" href="mailto:${EMAIL}">${EMAIL}</a>
            <button class="copy-email" type="button" data-copy="${EMAIL}">Copy</button>
          </div>
        </div>
        <div>
          <p class="eyebrow">Explore</p>
          <a class="footer-link" href="${base}index.html#work">Work</a>
          <a class="footer-link" href="${base}about.html">About</a>
          <a class="footer-link" href="${base}index.html#services">Services</a>
        </div>
        <div>
          <p class="eyebrow">Based here. Built for everywhere.</p>
          <p>Tamil Nadu, India<br />Working worldwide</p>
        </div>
      </div>
      <div class="footer-bottom">
        <a class="brand" href="${base}index.html"><img src="${base}assets/cc-mark-light.svg" alt="" width="34" height="34" /><span>Code Constellation</span></a>
        <span>© 2026 Code Constellation</span>
        <a class="footer-link" href="#top">Back to top ↑</a>
      </div>
      <p class="footer-wordmark" aria-hidden="true">Code Constellation</p>
    </footer>

    <dialog id="contact" aria-labelledby="contact-title">
      <button class="close" type="button" aria-label="Close contact dialog">×</button>
      <p class="eyebrow">Start a conversation</p>
      <h2 id="contact-title">What are you working on?</h2>
      <p>Tell us a little about your idea, your goals and your timeline.</p>
      <form class="contact-form">
        <label>Your name<input name="name" autocomplete="name" required placeholder="Name" /></label>
        <label>Your email<input name="email" type="email" autocomplete="email" required placeholder="you@company.com" /></label>
        <label>What do you have in mind?<textarea name="brief" required rows="3" placeholder="A brand, a website, a better way of working…"></textarea></label>
        <button class="cta" type="submit"><span class="label">Open email draft</span>${arrowChip}</button>
        <p class="form-note">Opens your email app with your brief. Nothing is sent automatically.</p>
      </form>
      <a class="direct-email" href="mailto:${EMAIL}">Or email us directly ↗</a>
    </dialog>
  </body>
</html>
`;
}

const page = (opts, body) => head(opts) + header(opts) + body + footer(opts);

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */
const ABOUT_PRINCIPLES = [
  ["Start with the right question.", "We begin with your goals, your audience and the problem worth solving. A clearer question gives every design and engineering decision a purpose."],
  ["Give good ideas room.", "We explore, test and refine. Making space for thoughtful work helps us find a direction with character and substance."],
  ["Make every detail useful.", "A strong identity and a smooth experience should work together. We care about how things look, what they communicate and how they feel to use."],
  ["Keep it clear.", "We simplify the message, the interface and the way we work together. Complexity belongs behind the scenes, not between you and your customers."],
];
const CAPABILITIES = [
  "Brand strategy", "Visual identity", "Logo design", "Brand guidelines", "Pitch decks", "Web design", "Web development", "Ecommerce",
  "SaaS products", "AI agents", "Workflow automation", "CRM systems", "3D visuals", "Motion design", "AI films", "SEO", "AI search",
  "Analytics", "Growth optimization",
];

function aboutPage() {
  const base = "";
  const body = `
    <main id="main">
      <section class="about-hero" aria-labelledby="about-title">
        <p class="eyebrow about-eyebrow">About the studio</p>
        <h1 id="about-title" class="about-title">
          <span class="line-mask"><span>Small studio.</span></span>
          <span class="line-mask"><span>Connected thinking.</span></span>
        </h1>
        <span class="sticker sticker-a" aria-hidden="true">Design meets technology</span>
        <span class="sticker sticker-b" aria-hidden="true">Built in Tamil Nadu</span>
        <figure class="about-portrait">
          <div class="portrait-mask">
            <img src="${base}assets/studio-original-duo.webp" alt="Our illustrated coder and designer, side by side" width="1536" height="1024" fetchpriority="high" />
          </div>
          <figcaption>Our illustrated duo — the studio’s characters, not portraits of real people.</figcaption>
        </figure>
      </section>

      <section class="about-statement" aria-label="Who we are">
        <p class="statement-copy">Code Constellation brings design, engineering and growth together. Founded by Sanjai K in Tamil Nadu, India, we help ambitious teams move from idea to orbit — and we work with them wherever they are.</p>
      </section>

      <section class="story" aria-label="Our story">
        <article class="story-row">
          <span class="story-index" aria-hidden="true">01</span>
          <div class="story-text">
            <p class="eyebrow">Why we started</p>
            <h2>Good ideas deserve a connected team.</h2>
            <p>Brand, technology and growth work best when they work together. Code Constellation was built around that idea: one studio connecting how a business looks, how it works and how it reaches people.</p>
          </div>
          <div class="story-art story-art-mark" aria-hidden="true"><img src="${base}assets/cc-mark-light.svg" alt="" width="200" height="200" /></div>
        </article>
        <article class="story-row is-reverse">
          <span class="story-index" aria-hidden="true">02</span>
          <div class="story-text">
            <p class="eyebrow">Where we are going</p>
            <h2>One studio. A wider perspective.</h2>
            <p>From a clear identity to a useful digital product, we look at the whole picture. We bring design thinking and thoughtful engineering to the same table, with a focus on clarity, craft and work that lasts.</p>
          </div>
          <div class="story-art story-art-companion" aria-hidden="true"><img src="${base}assets/companion-ink.webp" alt="" width="1246" height="1262" loading="lazy" /></div>
        </article>
      </section>

      <section class="founder" aria-labelledby="founder-title">
        <div class="founder-card">
          <span class="founder-mono" aria-hidden="true">SK</span>
          <p class="eyebrow">Founder</p>
          <h2 id="founder-title">Sanjai K</h2>
          <p>Founder of Code Constellation, based in Tamil Nadu, India.</p>
          <a class="cta" href="${base}work/sanjai-portfolio.html"><span class="label">See Sanjai’s portfolio lab</span>${arrowChip}</a>
        </div>
      </section>

      <section class="principles" aria-labelledby="principles-title">
        <div class="principles-head">
          <p class="eyebrow">How we work</p>
          <h2 id="principles-title">Four studio principles.</h2>
        </div>
        <ol class="principle-stack">
${ABOUT_PRINCIPLES.map(
  ([t, c], i) => `          <li class="principle-card">
            <span class="principle-num">0${i + 1}</span>
            <h3>${esc(t)}</h3>
            <p>${esc(c)}</p>
          </li>`,
).join("\n")}
        </ol>
      </section>

      <section class="about-gallery" aria-label="Inside our world">
        <div class="gallery-head">
          <p class="eyebrow">Inside our world</p>
          <button class="ghost-btn gallery-toggle" type="button" aria-pressed="false">Pause motion</button>
        </div>
        <div class="gallery-viewport">
          <ul class="gallery-track">
            <li class="g-tile g-mark"><img src="${base}assets/cc-mark-light.svg" alt="Code Constellation crescent mark" width="160" height="160" /></li>
            <li class="g-tile g-type">Build.<br />Brand.<br />Grow.</li>
            <li class="g-tile g-image"><img src="${base}assets/project-roadster-sm.webp" alt="Tesla Roadster unofficial concept cover" width="768" height="512" loading="lazy" /></li>
            <li class="g-tile g-code"><span>&lt;idea&gt;</span><strong>Make it real.</strong><span>&lt;/idea&gt;</span></li>
            <li class="g-tile g-image"><img src="${base}assets/project-poppio-sm.webp" alt="Poppio concept cover" width="768" height="512" loading="lazy" /></li>
            <li class="g-tile g-companion"><img src="${base}assets/companion-ink.webp" alt="Our blue companion" width="1246" height="1262" loading="lazy" /></li>
          </ul>
        </div>
      </section>

      <section class="capabilities" aria-labelledby="cap-title">
        <p class="eyebrow">Capabilities</p>
        <h2 id="cap-title">One studio. Plenty of range.</h2>
        <ul class="cap-cloud">
${CAPABILITIES.map((c) => `          <li><a href="${base}index.html#services">${esc(c)}</a></li>`).join("\n")}
        </ul>
        <button class="cta" type="button" data-contact><span class="label">Find your next step</span>${arrowChip}</button>
      </section>
    </main>
`;
  return page(
    {
      base,
      css: "about",
      current: "about",
      title: "About — Code Constellation",
      description: "Code Constellation is a creative technology studio founded by Sanjai K in Tamil Nadu, India, working worldwide.",
    },
    body,
  );
}

/* ------------------------------------------------------------------ */
/* Case studies                                                        */
/* ------------------------------------------------------------------ */
function casePage(p, i) {
  const base = "../";
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const did = p.did
    ? `<ul class="case-list">${p.did.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>`
    : `<p class="awaiting"><span class="awaiting-dot" aria-hidden="true"></span>Brief and deliverables awaiting content.</p>`;
  const results = p.results
    ? `
      <section class="case-results" aria-labelledby="results-title">
        <p class="eyebrow" id="results-title">Results</p>
        <ul>
${p.results.map(([big, small]) => `          <li><strong>${esc(big)}</strong><span>${esc(small)}</span></li>`).join("\n")}
        </ul>
      </section>`
    : "";
  const body = `
    <main id="main" class="case">
      <section class="case-hero" aria-labelledby="case-title">
        <a class="back-link" href="${base}index.html#work"><span aria-hidden="true">←</span> All work</a>
        <p class="eyebrow case-label">${esc(p.label)} · ${esc(p.category)}</p>
        <h1 id="case-title" class="case-title"><span class="line-mask"><span>${esc(p.name)}</span></span></h1>
        <p class="case-lead">${esc(p.lead)}</p>
        <dl class="case-meta">
${p.meta.map(([k, v]) => `          <div><dt>${esc(k)}</dt><dd${/awaiting/i.test(v) ? ' class="is-awaiting"' : ""}>${esc(v)}</dd></div>`).join("\n")}
        </dl>
      </section>

      <figure class="case-cover">
        <div class="cover-mask">
          <img src="${base}assets/${p.image}.webp" alt="${esc(p.alt)}" width="1536" height="1024" fetchpriority="high" />
        </div>
        <figcaption>Illustrative artwork.</figcaption>
      </figure>

      <section class="case-body" aria-label="Case study">
        <div class="case-col">
          <p class="eyebrow">Overview</p>
          <p class="case-overview">${esc(p.overview)}</p>
        </div>
        <div class="case-col">
          <p class="eyebrow">What we did</p>
          ${did}
        </div>
      </section>
${results}
      <aside class="case-notes" aria-label="Notes on this project">
        <p class="eyebrow">Notes</p>
        <ul>
${p.notes.map((n) => `          <li>${esc(n)}</li>`).join("\n")}
        </ul>
      </aside>

      <nav class="case-nav" aria-label="More projects">
        <a class="case-prev" href="${prev.slug}.html"><span aria-hidden="true">←</span> ${esc(prev.name)}</a>
        <a class="case-next" href="${next.slug}.html" data-cursor="Next case">
          <span class="eyebrow">Next project</span>
          <span class="next-name">${esc(next.name)}</span>
          <span class="next-media"><img src="${base}assets/${next.image}-sm.webp" alt="" width="768" height="512" loading="lazy" /></span>
        </a>
      </nav>
    </main>
`;
  return page(
    {
      base,
      css: "case",
      current: "work",
      title: `${p.name} — Code Constellation`,
      description: `${p.label}: ${p.lead}`,
    },
    body,
  );
}

/* ------------------------------------------------------------------ */
/* 404                                                                 */
/* ------------------------------------------------------------------ */
function notFound() {
  // Root-relative so it works from any missing path on a root-hosted site.
  const base = "/";
  const body = `
    <main id="main" class="case">
      <section class="case-hero lost">
        <p class="eyebrow">Error 404</p>
        <h1 class="case-title"><span class="line-mask"><span>Lost in orbit.</span></span></h1>
        <p class="case-lead">This page drifted out of range. Head back to the studio or see our work.</p>
        <p class="lost-actions"><a class="cta" href="/index.html"><span class="label">Back home</span>${arrowChip}</a> <a class="pill" href="/index.html#work">See work</a></p>
      </section>
    </main>
`;
  return page({ base, css: "case", current: "", title: "Page not found — Code Constellation", description: "Page not found." }, body);
}

/* ------------------------------------------------------------------ */
const out = (rel, html) => {
  const file = join(DIST, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log("wrote", rel);
};
out("about.html", aboutPage());
PROJECTS.forEach((p, i) => out(`work/${p.slug}.html`, casePage(p, i)));
out("404.html", notFound());
