import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { InputComponent } from '../../components/input/input.component';
import { SpeechService } from '../../services/text-to-speech.service';

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
  private text = '';
  private language: "pt-BR" | "en-US" | "it-IT" | "es-ES" | "fr-FR" = 'en-US';
  private holdTimeout: any;

  private textToSynthesize = '';
  audioUrl: string | null = null;

  constructor(private speechService: SpeechService) { }

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
    this.holdTimeout = setTimeout(() => {
      if (this.languageSelect) {
        this.language = this.languageSelect.nativeElement.value;
        this.recognition.lang = this.language;
        this.recognition.start();
      }
    }, 1000);
  }

  stopRecord() {
    this.recognition.stop();
    clearTimeout(this.holdTimeout);
    this.synthesizeText();
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

    this.text = this.finalTranscript || this.interimTranscript;
    this.transcriptionElement.nativeElement.innerHTML = this.text;
  }

  onEnd(): void {
    console.log('Reconhecimento de fala interrompido');
  }

  onError(event: any): void {
    console.error('Erro no reconhecimento de fala: ', event.error);
  }

  synthesizeText() {
    if (!this.text.trim()) return;

    this.speechService.synthesizeTextToSpeech(this.text.trim(), this.language)
      .then((audioBlob) => {
        this.audioUrl = URL.createObjectURL(audioBlob);
      })
      .catch((error) => {
        console.error('Error during synthesis:', error);
      });
  }
}
