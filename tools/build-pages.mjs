// Generates the static About page, case-study pages and 404 page into dist/.
// The site stays buildless at runtime; run `node tools/build-pages.mjs` after
// editing content here. Only verified project facts belong in PROJECTS.
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const V = "23";
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
    <script src="${base}js/sound.js?v=${V}" defer></script>
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
        <a class="pill" href="${base}work.html"${cur("work")}>Work</a>
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
      <div class="footer-top">
        <button class="footer-cta" type="button" data-contact>
          <span class="line"><span>Your next chapter.</span></span>
          <span class="line"><span>Let’s talk <span class="arrow-glyph" aria-hidden="true">↗</span></span></span>
        </button>
        <div class="footer-wave" aria-hidden="true">
          <img class="wave-coder" src="${base}assets/characters/coder-wave.webp" alt="" width="380" height="1000" loading="lazy" decoding="async" />
          <img class="wave-designer" src="${base}assets/characters/designer-wave.webp" alt="" width="516" height="1000" loading="lazy" decoding="async" />
        </div>
      </div>
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
          <a class="footer-link" href="${base}work.html">Work</a>
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
      <img class="dialog-mascot" src="${base}assets/characters/mascot-hello.webp" alt="" width="573" height="720" loading="lazy" decoding="async" />
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
    <div class="dock">
      <button class="dock-btn sound-toggle" type="button" aria-pressed="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4Z" /><path class="sound-wave" d="M16 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14" /></svg>
        <span>Sound off</span>
      </button>
      <button class="dock-btn motion-toggle" type="button" aria-pressed="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path class="i-pause" d="M9 6v12M15 6v12" /><path class="i-play" d="M8 5.5v13l10.5-6.5Z" /></svg>
        <span>Pause motion</span>
      </button>
    </div>
  </body>
