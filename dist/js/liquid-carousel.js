/* Code Constellation — Selected Work: liquid-glass lens carousel (ES module).

   Three.js render pipeline:
     1. The project panels are drawn into an off-screen WebGLRenderTarget (MSAA).
     2. A full-screen shader reads that target and refracts it through an animated
        glass lens: a rotated ellipse with a wavy rim, chromatic dispersion near the
        edge, an inner glow, a coloured rim ring and a moving shimmer band.
   Motion: target/current scroll with a glide factor, inertia, delayed snapping,
   speed-based shrink and panel bending, image glide inside each frame, a GSAP
   entry sequence (scattered images rise, grow into the strip, the glass develops)
   and a focus state for the selected project.

   The settings below are the values supplied for the reference "Liquid Carousel"
   component. The reference's own code could not be inspected (framer.com is not
   reachable from the build environment); this is an independent implementation of
   the described behaviour. Three.js r169, MIT licence (assets/vendor/three/LICENSE). */
import * as THREE from "../assets/vendor/three/three.module.min.js";

export const SETTINGS = {
  panelHeight: 450,
  gap: 12,
  glide: 0.075,
  wheelSensitivity: 1,
  snap: true,
  snapDistance: 60,
  snapDelay: 120,
  speedShrink: 60,
  lensShape: "circle",
  lensRotation: 65,
  lensWidth: 0.565,
  lensHeight: 1,
  lensX: 0.5,
  lensY: 0.5,
  dispersion: 11,
  zoom: 0,
  blur: 0,
  glow: 4.2,
  blueRing: 6,
  blueColor: "#009dff",
  shimmer: true,
  rimWave: 0.6,
  entryAnimation: true,
  focusScale: 1.18,
  pixelRatio: 2,
  // brand adaptation
  background: "#F1F2FB",
  stageRatio: 1.55, // stage height / panel height
};

