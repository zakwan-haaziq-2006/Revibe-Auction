// Web Audio API synthesized sound effects for realistic live auction feedback

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.activeAudioInstances = [];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAllAudio();
    }
  }

  stopAllAudio() {
    if (this.activeAudioInstances && this.activeAudioInstances.length > 0) {
      this.activeAudioInstances.forEach((audio) => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {
          console.warn('Error stopping audio:', e);
        }
      });
      this.activeAudioInstances = [];
    }
  }

  playBidSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Tone 1
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5

      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.15);

      // Accent high tone
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1318.5, now + 0.04); // E6
      gain2.gain.setValueAtTime(0.15, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(now + 0.04);
      osc2.stop(now + 0.2);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  playSoldGavelSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Double Gavel Knock (Knock 1)
      this.triggerGavelKnock(now);
      // Knock 2 (0.18s later)
      this.triggerGavelKnock(now + 0.18);
    } catch (e) {
      console.warn('Audio error', e);
    }
  }

  triggerGavelKnock(time) {
    // Low woody thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.14);

    // Click impact noise
    const bufferSize = this.ctx.sampleRate * 0.05; // 50ms buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 3;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.05);
  }

  playUnsoldBuzzerSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(130, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio error', e);
    }
  }

  playNextSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.08); // C6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      console.warn('Audio error', e);
    }
  }

  // Play background music from sounds folder (/sounds/ipl_background.mp3)
  playCountdownMusic() {
    if (!this.enabled) return null;
    this.stopAllAudio();
    try {
      const audio = new Audio('/sounds/ipl_background.mp3');
      audio.currentTime = 0;
      audio.volume = 0.75;
      audio.play().catch((err) => console.warn('Audio play prevented:', err));
      this.activeAudioInstances.push(audio);
      return audio;
    } catch (e) {
      console.warn('Audio error', e);
      return null;
    }
  }

  playCategorySound() {
    if (!this.enabled) return null;
    this.stopAllAudio();
    try {
      const audio = new Audio('/sounds/ipl_background.mp3');
      audio.currentTime = 0;
      audio.volume = 0.85;
      audio.play().catch((err) => console.warn('Audio play prevented:', err));
      this.activeAudioInstances.push(audio);
      return audio;
    } catch (e) {
      console.warn('Audio error', e);
      return null;
    }
  }
}

export const sounds = new SoundEffects();
