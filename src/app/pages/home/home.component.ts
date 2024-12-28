import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { InputComponent } from '../../components/input/input.component';

declare const webkitSpeechRecognition: any;

@Component({
  selector: 'app-home',
  imports: [InputComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('startBtn') startBtn!: ElementRef;
  @ViewChild('transcription') transcriptionElement!: ElementRef;
  @ViewChild('languageSelect') languageSelect!: ElementRef;

  private recognition: any;
  private finalTranscript = '';
  private interimTranscript = '';

  ngOnInit(): void {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'pt-BR';

      this.recognition.onresult = (event: any) => this.onResult(event);
      this.recognition.onend = () => this.onEnd();
      this.recognition.onerror = (event: any) => this.onError(event);
    } else {
      alert('A Web Speech API não é suportada neste navegador.');
    }
  }

  ngOnDestroy(): void {
    // Limpa recursos ao destruir o componente
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  onStartButtonClick(): void {
    if (this.languageSelect) {
      const selectedLanguage = this.languageSelect.nativeElement.value;
      this.recognition.lang = selectedLanguage;
      this.recognition.start();
    }
  }

  onResult(event: any): void {
    this.interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        this.finalTranscript += transcript + ' ';
      } else {
        this.interimTranscript += transcript + ' ';
      }
    }
    
    const result = this.finalTranscript || this.interimTranscript;

    this.transcriptionElement.nativeElement.innerHTML = result;
  }

  onEnd(): void {
    console.log('Reconhecimento de fala interrompido');
  }

  onError(event: any): void {
    console.error('Erro no reconhecimento de fala: ', event.error);
  }
}
