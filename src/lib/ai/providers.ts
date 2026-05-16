import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { LLMProvider } from "@/lib/types";
import type { LanguageModel } from "ai";

export function buildModel(provider: LLMProvider, modelId: string, apiKey: string): LanguageModel {
  switch (provider) {
    case "gemini": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(modelId, { useSearchGrounding: true });
    }
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai(modelId);
    }
    case "groq": {
      const groq = createGroq({ apiKey });
      return groq(modelId);
    }
    case "perplexity": {
      const perplexity = createOpenAI({
        apiKey,
        baseURL: "https://api.perplexity.ai",
        compatibility: "compatible",
      });
      return perplexity(modelId);
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
