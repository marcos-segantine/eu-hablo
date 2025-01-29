import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { SpeechService } from '../../services/text-to-speech.service';
import { ChatService } from '../../services/chat.service';

import { TalkingEffectComponent } from '../../components/talking-effect/talking-effect.component';

declare const webkitSpeechRecognition: any;

@Component({
  selector: 'app-home',
  imports: [TalkingEffectComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('startBtn') startBtn!: ElementRef;
  @ViewChild('transcription') transcriptionElement!: ElementRef;
  @ViewChild('languageSelect') languageSelect!: ElementRef;

  private recognition: any;
  private assistantResponse: string = "";
  private finalTranscript = '';
  private interimTranscript = '';
  private language: "pt-BR" | "en-US" | "it-IT" | "es-ES" | "fr-FR" = 'en-US';
  private holdTimeout: any;
  text = '';
  conversationHistory: Array<Record<string, string>> = [];

  audioUrl: string | null = null;
  runAnimation: boolean = false;
  isRecording = false;

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
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  onStartButtonClick(): void {
    if (this.isRecording === false) {
      this.isRecording = true;

      if (this.languageSelect) {
        this.language = this.languageSelect.nativeElement.value;
        this.recognition.lang = this.language;
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        this.recognition.start();
      }
    }
    else {
      this.stopRecord();
    }
  }

  stopRecord() {
    this.isRecording = false;

    this.recognition.stop();
    clearTimeout(this.holdTimeout);

    this.chatService.getResponse(this.text, this.conversationHistory).then(response => {
      this.conversationHistory.push({ user: this.text });

      if (response !== null) {
        this.synthesizeText(response);
        this.assistantResponse = response;
      }
      else {
        console.log("error ocurred");
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
      .then(async (audioBlob) => {
        this.audioUrl = URL.createObjectURL(audioBlob);
        this.runAnimation = true;

        this.conversationHistory.push({ assistant: this.assistantResponse as string });
        
        await this.sleep(500);
        const contentContainer = document.getElementsByClassName("content")[0];

        if (contentContainer) {
          contentContainer.scrollTop = contentContainer.scrollHeight;
        }

        this.text = ""
        this.finalTranscript = ""
        this.interimTranscript = "";
        this.transcriptionElement.nativeElement.innerHTML = "";
      })
      .catch((error) => {
        console.error('Error during synthesis:', error);
      });
  }

  stopAnimation(): void {
    this.runAnimation = false;
  }

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
