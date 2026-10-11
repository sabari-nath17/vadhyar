export function playTone(enabled: boolean, kind: 'tap' | 'reveal' | 'verified') {
  if (!enabled) return;
  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = {tap:440,reveal:520,verified:660}[kind];
    gain.gain.setValueAtTime(.035, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .12);
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.onended = () => { void audio.close().catch(() => {}); };
    oscillator.start(); oscillator.stop(audio.currentTime + .12);
  } catch { /* Sound is optional; the lesson still works when audio is unavailable. */ }
}
