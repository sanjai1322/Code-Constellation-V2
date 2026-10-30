# Code Constellation website

Light-theme studio homepage adapted from the structure and interaction patterns at https://two26.studio/ with original Code Constellation content and artwork.

## Included
- Supplied SVG master mark, local Geist fonts, Starlight / Midnight Ink / Orbit Blue palette.
- Original illustrated human duo and matching ink-style blue companion.
- Masked hero entrance, curved ribbon, pinned letter-by-letter studio introduction, direction-aware showcase, six project panels, seven animated service illustrations with a drawn path, five-card proof/principles deck, ten FAQs, elastic footer.
- Optional locally synthesized ambience and interaction sounds, off by default.
- Keyboard-friendly controls and reduced-motion handling.

## Content notes
Portfolio panels marked concept are illustrative, not client commissions. The 1Xircle rating is drawn from the supplied brand book. The contact form opens an email draft; it does not send mail or store submissions. This is a homepage adaptation, not a byte-for-byte copy of the reference website or its proprietary illustrations.

## Run
Serve this folder with a static web server, for example `python -m http.server 8765`, and visit http://localhost:8765/. All runtime assets are included locally.

## Artwork generation
Generated using the built-in image generation tool. The finished hero uses `assets/mascots.png` and `assets/companion-ink.png`. The supplied logo is unchanged at `assets/cc-mark-light.svg`. Service icons are original scalable SVG drawings animated in CSS.

Final companion edit prompt:
Edit target image 1: the blue rounded comet mascot. Style reference image 2: the two hand-drawn human characters. REDRAW ONLY the blue mascot from image 1 to look illustrated by exactly the same artist as image 2: imperfect dark navy ink contour lines, dry gouache grain, hand-drawn hatching, flat 2D editorial cartoon shading, paper-like texture within the colored shapes. Preserve the blue rounded droplet body, one curved top tuft, pale lavender face patch, friendly eyes and smile, tiny mitten hands and feet. Simplify glossy eyes into expressive cartoon eyes with a small ink highlight. Friendly wave, three-quarter posture with feet standing on one baseline, a little character and wit. The left hand can wave and other rest on hip. Electric blue #2F6BFF, lavender #C9CAEE, ivory #F1F2FB, navy #0A1033. Absolutely no 3D rendering, no gradients, no vinyl/plastic material, no bloom, no rim lighting, no soft airbrush, no glossy shine. Single character only. No humans in output. No cat, no animal ears, no background, no ground plane, no cast shadow, no text. Genuine transparent background. Full body completely visible with modest transparent padding. Match line weight and sketchy expressive quality of image 2, so this mascot naturally belongs between those two people.

## Reference research
- https://two26.studio/
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- https://github.com/darkroomengineering/lenis
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
