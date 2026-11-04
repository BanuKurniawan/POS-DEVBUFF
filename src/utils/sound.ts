/**
 * Synthesizes short audio beeps using standard Web Audio API without needing external audio assets.
 */
export function playBeep(freq = 900, duration = 0.07, enabled = true): void {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio context errors silently (e.g. autoplay policies before interaction)
  }
}

export function playSuccessSound(enabled = true): void {
  playBeep(1200, 0.12, enabled);
}

export function playErrorSound(enabled = true): void {
  playBeep(400, 0.15, enabled);
}