</html>
`;
}

const page = (opts, body) => head(opts) + header(opts) + body + footer(opts);

/* ------------------------------------------------------------------ */
/* About — content from the Code Constellation Brand Book v1.0         */
/* ------------------------------------------------------------------ */
const VALUES = [
  ["Craft over noise", "Every pixel and every line of code earns its place."],
  ["Outcomes over output", "We sell transformation, not tasks."],
  ["Clarity always", "Plain words, honest timelines, no jargon."],
  ["Explore first", "We test new technology so our clients don’t have to."],
  ["Long orbit", "Relationships that last well beyond launch."],
];
const JOURNEY = [
  ["Entry", "Brand & Create", "One niche, one clear result. The door in: a brand, a launch site, a deck or a reel.", "Project"],
  ["Expand", "Build", "The product, site or system the brand runs on. Same team, no hand-offs.", "Project"],
  ["Orbit", "Grow & Operate", "Automation, CRM, SEO and analytics on a monthly retainer. Clients stay and grow with us.", "Retainer"],
];
// Team. To add a portrait, either save a 4:5 image as dist/assets/team/<slug>.webp
// (e.g. sanjai.webp) or set `photo` to its path under dist/, then run this script.
// No biographies, links or credentials are shown — names and roles only.
const TEAM = [
  { slug: "sanjai", name: "Sanjai", role: "Founder & CEO", initials: "S", photo: null },
  { slug: "subhiksha", name: "Subhiksha", role: "COO & Automation Engineer", initials: "SU", photo: null },
  { slug: "sandeep", name: "Sandeep", role: "Lead Editor", initials: "SA", photo: null },
];
const teamPhoto = (m) => m.photo || (existsSync(join(DIST, "assets", "team", `${m.slug}.webp`)) ? `assets/team/${m.slug}.webp` : null);

function teamCard(m, i, base) {
  const photo = teamPhoto(m);
  const portrait = photo
    ? `<img src="${base}${photo}" alt="Portrait of ${esc(m.name)}" width="1000" height="1250" loading="lazy" decoding="async" />`
    : `<svg class="team-rings" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none"><circle cx="330" cy="560" r="170" /><circle cx="330" cy="560" r="270" /><circle cx="330" cy="560" r="370" /></g></svg>
                <span class="team-mono" aria-hidden="true">${esc(m.initials)}</span>
                <span class="team-annot" aria-hidden="true">Portrait · 4:5</span>`;
  return `          <li>
            <article class="team-card${photo ? " has-photo" : ""}" tabindex="0" aria-labelledby="team-${m.slug}">
              <div class="team-portrait">
                ${portrait}
                <span class="team-sheen" aria-hidden="true"></span>
                <span class="team-index" aria-hidden="true">0${i + 1}</span>
              </div>
              <div class="team-info">
                <h3 id="team-${m.slug}">${esc(m.name)}</h3>
                <p>${esc(m.role)}</p>
              </div>
            </article>
          </li>`;
}

const PILLARS = [
  ["01", "Build", ["Websites and web apps", "SaaS products", "AI systems and integration", "Ecommerce and cloud"]],
  ["02", "Brand & Create", ["Brand identity and UI/UX", "3D, motion and AI films", "Pitch decks and campaigns", "Templates and content"]],
  ["03", "Grow & Operate", ["AI automation and agents", "CRM and revenue ops", "SEO and AI search", "Analytics and growth"]],
];

const orbitRings = (cls) => `<svg class="${cls}" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <g fill="none"><circle cx="1180" cy="680" r="260" /><circle cx="1180" cy="680" r="430" /><circle cx="1180" cy="680" r="600" /><circle cx="1180" cy="680" r="770" /></g>
            <circle class="ring-path" cx="1180" cy="680" r="515" fill="none" />
            <circle class="ring-star" cx="815" cy="316" r="7" />
          </svg>`;

function aboutPage() {
  const base = "";
  const body = `
    <main id="main">
      <section class="about-hero" aria-labelledby="about-title">
        <div class="about-hero-grid">
          <div>
            <p class="eyebrow about-eyebrow"><span class="star-dot" aria-hidden="true"></span>About the studio</p>
            <h1 id="about-title" class="about-title">
              <span class="line-mask"><span>Small studio.</span></span>
              <span class="line-mask"><span>Connected <em>thinking.</em></span></span>
            </h1>
          </div>
          <div class="about-intro">
            <p>A creative technology studio that designs, builds and grows ambitious brands.</p>
            <dl class="annot">
              <div><dt>Founded by</dt><dd>Sanjai K</dd></div>
              <div><dt>Based in</dt><dd>Tamil Nadu, India</dd></div>
              <div><dt>Working</dt><dd>Worldwide</dd></div>
            </dl>
          </div>
        </div>
        <figure class="about-portrait">
          <div class="portrait-frame">
            ${orbitRings("portrait-rings")}
            <img src="${base}assets/studio-duo.webp" alt="Our illustrated coder and designer, side by side" width="1276" height="828" fetchpriority="high" />
          </div>
          <figcaption class="annot-line"><span>Fig. 01</span> Our illustrated duo — the studio’s characters, not portraits of real people.</figcaption>
        </figure>
      </section>

      <section class="about-mission" aria-label="Mission and vision">
        <div class="mission-col">
          <p class="eyebrow">Mission</p>
          <p class="mission-copy">Give ambitious companies the design, engineering and AI of a world-class team, connected into one system that makes them look better, work smarter and grow faster.</p>
        </div>
        <div class="mission-col">
          <p class="eyebrow">Vision</p>
          <p class="mission-copy">A world where any ambitious business, wherever it starts, can launch and run like a global brand.</p>
          <p class="annot-line">Built from Tamil Nadu, for the world.</p>
        </div>
      </section>

      <section class="story" aria-label="Our story">
        <article class="story-row">
          <img class="story-person" src="${base}assets/characters/coder-present.webp" alt="" width="610" height="1000" loading="lazy" decoding="async" />
          <div class="story-text">
            <p class="eyebrow"><span class="story-num">01</span> Why we started</p>
            <h2>Good ideas deserve a connected team.</h2>
            <p>Founders and teams often juggle a designer, a developer and an automation freelancer who never talk to each other. Code Constellation was built so one team owns the whole constellation — from the first impression to the systems that run the business.</p>
          </div>
        </article>
        <article class="story-row is-reverse">
          <div class="story-text">
            <p class="eyebrow"><span class="story-num">02</span> Where we are going</p>
            <h2>Every service is a star. Together, a shape people recognise.</h2>
            <p>Brand, product and growth connect into one system. We bring design thinking and thoughtful engineering to the same table, with a focus on clarity, craft and work that lasts.</p>
          </div>
          <img class="story-person" src="${base}assets/characters/designer-present.webp" alt="" width="541" height="1000" loading="lazy" decoding="async" />
        </article>
      </section>

      <section class="values" aria-labelledby="values-title">
        <div class="block-head">
          <p class="eyebrow">Core values</p>
          <h2 id="values-title">Five values. One orbit.</h2>
        </div>
        <ol class="value-stack">
