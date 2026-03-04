import OpenAI from "openai";
import { BaseAIAdapter } from "./base";
import type { AIMessage, AIResponse } from "./types";

// Moonshot is OpenAI-compatible
// Using OpenAI SDK with custom baseURL
export class MoonshotAdapter extends BaseAIAdapter {
  private readonly client: OpenAI;

  constructor(apiKey: string, model: string) {
    super(apiKey, model);
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://api.moonshot.cn/v1",
    });
  }

  async complete(system: string, messages: AIMessage[]): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: 2048,
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error("Empty response from Moonshot");
    }

    return {
      content,
      model: response.model,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  }
}
