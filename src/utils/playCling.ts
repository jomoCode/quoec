let audioCtx: AudioContext | null = null;

// Short glassy "cling" synthesized with the Web Audio API (no audio file needed).
export function playCling() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    audioCtx ??= new Ctx();
    if (audioCtx.state === 'suspended') void audioCtx.resume();

    const now = audioCtx.currentTime;
    const master = audioCtx.createGain();
    master.gain.value = 0.18;
    master.connect(audioCtx.destination);

    // Inharmonic partials give a bell/glass timbre.
    const partials = [
      { freq: 1568, gain: 1, decay: 0.9 },
      { freq: 2349, gain: 0.6, decay: 0.6 },
      { freq: 3951, gain: 0.35, decay: 0.35 },
      { freq: 5274, gain: 0.2, decay: 0.2 },
    ];

    for (const p of partials) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = p.freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(p.gain, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);
      osc.connect(gain).connect(master);
      osc.start(now);
      osc.stop(now + p.decay + 0.05);
    }
  } catch {
    // Audio is a nicety; never block the click.
  }
}
