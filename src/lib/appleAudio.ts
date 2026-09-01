// Singleton Zero-Latency Apple Audio Engine
class AppleAudioManager {
  private static instance: AppleAudioManager;
  private audioCtx: AudioContext | null = null;
  private soundBuffer: AudioBuffer | null = null;
  private isLoading = false;
  private isLoaded = false;

  // Official Apple Pay success sound URL
  private readonly SOUND_URL =
    'https://raw.githubusercontent.com/extratone/iOSSystemSounds/main/mp3/payment_success.mp3';

  private constructor() {
    if (typeof window !== 'undefined') {
      // 1. Start downloading in background immediately upon module execution
      this.preload();

      // 2. Prepare AudioContext on the earliest user interaction (pointer/touch/key)
      const initContext = () => {
        try {
          const ctx = this.getAudioContext();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
        } catch {
          // ignore
        }
        window.removeEventListener('pointerdown', initContext);
        window.removeEventListener('keydown', initContext);
        window.removeEventListener('touchstart', initContext);
      };

      window.addEventListener('pointerdown', initContext, { passive: true, once: true });
      window.addEventListener('keydown', initContext, { passive: true, once: true });
      window.addEventListener('touchstart', initContext, { passive: true, once: true });
    }
  }

  public static getInstance(): AppleAudioManager {
    if (!AppleAudioManager.instance) {
      AppleAudioManager.instance = new AppleAudioManager();
    }
    return AppleAudioManager.instance;
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Preload & decode the sound into uncompressed PCM RAM buffer in background
   */
  public async preload(): Promise<void> {
    if (this.isLoaded || this.isLoading || typeof window === 'undefined') return;
    this.isLoading = true;

    try {
      const ctx = this.getAudioContext();
      const response = await fetch(this.SOUND_URL, { cache: 'force-cache' });
      if (!response.ok) throw new Error('Network response not ok');
      const arrayBuffer = await response.arrayBuffer();
      this.soundBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.isLoaded = true;
    } catch {
      // If network fails or is slow, fallback synthesizer is automatically used with 0 latency
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Instant Zero-Latency Apple Harmonic Chime Synthesizer
   * Plays immediately (0.0ms delay) if the network audio is still downloading
   */
  private playSynthesizedAppleChime(ctx: AudioContext): void {
    const now = ctx.currentTime;

    // Master Gain at 100% volume
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now);
    masterGain.connect(ctx.destination);

    // Chime Note 1: First high bell tone (1046.5 Hz - C6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.5, now);

    gain1.gain.setValueAtTime(0.7, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Chime Note 2: Second rising harmonic bell tone (1318.5 Hz - E6) + harmonic shimmer (2093 Hz - C7)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, now + 0.08);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.85, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.48);

    // Harmonic sparkle overtone
    const oscSparkle = ctx.createOscillator();
    const gainSparkle = ctx.createGain();
    oscSparkle.type = 'triangle';
    oscSparkle.frequency.setValueAtTime(2093.0, now + 0.08);

    gainSparkle.gain.setValueAtTime(0, now);
    gainSparkle.gain.setValueAtTime(0.3, now + 0.08);
    gainSparkle.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    oscSparkle.connect(gainSparkle);
    gainSparkle.connect(masterGain);
    oscSparkle.start(now + 0.08);
    oscSparkle.stop(now + 0.38);
  }

  /**
   * Play with absolute zero latency from RAM buffer or instant synthesizer at 100% volume
   */
  public play(): void {
    try {
      const ctx = this.getAudioContext();

      // If buffer is already loaded into RAM, play high-res decoded PCM audio
      if (this.soundBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = this.soundBuffer;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(1.0, ctx.currentTime);

        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return;
      }

      // If not yet fully downloaded into buffer, play instant 0.00ms synthesized Apple chime!
      this.playSynthesizedAppleChime(ctx);

      // Trigger background preload for subsequent calls if needed
      this.preload();
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  }
}

export const appleAudio = AppleAudioManager.getInstance();
export default appleAudio;
