/**
 * SoundEngine - Lightweight audio feedback system
 * 
 * Features:
 * - Subtle tick on comparison (400Hz, 50ms)
 * - Stronger tick on swap (600Hz, 80ms, louder)
 * - Mute toggle
 * - Prevents overlapping sounds
 * - Uses Web Audio API (lightweight)
 */

class SoundEngine {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private isPlaying: boolean = false;
  private lastPlayTime: number = 0;
  private minInterval: number = 20; // Minimum 20ms between sounds

  /**
   * Initialize audio context
   * Must be called after user interaction (browser requirement)
   */
  initialize() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }
  }

  /**
   * Toggle sound on/off
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Check if enough time has passed since last sound
   * Prevents overlapping and audio distortion
   */
  private canPlay(): boolean {
    const now = Date.now();
    if (now - this.lastPlayTime < this.minInterval) {
      return false;
    }
    this.lastPlayTime = now;
    return true;
  }

  /**
   * Play subtle tick on comparison
   * Lower frequency (400Hz), quieter (0.1 gain), shorter (50ms)
   */
  playCompare() {
    if (!this.enabled || !this.audioContext || this.isPlaying || !this.canPlay()) {
      return;
    }
    
    this.isPlaying = true;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Subtle tick: 400Hz, 50ms duration
    oscillator.type = 'sine';
    oscillator.frequency.value = 400;
    
    // Quiet volume
    gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.05
    );
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.05);
    
    // Reset playing flag after sound finishes
    setTimeout(() => {
      this.isPlaying = false;
    }, 50);
  }

  /**
   * Play stronger tick on swap
   * Higher frequency (600Hz), louder (0.15 gain), longer (80ms)
   */
  playSwap() {
    if (!this.enabled || !this.audioContext || this.isPlaying || !this.canPlay()) {
      return;
    }
    
    this.isPlaying = true;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Stronger tick: 600Hz, 80ms duration
    oscillator.type = 'sine';
    oscillator.frequency.value = 600;
    
    // Louder volume
    gainNode.gain.setValueAtTime(0.12, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.08
    );
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.08);
    
    // Reset playing flag after sound finishes
    setTimeout(() => {
      this.isPlaying = false;
    }, 80);
  }

  /**
   * Play sound for visiting a node (graph algorithms)
   * Medium frequency (500Hz), medium volume, medium duration
   */
  playVisit() {
    if (!this.enabled || !this.audioContext || this.isPlaying || !this.canPlay()) {
      return;
    }
    
    this.isPlaying = true;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Visiting sound: 500Hz, 60ms duration
    oscillator.type = 'sine';
    oscillator.frequency.value = 500;
    
    // Medium volume
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.06
    );
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.06);
    
    // Reset playing flag after sound finishes
    setTimeout(() => {
      this.isPlaying = false;
    }, 60);
  }

  /**
   * Play success sound (found element, completed path)
   * Higher frequency (800Hz), louder, longer duration
   */
  playSuccess() {
    if (!this.enabled || !this.audioContext || this.isPlaying || !this.canPlay()) {
      return;
    }
    
    this.isPlaying = true;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Success sound: 800Hz, 120ms duration
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    
    // Loud volume
    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.12
    );
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.12);
    
    // Reset playing flag after sound finishes
    setTimeout(() => {
      this.isPlaying = false;
    }, 120);
  }

  /**
   * Get current enabled state
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundEngine = new SoundEngine();
