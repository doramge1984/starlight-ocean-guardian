/**
 * Web Audio API Procedural Sound Engine
 * Zero external audio files: 100% synthesized in code.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isQuietMode: boolean = false;
  private bgmVolume: number = 0.4;
  private sfxVolume: number = 0.6;

  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Background audio nodes
  private waveGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private underwaterGain: GainNode | null = null;
  private auroraGain: GainNode | null = null;

  private musicBoxInterval: number | null = null;
  private waveFilter: BiquadFilterNode | null = null;
  private waveInterval: number | null = null;

  private currentStage: number = 1;
  private recoveryRate: number = 0;

  constructor() {
    // Initialized on first user interaction
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master bus
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // BGM bus
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume * (this.isQuietMode ? 0.3 : 1), this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      // SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume * (this.isQuietMode ? 0.4 : 1), this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.startAmbientGenerators();
      this.startMusicBoxLoop();
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  // Generate pink/white noise buffer
  private createNoiseBuffer(seconds: number = 3): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter algorithm
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private startAmbientGenerators() {
    if (!this.ctx || !this.bgmGain) return;

    // 1. Ocean Waves generator (Swept filtered noise)
    const waveNoise = this.createNoiseBuffer(5);
    if (waveNoise) {
      const waveSource = this.ctx.createBufferSource();
      waveSource.buffer = waveNoise;
      waveSource.loop = true;

      this.waveFilter = this.ctx.createBiquadFilter();
      this.waveFilter.type = 'lowpass';
      this.waveFilter.frequency.setValueAtTime(350, this.ctx.currentTime);
      this.waveFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      this.waveGain = this.ctx.createGain();
      this.waveGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      waveSource.connect(this.waveFilter);
      this.waveFilter.connect(this.waveGain);
      this.waveGain.connect(this.bgmGain);
      waveSource.start();

      // Periodically sweep waves like ocean tide
      let tide = 0;
      this.waveInterval = window.setInterval(() => {
        if (!this.ctx || !this.waveFilter || !this.waveGain) return;
        tide += 0.08;
        const freq = 200 + Math.sin(tide) * 350 + Math.sin(tide * 0.5) * 150;
        const gain = 0.12 + Math.max(0, Math.sin(tide)) * 0.18;
        const now = this.ctx.currentTime;
        this.waveFilter.frequency.setTargetAtTime(freq, now, 1.2);
        this.waveGain.gain.setTargetAtTime(gain, now, 1.2);
      }, 500);
    }

    // 2. Wind gentle drone
    const windNoise = this.createNoiseBuffer(4);
    if (windNoise) {
      const windSource = this.ctx.createBufferSource();
      windSource.buffer = windNoise;
      windSource.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      windFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      windSource.connect(windFilter);
      windFilter.connect(this.windGain);
      this.windGain.connect(this.bgmGain);
      windSource.start();
    }

    // 3. Underwater drone for Stage 3 & 4
    const underwaterOsc = this.ctx.createOscillator();
    underwaterOsc.type = 'sine';
    underwaterOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low sub bass A1

    const underwaterFilter = this.ctx.createBiquadFilter();
    underwaterFilter.type = 'lowpass';
    underwaterFilter.frequency.setValueAtTime(120, this.ctx.currentTime);

    this.underwaterGain = this.ctx.createGain();
    this.underwaterGain.gain.setValueAtTime(0, this.ctx.currentTime); // active in underwater

    underwaterOsc.connect(underwaterFilter);
    underwaterFilter.connect(this.underwaterGain);
    this.underwaterGain.connect(this.bgmGain);
    underwaterOsc.start();

    // 4. Aurora ethereal synth chord
    const auroraFreqs = [220, 277.18, 329.63, 415.30]; // A major 7th chord
    auroraFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.bgmGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      // Subtle vibrato/detune
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.2 + idx * 0.05, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(2.5, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start();
    });
  }

  // Musicbox arpeggiator that evolves with ocean recovery rate
  private startMusicBoxLoop() {
    const scales = [
      [261.63, 329.63, 392.00, 523.25], // C major
      [293.66, 349.23, 440.00, 587.33], // D minor
      [329.63, 392.00, 493.88, 659.25], // E minor
      [349.23, 440.00, 523.25, 698.46], // F major
      [392.00, 493.88, 587.33, 783.99], // G major
    ];

    let noteIndex = 0;
    let chordIndex = 0;

    this.musicBoxInterval = window.setInterval(() => {
      if (!this.ctx || !this.bgmGain || this.isMuted) return;
      if (this.currentStage >= 3 && this.currentStage <= 4) return; // Muffled in underwater stages

      // Probability of playing note scales with recovery rate (more melodious as recovery rises)
      const playProb = 0.35 + (this.recoveryRate / 100) * 0.45;
      if (Math.random() > playProb) return;

      const chord = scales[chordIndex % scales.length];
      const freq = chord[noteIndex % chord.length];
      noteIndex++;
      if (noteIndex % chord.length === 0) {
        chordIndex = (chordIndex + 1) % scales.length;
      }

      this.playChimeNote(freq, 0.08 + (this.recoveryRate / 100) * 0.06);
    }, 700);
  }

  private playChimeNote(freq: number, baseVol: number = 0.1) {
    if (!this.ctx || !this.bgmGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    const gain = this.ctx.createGain();
    const vol = baseVol * (this.isQuietMode ? 0.3 : 1);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(vol, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.bgmGain);
    osc.start(now);
    osc.stop(now + 1.3);
  }

  // Update environmental audio on stage change
  public setStage(stage: number) {
    this.currentStage = stage;
    if (!this.ctx || !this.underwaterGain || !this.waveGain) return;
    const now = this.ctx.currentTime;
    const isUnderwater = stage === 3 || stage === 4;

    this.underwaterGain.gain.setTargetAtTime(isUnderwater ? 0.22 : 0.0, now, 1.5);
    this.waveGain.gain.setTargetAtTime(isUnderwater ? 0.06 : 0.22, now, 1.5);
  }

  public setRecoveryRate(rate: number) {
    this.recoveryRate = rate;
  }

  // ================= SFX ================= //

  public playFootstep(inWater: boolean = false) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = inWater ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(inWater ? 280 : 120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    const gain = this.ctx.createGain();
    const vol = (inWater ? 0.09 : 0.06) * (this.isQuietMode ? 0.3 : 1);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playPickup() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      const gain = this.ctx!.createGain();
      const vol = 0.12 * (this.isQuietMode ? 0.3 : 1);
      gain.gain.setValueAtTime(vol, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.3);
    });
  }

  public playExperimentAction() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08 * (this.isQuietMode ? 0.3 : 1), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playQuizCorrect() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Pleasant high 'ding' (E6 to G6 chord)
    [1318.51, 1567.98].forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.18 * (this.isQuietMode ? 0.4 : 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now);
      osc.stop(now + 0.65);
    });
  }

  public playQuizRetry() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Gentle warm 'boing' (encouraging, no harsh penalty)
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12 * (this.isQuietMode ? 0.3 : 1), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playBadgeFanfare() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Grand triumphant fanfare C - E - G - C6 with delay
    const chords = [
      { t: 0.00, f: 523.25 },
      { t: 0.12, f: 659.25 },
      { t: 0.24, f: 783.99 },
      { t: 0.38, f: 1046.50 },
      { t: 0.38, f: 1318.51 },
    ];
    chords.forEach(({ t, f }) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.2 * (this.isQuietMode ? 0.4 : 1), now + t);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + t);
      osc.stop(now + t + 0.9);
    });
  }

  public playTurtleRescue() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Heartwarming harmonic swirl
    const freqs = [440, 554.37, 659.25, 880];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.15 * (this.isQuietMode ? 0.4 : 1), now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.9);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 1.0);
    });
  }

  public playDolphinChirp() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Playful dolphin frequency modulation whistle
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.linearRampToValueAtTime(2800, now + 0.12);
    osc.frequency.linearRampToValueAtTime(1800, now + 0.22);
    osc.frequency.linearRampToValueAtTime(3200, now + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12 * (this.isQuietMode ? 0.3 : 1), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  public playSunriseMusic() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Dawn gentle majestic harmonic progression
    const progression = [
      [261.63, 329.63, 392.00], // C
      [329.63, 392.00, 493.88], // Em
      [349.23, 440.00, 523.25], // F
      [392.00, 493.88, 587.33, 783.99], // G
    ];
    progression.forEach((chord, cIdx) => {
      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + cIdx * 0.8);

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.0001, now + cIdx * 0.8);
        gain.gain.exponentialRampToValueAtTime(0.12 * (this.isQuietMode ? 0.4 : 1), now + cIdx * 0.8 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + cIdx * 0.8 + 1.2);

        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now + cIdx * 0.8);
        osc.stop(now + cIdx * 0.8 + 1.3);
      });
    });
  }

  // ================= Volume & Mode Controls ================= //

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleQuietMode(): boolean {
    this.isQuietMode = !this.isQuietMode;
    this.updateBuses();
    return this.isQuietMode;
  }

  public getIsQuietMode(): boolean {
    return this.isQuietMode;
  }

  public setBgmVolume(val: number) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    this.updateBuses();
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    this.updateBuses();
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  private updateBuses() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.bgmGain) {
      const targetBgm = this.bgmVolume * (this.isQuietMode ? 0.35 : 1);
      this.bgmGain.gain.setTargetAtTime(targetBgm, now, 0.1);
    }
    if (this.sfxGain) {
      const targetSfx = this.sfxVolume * (this.isQuietMode ? 0.4 : 1);
      this.sfxGain.gain.setTargetAtTime(targetSfx, now, 0.1);
    }
  }
}

export const soundEngine = new SoundEngine();