const PANEL_VERT = /* glsl */ `
  uniform vec2 uSize;
  uniform float uBend;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // the panel bows against its motion: curved silhouettes while moving
    p.x -= sin(uv.y * 3.14159265) * uBend / max(uSize.x, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const PANEL_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uSize;
  uniform float uRadius;
  uniform float uAlpha;
  uniform float uGlide;
  uniform float uImgAspect;
  uniform float uShade;
  uniform vec3 uBg;
  varying vec2 vUv;
  float box(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }
  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    float d = box(p, uSize * 0.5, uRadius);
    float a = 1.0 - smoothstep(-1.0, 1.0, d);
    float pa = uSize.x / uSize.y;
    vec2 uv = vUv - 0.5;
    if (uImgAspect > pa) uv.x *= pa / uImgAspect; else uv.y *= uImgAspect / pa;
    uv = uv / 1.12 + 0.5;          // headroom for the glide
    uv.x += uGlide;                 // the picture travels slower than its frame
    vec3 col = texture2D(uTex, clamp(uv, 0.002, 0.998)).rgb;
    col = mix(col, uBg, uShade);
    gl_FragColor = vec4(col, a * uAlpha);
  }
`;
const LENS_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;
const LENS_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D tScene;
  uniform vec2 uRes;
  uniform float uDpr;
  uniform float uTime;
  uniform vec2 uCenter;
  uniform vec2 uAxes;
  uniform float uRot;
  uniform float uStrength;
  uniform float uRefract;
  uniform float uDispersion;
  uniform float uZoom;
  uniform float uBlur;
  uniform float uGlow;
  uniform float uRing;
  uniform vec3 uRingColor;
  uniform float uShimmer;
  uniform float uRimWave;
  uniform float uFocusRing;
  varying vec2 vUv;

  vec2 rot(vec2 v, float a) {
    float c = cos(a), s = sin(a);
    return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
  }
  vec3 scene(vec2 px) {
    return texture2D(tScene, clamp(px / uRes, vec2(0.0005), vec2(0.9995))).rgb;
  }
  vec3 sceneBlur(vec2 px, float r) {
    if (r < 0.5) return scene(px);
    vec3 acc = scene(px) * 0.2;
    acc += scene(px + vec2(r, 0.0)) * 0.2;
    acc += scene(px - vec2(r, 0.0)) * 0.2;
    acc += scene(px + vec2(0.0, r)) * 0.2;
    acc += scene(px - vec2(0.0, r)) * 0.2;
    return acc;
  }
  // signed distance to the (rotated, rim-waved) ellipse, in buffer pixels
  float lens(vec2 px, out vec2 n, out vec2 q) {
    q = rot(px - uCenter, -uRot);
    float ang = atan(q.y, q.x);
    float wave = uRimWave * (0.6 * sin(ang * 3.0 + uTime * 1.25) + 0.4 * sin(ang * 5.0 - uTime * 0.85));
    vec2 ab = uAxes * (1.0 + 0.022 * wave);
    float k0 = length(q / ab);
    float k1 = length(q / (ab * ab));
    float d = k0 * (k0 - 1.0) / max(k1, 1e-6);
    n = rot(normalize(q / (ab * ab) + 1e-7), uRot);
    return d;
  }

  void main() {
    vec2 px = vUv * uRes;
    vec3 col = scene(px);
    float s = uStrength;
    if (s > 0.001) {
      vec2 n, q;
      float d = lens(px, n, q);
      float minAx = min(uAxes.x, uAxes.y);
      float aa = 1.5 * uDpr;

      // soft contact shadow just outside the glass
      float sh = exp(-max(d - 6.0 * uDpr, 0.0) / (22.0 * uDpr)) * step(0.0, d) * 0.07 * s;
      col *= 1.0 - sh;

      float inside = 1.0 - smoothstep(-aa, aa, d);
      if (inside > 0.0) {
        float edge = minAx * 0.46;
        float t = clamp(-d / edge, 0.0, 1.0);        // 0 at the rim, 1 in the flat centre
        float bevel = pow(1.0 - t, 2.2);
        vec2 toC = px - uCenter;
        vec2 disp = -n * bevel * uRefract * s - toC * uZoom * 0.2 * s;
        vec2 dn = n * bevel * uDispersion * uDpr * s;
        float br = uBlur * uDpr * (0.4 + bevel);
        vec3 g;
        g.r = sceneBlur(px + disp + dn, br).r;
        g.g = sceneBlur(px + disp, br).g;
        g.b = sceneBlur(px + disp - dn, br).b;
        // glass body: inner glow at the rim, a key light from the upper left
        float glow = uGlow * 0.03 * exp(d / (9.0 * uDpr));
        float light = max(dot(n, normalize(vec2(-0.6, 0.8))), 0.0);
        g += vec3(glow) + vec3(0.11) * bevel * light;
        // shimmer: a soft band of light travelling across the lens
        if (uShimmer > 0.5) {
          vec2 sq = rot(q, -0.55) / minAx;
          float c = mod(uTime * 0.2, 3.4) - 1.7;
          float band = exp(-pow((sq.x - c) * 2.8, 2.0));
          g += vec3(0.14) * band * (0.3 + 0.7 * bevel);
        }
        col = mix(col, g, inside * clamp(s * 1.4, 0.0, 1.0));
      }

      // coloured rim ring and its halo
      float rw = uRing * uDpr;
      float ring = 1.0 - smoothstep(0.0, rw * 0.5 + aa, abs(d + rw * 0.35));
      col = mix(col, uRingColor, ring * 0.6 * s);
      float halo = step(0.0, d) * exp(-d / (uGlow * 4.0 * uDpr));
      col = mix(col, uRingColor, halo * 0.16 * s);

      // keyboard focus: a dashed ring that follows the lens
      if (uFocusRing > 0.01) {
        float off = d - 10.0 * uDpr;
        float band = 1.0 - smoothstep(0.0, 1.6 * uDpr, abs(off));
        float dash = step(0.5, fract(atan(q.y, q.x) * 9.0 / 3.14159265));
        col = mix(col, vec3(0.184, 0.420, 1.0), band * dash * uFocusRing);
      }
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

const mod = (a, n) => ((a % n) + n) % n;
const rand = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function supported(allowSoftware = false) {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2", { failIfMajorPerformanceCaveat: !allowSoftware }); // three r163+ requires WebGL2
    if (!gl) return false;
    const lose = gl.getExtension("WEBGL_lose_context");
    if (lose) lose.loseContext();
    return true;
  } catch {
    return false;
  }
}

/* items: [{ src }] · hooks: { start, onIndex(i), onReveal(bool), onFail(err), paused() } */
export function mount(stage, items, hooks = {}, overrides = {}) {
  const S = { ...SETTINGS, ...overrides };
  const gsap = window.gsap;
  const n = items.length;
  THREE.ColorManagement.enabled = false; // pass colours through untouched (sRGB in, sRGB out)

  const canvas = document.createElement("canvas");
  canvas.className = "glass-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  const bg = new THREE.Color(S.background);
  renderer.setClearColor(bg, 1);
  stage.append(canvas);

  /* ---------- pass 1: the strip ---------- */
  const strip = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  const geo = new THREE.PlaneGeometry(1, 1, 24, 24);
  const panels = items.map((it, i) => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: PANEL_VERT,
      fragmentShader: PANEL_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTex: { value: null },
        uSize: { value: new THREE.Vector2(1, 1) },
        uBend: { value: 0 },
        uRadius: { value: 18 },
        uAlpha: { value: S.entryAnimation ? 0 : 1 },
        uGlide: { value: 0 },
        uImgAspect: { value: 1.5 },
        uShade: { value: 0 },
        uBg: { value: new THREE.Vector3(bg.r, bg.g, bg.b) },
      },
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = i;
    strip.add(mesh);
    return {
      mesh,
      mat,
      entry: { rise: S.entryAnimation ? 0 : 1, grow: S.entryAnimation ? 0 : 1 },
      seed: [rand(i + 1), rand(i + 7.3), rand(i + 13.9), rand(i + 21.4)],
      focus: 0,
    };
  });
  let rt = null;

  /* ---------- pass 2: the lens ---------- */
  const ringColor = new THREE.Color(S.blueColor);
  const lensMat = new THREE.ShaderMaterial({
    vertexShader: LENS_VERT,
    fragmentShader: LENS_FRAG,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tScene: { value: null },
      uRes: { value: new THREE.Vector2(1, 1) },
      uDpr: { value: 1 },
      uTime: { value: 0 },
      uCenter: { value: new THREE.Vector2() },
      uAxes: { value: new THREE.Vector2(1, 1) },
      uRot: { value: (S.lensRotation * Math.PI) / 180 },
      uStrength: { value: S.entryAnimation ? 0 : 1 },
      uRefract: { value: 40 },
      uDispersion: { value: S.dispersion },
      uZoom: { value: S.zoom },
      uBlur: { value: S.blur },
      uGlow: { value: S.glow },
      uRing: { value: S.blueRing },
      uRingColor: { value: new THREE.Vector3(ringColor.r, ringColor.g, ringColor.b) },
      uShimmer: { value: S.shimmer ? 1 : 0 },
      uRimWave: { value: S.rimWave },
      uFocusRing: { value: 0 },
    },
  });
  const lensScene = new THREE.Scene();
  const lensQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lensMat);
  lensQuad.frustumCulled = false;
  lensScene.add(lensQuad);
  const flat = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  /* ---------- state ---------- */
  const state = {
    x: 0, // current scroll (px)
    tx: 0, // target scroll (px)
    v: 0, // px per 60fps frame
    lens: { strength: S.entryAnimation ? 0 : 1, scale: S.entryAnimation ? 0.35 : 1 },
    focus: { t: 0 },
    focusRing: 0,
  };
  let W = 1;
  let H = 1;
  let dpr = 1;
  let panelH = S.panelHeight;
  let panelW = S.panelHeight * 1.5;
  let gap = S.gap;
  let pitch = panelW + gap;
  let total = pitch * n;
  let visible = false;
  let entered = !S.entryAnimation;
  let destroyed = false;
  let raf = 0;
  let last = performance.now();
  let time = 0;
  let lastInput = 0;
  let lastIndex = hooks.start || 0;
  let revealed = false;

  function layout() {
    const r = stage.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, S.pixelRatio);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    panelH = Math.min(S.panelHeight, H / S.stageRatio);
    panelW = panelH * 1.5;
    gap = W < 700 ? Math.max(8, S.gap * 0.7) : S.gap;
    const oldPitch = pitch;
    pitch = panelW + gap;
    total = pitch * n;
    // keep the same project centred through a resize
    state.x = (state.x / oldPitch) * pitch;
    state.tx = (state.tx / oldPitch) * pitch;
    cam.left = -W / 2;
    cam.right = W / 2;
    cam.top = H / 2;
    cam.bottom = -H / 2;
    cam.updateProjectionMatrix();
    if (rt) rt.dispose();
    rt = new THREE.WebGLRenderTarget(Math.round(W * dpr), Math.round(H * dpr), { samples: 4, depthBuffer: false });
    lensMat.uniforms.tScene.value = rt.texture;
    lensMat.uniforms.uRes.value.set(W * dpr, H * dpr);
    lensMat.uniforms.uDpr.value = dpr;
    panels.forEach((p) => p.mat.uniforms.uRadius.value = Math.max(12, panelH * 0.05));
    request();
  }

  /* ---------- per-frame ---------- */
  function updatePanels() {
    const shrink = 1 - 0.14 * Math.min(Math.abs(state.v) / S.speedShrink, 1);
    const bend = Math.max(-60, Math.min(60, state.v)) * 0.9;
    const f = state.focus.t;
    const center = Math.round(state.x / pitch);
    panels.forEach((p, i) => {
      // nearest wrapped copy of panel i relative to the scroll position
      let rel = i * pitch - state.x;
      rel = mod(rel + total / 2, total) - total / 2;
      const isFocus = mod(center, n) === i;
      const fs = isFocus ? 1 + (S.focusScale - 1) * f : 1 - 0.06 * f;
      const sx = rel * (isFocus ? 1 : 1 + 0.08 * f);
      // entry: below -> scattered -> strip
      const [r0, r1, r2, r3] = p.seed;
      const scatX = (r0 - 0.5) * W * 0.78;
      const scatY = (r1 - 0.45) * H * 0.62;
      const scatS = 0.2 + r2 * 0.12;
      const scatR = (r3 - 0.5) * 0.5;
      const e = p.entry;
      const x0 = scatX;
      const y0 = scatY - H * 0.9 * (1 - e.rise);
      const x = x0 + (sx - x0) * e.grow;
      const y = y0 + (0 - y0) * e.grow;
      const sc = (scatS + (1 - scatS) * e.grow) * (e.grow > 0.999 ? shrink * fs : 1);
      p.mesh.position.set(x, y, 0);
      p.mesh.rotation.z = scatR * (1 - e.grow);
      p.mesh.scale.set(panelW * sc, panelH * sc, 1);
      p.mesh.renderOrder = isFocus ? 100 : i;
      const u = p.mat.uniforms;
      u.uSize.value.set(panelW * sc, panelH * sc);
      u.uBend.value = e.grow > 0.999 ? bend : 0;
      u.uAlpha.value = Math.min(1, e.rise * 1.4);
      u.uGlide.value = Math.max(-1.5, Math.min(1.5, rel / pitch)) * 0.034;
      u.uShade.value = isFocus ? 0 : 0.42 * f;
    });
  }

  function updateLens() {
    const u = lensMat.uniforms;
    const R = (H / 2) * 0.94 * state.lens.scale * (1 + 0.22 * state.focus.t);
    const breathe = 1 + 0.012 * Math.sin(time * 0.9);
    u.uAxes.value.set(S.lensWidth * R * breathe * dpr, S.lensHeight * R * dpr);
    const drift = Math.sin(time * 0.35) * 5;
    u.uCenter.value.set((S.lensX * W + drift) * dpr, (1 - S.lensY) * H * dpr);
    u.uRot.value = ((S.lensRotation + Math.sin(time * 0.4) * 2.5) * Math.PI) / 180;
    u.uStrength.value = state.lens.strength * (1 - 0.55 * state.focus.t);
    u.uRefract.value = Math.min(S.lensWidth, S.lensHeight) * R * 0.32 * dpr * (1 + Math.min(Math.abs(state.v) / S.speedShrink, 1) * 0.6);
    u.uTime.value = time;
    u.uFocusRing.value = state.focusRing;
  }

  function frame(now) {
    raf = 0;
    if (destroyed) return;
    const dt = Math.min(64, now - last);
    last = now;
    const paused = hooks.paused ? hooks.paused() : false;
    if (!paused) time += dt / 1000;
    // glide toward the target (frame-rate independent)
    const k = 1 - Math.pow(1 - S.glide, dt / 16.667);
    const prev = state.x;
    state.x += (state.tx - state.x) * k;
    const inst = ((state.x - prev) / Math.max(dt, 1)) * 16.667;
    state.v += (inst - state.v) * 0.3;
    if (Math.abs(state.tx - state.x) < 0.05) state.x = state.tx;
    // snap once the visitor has let go and the glide is nearly done
    if (S.snap && entered && !dragging && now - lastInput > S.snapDelay) {
      const nearest = Math.round(state.tx / pitch) * pitch;
      if (state.tx !== nearest && Math.abs(state.tx - state.x) < S.snapDistance) state.tx = nearest;
    }
    const idx = mod(Math.round(state.tx / pitch), n);
    if (idx !== lastIndex) {
      lastIndex = idx;
      hooks.onIndex && hooks.onIndex(idx);
    }
    updatePanels();
    updateLens();
    renderer.setRenderTarget(rt);
    renderer.clear();
    renderer.render(strip, cam);
    renderer.setRenderTarget(null);
    renderer.render(lensScene, flat);
    const moving = Math.abs(state.tx - state.x) > 0.05 || Math.abs(state.v) > 0.02 || dragging || (gsap && gsap.isTweening(state.lens));
    if (visible && !document.hidden && (moving || !paused)) request();
  }
  function request() {
    if (!raf && !destroyed && visible && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  /* ---------- navigation and focus ---------- */
  const touch = () => (lastInput = performance.now());
  function go(delta) {
    if (!entered) return;
    if (revealed) setReveal(false);
    touch();
    state.tx = (Math.round(state.tx / pitch) + delta) * pitch;
    request();
  }
  function goTo(i) {
    const cur = Math.round(state.tx / pitch);
    let diff = mod(i, n) - mod(cur, n);
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;
    if (diff) go(diff);
  }
  function setReveal(on) {
    if (!entered || revealed === on) return;
    revealed = on;
    if (on) state.tx = Math.round(state.tx / pitch) * pitch;
    gsap.to(state.focus, { t: on ? 1 : 0, duration: on ? 0.9 : 0.7, ease: on ? "expo.out" : "power3.inOut", onUpdate: request, overwrite: "auto" });
    hooks.onReveal && hooks.onReveal(on);
    request();
  }
  const toggleReveal = () => setReveal(!revealed);
  const collapse = () => setReveal(false);

  /* ---------- pointer: horizontal drag only; vertical scrolling stays with the page ---------- */
  let dragging = false;
  let p0 = null;
  function onDown(e) {
    if (!entered || (e.pointerType === "mouse" && e.button !== 0)) return;
    p0 = { x: e.clientX, y: e.clientY, tx: state.tx, id: e.pointerId, decided: false, samples: [[performance.now(), e.clientX]] };
  }
  function onMove(e) {
    if (!p0 || e.pointerId !== p0.id) return;
    const dx = e.clientX - p0.x;
    const dy = e.clientY - p0.y;
    if (!p0.decided) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      p0.decided = true;
      if (Math.abs(dy) > Math.abs(dx)) {
        p0 = null;
        return;
      }
      dragging = true;
      stage.setPointerCapture(e.pointerId);
      if (revealed) setReveal(false);
    }
    state.tx = p0.tx - dx;
    p0.samples.push([performance.now(), e.clientX]);
    if (p0.samples.length > 6) p0.samples.shift();
    touch();
    request();
  }
  function onUp(e) {
    if (!p0 || e.pointerId !== p0.id) return;
    const d = p0;
    p0 = null;
    if (!dragging) {
      // a click: neighbours come into focus; the centred project opens or closes
      const r = stage.getBoundingClientRect();
      const relX = e.clientX - r.left - W / 2;
      const relY = e.clientY - r.top - H / 2;
      const step = Math.round(relX / pitch);
      if (step !== 0) go(step);
      else if (Math.abs(relX) < panelW / 2 && Math.abs(relY) < panelH / 2) toggleReveal();
      return;
    }
    dragging = false;
    const s = d.samples;
    const [t0, x0] = s[0];
    const [t1, x1] = s[s.length - 1];
    const v = (x1 - x0) / Math.max(16, t1 - t0); // px per ms
    state.tx -= v * 240; // inertia
    touch();
    request();
  }
  function onCancel(e) {
    if (!p0 || e.pointerId !== p0.id) return;
    p0 = null;
    dragging = false;
    touch();
    request();
  }
  function onWheel(e) {
    if (!entered || Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 1) return; // vertical: let the page scroll
    e.preventDefault();
    if (revealed) setReveal(false);
    state.tx += e.deltaX * S.wheelSensitivity;
    touch();
    request();
  }
  const onFocus = () => {
    if (stage.matches(":focus-visible")) gsap.to(state, { focusRing: 1, duration: 0.3, onUpdate: request });
  };
  const onBlur = () => gsap.to(state, { focusRing: 0, duration: 0.3, onUpdate: request });
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onCancel);
  stage.addEventListener("wheel", onWheel, { passive: false });
  stage.addEventListener("focus", onFocus);
  stage.addEventListener("blur", onBlur);

  /* ---------- entry: scattered images rise, grow into the strip, the glass develops ---------- */
  function play() {
    if (entered || destroyed) return;
    const order = panels.map((p, i) => i).sort((a, b) => panels[a].seed[0] - panels[b].seed[0]);
    const tl = gsap.timeline({
      onUpdate: request,
      onComplete: () => {
        entered = true;
        touch();
        request();
      },
    });
    order.forEach((i, k) => tl.to(panels[i].entry, { rise: 1, duration: 0.85, ease: "power3.out" }, k * 0.08));
    panels.forEach((p, i) => {
      let rel = mod(i * pitch - state.x + total / 2, total) - total / 2;
      tl.to(p.entry, { grow: 1, duration: 1.15, ease: "expo.inOut" }, 0.78 + Math.min(Math.abs(rel) / pitch, 3) * 0.06);
    });
    tl.to(state.lens, { strength: 1, duration: 1.3, ease: "power2.out" }, 1.55);
    tl.to(state.lens, { scale: 1, duration: 1.5, ease: "elastic.out(1, 0.62)" }, 1.5);
    request();
    return tl;
  }

  /* ---------- lifecycle ---------- */
  const ro = new ResizeObserver(layout);
  ro.observe(stage);
  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) request();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    { rootMargin: "100px 0px" },
  );
  io.observe(stage);
  const onVis = () => !document.hidden && request();
  document.addEventListener("visibilitychange", onVis);
  const onLost = (e) => {
    e.preventDefault();
    fail(new Error("WebGL context lost"));
  };
  canvas.addEventListener("webglcontextlost", onLost);

  function fail(err) {
    destroy();
    hooks.onFail && hooks.onFail(err);
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    if (raf) cancelAnimationFrame(raf);
    if (gsap) {
      gsap.killTweensOf(state);
      gsap.killTweensOf(state.lens);
      gsap.killTweensOf(state.focus);
      panels.forEach((p) => gsap.killTweensOf(p.entry));
    }
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    stage.removeEventListener("pointerdown", onDown);
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("pointerup", onUp);
    stage.removeEventListener("pointercancel", onCancel);
    stage.removeEventListener("wheel", onWheel);
    stage.removeEventListener("focus", onFocus);
    stage.removeEventListener("blur", onBlur);
    canvas.removeEventListener("webglcontextlost", onLost);
    panels.forEach((p) => {
      if (p.mat.uniforms.uTex.value) p.mat.uniforms.uTex.value.dispose();
      p.mat.dispose();
    });
    geo.dispose();
    lensQuad.geometry.dispose();
    lensMat.dispose();
    if (rt) rt.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  }

  /* ---------- textures ---------- */
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  layout();
  state.x = state.tx = lastIndex * pitch; // centre the requested project
  const ready = Promise.all(
    items.map((it, i) =>
      loader.loadAsync(it.src).then((tex) => {
        tex.colorSpace = THREE.NoColorSpace;
        tex.anisotropy = Math.min(8, maxAniso);
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.generateMipmaps = true;
        const u = panels[i].mat.uniforms;
        u.uTex.value = tex;
        u.uImgAspect.value = tex.image.width / tex.image.height;
      }),
    ),
  ).then(() => {
    if (destroyed) throw new Error("destroyed");
    request();
  });
  ready.catch((err) => !destroyed && fail(err));

  return {
    go,
    goTo,
    toggleReveal,
    collapse,
    play,
    ready,
    destroy,
    get index() {
      return mod(Math.round(state.tx / pitch), n);
    },
    get entered() {
      return entered;
    },
    // test hook: switch the glass off/on to compare identical frames
    debugLens(strength) {
      gsap.killTweensOf(state.lens);
      state.lens.strength = strength;
      state.lens.scale = 1;
      request();
    },
  };
}
