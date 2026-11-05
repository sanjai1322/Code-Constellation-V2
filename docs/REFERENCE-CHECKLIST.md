# Reference checklist — two26.studio → Code Constellation

**Important limitation.** In both implementation passes (4 and 5 November 2026) the reference site (`two26.studio`) was blocked by the build environment's network policy, so it could not be browsed, scrolled, timed or inspected live. The supplied screen recordings — of our own site (1105.mp4) and of the reference itself (1105_1.mp4: home, card hovers, Work page and About page) — and the Code Constellation Brand Book v1.0 were used instead. Timings were judged from the recording at 2–4 frames per second, not measured on the live site. The mapping below follows the section structure already present in this repository (which was modelled on the reference) and the behaviours listed in the project brief. Items marked **needs live comparison** should be checked side by side against the reference once it is reachable; nothing here claims a pixel-perfect match.

Status key: ✅ implemented and verified in a browser · 🔶 implemented, needs live comparison with the reference · ⏳ awaiting content

## Pages and routes

| Reference | Ours | Status |
| --- | --- | --- |
| Home | `index.html` | ✅ / 🔶 |
| Work page ("To brag about") | `work.html` with type filters | ✅ 🔶 |
| About (own page) | `about.html` | ✅ / 🔶 |
| Project pages | `work/1xircle.html`, `poppio`, `tesla-roadster`, `vespera`, `ferrari-f1`, `sanjai-portfolio` | ✅ (content partly ⏳) |
| Missing route | `404.html` (served by static hosts that honour it) | ✅ |
| Nav: Work / About | Header pills; Work scrolls to `#work` (or deep-links from other pages), About opens its own page | ✅ |

## Global interactions

| Item | Ours | Status |
| --- | --- | --- |
| Initial loader / entrance | First visit per session: curtain with mark + name, then hero lines rise from masks, duo and companion rise, stickers pop | ✅ 🔶 timing |
| Page transitions | Orbit-blue curtain covers on link click, next page uncovers; bfcache back/forward never left covered | ✅ 🔶 |
| Header | Fixed; hides on scroll down, returns on scroll up; brush-stroke hover on pills; active state (`aria-current`) | ✅ 🔶 |
| Smooth scroll | Lenis, single instance driving ScrollTrigger | ✅ |
| Anchor scrolling / deep links | Smooth in-page anchors with history entries; deep links settle after pins and fonts, re-checked once | ✅ |
| Custom cursor | "View case" / "Next case" bubble on project links (fine pointers only) | ✅ 🔶 |
| Footer | Rising CTA lines, copy-email button, underline hovers, elastic letter-by-letter wordmark sized to fit | ✅ 🔶 |
| Reduced motion | No Lenis, pins, curtain or loops; full services path; clip posters; marquees become scrollable rows | ✅ |

## Homepage sections

| Reference section | Ours | Status |
| --- | --- | --- |
| Hero typography + masks | "From idea / to orbit." two masked lines | ✅ 🔶 |
| Hero composition | Centred group on the ribbon: coder (`<idea/>` board), re-keyed 3D mascot clip, designer (constellation board, "orbit."); orbit rings with travelling star; one glow; pointer parallax; duo drifts apart on scroll | ✅ 🔶 |
| Curved ribbon with moving text | SVG band with text on a path; drifts and responds to scroll | ✅ 🔶 speed |
| Pinned section with progressive text reveal | "A bit about us" pinned; characters go lavender → electric → ink while scrubbing; value pills pop | ✅ 🔶 pin length |
| Marquee | Direction follows scroll direction, speed boosts with scroll velocity; pause button | ✅ 🔶 base speed |
| Selected work | Liquid-glass WebGL carousel (original implementation) with HTML captions, counter, View project link; card list fallback | ✅ |
| Project cards | Reference hover from the recording: colour blob grows from the entry corner, detail crop follows; arrow swap, cursor label | ✅ 🔶 timing |
| "Whole page for that" | Link from the homepage to the Work page | ✅ |
| Services + winding path | Large transparent clips, sentence-case split titles, caption bubbles, measured path with exact leading marker that ends at the last caption, mobile channel composition; designer presents the heading | ✅ (precision tested) 🔶 composition |
| Presenting / waving characters | Coder presents Work, designer presents Services, mascot in FAQ, duo waves at the footer contact point, mascot waves in the contact dialog | ✅ |
| Motion control | Dock button pauses the hero clip, marquee, ribbon drift and orbit star; services have their own pause | ✅ |
| Card stack | Drag/swipe (pointer), arrow buttons, ← → keys, counter | ✅ 🔶 |
| FAQ | Height-animated open/close, one open at a time, rotating plus icon | ✅ 🔶 |

## About page

| Item | Ours | Status |
| --- | --- | --- |
| Composition | Left-aligned masked headline with intro and mono annotations; flat-cropped duo on an orbit-ring panel with clip-reveal, parallax and travelling star | ✅ 🔶 |
| Mission and vision | Brand-book text with word-by-word reveal | ✅ |
| Story sections | Two rows with presenting characters on the side they present from | ✅ 🔶 |
| Values | Brand-book five values as sticky stacking cards | ✅ 🔶 |
| Client journey | Entry → Expand → Orbit with a star travelling the dotted line | ✅ |
| Team ("This is pretty much everyone") | Three 4:5 showcase cards: Sanjai, Subhiksha, Sandeep with roles; lavender placeholders with S / SU / SA; hover, focus and touch states | ✅ ⏳ portraits |
| Pillars | Build / Brand & Create / Grow & Operate lists linking to Services | ✅ |
| Gallery | Velocity-aware marquee with pause; 3D mascot tile | ✅ |

## Case-study pages

Layout: back link and index, colour-coded type chip (client / concept / unofficial concept / lab), masked title, lead with technical meta grid, clip-revealed cover, unofficial-concept banner where relevant, overview, numbered deliverables, results (1Xircle only), a "Selected frames" gallery of seven labelled image placeholder slots per project, notes, previous / next project. Unknown facts are shown as "Awaiting content" or "Awaiting documentation". ✅ 🔶

## Content still needed

- 1Xircle: client quote (approval pending) and permission to show the real deck, explainer and logo.
- Poppio and Vespera: brief and deliverables.
- Tesla Roadster and Ferrari F1: deliverables.
- Sanjai creative portfolio: technology stack and interaction documentation.
- Portraits for Sanjai, Subhiksha and Sandeep (placeholders on About).
- Approved images for every case-study slot (1Xircle slots are marked "awaiting client approval").
