/* Code Constellation — liquid-glass work carousel.
   Original implementation. The Framer module named in the brief could not be
   accessed to verify its licence, so none of its code is used here.

   One WebGL 1 context, one full-canvas fragment shader and one texture atlas.
   Slides glide beneath a fixed glass lens; GSAP tweens the position.
   - Never captures vertical scrolling: touch-action: pan-y, no vertical wheel.
   - Renders on demand, only while visible and the tab is visible.
   - Device pixel ratio capped at 2; every GPU resource is released in destroy().

   API: window.CCGlass.mount(stage, items, hooks) -> { go, goTo, toggleReveal, collapse, ready, destroy }
   items: [{ src }], hooks: { start, onIndex(i), onReveal(bool), onFail(err) } */
(() => {
  const VERT = "attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos*0.5+0.5;gl_Position=vec4(aPos,0.0,1.0);}";

  const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform sampler2D uAtlas;
uniform vec2 uRes;
uniform vec2 uSlide;
uniform vec2 uLens;
uniform float uLensR;
uniform float uBevel;
uniform float uRefract;
uniform float uDisperse;
uniform float uPitch;
uniform float uRadius;
uniform float uProgress;
uniform float uCount;
uniform float uVel;
uniform float uReveal;
uniform vec2 uGrid;
const vec3 PAPER = vec3(0.945, 0.949, 0.984);
const vec3 INK = vec3(0.039, 0.063, 0.2);

float box(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec4 slides(vec2 p) {
  float k = floor(p.x / uPitch + uProgress + 0.5);
  float rel = k - uProgress;
  float a = clamp(abs(rel), 0.0, 1.0);
  float s = mix(1.0 + 0.1 * uReveal, 0.84, a);
  vec2 hb = uSlide * 0.5 * s;
  vec2 q = p - vec2(rel * uPitch, 0.0);
  float d = box(q, hb, uRadius * s);
  float alpha = 1.0 - smoothstep(-1.0, 1.0, d);
  if (alpha <= 0.0) return vec4(0.0);
  float idx = mod(k, uCount);
  vec2 uv = q / (hb * 2.0) + 0.5;
  float zoom = 1.16 - 0.08 * uReveal;
  uv = (uv - 0.5) / zoom + 0.5;
  // image glide: the picture travels slower than its frame
  uv.x += clamp(rel, -1.5, 1.5) * 0.06 + clamp(uVel, -4.0, 4.0) * 0.008;
  uv = clamp(uv, vec2(0.003), vec2(0.997));
  float col = mod(idx, uGrid.x);
  float row = floor(idx / uGrid.x);
  vec2 auv = vec2((col + uv.x) / uGrid.x, (uGrid.y - 1.0 - row + uv.y) / uGrid.y);
  vec3 rgb = texture2D(uAtlas, auv).rgb;
  rgb = mix(rgb, PAPER, 0.26 * a);
  return vec4(rgb * alpha, alpha);
}

void main() {
  vec2 p = (vUv - 0.5) * uRes;
  vec4 col = slides(p);

  // soft contact shadow under the glass, visible only in the gaps
  float ds = box(p - vec2(0.0, -uBevel * 0.45), uLens, uLensR);
  float sh = 0.08 * (1.0 - smoothstep(-uBevel * 0.3, uBevel * 0.9, ds)) * (1.0 - uReveal);
  col += vec4(INK * sh, sh) * (1.0 - col.a);

  float dl = box(p, uLens, uLensR);
  if (dl < 1.0) {
    vec2 e = vec2(1.0, 0.0);
    vec2 n = vec2(box(p + e.xy, uLens, uLensR) - box(p - e.xy, uLens, uLensR),
                  box(p + e.yx, uLens, uLensR) - box(p - e.yx, uLens, uLensR));
    n = n / max(length(n), 1e-4);
    float rim = smoothstep(-uBevel, 0.0, dl);
    float motion = clamp(0.25 + abs(uVel) * 0.9, 0.25, 1.0);
    vec2 disp = -n * rim * rim * uRefract * motion * (1.0 - uReveal);
    vec4 g = slides(p + disp);
    vec4 r = slides(p + disp * (1.0 + uDisperse));
    vec4 b = slides(p + disp * (1.0 - uDisperse));
    vec4 glass = vec4(r.r, g.g, b.b, g.a);
    // restrained glass body: faint fill, one light from the upper left on the rim
    float light = max(dot(n, normalize(vec2(-0.55, 0.85))), 0.0);
    float edge = 1.0 - smoothstep(0.0, uBevel * 0.08, -dl);
    float hi = (0.025 + smoothstep(0.6, 1.0, rim) * (0.05 + 0.14 * light) + edge * 0.28) * (1.0 - 0.75 * uReveal);
    glass.rgb = glass.rgb * (1.0 - hi) + vec3(hi);
    glass.a = glass.a + hi * (1.0 - glass.a);
    col = mix(col, glass, 1.0 - smoothstep(-1.0, 1.0, dl));
  }
  gl_FragColor = col;
}`;

  const UNIFORMS = ["uAtlas", "uRes", "uSlide", "uLens", "uLensR", "uBevel", "uRefract", "uDisperse", "uPitch", "uRadius", "uProgress", "uCount", "uVel", "uReveal", "uGrid"];
  const mod = (a, n) => ((a % n) + n) % n;

  function supported(allowSoftware = false) {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl", { failIfMajorPerformanceCaveat: !allowSoftware });
      if (!gl) return false;
      const ok = gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 2048;
      const lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
      return ok;
    } catch {
      return false;
    }
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image failed: " + src));
      img.src = src;
    });
  }

  function mount(stage, items, hooks = {}) {
    const n = items.length;
    const state = { progress: hooks.start || 0, target: hooks.start || 0, vel: 0, reveal: 0 };
    const canvas = document.createElement("canvas");
    canvas.className = "glass-canvas";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "high-performance" });
    if (!gl) throw new Error("WebGL unavailable");

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link");
    const U = {};
    UNIFORMS.forEach((name) => (U[name] = gl.getUniformLocation(prog, name)));
    const aPos = gl.getAttribLocation(prog, "aPos");
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    stage.append(canvas);

    let tex = null;
    let grid = { cols: 3, rows: Math.ceil(n / 3) };
    let geo = null;
    let raf = 0;
    let visible = true;
    let destroyed = false;
    let lastP = state.progress;
    let lastT = performance.now();
    let dragging = false;

    /* ---------- geometry (CSS px; uniforms are scaled by dpr) ---------- */
    function layout() {
      const r = stage.getBoundingClientRect();
      const W = Math.max(1, r.width);
      const H = Math.max(1, r.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      const mobile = W < 700;
      const sw = mobile ? W * 0.8 : Math.min(W * 0.46, 760);
      const sh = (sw * 2) / 3;
      geo = { W, H, dpr, sw, sh, pitch: sw * 0.92 + (mobile ? 16 : 44), radius: mobile ? 18 : 26 };
      gl.viewport(0, 0, canvas.width, canvas.height);
      request();
    }

    function draw() {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!tex || !geo) return;
      const { dpr, sw, sh, pitch, radius, H } = geo;
      const margin = Math.max(14, Math.min(34, (H - sh) / 2 - 3));
      gl.useProgram(prog);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform2f(U.uSlide, sw * dpr, sh * dpr);
      gl.uniform2f(U.uLens, (sw * 0.5 + margin) * dpr, (sh * 0.5 + margin) * dpr);
      gl.uniform1f(U.uLensR, (radius + margin * 0.7) * dpr);
      gl.uniform1f(U.uBevel, margin * 0.85 * dpr);
      gl.uniform1f(U.uRefract, 16 * dpr);
      gl.uniform1f(U.uDisperse, 0.025);
      gl.uniform1f(U.uPitch, pitch * dpr);
      gl.uniform1f(U.uRadius, radius * dpr);
      gl.uniform1f(U.uProgress, state.progress);
      gl.uniform1f(U.uCount, n);
      gl.uniform1f(U.uVel, state.vel);
      gl.uniform1f(U.uReveal, state.reveal);
      gl.uniform2f(U.uGrid, grid.cols, grid.rows);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(U.uAtlas, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    /* ---------- render on demand ---------- */
    const busy = () => dragging || (window.gsap && gsap.isTweening(state));
    function frame(t) {
      raf = 0;
      if (destroyed) return;
      const dt = Math.max(1, t - lastT);
      lastT = t;
      const inst = ((state.progress - lastP) / dt) * 1000;
      lastP = state.progress;
      state.vel += (inst - state.vel) * 0.25;
      if (Math.abs(state.vel) < 0.004) state.vel = 0;
      draw();
      if (state.vel !== 0 || busy()) request();
    }
    function request() {
      if (!raf && !destroyed && visible && !document.hidden) {
        lastT = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    /* ---------- navigation ---------- */
    function emit(target) {
      hooks.onIndex && hooks.onIndex(mod(target, n));
    }
    function tweenTo(target, duration = 0.9) {
      state.target = target;
      emit(target);
      if (state.reveal > 0) collapse();
      gsap.to(state, { progress: target, duration, ease: "power3.out", overwrite: "auto", onUpdate: request });
      request();
    }
    const go = (delta) => tweenTo(Math.round(state.target) + delta);
    function goTo(i) {
      const cur = Math.round(state.target);
      let diff = mod(i, n) - mod(cur, n);
      if (diff > n / 2) diff -= n;
      if (diff < -n / 2) diff += n;
      if (diff) tweenTo(cur + diff);
    }
    function setReveal(on) {
      gsap.to(state, { reveal: on ? 1 : 0, duration: 0.8, ease: "power3.inOut", overwrite: "auto", onUpdate: request });
      hooks.onReveal && hooks.onReveal(on);
      request();
    }
    const toggleReveal = () => setReveal(state.reveal < 0.5);
    const collapse = () => state.reveal > 0 && setReveal(false);

    /* ---------- pointer: horizontal drag only ---------- */
    let p0 = null;
    function onDown(e) {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      p0 = { x: e.clientX, y: e.clientY, prog: state.progress, id: e.pointerId, moved: false, decided: false, samples: [] };
    }
    function onMove(e) {
      if (!p0 || e.pointerId !== p0.id) return;
      const dx = e.clientX - p0.x;
      const dy = e.clientY - p0.y;
      if (!p0.decided) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        p0.decided = true;
        if (Math.abs(dy) > Math.abs(dx)) {
          p0 = null; // vertical intent: leave it to the page
          return;
        }
        dragging = true;
        p0.moved = true;
        stage.setPointerCapture(e.pointerId);
        gsap.killTweensOf(state, "progress");
        collapse();
      }
      state.progress = p0.prog - dx / geo.pitch;
      p0.samples.push([performance.now(), state.progress]);
      if (p0.samples.length > 6) p0.samples.shift();
      request();
    }
    function onUp(e) {
      if (!p0 || e.pointerId !== p0.id) return;
      const d = p0;
      p0 = null;
      if (!d.moved) {
        // a click: neighbours come into focus; the focused image toggles its reveal
        const r = stage.getBoundingClientRect();
        const x = e.clientX - r.left - geo.W / 2;
        const y = e.clientY - r.top - geo.H / 2;
        const rel = Math.round(x / geo.pitch);
        if (rel !== 0) go(rel);
        else if (Math.abs(x) < geo.sw / 2 && Math.abs(y) < geo.sh / 2) toggleReveal();
        return;
      }
      dragging = false;
      let v = 0;
      const s = d.samples;
      if (s.length > 1) {
        const [t0, a] = s[0];
        const [t1, b] = s[s.length - 1];
        v = ((b - a) / Math.max(16, t1 - t0)) * 1000;
      }
      const fling = Math.max(-2, Math.min(2, v * 0.22));
      tweenTo(Math.round(state.progress + fling), 0.8);
    }
    function onCancel(e) {
      if (!p0 || e.pointerId !== p0.id) return;
      const wasDragging = dragging;
      p0 = null;
      dragging = false;
      if (wasDragging) tweenTo(Math.round(state.progress), 0.6);
    }
    // Horizontal trackpad swipes only; vertical wheel always scrolls the page.
    let wheelAcc = 0;
    let wheelLock = 0;
    function onWheel(e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 2) return;
      e.preventDefault();
      const now = performance.now();
      if (now < wheelLock) return;
      wheelAcc += e.deltaX;
      if (Math.abs(wheelAcc) > 50) {
        go(wheelAcc > 0 ? 1 : -1);
        wheelAcc = 0;
        wheelLock = now + 420;
      }
    }
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onCancel);
    stage.addEventListener("wheel", onWheel, { passive: false });

    /* ---------- lifecycle ---------- */
    const ro = new ResizeObserver(() => layout());
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
      { rootMargin: "120px 0px" },
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
      if (window.gsap) gsap.killTweensOf(state);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onCancel);
      stage.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("webglcontextlost", onLost);
      if (!gl.isContextLost()) {
        if (tex) gl.deleteTexture(tex);
        gl.deleteBuffer(buf);
        gl.detachShader(prog, vs);
        gl.detachShader(prog, fs);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteProgram(prog);
        const lose = gl.getExtension("WEBGL_lose_context");
        if (lose) lose.loseContext();
      }
      tex = null;
      canvas.remove();
    }

    /* ---------- texture atlas: all covers in one texture ---------- */
    async function load() {
      const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const cols = 3;
      const rows = Math.ceil(n / cols);
      let cw = geo.W < 700 ? 640 : 1024;
      while (cw * cols > maxTex && cw > 256) cw = Math.floor(cw / 2);
      const ch = Math.round((cw * 2) / 3);
      const imgs = await Promise.all(items.map((it) => loadImage(it.src)));
      if (destroyed) return;
      const atlas = document.createElement("canvas");
      atlas.width = cw * cols;
      atlas.height = ch * rows;
      const ctx = atlas.getContext("2d");
      ctx.fillStyle = "#f1f2fb";
      ctx.fillRect(0, 0, atlas.width, atlas.height);
      imgs.forEach((img, i) => {
        const x = (i % cols) * cw;
        const y = Math.floor(i / cols) * ch;
        const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, cw, ch);
        ctx.clip();
        ctx.drawImage(img, x + (cw - w) / 2, y + (ch - h) / 2, w, h);
        ctx.restore();
      });
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      atlas.width = atlas.height = 0; // release the 2D backing store
      grid = { cols, rows };
      request();
    }

    layout();
    const ready = load().catch((err) => {
      fail(err);
      throw err;
    });

    return { go, goTo, toggleReveal, collapse, ready, destroy, get index() { return mod(Math.round(state.target), n); } };
  }

  window.CCGlass = { supported, mount };
})();
