import Anthropic from "@anthropic-ai/sdk";
import { getErrorMessage } from "../misc";
import {
  ALGORITHM_KEYWORDS,
  ANALYSIS_KEYWORDS,
  BASE_SYSTEM_PROMPT,
  CAREER_KEYWORDS,
  COMPLEXITY_INDICATORS,
  DEBUG_KEYWORDS,
  LEARNING_MODE_PROMPTS,
  QUESTION_INDICATORS,
  REVIEW_KEYWORDS,
  SIMPLICITY_INDICATORS,
  SOFTWARE_INDICATORS,
  SYSTEM_DESIGN_KEYWORDS,
  CACHED_SYSTEM_PROMPTS,
  TUTORIAL_KEYWORDS,
} from "./constants";

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const MODELS = {
  HAIKU: "claude-3-5-haiku-latest",
  SONNET: "claude-sonnet-4-20250514",
} as const;

export type LearningMode = keyof typeof LEARNING_MODE_PROMPTS;
export type ModelType = keyof typeof MODELS;

export interface BaseMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ConversationContext {
  messages: BaseMessage[];
  systemPrompt: string;
  thinking?: boolean;
  learningMode?: string;
  model?: keyof typeof MODELS;
  temperature?: number;
  userLevel?: "beginner" | "intermediate" | "advanced";
  contextCount?: number;
  queryType?: string;
  urgency?: "low" | "medium" | "high";
  complexity?: "simple" | "complex";
  searchPerformed?: boolean;
  searchType?: string;
  searchResultCount?: number;
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

export interface StreamingAIResponse {
  stream: ReadableStream<string>;
  messageId: string;
  model: string;
  metadata?: Record<string, unknown>;
}

/**
 * Determines if "thinking" should be enabled for a request.
 */
export function shouldEnableThinking({
  learningMode,
  complexity,
  userQuery,
}: {
  learningMode?: string;
  complexity?: "simple" | "complex";
  userQuery?: string;
}): boolean {
  const thinkingModes: string[] = [
    "system-design",
    "explain-or-design-algorithm",
    "analyze-algorithm",
    "code-review",
  ];

  if (learningMode && thinkingModes.includes(learningMode)) return true;
  if (complexity === "complex") return true;

  const reasoningTriggers = [
    "show your reasoning",
    "think step by step",
    "explain your steps",
    "explain why",
    "how did you get this",
  ];
  const queryLower = (userQuery || "").toLowerCase();
  if (reasoningTriggers.some((t) => queryLower.includes(t))) return true;

  return false;
}

/**
 * Core Claude API interaction with streaming support
 */
export async function callClaudeAPI(
  context: ConversationContext,
  enableThinking?: boolean,
): Promise<StreamingAIResponse> {
  const config = {
    haikuMaxTokens: 4_096,
    sonnetMaxTokens: 16_000,
    temperature: 0.7,
    defaultModel: MODELS.HAIKU,
  };

  try {
    const thinkingEnabled =
      enableThinking ??
      shouldEnableThinking({
        learningMode: context.learningMode,
        complexity: context.complexity,
        userQuery: context.messages[0]?.content,
      });

    const model =
      thinkingEnabled || context.model === "SONNET"
        ? MODELS["SONNET"]
        : MODELS[context.model ?? "HAIKU"];

    const systemPrompt =
      typeof context.systemPrompt === "string" &&
      context.systemPrompt in CACHED_SYSTEM_PROMPTS
        ? CACHED_SYSTEM_PROMPTS[
            context.systemPrompt as keyof typeof CACHED_SYSTEM_PROMPTS
          ]
        : (context.systemPrompt as string);

    const maxTokens =
      thinkingEnabled && model === MODELS["SONNET"]
        ? config.sonnetMaxTokens
        : config.haikuMaxTokens;

    const messages = [...context.messages];

    const stream = anthropicClient.messages.stream({
      model,
      max_tokens: maxTokens,
      temperature: context.temperature ?? config.temperature,
      ...(thinkingEnabled && {
        thinking: {
          type: "enabled",
          budget_tokens: 10_000,
        },
      }),
      system: [
        { type: "text", text: BASE_SYSTEM_PROMPT },
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
    });
    let inputTokens: number;
    let outputTokens: number;
    let totalTokens: number;
    let cacheCreationInputTokens: number | null = null;
    let cacheReadInputTokens: number | null = null;
    const readableStream = new ReadableStream<string>({
      async start(controller) {
        for await (const event of stream) {
          switch (event.type) {
            case "message_start":
              {
                inputTokens = event.message.usage.input_tokens;
                outputTokens = event.message.usage.output_tokens;
                cacheCreationInputTokens =
                  event.message.usage.cache_creation_input_tokens ?? 0;
                cacheReadInputTokens =
                  event.message.usage.cache_read_input_tokens ?? 0;
                totalTokens =
                  inputTokens +
                  outputTokens +
                  cacheCreationInputTokens +
                  cacheReadInputTokens;
                controller.enqueue(
                  JSON.stringify({
                    type: "message_start",
                    data: {
                      messageId: event.message.id,
                      model: event.message.model,
                      metadata: {
                        inputTokens,
                        outputTokens,
                        cacheCreationInputTokens,
                        cacheReadInputTokens,
                        totalTokens,
                        learningMode: context.learningMode,
                        userLevel: context.userLevel,
                        contextCount: context.contextCount,
                        queryType: context.queryType,
                        urgency: context.urgency,
                        complexity: context.complexity,
                        searchPerformed: context.searchPerformed,
                        searchType: context.searchType,
                        searchResultCount: context.searchResultCount,
                      },
                    },
                  }),
                );
              }
              break;

            case "content_block_start":
              if (event.content_block.type === "thinking") {
                controller.enqueue(
                  JSON.stringify({
                    type: "thinking",
                    data: "",
                  }),
                );
              }
              break;

            case "content_block_delta":
              if (event.delta.type === "thinking_delta") {
                controller.enqueue(
                  JSON.stringify({
                    type: event.delta.type,
                    data: event.delta.thinking,
                  }),
                );
              }
              if (event.delta.type === "signature_delta") {
                controller.enqueue(
                  JSON.stringify({
                    type: event.delta.type,
                    data: event.delta.signature,
                  }),
                );
              }

              if (event.delta.type === "text_delta") {
                controller.enqueue(
                  JSON.stringify({
                    type: event.delta.type,
                    data: event.delta.text,
                  }),
                );
              }
              break;

            case "message_delta":
              {
                inputTokens += event.usage.input_tokens ?? 0;
                outputTokens += event.usage.output_tokens;
                controller.enqueue(
                  JSON.stringify({
                    type: event.type,
                    data: event.delta, // {stop_reason, stop_sequence}
                    metadata: {},
                  }),
                );
              }
              break;

            case "message_stop":
              controller.close();
              break;

            default:
              break;
          }
        }
        controller.close();
      },
    });

    return {
      stream: readableStream,
      messageId: `streaming-${Date.now()}`,
      model,
      metadata: {
        learningMode: context.learningMode,
        userLevel: context.userLevel,
        contextCount: context.contextCount,
        queryType: context.queryType,
        urgency: context.urgency,
        complexity: context.complexity,
        searchPerformed: context.searchPerformed,
        searchType: context.searchType,
        searchResultCount: context.searchResultCount,
      },
    };
  } catch (error: unknown) {
    console.error("Claude API error:", error);
    throw new Error(`Failed to call Claude API: ${getErrorMessage(error)}`);
  }
}

/**
 * Model selection mapping based on learning mode recommendations
 */
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

/**
 * Temperature settings optimized for each learning mode
 */
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

/**
 * Gets the appropriate prompt for a given learning mode.
 * @param mode The learning mode to get the prompt for.
 * @returns The prompt for the specified learning mode.
 */
export function getPromptForLearningMode(mode: LearningMode): string {
  return `${CACHED_SYSTEM_PROMPTS.SUPERCHARGED_ASSISTANT}

**CURRENT LEARNING MODE: ${mode.toUpperCase().replace("-", " ")}**

${LEARNING_MODE_PROMPTS[mode]}
**RESPONSE REQUIREMENTS FOR THIS MODE:**
- Provide exhaustive detail with microscopic precision
- Include multiple examples and edge cases
- Use visual aids (mermaid diagrams) where helpful
- Use mathematical notation for complex concepts where applicable
- Explain underlying principles and theory
- Offer practical implementation guidance where necessary
- Address common pitfalls and advanced considerations
- Suggest related topics and next learning steps
- Maintain focus on the specific learning mode context
- Make sure you handle accurately non-coding queries and requests`;
}

/**
 * Smart learning mode detection based on user query
 * @param query The user query to analyze.
 * @returns The detected learning mode.
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
 * Detects the complexity of a user query.
 * @param query The user query to analyze.
 * @returns The detected complexity level.
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
 * Determines if a query should trigger a web search.
 * @param query The user query to analyze.
 * @param learningMode The current learning mode.
 * @returns True if a search should be performed, false otherwise.
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
 * Determines the best search type based on query and learning mode.
 * @param query The user query to analyze.
 * @param learningMode The current learning mode.
 * @returns The recommended search type.
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

/**
 * Gets the appropriate model for a career advice query.
 * @param query The user query to analyze.
 * @returns The recommended model type.
 */
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

/**
 * Selects the optimal model for a given query and learning mode.
 * @param learningMode The current learning mode.
 * @param query The user query to analyze.
 * @param complexity The detected complexity level.
 * @returns The selected model type.
 */
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
 * Gets a model recommendation based on the query and options.
 * @param query The user query to analyze.
 * @param options The options for model selection.
 * @returns The recommended model and its parameters.
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
  const learningMode = options.learningMode ?? detectLearningMode(query);
  const complexity = options.complexity ?? detectComplexity(query);
  const model = selectOptimalModel(learningMode, query, complexity);
  const temperature = LEARNING_MODE_TEMPERATURE_MAP[learningMode] ?? 0.3;

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