${VALUES.map(
  ([t, c], i) => `          <li class="value-card">
            <span class="value-num">0${i + 1}</span>
            <h3>${esc(t)}</h3>
            <p>${esc(c)}</p>
          </li>`,
).join("\n")}
        </ol>
      </section>

      <section class="journey-about" aria-labelledby="journey-title">
        <div class="block-head">
          <p class="eyebrow">The client journey</p>
          <h2 id="journey-title">How a client travels.</h2>
          <p class="block-sub">Every client enters through one pillar and grows into all three. Project, then retainer, then long-term partnership.</p>
        </div>
        <div class="journey-track">
          <svg class="journey-line-about" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true"><path d="M20 20 H1180" /></svg>
          <span class="journey-star" aria-hidden="true"></span>
          <ol class="journey-steps">
${JOURNEY.map(
  ([stage, pillar, copy, kind], i) => `            <li>
              <span class="step-dot" aria-hidden="true"></span>
              <p class="eyebrow">0${i + 1} · ${esc(stage)}</p>
              <h3>${esc(pillar)}</h3>
              <p>${esc(copy)}</p>
              <span class="step-kind">${esc(kind)}</span>
            </li>`,
).join("\n")}
          </ol>
        </div>
      </section>

      <section class="team" aria-labelledby="team-title">
        <div class="block-head">
          <p class="eyebrow">The team</p>
          <h2 id="team-title">The people behind the possibilities.</h2>
          <p class="block-sub">Meet the team connecting creativity, technology and execution.</p>
        </div>
        <ul class="team-grid">
${TEAM.map((m, i) => teamCard(m, i, base)).join("\n")}
        </ul>
      </section>

      <section class="pillars" aria-labelledby="pillars-title">
        <div class="block-head">
          <p class="eyebrow">Capabilities</p>
          <h2 id="pillars-title">Build. Brand. Grow.</h2>
          <p class="block-sub">Three pillars, one connected system.</p>
        </div>
        <div class="pillar-grid">
