import { Component, input, OnInit, output } from '@angular/core';

@Component({
  selector: 'app-talking-effect',
  imports: [],
  templateUrl: './talking-effect.component.html',
  styleUrl: './talking-effect.component.scss'
})
export class TalkingEffectComponent implements OnInit {
  audioURL = input.required();
  showAnimation = input(false);
  event = output();

  ngOnInit(): void {
    const audio = document.getElementById('audio') as HTMLAudioElement;
    audio.onloadedmetadata = async () => {
      const duracao = audio.duration;
      console.log(duracao);
      
      await this.sleep(duracao * 1000);

      this.emitEvent();
    };
  }

  emitEvent() {
    this.event.emit();
  }

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
