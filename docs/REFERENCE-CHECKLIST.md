# Reference checklist — two26.studio → Code Constellation

**Important limitation.** During this implementation pass the reference site (`two26.studio`) was blocked by the build environment's network policy, so it could not be browsed, scrolled or inspected live. The mapping below follows the section structure already present in this repository (which was modelled on the reference) and the behaviours listed in the project brief. Items marked **needs live comparison** should be checked side by side against the reference once it is reachable; nothing here claims a pixel-perfect match.

Status key: ✅ implemented and verified in a browser · 🔶 implemented, needs live comparison with the reference · ⏳ awaiting content

## Pages and routes

| Reference | Ours | Status |
| --- | --- | --- |
| Home | `index.html` | ✅ / 🔶 |
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
| Characters + pointer interaction | Coder + designer (crops of the original art) with Code / Constellation signs, waving companion clip; pointer parallax; drift apart on scroll | ✅ 🔶 |
| Curved ribbon with moving text | SVG band with text on a path; drifts and responds to scroll | ✅ 🔶 speed |
| Pinned section with progressive text reveal | "A bit about us" pinned; characters go lavender → electric → ink while scrubbing; value pills pop | ✅ 🔶 pin length |
| Marquee | Direction follows scroll direction, speed boosts with scroll velocity; pause button | ✅ 🔶 base speed |
| Project cards | Scroll-scrubbed mask reveal, hover inset + zoom, arrow swap, cursor label; links to case pages | ✅ 🔶 |
| Services + winding path | Large transparent clips, split titles, caption bubbles, measured path with exact leading marker, mobile channel composition | ✅ (precision tested) 🔶 composition |
| Card stack | Drag/swipe (pointer), arrow buttons, ← → keys, counter | ✅ 🔶 |
| FAQ | Height-animated open/close, one open at a time, rotating plus icon | ✅ 🔶 |

## About page

| Item | Ours | Status |
| --- | --- | --- |
| Composition | Masked headline, stickers, duo portrait with clip-reveal and parallax | ✅ 🔶 |
| Story sections | Statement with word-by-word reveal; two alternating story rows | ✅ 🔶 |
| Founder | Sanjai K, Founder (no photo available; monogram card) | ✅ |
| Principles | Four sticky stacking cards | ✅ 🔶 |
| Gallery | Velocity-aware marquee with pause | ✅ |
| Capabilities | Pill cloud linking to Services | ✅ |

## Case-study pages

Layout: back link, label, masked title, lead, meta grid, clip-revealed cover, overview, what we did, results (1Xircle only), notes, previous / next project. Unknown facts are shown as "Awaiting content" or "Awaiting documentation". ✅ 🔶

## Content still needed

- 1Xircle: client quote (approval pending) and permission to show the real deck, explainer and logo.
- Poppio and Vespera: brief and deliverables.
- Tesla Roadster and Ferrari F1: deliverables.
- Sanjai creative portfolio: technology stack and interaction documentation.
- Founder photo, if one should be used.
