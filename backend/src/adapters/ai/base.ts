// ─── Provider Metadata ────────────────────────────────────────────────────────

import type { AIMessage, AIModel, AIProvider, AIResponse } from "./types";

export const PROVIDER_MODELS: Record<AIProvider, AIModel[]> = {
  anthropic: ["claude-sonnet-4-5", "claude-haiku-4-5"],
  openai: ["gpt-4o", "gpt-4o-mini"],
  moonshot: ["moonshot-v1-8k", "moonshot-v1-32k"],
  google: ["gemini-1.5-pro", "gemini-1.5-flash"],
};

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  moonshot: "Moonshot (Kimi)",
  google: "Google Gemini",
};

export const MODEL_LABELS: Record<AIModel, string> = {
  "claude-sonnet-4-5": "Claude Sonnet 4.5",
  "claude-haiku-4-5": "Claude Haiku 4.5",
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o Mini",
  "moonshot-v1-8k": "Moonshot v1 8K",
  "moonshot-v1-32k": "Moonshot v1 32K",
  "gemini-1.5-pro": "Gemini 1.5 Pro",
  "gemini-1.5-flash": "Gemini 1.5 Flash",
};

// ─── Base Adapter ─────────────────────────────────────────────────────────────

export abstract class BaseAIAdapter {
  protected readonly apiKey: string;
  protected readonly model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  abstract complete(system: string, messages: AIMessage[]): Promise<AIResponse>;
}
