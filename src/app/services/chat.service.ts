import { Injectable } from '@angular/core';

import OpenAI from "openai";

import { environment } from "../config/enviroment"

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private openai = new OpenAI({
    apiKey: environment.openAiKey,
    dangerouslyAllowBrowser: true
  });

  constructor() { }

  async getResponse(userText: string) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        { role: "system", content: "You are a AI that help people to learn a new language." },
        { role: "system", content: "Be extremely concise. Answer directly, briefly and objectively, using as few words as possible." },
        {
          role: "user",
          content: userText,
        },
      ],
    });

    return response.choices[0].message;
  }
}
