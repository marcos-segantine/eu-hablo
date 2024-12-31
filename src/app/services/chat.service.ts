import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  async getResponse(userText: string) {
    const baseUrl = "https://euhablo-chat.azurewebsites.net/api/EuHabloChart?";

    const url = `${baseUrl}text=${encodeURIComponent(userText)}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return await response.text();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error calling Azure Function:", error);
      return null;
    }
  }
}
