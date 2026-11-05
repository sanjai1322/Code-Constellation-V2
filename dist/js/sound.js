/* Code Constellation — "orbit" sound kit.
   Every sound is synthesized with the Web Audio API: no audio files, nothing to licence.

   - Off by default. When a visitor turns it on, the choice holds across pages for this
     browser session and resumes on their next tap, click or key press (browsers only
     allow audio to start from a user gesture).
   - One musical palette: D major pentatonic, soft sine/FM bells, a shared reverb and a
     limiter, so every sound sits in the same "space".
   - Phones: starts from the tap on the toggle, respects the iOS silent switch and mixes
     with the visitor's own music (audio session "ambient"), no hover sounds on touch.
   - The context is suspended when sound is off, when the tab is hidden and on pagehide.

   Other scripts call window.CC.sfx(name, data); site.js defines a silent stub so calls
   are safe before (or without) this file. */
(() => {
  const CC = (window.CC = window.CC || {});
  const btn = document.querySelector(".sound-toggle");
  const label = btn && btn.querySelector("span");
  const KEY = "cc-sound";
  const DEBUG = /[?&]sfx-debug\b/.test(location.search);
  const store = {
    get: () => {
      try {
        return sessionStorage.getItem(KEY) === "1";
      } catch {
        return false;
      }
    },
    set: (on) => {
      try {
        if (on) sessionStorage.setItem(KEY, "1");
        else sessionStorage.removeItem(KEY);
      } catch {}
    },
  };

  let ctx = null;
  let bus = null;
  let send = null;
  let noiseBuf = null;
  let enabled = store.get();
  let unlocked = false;
  let ambient = null;
  let sparkleTimer = 0;
  let suspendTimer = 0;
  let starAt = 0;
  const lastAt = {};

  /* ---------- palette ---------- */
  const STEPS = [0, 2, 4, 7, 9]; // major pentatonic
  const note = (i, base = 293.66) => {
    const o = Math.floor(i / 5);
    const s = STEPS[((i % 5) + 5) % 5];
    return base * 2 ** ((s + 12 * o) / 12);
  };
  const panFromX = (x) => (typeof x === "number" ? Math.max(-0.6, Math.min(0.6, (x / innerWidth) * 1.2 - 0.6)) : 0);

  /* ---------- graph ---------- */
  function impulse(seconds, decay) {
    const len = Math.round(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        lp += (Math.random() * 2 - 1 - lp) * 0.35; // gentle low-pass: a soft, dark room
        d[i] = lp * (1 - i / len) ** decay;
      }
    }
    return buf;
  }
  function build() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      // iOS/Safari: respect the silent switch and mix with the visitor's own audio.
      if (navigator.audioSession) navigator.audioSession.type = "ambient";
    } catch {}
    try {
      ctx = new AC({ latencyHint: "interactive" });
    } catch {
      return false;
    }
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;
    const master = ctx.createGain();
    master.gain.value = 0.9;
    bus = ctx.createGain();
    bus.connect(comp).connect(master).connect(ctx.destination);
    const verb = ctx.createConvolver();
    verb.buffer = impulse(2.6, 2.6);
    send = ctx.createGain();
    send.gain.value = 0.9;
    send.connect(verb).connect(bus);
    if (DEBUG) CC.__audio = { ctx, bus };
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    return true;
  }
  async function wake() {
    if (!build()) return false;
    clearTimeout(suspendTimer);
    if (ctx.state !== "running") {
      try {
        await ctx.resume();
      } catch {}
    }
    unlocked = ctx.state === "running";
    return unlocked;
  }

  /* A voice: gain envelope -> pan -> dry bus + reverb send. Disconnects itself. */
  function voice({ peak = 0.05, attack = 0.004, decay = 0.4, pan = 0, wet = 0.4, at = 0 }) {
    const t = ctx.currentTime + 0.005 + at;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    let tail = g;
    if (ctx.createStereoPanner && pan) {
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      g.connect(p);
      tail = p;
    }
    tail.connect(bus);
    const w = ctx.createGain();
    w.gain.value = wet;
    tail.connect(w).connect(send);
    const end = t + attack + decay + 0.05;
    const nodes = [g, w, tail];
    const done = () => nodes.forEach((n) => n.disconnect());
    return { input: g, t, end, done };
  }
  function osc(v, type, freq, { glideTo, glideTime = 0.1, detune = 0 } = {}) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, v.t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, v.t + glideTime);
    o.detune.value = detune;
    o.connect(v.input);
    o.start(v.t);
    o.stop(v.end);
    o.onended = () => {
      o.disconnect();
      v.done();
    };
    return o;
  }
  /* FM bell: glassy when ratio is slightly inharmonic. */
  function bell(freq, { peak = 0.05, decay = 1.2, ratio = 2, index = 1.6, pan = 0, wet = 0.55, at = 0 } = {}) {
    const v = voice({ peak, attack: 0.004, decay, pan, wet, at });
    const car = osc(v, "sine", freq);
    const mod = ctx.createOscillator();
    const mg = ctx.createGain();
    mod.frequency.value = freq * ratio;
    mg.gain.setValueAtTime(freq * index, v.t);
    mg.gain.exponentialRampToValueAtTime(1, v.t + decay * 0.6);
    mod.connect(mg).connect(car.frequency);
    mod.start(v.t);
    mod.stop(v.end);
    mod.onended = () => {
      mod.disconnect();
      mg.disconnect();
    };
  }
  function noise({ peak = 0.06, attack = 0.01, decay = 0.3, type = "bandpass", from = 800, to = 800, q = 1, pan = 0, panTo, wet = 0.3, at = 0 }) {
    const v = voice({ peak, attack, decay, pan, wet, at });
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(from, v.t);
    f.frequency.exponentialRampToValueAtTime(to, v.t + attack + decay);
    let head = f;
    if (panTo !== undefined && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.setValueAtTime(pan, v.t);
      p.pan.linearRampToValueAtTime(panTo, v.t + attack + decay);
      f.connect(p);
      head = p;
    }
    src.connect(f);
    head.connect(v.input);
    src.start(v.t, Math.random() * 0.5);
    src.stop(v.end);
    src.onended = () => {
      src.disconnect();
      f.disconnect();
      if (head !== f) head.disconnect();
      v.done();
    };
  }

  /* ---------- the kit ---------- */
  const KIT = {
    // pointer hover on anything interactive (mouse only)
    tick: ({ x } = {}) => {
      const v = voice({ peak: 0.014, attack: 0.002, decay: 0.045, pan: panFromX(x), wet: 0.08 });
      osc(v, "sine", 2400 + Math.random() * 400);
    },
    // tap / click / Enter on an interactive element
    tap: ({ x } = {}) => {
      const f = note(10 + Math.floor(Math.random() * 3));
      const v = voice({ peak: 0.03, attack: 0.003, decay: 0.16, pan: panFromX(x), wet: 0.25 });
      osc(v, "triangle", f * 1.02, { glideTo: f, glideTime: 0.05 });
    },
    // page transition: air rushing past as the curtain closes
    leave: () => {
      noise({ peak: 0.09, attack: 0.28, decay: 0.42, from: 260, to: 2800, q: 0.8, pan: -0.5, panTo: 0.5, wet: 0.35 });
      bell(note(12), { peak: 0.02, decay: 1.1, ratio: 3.01, at: 0.42, wet: 0.8 });
    },
    // carousel: a glassy note per project as it settles, plus the glide
    glass: ({ index = 0 } = {}) => {
      noise({ peak: 0.035, attack: 0.08, decay: 0.32, from: 1800, to: 500, q: 0.7, pan: 0.3, panTo: -0.3, wet: 0.2 });
      bell(note(8 + index), { peak: 0.045, decay: 1.5, ratio: 3.01, index: 1.2, wet: 0.6, at: 0.12 });
      if (navigator.vibrate && matchMedia("(pointer: coarse)").matches) navigator.vibrate(6);
    },
    reveal: ({ on } = {}) => {
      if (on) {
        noise({ peak: 0.04, attack: 0.2, decay: 0.3, from: 500, to: 3000, q: 0.6, wet: 0.4 });
        bell(note(14), { peak: 0.03, decay: 1.4, ratio: 2, wet: 0.7, at: 0.12 });
      } else {
        bell(note(9), { peak: 0.025, decay: 0.8, ratio: 2, wet: 0.5 });
      }
    },
    // services: each star rings as the line reaches it; fast scrolling plays an arpeggio
    star: ({ index = 0, up = true } = {}) => {
      const now = ctx.currentTime;
      starAt = Math.max(now, starAt) + 0.09;
      const at = starAt - now - 0.09;
      if (up) {
        bell(note(7 + index), { peak: 0.05, decay: 1.8, ratio: 2, index: 1.4, wet: 0.7, at, pan: index % 2 ? 0.25 : -0.25 });
        bell(note(7 + index) * 2, { peak: 0.008, decay: 0.9, ratio: 3.01, wet: 0.9, at: at + 0.02 });
      } else {
        bell(note(2 + index), { peak: 0.022, decay: 0.9, ratio: 2, wet: 0.6, at });
      }
    },
    // proof deck: a card flicked away
    card: ({ dir = 1 } = {}) => {
      noise({ peak: 0.07, attack: 0.004, decay: 0.07, type: "highpass", from: 2600, to: 2200, q: 0.5, pan: dir > 0 ? 0.3 : -0.3, wet: 0.15 });
      const v = voice({ peak: 0.05, attack: 0.003, decay: 0.12, wet: 0.1 });
      osc(v, "sine", 150, { glideTo: 85, glideTime: 0.1 });
      if (navigator.vibrate && matchMedia("(pointer: coarse)").matches) navigator.vibrate(8);
    },
    expand: () => {
      bell(note(9), { peak: 0.03, decay: 0.45, ratio: 2, index: 0.8, wet: 0.35 });
      bell(note(11), { peak: 0.03, decay: 0.6, ratio: 2, index: 0.8, wet: 0.4, at: 0.07 });
    },
    collapse: () => {
      bell(note(11), { peak: 0.025, decay: 0.4, ratio: 2, index: 0.8, wet: 0.3 });
      bell(note(8), { peak: 0.025, decay: 0.5, ratio: 2, index: 0.8, wet: 0.35, at: 0.07 });
    },
    open: () => {
      const v = voice({ peak: 0.05, attack: 0.006, decay: 0.18, wet: 0.3 });
      osc(v, "sine", 420, { glideTo: 760, glideTime: 0.09 });
      bell(note(12), { peak: 0.025, decay: 1.2, ratio: 3.01, wet: 0.75, at: 0.08 });
    },
    close: () => {
      const v = voice({ peak: 0.04, attack: 0.006, decay: 0.16, wet: 0.25 });
      osc(v, "sine", 700, { glideTo: 360, glideTime: 0.1 });
    },
    success: () => {
      bell(note(10), { peak: 0.035, decay: 0.8, ratio: 2, wet: 0.5 });
      bell(note(12), { peak: 0.035, decay: 1.2, ratio: 2, wet: 0.6, at: 0.09 });
      bell(note(15), { peak: 0.02, decay: 1.4, ratio: 3.01, wet: 0.8, at: 0.18 });
    },
    filter: ({ index = 0 } = {}) => bell(note(8 + index), { peak: 0.03, decay: 0.5, ratio: 2, index: 0.9, wet: 0.35 }),
    // the mascot says hi: two quick rising chirps and a sparkle
    hi: () => {
      [
        [620, 980, 0],
        [820, 1260, 0.14],
      ].forEach(([a, b, at]) => {
        const v = voice({ peak: 0.07, attack: 0.01, decay: 0.16, wet: 0.3, at });
        const o = osc(v, "sine", a, { glideTo: b, glideTime: 0.12 });
        const lfo = ctx.createOscillator();
        const depth = ctx.createGain();
        lfo.frequency.value = 28;
        depth.gain.value = 18;
        lfo.connect(depth).connect(o.frequency);
        lfo.start(v.t);
        lfo.stop(v.end);
        lfo.onended = () => {
          lfo.disconnect();
          depth.disconnect();
        };
      });
      bell(note(16), { peak: 0.018, decay: 1, ratio: 3.01, wet: 0.9, at: 0.3 });
    },
    // the hero boards being painted on (only heard if sound is already running)
    scribble: () => {
      for (let i = 0; i < 5; i++) noise({ peak: 0.018, attack: 0.03, decay: 0.12, from: 1600 + i * 120, to: 2200, q: 2.5, wet: 0.1, at: i * 0.2, pan: -0.3 + i * 0.15 });
    },
    toggle: ({ on } = {}) => {
      const v = voice({ peak: 0.025, attack: 0.003, decay: 0.08, wet: 0.15 });
      osc(v, "sine", on ? 1400 : 980);
    },
    "power-on": () => {
      [0, 2, 4, 7].forEach((i, k) => {
        const v = voice({ peak: 0.03, attack: 0.25 + k * 0.05, decay: 1.6, wet: 0.8, at: k * 0.06, pan: (k - 1.5) * 0.3 });
        osc(v, "sine", note(5 + i));
      });
      bell(note(14), { peak: 0.02, decay: 1.8, ratio: 3.01, wet: 0.9, at: 0.35 });
    },
    "power-off": () => {
      bell(note(9), { peak: 0.03, decay: 0.6, ratio: 2, wet: 0.5 });
      bell(note(5), { peak: 0.03, decay: 0.9, ratio: 2, wet: 0.6, at: 0.1 });
    },
  };
  // Minimum gap between repeats of the same sound (seconds).
  const GAP = { tick: 0.045, tap: 0.06, glass: 0.12, card: 0.1, filter: 0.08, toggle: 0.05, leave: 0.5, scribble: 2 };

  function play(name, data = {}) {
    const fn = KIT[name];
    if (!fn || !ctx || ctx.state !== "running") return;
    const now = ctx.currentTime;
    if (now - (lastAt[name] || -1) < (GAP[name] || 0.02)) return;
    lastAt[name] = now;
    try {
      fn(data);
    } catch (err) {
      if (DEBUG) console.error("sfx", name, err);
    }
  }

  /* ---------- ambient: an open-fifth pad and the odd twinkling star ---------- */
  function startAmbient() {
    if (!ctx || ambient) return;
    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.03, t + 2.5);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 760;
    lp.Q.value = 0.6;
    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.frequency.value = 0.045;
    lfoDepth.gain.value = 280;
    lfo.connect(lfoDepth).connect(lp.frequency);
    lfo.start();
    lp.connect(out);
    out.connect(bus);
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    out.connect(wet).connect(send);
    const oscs = [
      [146.83, "sine", -4],
      [146.83, "sine", 5],
      [220, "triangle", 3],
      [329.63, "sine", -6],
    ].map(([f, type, det]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = f;
      o.detune.value = det;
      g.gain.value = type === "triangle" ? 0.18 : 0.32;
      o.connect(g).connect(lp);
      o.start();
      return o;
    });
    ambient = { out, nodes: [...oscs, lfo], extra: [lp, lfoDepth, wet] };
    scheduleSparkle();
  }
  function stopAmbient() {
    clearTimeout(sparkleTimer);
    if (!ambient || !ctx) return;
    const a = ambient;
    ambient = null;
    const t = ctx.currentTime;
    a.out.gain.cancelScheduledValues(t);
    a.out.gain.setValueAtTime(Math.max(a.out.gain.value, 0.0001), t);
    a.out.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    setTimeout(() => {
      a.nodes.forEach((n) => {
        try {
          n.stop();
        } catch {}
        n.disconnect();
      });
      a.extra.forEach((n) => n.disconnect());
      a.out.disconnect();
    }, 900);
  }
  function scheduleSparkle() {
    clearTimeout(sparkleTimer);
    sparkleTimer = setTimeout(() => {
      if (enabled && ambient && !document.hidden && ctx.state === "running") {
        bell(note(12 + Math.floor(Math.random() * 5)), { peak: 0.012 + Math.random() * 0.008, decay: 1.6, ratio: 3.01, index: 1, wet: 0.95, pan: Math.random() * 1.4 - 0.7 });
      }
      if (ambient) scheduleSparkle();
    }, 3500 + Math.random() * 5000);
  }

  /* ---------- on / off ---------- */
  function render() {
    if (!btn) return;
    btn.setAttribute("aria-pressed", String(enabled));
    if (label) label.textContent = enabled ? "Sound on" : "Sound off";
    btn.title = enabled ? "Turn sound off" : "Turn sound on";
  }
  async function turnOn() {
    enabled = true;
    store.set(true);
    render();
    if (!(await wake())) {
      enabled = false;
      store.set(false);
      if (label) label.textContent = "Sound unavailable";
      btn && btn.setAttribute("aria-pressed", "false");
      return;
    }
    play("power-on");
    startAmbient();
  }
  function turnOff() {
    play("power-off");
    enabled = false;
    store.set(false);
    render();
    stopAmbient();
    clearTimeout(suspendTimer);
    suspendTimer = setTimeout(() => {
      if (!enabled && ctx && ctx.state === "running") ctx.suspend();
    }, 1600);
  }
  btn?.addEventListener("click", () => (enabled ? turnOff() : turnOn()));
  render();

  // Sound was switched on earlier in this session: resume on the first gesture here.
  const unlock = async () => {
    if (!enabled || unlocked) return;
    if (await wake()) startAmbient();
  };
  ["pointerup", "touchend", "keydown"].forEach((ev) => addEventListener(ev, unlock, { passive: true }));

  /* ---------- public API ---------- */
  CC.sfx = (name, data = {}) => {
    if (data.force && !enabled) {
      // An explicit "say hi" works even with sound off: it is the visitor's own action.
      wake().then((ok) => ok && play(name, data));
      return;
    }
    if (!enabled) return;
    play(name, data);
  };

  /* ---------- interface sounds: hover (mouse only), tap, keyboard ---------- */
  const HOVER = "a[href], button, summary, [role='button'], .team-card, .glass-stage, .filter-chip";
  let hoverEl = null;
  document.addEventListener(
    "pointerover",
    (e) => {
      if (e.pointerType !== "mouse" || !enabled) return;
      const el = e.target.closest(HOVER);
      if (el === hoverEl) return;
      hoverEl = el;
      if (el) play("tick", { x: e.clientX });
    },
    { passive: true },
  );
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (!enabled) return;
      const el = e.target.closest("a[href], button, summary, [role='button']");
      if (!el || el.closest(".sound-toggle")) return;
      play("tap", { x: e.clientX });
    },
    { passive: true },
  );
  document.addEventListener("keydown", (e) => {
    if (!enabled || (e.key !== "Enter" && e.key !== " ")) return;
    const el = document.activeElement;
    if (el && el.matches && el.matches("a[href], button, summary") && !el.closest(".sound-toggle")) play("tap", {});
  });

  /* ---------- lifecycle ---------- */
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (enabled && unlocked) ctx.resume();
  });
  addEventListener("pagehide", () => {
    stopAmbient();
    if (ctx && ctx.state === "running") ctx.suspend();
    unlocked = false;
  });
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    enabled = store.get();
    render();
  });
})();
