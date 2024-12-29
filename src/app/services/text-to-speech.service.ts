import { Injectable } from '@angular/core';

import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

import { environment } from '../config/enviroment';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private speechConfig: SpeechSDK.SpeechConfig;

  constructor() {
    this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      environment.azureSpeechKey,
      environment.azureSpeechRegion
    );
  }

  synthesizeTextToSpeech(text: string, language: "pt-BR" | "en-US" | "it-IT" | "es-ES" | "fr-FR"): Promise<Blob> {
    this.speechConfig.speechSynthesisVoiceName = this.getLanguage(language);

    return new Promise((resolve, reject) => {
      const synthesizer = new SpeechSDK.SpeechSynthesizer(this.speechConfig);
      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.audioData) {
            const audioBlob = new Blob([result.audioData], { type: 'audio/wav' });
            resolve(audioBlob);
          } else {
            reject('No audio data returned');
          }
          synthesizer.close();
        },
        (error) => {
          reject(error);
          synthesizer.close();
        }
      );
    });
  }

  getLanguage(language: string): string {
    switch (language) {
      case 'pt-BR':
        return "pt-BR-YaraNeural";
      case 'en-US':
        return "en-US-CoraNeural";
      case 'it-IT':
        return 'it-IT-PalmiraNeural';
      case 'es-ES':
        return 'es-ES-EstrellaNeural';
      case 'fr-FR':
        return 'fr-FR-YvetteNeural';
      default:
        return "en-US-CoraNeural";
    }
  }
}
