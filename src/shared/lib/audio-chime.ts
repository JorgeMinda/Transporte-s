// ==============================================================================
// SINTETIZADOR DE TIMBRE DE PROXIMIDAD (WEB AUDIO API)
// Genera sonido armónico puro sin descargar ningún archivo de audio (0 megas consumidos)
// ==============================================================================

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Emite el timbre sonoro escolar ("Chime armónico")
 * Tono 1: Campana alta (880 Hz - Nota La5)
 * Tono 2: Resonancia cálida (587.33 Hz - Nota Re5 con delay de 120ms)
 */
export function playSchoolChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // --- Oscilador 1: Tono agudo brillante ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // La5
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // --- Oscilador 2: Tono fundamental armónico con delay ---
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(587.33, now + 0.12); // Re5
    gain2.gain.setValueAtTime(0.45, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    // Ejecutar
    osc1.start(now);
    osc1.stop(now + 0.85);

    osc2.start(now + 0.12);
    osc2.stop(now + 1.25);

    // Si el dispositivo soporta vibración (Android), vibrar en sincronía
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([150, 80, 200]);
    }
  } catch (error) {
    console.warn('[AudioChime] Reproducción de audio bloqueada o no soportada:', error);
  }
}

/**
 * Tono corto de confirmación al pulsar "A bordo"
 */
export function playSuccessBeep(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, now); // Do6
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  } catch (e) {
    // Ignorar si autoplay no está habilitado aún
  }
}