${PILLARS.map(
  ([n, name, items]) => `          <div class="pillar">
            <p class="eyebrow">${n}</p>
            <h3>${esc(name)}</h3>
            <ul>${items.map((it) => `<li><a href="${base}index.html#services">${esc(it)}</a></li>`).join("")}</ul>
          </div>`,
).join("\n")}
        </div>
      </section>

      <section class="about-gallery" aria-label="Inside our world">
        <div class="gallery-head">
          <p class="eyebrow">Inside our world</p>
        </div>
        <div class="gallery-viewport">
          <ul class="gallery-track">
            <li class="g-tile g-mark"><img src="${base}assets/cc-mark-light.svg" alt="Code Constellation crescent mark" width="160" height="160" /></li>
            <li class="g-tile g-type">Build.<br />Brand.<br />Grow.</li>
            <li class="g-tile g-image"><img src="${base}assets/project-roadster-sm.webp" alt="Tesla Roadster unofficial concept cover" width="768" height="512" loading="lazy" /><span>Unofficial concept</span></li>
            <li class="g-tile g-code"><span>&lt;idea&gt;</span><strong>Make it real.</strong><span>&lt;/idea&gt;</span></li>
            <li class="g-tile g-image"><img src="${base}assets/project-poppio-sm.webp" alt="Poppio concept cover" width="768" height="512" loading="lazy" /><span>Concept</span></li>
            <li class="g-tile g-mascot"><img src="${base}assets/characters/mascot-jump.webp" alt="Our blue companion, jumping" width="570" height="720" loading="lazy" /></li>
          </ul>
        </div>
      </section>

      <section class="about-cta" aria-label="Start a project">
        <h2>From idea to orbit.</h2>
        <button class="cta" type="button" data-contact><span class="label">Start a project</span>${arrowChip}</button>
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
// Image slots, in layout order: wide 16:9, tall 4:5, 4:3, strip 21:9, three squares.
// Replace a slot's .slot-frame with <img src="..." alt="..."> when an approved image exists.
const SLOT_SHAPES = [
  ["wide", "16 / 9", "2400 × 1350"],
  ["tall", "4 / 5", "1600 × 2000"],
  ["half", "4 / 3", "2000 × 1500"],
  ["strip", "21 / 9", "2520 × 1080"],
  ["square", "1 / 1", "1600 × 1600"],
  ["square", "1 / 1", "1600 × 1600"],
  ["square", "1 / 1", "1600 × 1600"],
];
const SLOTS = {
  "1xircle": ["Pitch deck — cover slide", "Logo — before and after", "Deck — product story spread", "Explainer — storyboard strip", "Explainer — frame 01", "Explainer — frame 02", "Logo — app icon"],
  poppio: ["Hero visual", "Brand mark", "Key visual — detail", "Wide brand scene", "Colour", "Typography", "Application"],
  "tesla-roadster": ["Product page — desktop hero", "Product page — mobile", "Storytelling section", "Scroll sequence strip", "Detail module 01", "Detail module 02", "Detail module 03"],
  vespera: ["Hero visual", "Detail", "Key frame", "Wide scene", "Frame 01", "Frame 02", "Frame 03"],
  "ferrari-f1": ["Team site — desktop hero", "Team site — mobile", "Motion frame", "Speed sequence strip", "Frame 01", "Frame 02", "Frame 03"],
  "sanjai-portfolio": ["Interactive 3D head — hero", "Mobile view", "Interaction still", "Process strip", "Still 01", "Still 02", "Still 03"],
};
const KIND = { "Client work": "client", Concept: "concept", "Unofficial concept": "unofficial", Lab: "lab" };

// Hover colour (brand palette only) and the focal point of the detail crop revealed on hover.
const CARD_STYLE = {
  "1xircle": ["#2F6BFF", "50% 46%"],
  poppio: ["#C9CAEE", "42% 55%"],
  "tesla-roadster": ["#0A1033", "40% 62%"],
  vespera: ["#8A90EE", "56% 42%"],
  "ferrari-f1": ["#2B45D8", "46% 60%"],
  "sanjai-portfolio": ["#0A1033", "62% 40%"],
};

