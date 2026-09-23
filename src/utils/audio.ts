// Pure Web Audio API Sound Synthesizer for AquaMind
// Zero external assets required - 100% reliable offline & cross-platform

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export type SoundType = 'water_ripple' | 'crystal_chime' | 'zen_bell' | 'fresh_pop' | 'soft_ding';

export const SOUND_LABELS: Record<SoundType, { name: string; description: string }> = {
  water_ripple: { name: 'Water Ripple', description: 'Gentle aquatic droplet tones' },
  crystal_chime: { name: 'Crystal Chime', description: 'Bright cheerful harmonic bells' },
  zen_bell: { name: 'Zen Bell', description: 'Calming resonant meditation tone' },
  fresh_pop: { name: 'Fresh Pop', description: 'Crisp organic wooden pop' },
  soft_ding: { name: 'Soft Ding', description: 'Subtle pleasant notification' },
};

export function playSound(sound: SoundType = 'water_ripple', volume: number = 0.5) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (sound) {
      case 'water_ripple': {
        // Multi-stage water droplet pitch bend
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        // Downward fluid sweep
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.exponentialRampToValueAtTime(320, now + 0.16);

        osc2.frequency.setValueAtTime(1320, now + 0.08);
        osc2.frequency.exponentialRampToValueAtTime(540, now + 0.28);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.06);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
        break;
      }

      case 'crystal_chime': {
        // High harmonic crystal chord
        [1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + idx * 0.06;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(volume * 0.45, startTime + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.65);
        });
        break;
      }

      case 'zen_bell': {
        // Resonant bowl bell with slow decay
        const osc = ctx.createOscillator();
        const oscOvertone = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, now); // 528 Hz Love frequency

        oscOvertone.type = 'sine';
        oscOvertone.frequency.setValueAtTime(1056, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(volume * 0.6, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        oscOvertone.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        oscOvertone.start(now);
        osc.stop(now + 1.2);
        oscOvertone.stop(now + 1.2);
        break;
      }

      case 'fresh_pop': {
        // Woody organic pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(volume * 0.8, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }

      case 'soft_ding':
      default: {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(880, now + 0.09); // A5

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
    }
  } catch (err) {
    console.warn('Audio playback error (browser user-interaction policy):', err);
  }
}

// Satisfying water splash sound when logging hydration
export function playWaterSplash() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(850, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

// Goal completed celebratory chime
export function playGoalFanfare() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = ctx.currentTime + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.001, st);
      gain.gain.linearRampToValueAtTime(0.3, st + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(st);
      osc.stop(st + 0.45);
    });
  } catch (e) {
    // Ignore
  }
}
