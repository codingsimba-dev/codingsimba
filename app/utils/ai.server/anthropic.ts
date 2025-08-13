import Anthropic from "@anthropic-ai/sdk";
import { getErrorMessage } from "../misc";
import {
  ALGORITHM_KEYWORDS,
  ANALYSIS_KEYWORDS,
  CAREER_KEYWORDS,
  COMPLEXITY_INDICATORS,
  DEBUG_KEYWORDS,
  LEARNING_MODE_PROMPTS,
  QUESTION_INDICATORS,
  REVIEW_KEYWORDS,
  SIMPLICITY_INDICATORS,
  SOFTWARE_INDICATORS,
  SYSTEM_DESIGN_KEYWORDS,
  SYSTEM_PROMPTS,
  TUTORIAL_KEYWORDS,
} from "./constants";

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const MODELS = {
  HAIKU: "claude-3-5-haiku-latest",
  SONNET: "claude-3-7-sonnet-latest",
} as const;

export const CONFIG = {
  maxTokens: 4096,
  temperature: 0.7,
  defaultModel: MODELS.HAIKU,
};

export interface BaseMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ConversationContext {
  messages: BaseMessage[];
  model?: keyof typeof MODELS;
  temperature?: number;
  maxTokens?: number;
  systemPrompt: keyof typeof SYSTEM_PROMPTS | string;
}

export interface RAGContext {
  query: string;
  contexts: Array<{
    text: string;
    source: string;
    score: number;
    metadata?: Record<string, unknown>;
  }>;
  userLevel?: "beginner" | "intermediate" | "advanced";
}

export interface AIResponse {
  content: string;
  messageId: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  processingTime: number;
  metadata?: Record<string, unknown>;
}

/**
 * Core Claude API interaction with comprehensive error handling and retries
 */
export async function callClaudeAPI(
  context: ConversationContext,
): Promise<AIResponse> {
  const startTime = Date.now();

  try {
    const model = MODELS[context.model ?? "HAIKU"];

    // Handle both system prompt keys and direct strings
    const systemPrompt =
      typeof context.systemPrompt === "string" &&
      context.systemPrompt in SYSTEM_PROMPTS
        ? SYSTEM_PROMPTS[context.systemPrompt as keyof typeof SYSTEM_PROMPTS]
        : (context.systemPrompt as string);

    const messages = [...context.messages];
    let content = "";
    const stream = anthropicClient.messages
      .stream({
        model,
        max_tokens: context.maxTokens || CONFIG.maxTokens,
        temperature: context.temperature || CONFIG.temperature,
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      })
      .on("text", (text) => {
        content += text;
      });

    const message = await stream.finalMessage();

    return {
      model,
      messageId: message.id,
      content: content.trim(),
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        totalTokens: message.usage.input_tokens + message.usage.output_tokens,
      },
      processingTime: Date.now() - startTime,
    };
  } catch (error: unknown) {
    console.error("Claude API error:", error);
    throw new Error(`Failed to call Claude API: ${getErrorMessage(error)}`);
  }
}

// Type definitions
export type LearningMode = keyof typeof LEARNING_MODE_PROMPTS;
export type ModelType = keyof typeof MODELS;

// Model selection mapping based on learning mode recommendations
const LEARNING_MODE_MODEL_MAP: Record<LearningMode, ModelType> = {
  "system-design": "SONNET",
  "explain-or-design-algorithm": "SONNET",
  "analyze-algorithm": "SONNET",
  "create-tutorial": "SONNET",
  "debug-code": "HAIKU",
  "code-review": "HAIKU",
  "analyse-code": "HAIKU",
  "career-advice": "HAIKU",
  default: "HAIKU",
};

// Temperature settings optimized for each learning mode
export const LEARNING_MODE_TEMPERATURE_MAP: Record<LearningMode, number> = {
  "system-design": 0.4,
  "explain-or-design-algorithm": 0.3,
  "analyze-algorithm": 0.1,
  "create-tutorial": 0.5,
  "debug-code": 0.1,
  "code-review": 0.2,
  "analyse-code": 0.2,
  "career-advice": 0.4,
  default: 0.2,
};

// Helper function to get the appropriate prompt based on learning mode
export function getPromptForLearningMode(mode: LearningMode): string {
  return `${SYSTEM_PROMPTS.SUPERCHARGED_ASSISTANT}

**CURRENT LEARNING MODE: ${mode.toUpperCase().replace("-", " ")}**

${LEARNING_MODE_PROMPTS[mode]}

**RESPONSE REQUIREMENTS FOR THIS MODE:**
- Provide exhaustive detail with microscopic precision
- Include multiple examples and edge cases
- Use visual aids (mermaid diagrams) where helpful
- Explain underlying principles and theory
- Offer practical implementation guidance
- Address common pitfalls and advanced considerations
- Suggest related topics and next learning steps
- Maintain focus on the specific learning mode context`;
}

/**
 * Smart learning mode detection based on user query
 */
export function detectLearningMode(query: string): LearningMode {
  const queryLower = query.toLowerCase();
  if (DEBUG_KEYWORDS.some((keyword) => queryLower.includes(keyword))) {
    return "debug-code";
  }

  if (SYSTEM_DESIGN_KEYWORDS.some((keyword) => queryLower.includes(keyword))) {
    return "system-design";
  }

  if (ALGORITHM_KEYWORDS.some((keyword) => queryLower.includes(keyword))) {
    return "analyze-algorithm";
  }

  if (TUTORIAL_KEYWORDS.some((keyword) => queryLower.includes(keyword))) {
    return "create-tutorial";
  }

  if (REVIEW_KEYWORDS.some((keyword) => queryLower.includes(keyword))) {
    return "code-review";
  }

  if (CAREER_KEYWORDS.some((keyword) => queryLower.includes(keyword))) {
    return "career-advice";
  }

  if (ANALYSIS_KEYWORDS.some((keyword) => queryLower.includes(keyword))) {
    return "analyse-code";
  }
  // Default fallback
  return "default";
}