function card(p, base, indent = "          ") {
  const [accent, focus] = CARD_STYLE[p.slug];
  const kind = KIND[p.label] || "concept";
  const img = `${base}assets/${p.image}.webp`;
  return `${indent}<li class="project-card" data-kind="${kind}" style="--accent: ${accent}; --focus: ${focus}">
${indent}  <a href="${base}work/${p.slug}.html" data-cursor="View case">
${indent}    <div class="project-media">
${indent}      <div class="project-mask"><img src="${img}" alt="" width="1536" height="1024" loading="lazy" decoding="async" /></div>
${indent}      <span class="blob blob-fill" aria-hidden="true"></span>
${indent}      <span class="blob blob-detail" aria-hidden="true"><img src="${img}" alt="" width="1536" height="1024" loading="lazy" decoding="async" /></span>
${indent}      <span class="project-tag kind-chip kind-${kind}">${esc(p.label)}</span>
${indent}    </div>
${indent}    <div class="project-meta">
${indent}      <h3>${esc(p.name)}</h3>
${indent}      <p>${esc(p.category)}</p>
${indent}      <span class="arrow-chip"></span>
${indent}    </div>
${indent}  </a>
${indent}</li>`;
}

/* ------------------------------------------------------------------ */
/* Work index                                                          */
/* ------------------------------------------------------------------ */
function workPage() {
  const base = "";
  const counts = PROJECTS.reduce((m, p) => ((m[KIND[p.label]] = (m[KIND[p.label]] || 0) + 1), m), {});
  const filters = [
    ["all", "All", PROJECTS.length],
    ["client", "Client work", counts.client || 0],
    ["concept", "Concept", counts.concept || 0],
    ["unofficial", "Unofficial concept", counts.unofficial || 0],
    ["lab", "Lab", counts.lab || 0],
  ].filter(([, , c]) => c > 0);
  const body = `
    <main id="main">
      <section class="work-hero" aria-labelledby="work-page-title">
        <div>
          <p class="eyebrow"><span class="star-dot" aria-hidden="true"></span>Work</p>
          <h1 id="work-page-title" class="work-page-title">
            <span class="line-mask"><span>Ideas,</span></span>
            <span class="line-mask"><span>made <em>tangible.</em></span></span>
          </h1>
        </div>
        <div class="work-intro">
          <img class="work-mascot" src="${base}assets/characters/mascot-point.webp" alt="" width="565" height="720" decoding="async" />
          <p>Client work, independent concepts and lab experiments. Every project is labelled for what it is.</p>
        </div>
      </section>

      <section class="work-list" aria-label="All projects">
        <div class="work-filters" role="group" aria-label="Filter projects">
${filters.map(([key, label, c], i) => `          <button class="filter-chip" type="button" data-filter="${key}" aria-pressed="${i === 0}">${esc(label)} <span>${String(c).padStart(2, "0")}</span></button>`).join("\n")}
        </div>
        <p class="sr-only" aria-live="polite" data-filter-status></p>
        <ul class="work-grid work-index">
${PROJECTS.map((p) => card(p, base)).join("\n")}
        </ul>
      </section>
    </main>
`;
  return page(
    {
      base,
      css: "work",
      current: "work",
      title: "Work — Code Constellation",
      description: "Client work, independent concepts and lab experiments by Code Constellation, each labelled for what it is.",
    },
    body,
  );
}

function slot(label, [shape, ar, px], n, pending) {
  return `          <figure class="slot slot-${shape}" style="--ar: ${ar}">
            <div class="slot-frame">
              <span class="slot-icon" aria-hidden="true"></span>
              <span class="slot-label">${esc(label)}</span>
              <span class="slot-annot">IMG ${String(n).padStart(2, "0")} · ${ar.replace(/ /g, "")} · ${px} · ${pending}</span>
            </div>
          </figure>`;
}

