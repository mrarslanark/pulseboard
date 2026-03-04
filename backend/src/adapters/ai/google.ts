import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseAIAdapter } from "./base";
import type { AIMessage, AIResponse } from "./types";

export class GoogleAdapter extends BaseAIAdapter {
  private readonly client: GoogleGenerativeAI;

  constructor(apiKey: string, model: string) {
    super(apiKey, model);
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async complete(system: string, messages: AIMessage[]): Promise<AIResponse> {
    const generativeModel = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: system,
    });

    const chat = generativeModel.startChat({
      history: messages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;

    return {
      content: response.text(),
      model: this.model,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
      },
    };
  }
}
