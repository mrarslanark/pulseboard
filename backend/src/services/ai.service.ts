import {
  type AIModel,
  type AIProvider,
  type AIProviderConfig,
  AnthropicAdapter,
  GoogleAdapter,
  MoonshotAdapter,
  OpenAIAdapter,
  PROVIDER_MODELS,
} from "../adapters";

class AIService {
  createAdapter(config: AIProviderConfig) {
    switch (config.provider) {
      case "anthropic":
        return new AnthropicAdapter(config.apiKey, config.model);
      case "openai":
        return new OpenAIAdapter(config.apiKey, config.model);
      case "moonshot":
        return new MoonshotAdapter(config.apiKey, config.model);
      case "google":
        return new GoogleAdapter(config.apiKey, config.model);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  isValidProvider(provider: string): provider is AIProvider {
    return Object.keys(PROVIDER_MODELS).includes(provider);
  }

  isValidModel(provider: AIProvider, model: string): model is AIModel {
    return PROVIDER_MODELS[provider].includes(model as AIModel);
  }

  getModelsForProvider(provider: AIProvider): AIModel[] {
    return PROVIDER_MODELS[provider];
  }
}

export const aiService = new AIService();
