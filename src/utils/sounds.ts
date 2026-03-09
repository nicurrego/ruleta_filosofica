export class SoundManager {
  private spinAudio: HTMLAudioElement | null = null;
  private winAudio: HTMLAudioElement | null = null;
  private transitionAudio: HTMLAudioElement | null = null;
  private tickAudio: HTMLAudioElement | null = null;
  private whooshAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.spinAudio = new Audio('/wheel-spin.wav');
      this.spinAudio.loop = true;
      
      this.winAudio = new Audio('/wheel-win.wav');

      // Screen transition sound — played when switching to the phrase screen
      this.transitionAudio = new Audio('/screen-transition.wav');
      this.transitionAudio.volume = 0.85;

      // Tick sound — now using the provided audio file
      this.tickAudio = new Audio('/tick.wav');
      this.tickAudio.volume = 0.5;

      // Whoosh sound — now using the provided audio file
      this.whooshAudio = new Audio('/wheel-whoosh.wav');
      this.whooshAudio.volume = 0.8;
    }
  }

  public playSpin() {
    if (this.spinAudio) {
      this.spinAudio.currentTime = 0;
      this.spinAudio.volume = 0.7;
      this.spinAudio.play().catch(e => console.error('Audio play failed', e));
    }
  }

  public stopSpin() {
    if (this.spinAudio) {
      this.spinAudio.pause();
      this.spinAudio.currentTime = 0;
    }
  }

  public playWin() {
    if (this.winAudio) {
      this.winAudio.currentTime = 0;
      this.winAudio.volume = 0.9;
      this.winAudio.play().catch(e => console.error('Audio play failed', e));
    }
  }

  public playTransition() {
    if (this.transitionAudio) {
      this.transitionAudio.currentTime = 0;
      this.transitionAudio.play().catch(e => console.error('Transition audio play failed', e));
    }
  }

  /**
   * Plays the tick sound file.
   */
  public playTick() {
    if (this.tickAudio) {
      // Clone the node so we can play overlapping ticks if they happen fast
      const click = this.tickAudio.cloneNode() as HTMLAudioElement;
      click.volume = 0.4;
      click.play().catch(e => {});
    }
  }

  /**
   * Plays the dramatic whoosh sound file.
   */
  public playDramaticWhoosh() {
    if (this.whooshAudio) {
      this.whooshAudio.currentTime = 0;
      this.whooshAudio.play().catch(e => console.error('Whoosh audio play failed', e));
    }
  }
}

export const soundManager = new SoundManager();