function casePage(p, i) {
  const base = "../";
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const kind = KIND[p.label] || "concept";
  const unofficial = p.label === "Unofficial concept";
  const pending = p.slug === "1xircle" ? "Awaiting client approval" : "Placeholder";
  const did = p.did
    ? `<ol class="case-list">${p.did.map((d, k) => `<li><span>0${k + 1}</span>${esc(d)}</li>`).join("")}</ol>`
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
  const disclaimer = unofficial ? `<p class="unofficial-banner"><span class="star-dot" aria-hidden="true"></span>${esc(p.notes[0])}</p>` : "";
  const body = `
    <main id="main" class="case case-${kind}">
      <section class="case-hero" aria-labelledby="case-title">
        <div class="case-topline">
          <a class="back-link" href="${base}work.html"><span aria-hidden="true">←</span> All work</a>
          <span class="case-index">${String(i + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}</span>
        </div>
        <p class="case-label"><span class="kind-chip kind-${kind}">${esc(p.label)}</span><span class="eyebrow">${esc(p.category)}</span></p>
        <h1 id="case-title" class="case-title"><span class="line-mask"><span>${esc(p.name)}</span></span></h1>
        <div class="case-intro">
          <p class="case-lead">${esc(p.lead)}</p>
          <dl class="case-meta">
${p.meta.map(([k, v]) => `            <div><dt>${esc(k)}</dt><dd${/awaiting/i.test(v) ? ' class="is-awaiting"' : ""}>${esc(v)}</dd></div>`).join("\n")}
          </dl>
        </div>
      </section>

      <figure class="case-cover">
        <div class="cover-mask">
          <img src="${base}assets/${p.image}.webp" alt="${esc(p.alt)}" width="1536" height="1024" fetchpriority="high" />
        </div>
        <figcaption class="annot-line"><span>Fig. 01</span> Illustrative cover artwork${unofficial ? " · Unofficial concept" : ""}</figcaption>
      </figure>
      ${disclaimer}

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
      <section class="case-gallery" aria-labelledby="gallery-title">
        <div class="gallery-title-row">
          <p class="eyebrow" id="gallery-title">Selected frames</p>
          <p class="gallery-note">${p.slug === "1xircle" ? "Image slots reserved for the delivered work, pending client approval." : "Image slots reserved for project visuals."}</p>
        </div>
        <div class="slot-grid">
${SLOTS[p.slug].map((label, k) => slot(label, SLOT_SHAPES[k], k + 2, pending)).join("\n")}
        </div>
      </section>

      <aside class="case-notes" aria-label="Notes on this project">
        <p class="eyebrow">Notes</p>
        <ul>
${p.notes.map((n) => `          <li>${esc(n)}</li>`).join("\n")}
        </ul>
      </aside>

      <nav class="case-nav" aria-label="More projects">
        <a class="case-prev" href="${prev.slug}.html"><span aria-hidden="true">←</span> ${esc(prev.name)}</a>
        <a class="case-next" href="${next.slug}.html" data-cursor="Next case">
          <span class="eyebrow">Next project · ${esc(next.label)}</span>
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
        <img class="lost-mascot" src="/assets/characters/mascot-point.webp" alt="" width="565" height="720" />
        <p class="eyebrow">Error 404</p>
        <h1 class="case-title"><span class="line-mask"><span>Lost in orbit.</span></span></h1>
        <p class="case-lead">This page drifted out of range. Head back to the studio or see our work.</p>
        <p class="lost-actions"><a class="cta" href="/index.html"><span class="label">Back home</span>${arrowChip}</a> <a class="pill" href="/work.html">See work</a></p>
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
out("work.html", workPage());

// Homepage: the fallback card list under the carousel is generated from the same data.
{
  const file = join(DIST, "index.html");
  const html = readFileSync(file, "utf8");
  const start = "<!-- work-cards:start (generated by tools/build-pages.mjs) -->";
  const end = "<!-- work-cards:end -->";
  const a = html.indexOf(start);
  const b = html.indexOf(end);
  if (a < 0 || b < 0) throw new Error("work-cards markers missing in index.html");
  const cards = PROJECTS.map((p) => card(p, "")).join("\n");
  writeFileSync(file, html.slice(0, a + start.length) + "\n" + cards + "\n          " + html.slice(b));
  console.log("updated index.html work cards");
}
