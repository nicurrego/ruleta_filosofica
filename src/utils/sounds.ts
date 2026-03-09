export class SoundManager {
  private spinAudio: HTMLAudioElement | null = null;
  private winAudio: HTMLAudioElement | null = null;
  private transitionAudio: HTMLAudioElement | null = null;
  private tickAudio: HTMLAudioElement | null = null;
  private whooshAudio: HTMLAudioElement | null = null;
  private introNotificationAudio: HTMLAudioElement | null = null;
  private wheelAppearsAudio: HTMLAudioElement | null = null;
  private applauseAudio: HTMLAudioElement | null = null;
  private airWhooshAudio: HTMLAudioElement | null = null;
  private scrollSwooshAudio: HTMLAudioElement | null = null;
  private winnerExpansionAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.spinAudio = new Audio('/wheel-spin.wav');
      this.spinAudio.loop = true;
      
      this.winAudio = new Audio('/wheel-win.wav');

      // Screen transition sound — played when switching to the phrase screen
      this.transitionAudio = new Audio('/screen-transition.wav');
      this.transitionAudio.volume = 0.85;

      // Tick sound — new "gamer" variant
      this.tickAudio = new Audio('/tick.wav');
      this.tickAudio.volume = 0.5;

      // Whoosh sound
      this.whooshAudio = new Audio('/wheel-whoosh.wav');
      this.whooshAudio.volume = 0.8;

      // NEW SOUNDS
      this.introNotificationAudio = new Audio('/ruleta_filosofica_notification.wav');
      this.wheelAppearsAudio = new Audio('/wheel_appears.wav');
      this.applauseAudio = new Audio('/girls_applause.wav');
      this.airWhooshAudio = new Audio('/air_whoosh_to_mothly_overview.wav');
      this.scrollSwooshAudio = new Audio('/scroll_up_swoosh.wav');
      this.winnerExpansionAudio = new Audio('/winner_topic_2colum_1column.wav');
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

  public playTick() {
    if (this.tickAudio) {
      const click = this.tickAudio.cloneNode() as HTMLAudioElement;
      click.volume = 0.4;
      click.play().catch(e => {});
    }
  }

  public playDramaticWhoosh() {
    if (this.whooshAudio) {
      this.whooshAudio.currentTime = 0;
      this.whooshAudio.play().catch(e => console.error('Whoosh audio play failed', e));
    }
  }

  public playIntroNotification() {
    if (this.introNotificationAudio) {
      this.introNotificationAudio.currentTime = 0;
      this.introNotificationAudio.play().catch(e => console.error('Intro notification play failed', e));
    }
  }

  public playWheelAppears() {
    if (this.wheelAppearsAudio) {
      this.wheelAppearsAudio.currentTime = 0;
      this.wheelAppearsAudio.play().catch(e => console.error('Wheel appears play failed', e));
    }
  }

  public playApplause() {
    if (this.applauseAudio) {
      this.applauseAudio.currentTime = 0;
      this.applauseAudio.play().catch(e => console.error('Applause play failed', e));
    }
  }

  public playAirWhoosh() {
    if (this.airWhooshAudio) {
      this.airWhooshAudio.currentTime = 0;
      this.airWhooshAudio.play().catch(e => console.error('Air Whoosh play failed', e));
    }
  }
  
  public playScrollSwoosh() {
    if (this.scrollSwooshAudio) {
      this.scrollSwooshAudio.currentTime = 0;
      this.scrollSwooshAudio.play().catch(e => console.error('Scroll Swoosh play failed', e));
    }
  }

  public playWinnerExpansion() {
    if (this.winnerExpansionAudio) {
      this.winnerExpansionAudio.currentTime = 0;
      this.winnerExpansionAudio.play().catch(e => console.error('Winner Expansion play failed', e));
    }
  }
}

export const soundManager = new SoundManager();
