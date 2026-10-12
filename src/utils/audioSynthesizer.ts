// Web Audio API synthesizer for realistic radio dispatch and voice note playback

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private currentOscillators: OscillatorNode[] = [];
  private isPlaying = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play radio chirp / walkie-talkie beep (at start of audio)
  public playRadioBeep() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // AudioContext fallback
    }
  }

  // Play simulated voice note modulation melody
  public startVoiceNote(onProgress?: (progress: number) => void, onComplete?: () => void) {
    try {
      this.initContext();
      if (!this.ctx) return;
      this.stop();
      this.isPlaying = true;

      this.playRadioBeep();

      const startTime = this.ctx.currentTime + 0.15;
      const notes = [260, 310, 290, 340, 310, 270, 350, 390, 320, 290, 330, 280];
      const durationPerNote = 0.35;
      const totalDuration = notes.length * durationPerNote;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.06, startTime);
      masterGain.connect(this.ctx.destination);

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteStart = startTime + idx * durationPerNote;

        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // Radio dispatch voice timbre using bandpass
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800 + (idx % 3) * 200, noteStart);
        filter.Q.setValueAtTime(2.5, noteStart);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);
        osc.frequency.linearRampToValueAtTime(freq + (idx % 2 === 0 ? 15 : -15), noteStart + durationPerNote);

        noteGain.gain.setValueAtTime(0.07, noteStart);
        noteGain.gain.exponentialRampToValueAtTime(0.005, noteStart + durationPerNote - 0.02);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + durationPerNote);
        this.currentOscillators.push(osc);
      });

      // Progress tracker
      const interval = setInterval(() => {
        if (!this.ctx || !this.isPlaying) {
          clearInterval(interval);
          return;
        }
        const elapsed = this.ctx.currentTime - startTime;
        const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        if (onProgress) onProgress(progress);

        if (elapsed >= totalDuration) {
          clearInterval(interval);
          this.isPlaying = false;
          this.playRadioBeep();
          if (onComplete) onComplete();
        }
      }, 100);

    } catch {
      if (onComplete) onComplete();
    }
  }

  public stop() {
    this.isPlaying = false;
    this.currentOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.currentOscillators = [];
  }
}

export const audioSynthesizer = new AudioSynthesizer();
