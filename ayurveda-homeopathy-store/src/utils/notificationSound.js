const SOUND_MUTED_KEY = "maliks_notification_sound_muted";

export const isSoundMuted = () => {
  try {
    return window.localStorage.getItem(SOUND_MUTED_KEY) === "true";
  } catch {
    return false;
  }
};

export const persistSoundMuted = (muted) => {
  try {
    window.localStorage.setItem(SOUND_MUTED_KEY, muted ? "true" : "false");
  } catch {
    // Preference persistence is best-effort.
  }
};

let audioContext = null;
const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioContext) {
    try {
      audioContext = new AudioCtx();
    } catch {
      return null;
    }
  }
  // Browsers suspend audio until a user gesture; resume opportunistically.
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
};

/**
 * Play a short, gentle two-note chime using the Web Audio API.
 * No external asset is required and the volume is kept very low so it reads
 * as a subtle/silent alert rather than a jarring notification sound.
 */
export const playNotificationSound = () => {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.05; // very soft
    master.connect(ctx.destination);

    const tones = [
      { freq: 880, start: 0, duration: 0.14 },
      { freq: 1174.66, start: 0.11, duration: 0.18 },
    ];

    for (const { freq, start, duration } of tones) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(1, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.03);
    }
  } catch {
    // Audio is a best-effort enhancement; ignore failures silently.
  }
};
