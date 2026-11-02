// Web Audio API Automotive Synthesizer for Cabin Alerts
class SoundAlertService {
  constructor() {
    this.audioCtx = null;
    this.isMuted = typeof window !== 'undefined' ? localStorage.getItem('cabin_alert_muted') === 'true' : false;
    this.lastPlayedState = null;
    this.lastPlayTime = 0;
  }

  init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('cabin_alert_muted', String(this.isMuted));
    }
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  playTone(freq, type = 'sine', duration = 0.15, startTime = 0, gainLevel = 0.1) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + startTime);

      gain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + startTime);
      osc.stop(this.audioCtx.currentTime + startTime + duration);
    } catch {
      // Audio context might be restricted before first user interaction
    }
  }

  // Soft futuristic automotive chime
  playNormalChime() {
    this.playTone(523.25, 'sine', 0.12, 0, 0.08); // C5
    this.playTone(659.25, 'sine', 0.25, 0.1, 0.08); // E5
  }

  // Attention warning chime
  playWarningChime() {
    this.playTone(600, 'triangle', 0.15, 0, 0.12);
    this.playTone(600, 'triangle', 0.2, 0.18, 0.12);
  }

  // Urgent cabin overheat safety pulse
  playCriticalAlert() {
    this.playTone(880, 'sawtooth', 0.18, 0, 0.15);
    this.playTone(1046.5, 'sawtooth', 0.25, 0.16, 0.15);
    this.playTone(880, 'sawtooth', 0.18, 0.38, 0.15);
  }

  // Trigger sound automatically when thermal state changes
  handleThermalState(status, temp) {
    const now = Date.now();
    // Throttle alert sounds to at least 12 seconds between plays for the same state
    if (this.lastPlayedState === status && now - this.lastPlayTime < 12000) {
      return;
    }

    if (status === 'HIGH' || temp >= 35) {
      this.playCriticalAlert();
      this.lastPlayedState = 'HIGH';
      this.lastPlayTime = now;
    } else if (status === 'WARNING' || temp >= 30) {
      this.playWarningChime();
      this.lastPlayedState = 'WARNING';
      this.lastPlayTime = now;
    }
  }
}

export const soundAlertService = new SoundAlertService();
