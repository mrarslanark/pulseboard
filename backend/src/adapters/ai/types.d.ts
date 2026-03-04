export type AIProvider = "anthropic" | "openai" | "moonshot" | "google";

export type AIModel =
  | "claude-sonnet-4-5"
  | "claude-haiku-4-5"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "moonshot-v1-8k"
  | "moonshot-v1-32k"
  | "gemini-1.5-pro"
  | "gemini-1.5-flash";

export type AIProviderConfig = {
  provider: AIProvider;
  model: AIModel;
  apiKey: string;
};

export type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AIResponse = {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
};
