import { Component, Input, OnChanges, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-talking-effect',
  templateUrl: './talking-effect.component.html',
  styleUrls: ['./talking-effect.component.scss']
})
export class TalkingEffectComponent implements OnInit, OnChanges {
  @Input() audioURL!: string | null;
  @Input() showAnimation = false;
  @Output() event = new EventEmitter<void>();

  private animationFrameId: number | null = null;
  private audioContext: AudioContext | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showAnimation']) {
      const currentValue = changes['showAnimation'].currentValue;

      if (currentValue) {
        this.runAnimation();
      } else {
        this.stopAnimation();
      }
    }
  }

  ngOnInit(): void {
    const audio = document.getElementById('audio') as HTMLAudioElement;

    audio.onloadedmetadata = async () => {
      const duration = audio.duration;
      console.log('Audio duration:', duration);

      await this.sleep(duration * 1000);

      this.emitEvent();
    };
  }

  emitEvent(): void {
    this.event.emit();
  }

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  runAnimation(): void {
    const circles = document.querySelectorAll<HTMLDivElement>('.circle');

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream: MediaStream) => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
        const analyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 64;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);

        const animateCircles = () => {
          analyser.getByteFrequencyData(dataArray);

          circles.forEach((circle, index) => {
            if (index < dataArray.length) {
              const height = (dataArray[index] / 255) * 100;
              circle.style.height = `${Math.max(10, height)}px`;
            }
          });

          this.animationFrameId = requestAnimationFrame(animateCircles);
        };

        animateCircles();
      })
      .catch((err: Error) => {
        console.error('Error accessing audio:', err);
      });
  }

  stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Reset circle styles
    const circles = document.querySelectorAll<HTMLDivElement>('.circle');
    circles.forEach(circle => {
      circle.style.height = '10px';
    });

    // Close the audio context
    if (this.audioContext) {
      this.audioContext.close().catch(err => console.error('Error closing audio context:', err));
      this.audioContext = null;
    }
  }
}