/**
 * Detect query complexity based on content
 */
export function detectComplexity(query: string): "simple" | "complex" {
  const queryLower = query.toLowerCase();
  if (
    COMPLEXITY_INDICATORS.some((indicator) => queryLower.includes(indicator))
  ) {
    return "complex";
  }

  if (
    SIMPLICITY_INDICATORS.some((indicator) => queryLower.includes(indicator))
  ) {
    return "simple";
  }

  return query.length > 100 ? "complex" : "simple";
}

/**
 * Detect if a query would benefit from web search
 */
export function shouldPerformSearch(
  query: string,
  learningMode: LearningMode,
): boolean {
  const queryLower = query.toLowerCase();

  // Learning modes that often benefit from search
  const searchBeneficialModes: LearningMode[] = [
    "career-advice", // Job market, salary info, industry trends
    "create-tutorial", // Latest examples and best practices
    "system-design", // Current architectural patterns and tools
  ];

  // Don't search for basic algorithmic or debugging questions
  const noSearchModes: LearningMode[] = [
    "debug-code", // Usually about specific code issues
    "analyze-algorithm", // Mathematical analysis doesn't need current info
  ];

  // Skip search for these modes unless explicitly indicated
  if (noSearchModes.includes(learningMode)) {
    return CAREER_KEYWORDS.some((indicator) => queryLower.includes(indicator));
  }

  if (searchBeneficialModes.includes(learningMode)) {
    return true;
  }

  return (
    CAREER_KEYWORDS.some((indicator) => queryLower.includes(indicator)) ||
    QUESTION_INDICATORS.some((indicator) => queryLower.includes(indicator))
  );
}

/**
 * Determine the best search type based on query and learning mode
 */
export function getSearchType(
  query: string,
  learningMode: LearningMode,
): "general" | "software" | "recent" {
  const queryLower = query.toLowerCase();

  if (CAREER_KEYWORDS.some((indicator) => queryLower.includes(indicator))) {
    return "recent";
  }

  const isSoftwareQuery =
    SOFTWARE_INDICATORS.some((indicator) => queryLower.includes(indicator)) ||
    [
      "system-design",
      "analyse-code",
      "create-tutorial",
      "explain-or-design-algorithm",
    ].includes(learningMode);

  return isSoftwareQuery ? "software" : "general";
}

// Context-dependent model selection for career advice
function getCareerAdviceModel(query: string): ModelType {
  const tacticalCareerKeywords = [
    "resume",
    "interview",
    "salary",
    "negotiation",
    "job search",
    "quick advice",
    "should I",
    "how to",
    "what technology",
    "which framework",
  ];

  const queryLower = query.toLowerCase();
  if (CAREER_KEYWORDS.some((keyword) => queryLower.includes(keyword))) {
    return "SONNET";
  }

  if (tacticalCareerKeywords.some((keyword) => queryLower.includes(keyword))) {
    return "HAIKU";
  }

  return "HAIKU";
}

export function selectOptimalModel(
  learningMode: LearningMode,
  query: string,
  complexity?: "simple" | "complex",
): ModelType {
  if (learningMode === "career-advice") {
    return getCareerAdviceModel(query);
  }

  let recommendedModel = LEARNING_MODE_MODEL_MAP[learningMode];

  if (complexity === "complex" && recommendedModel === "HAIKU") {
    if (learningMode === "analyse-code" || learningMode === "debug-code") {
      const queryLower = query.toLowerCase();

      if (
        COMPLEXITY_INDICATORS.some((indicator) =>
          queryLower.includes(indicator),
        )
      ) {
        recommendedModel = "SONNET";
      }
    }
  } else if (complexity === "simple" && recommendedModel === "SONNET") {
    const queryLower = query.toLowerCase();
    if (
      SIMPLICITY_INDICATORS.some((indicator) => queryLower.includes(indicator))
    ) {
      recommendedModel = "HAIKU";
    }
  }

  return recommendedModel;
}

/**
 * Helper function to get quick model recommendation without making API call
 */
export function getModelRecommendation(
  query: string,
  options: {
    learningMode?: LearningMode;
    complexity?: "simple" | "complex";
  } = {},
): {
  learningMode: LearningMode;
  model: ModelType;
  temperature: number;
  reasoning: string;
} {
  const learningMode = options.learningMode || detectLearningMode(query);
  const complexity = options.complexity || detectComplexity(query);
  const model = selectOptimalModel(learningMode, query, complexity);
  const temperature = LEARNING_MODE_TEMPERATURE_MAP[learningMode] || 0.3;

  let reasoning = `Detected mode: ${learningMode}, recommended model: ${model}`;

  if (learningMode === "career-advice") {
    reasoning =
      model === "SONNET"
        ? "Complex career planning detected - using SONNET for comprehensive analysis"
        : "Tactical career question detected - using HAIKU for quick, focused advice";
  } else if (complexity === "complex" && model === "SONNET") {
    reasoning = "Complex query detected - using SONNET for deeper analysis";
  } else if (complexity === "simple" && model === "HAIKU") {
    reasoning = "Simple query detected - using HAIKU for efficient response";
  }

  return { learningMode, model, temperature, reasoning };
}
