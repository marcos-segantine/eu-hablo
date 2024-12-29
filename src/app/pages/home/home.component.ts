import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { SpeechService } from '../../services/text-to-speech.service';
import { ChatService } from '../../services/chat.service';

declare const webkitSpeechRecognition: any;

@Component({
  selector: 'app-home',
  imports: [],
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

  constructor(private speechService: SpeechService, private chatService: ChatService) { }

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
    console.log("stopRecord");

    this.recognition.stop();
    clearTimeout(this.holdTimeout);

    this.chatService.getResponse(this.text).then(response => {
      if (response.content) {
        this.synthesizeText(response.content);
      }
    });
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

  synthesizeText(textToSynthesize: string): void {
    if (!this.text.trim()) return;

    this.speechService.synthesizeTextToSpeech(textToSynthesize, this.language)
      .then((audioBlob) => {
        this.audioUrl = URL.createObjectURL(audioBlob);

        this.text = ""
        this.finalTranscript = ""
        this.interimTranscript = "";
        this.transcriptionElement.nativeElement.innerHTML = "";
      })
      .catch((error) => {
        console.error('Error during synthesis:', error);
      });
  }
}
