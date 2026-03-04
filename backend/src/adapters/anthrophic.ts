import Anthropic from "@anthropic-ai/sdk";
import {
  AIMessage,
  AIResponse,
  BaseAIAdapter,
} from "../services/ai-provider.service";

export class AnthropicAdapter extends BaseAIAdapter {
  private readonly client: Anthropic;

  constructor(apiKey: string, model: string) {
    super(apiKey, model);
    this.client = new Anthropic({ apiKey });
  }

  async complete(system: string, messages: AIMessage[]): Promise<AIResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      system,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = response.content[0];

    if (content.type !== "text") {
      throw new Error("Unexpected response type from Anthropic");
    }

    return {
      content: content.text,
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}
