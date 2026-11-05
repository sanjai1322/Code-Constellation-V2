# Hero boards — concept and image prompts

## Concept

The coder and designer each hold a board. Instead of splitting the studio name across them, the boards show the first two pillars of the brand book, and the sticker above completes the line:

| Board | Pillar | What is drawn |
| --- | --- | --- |
| Coder (left) | **Build** | A hand-drawn website wireframe: browser window, hatched hero block, two text lines, a `</>` code badge and a cursor clicking the hero block |
| Designer (right) | **Brand** | The official crescent mark inside a dashed orbit ring, three palette swatches (Orbit, Electric, Lavender), "Aa" for type and a pencil |

The site currently ships these as inline SVG (`dist/index.html`, `.board-build` and `.board-brand`), drawn in the characters' ink-and-blue palette with a faint hand-drawn wobble and animated in after the duo lands. Painted versions can replace them using the prompts below.

**Brand-book rule:** never redraw the logo. The designer's board uses the master file `assets/cc-mark-light.svg`. Generated artwork must leave the logo area empty so the real mark is placed on top.

## Option A — flat board artwork (recommended)

Generate each board as a flat, front-facing illustration, then place it on the existing board (the site already tilts it to match: −4° coder, +5.6° designer).

Output: transparent PNG, 2048 × 960 (about 2.13:1), artwork filling the canvas with a small margin.

### Prompt — "Build" board (coder)

> A flat, front-facing illustration for a white cardboard sign, in exactly the same hand-drawn style as the attached character sheet: imperfect dark navy ink outlines (#0A1033), dry gouache fills with visible brush grain, light hatching, flat 2D editorial cartoon shading. Subject: a simple website wireframe sketch — a rounded browser window with three small dots in the top bar, a wide hero block filled with cobalt blue (#2B45D8) and electric-blue hatching (#2F6BFF), two short lavender text lines (#8A90EE) below it, a dark navy rounded square on the right containing a "</>" code symbol in off-white with the slash in electric blue, and a white mouse cursor with a navy outline clicking the hero block. Palette only: #0A1033, #2B45D8, #2F6BFF, #8A90EE, #C9CAEE, #F1F2FB. Transparent background, no sign edges, no hands, no shadows, no other text, no logos, no rockets, no stars, no gradients, no 3D.

### Prompt — "Brand" board (designer)

> A flat, front-facing illustration for a white cardboard sign, in exactly the same hand-drawn style as the attached character sheet: imperfect dark navy ink outlines (#0A1033), dry gouache fills with visible brush grain, flat 2D editorial cartoon shading. Subject: a designer's brand sketch — on the left, an EMPTY circular area about 40% of the canvas height, ringed by a thin dashed lavender circle (#8A90EE) with nothing inside it (the real logo is placed there later); on the right, three round paint swatches in a row (cobalt #2B45D8, electric blue #2F6BFF, lavender #C9CAEE) with navy outlines, below them the letters "Aa" in a clean geometric sans-serif in navy, and a lavender pencil with a navy tip lying diagonally beneath. Palette only: #0A1033, #2B45D8, #2F6BFF, #8A90EE, #C9CAEE, #F1F2FB. Transparent background, no sign edges, no hands, no shadows, no other text, do not draw any logo, moon or crescent, no gradients, no 3D.

### Putting them on the site

1. Save as `dist/assets/boards/board-build.webp` and `dist/assets/boards/board-brand.webp`. Keep the transparency.
2. In `dist/index.html`, replace the `<svg class="board-art">…</svg>` inside `.board-build` with:
   `<img class="board-art" src="assets/boards/board-build.webp" alt="" width="2048" height="960" />`
3. For `.board-brand`, keep the official logo on top: replace the SVG with
   `<img class="board-art" src="assets/boards/board-brand.webp" alt="" width="2048" height="960" />` followed by
   `<img class="board-logo" src="assets/cc-mark-light.svg" alt="" width="80" height="80" />`, and position `.board-logo` over the empty circle (left ≈ 16%, top ≈ 24%, width ≈ 25% of the board).
4. In `dist/js/home.js`, the board timeline animates the SVG parts; with images, replace it with a simple reveal such as `gsap.from(".board-art", { clipPath: "inset(0 100% 0 0)", duration: 0.9, stagger: 0.2 })`.

## Option B — repaint the signs in the hero illustration

Use this if you would rather the drawing look painted onto the cardboard. Attach `assets/hero-coder.webp` (or `hero-designer.webp`) as the image to edit and the character sheet as the style reference.

> Edit the attached illustration. Change ONLY the contents of the blank white sign the character is holding. Keep the character's face, hair, glasses, skin, hands, outfit, pose, proportions, line weight and colours exactly the same, pixel for pixel outside the sign. Paint onto the sign, following its perspective and slight tilt, [DESCRIPTION FROM OPTION A — Build or Brand]. Same dry-gouache texture and navy ink outlines as the character. Keep the transparent background. No new objects outside the sign, no text other than "</>" or "Aa", no logos or crescents.

For the designer, keep the empty circle and composite `assets/cc-mark-light.svg` over it afterwards, as in Option A.

## Other board ideas (not implemented)

- **Before → after:** a rough pencil sketch on the coder's board, the finished cobalt wireframe on the designer's.
- **Sticky-note plan:** three sticky notes on each board, reading Build / Brand on the boards and Grow carried by the mascot.
- **Orbit diagram:** three small connected nodes (constellation hairlines) on one board, a launched website card on the other. Avoid rockets, astronauts and nebula imagery (brand book, "Leave these in the past").
