let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function playBeep(freq: number, soundOn: boolean = true) {
  if (!soundOn) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.type = 'sine';
    g.gain.value = 0.045;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    o.stop(ctx.currentTime + 0.17);
  } catch {
    // audio failure silent catch
  }
}

export function playGemSound(gemCount: number, soundOn: boolean = true) {
  if (!soundOn) return;
  const freq = 660 + gemCount * 35;
  playBeep(freq, soundOn);
}

export function playJumpSound(soundOn: boolean = true) {
  if (!soundOn) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    const now = ctx.currentTime;
    o.frequency.setValueAtTime(260, now);
    o.frequency.exponentialRampToValueAtTime(520, now + 0.12);
    g.gain.setValueAtTime(0.035, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(now + 0.13);
  } catch {}
}

export function playWinSound(soundOn: boolean = true) {
  if (!soundOn) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        const now = ctx.currentTime;
        g.gain.setValueAtTime(0.05, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        o.stop(now + 0.3);
      }, i * 90);
    });
  } catch {}
}

export function playFallSound(soundOn: boolean = true) {
  if (!soundOn) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    const now = ctx.currentTime;
    o.frequency.setValueAtTime(320, now);
    o.frequency.exponentialRampToValueAtTime(110, now + 0.22);
    g.gain.setValueAtTime(0.03, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(now + 0.23);
  } catch {}
}

export function playBarrierHitSound(soundOn: boolean = true) {
  if (!soundOn) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    const now = ctx.currentTime;
    o.frequency.setValueAtTime(160, now);
    o.frequency.setValueAtTime(80, now + 0.08);
    o.frequency.setValueAtTime(220, now + 0.14);
    g.gain.setValueAtTime(0.06, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(now + 0.26);
  } catch {}
}
