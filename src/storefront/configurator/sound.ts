"use client";

/**
 * Synthesised cues (spec §3): off by default, opt-in, no assets, no hover sounds.
 * Selection cues are throttled to one per 150 ms and capped at two voices.
 */
let ctx: AudioContext | null = null;
let last = 0;
let voices = 0;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function play(freq: number, ms: number, gain = 0.08, type: OscillatorType = "square") {
  const c = audio();
  if (!c || voices >= 2 || document.hidden) return;
  voices++;
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 1800;
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + ms / 1000);
  o.connect(f).connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + ms / 1000);
  o.onended = () => {
    voices = Math.max(0, voices - 1);
  };
}

export const cue = {
  /** Soft mechanical click, 40–90 ms, once per committed selection. */
  select() {
    const now = performance.now();
    if (now - last < 150) return;
    last = now;
    play(1400, 60, 0.05);
  },
  /** Muted seating sound for a real component change. */
  seat() {
    play(220, 140, 0.06, "triangle");
  },
  /** Restrained confirmation, only after server success. */
  confirm() {
    play(660, 120, 0.05, "sine");
    setTimeout(() => play(880, 160, 0.04, "sine"), 90);
  },
  /** Short dry texture after engraving edits end. */
  engrave() {
    play(3200, 45, 0.02, "sawtooth");
  },
};
