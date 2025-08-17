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
  REVIEW_KEYWORDS,
  SIMPLICITY_INDICATORS,
  SYSTEM_DESIGN_KEYWORDS,
  CACHED_SYSTEM_PROMPTS,
  TUTORIAL_KEYWORDS,
  GENERAL_CHAT_KEYWORDS,
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

interface TextContentBlock {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
}

interface ImageContentBlock {
  type: "image";
  source: {
    type: "base64";
    media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    data: string;
  };
  cache_control?: { type: "ephemeral" };
}

type ContentBlock = TextContentBlock | ImageContentBlock;

export interface UserMessage {
  role: "user";
  content: string | ContentBlock[];
}

export interface AssistantMessage {
  role: "assistant";
  content: string | ContentBlock[];
}

export type BaseMessage = UserMessage | AssistantMessage;

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
}

export interface RAGContext {
  query: string;
  messages: BaseMessage[];
  contexts: string[];
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
  // Never enable thinking for general chat
  if (learningMode === "general-chat") return false;

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
        userQuery: context.messages[0]?.content as string,
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
          type: "enabled" as const,
          budget_tokens: 10_000,
        },
      }),
      system: [
        { type: "text" as const, text: BASE_SYSTEM_PROMPT },
        {
          type: "text" as const,
          text: systemPrompt,
          cache_control: { type: "ephemeral" as const },
        },
      ],
      messages: messages.map((msg): Anthropic.Messages.MessageParam => {
        if (msg.role === "user") {
          if (typeof msg.content === "string") {
            return {
              role: "user",
              content: msg.content,
            };
          } else {
            return {
              role: "user",
              content: msg.content,
            };
          }
        } else {
          if (typeof msg.content === "string") {
            return {
              role: "assistant",
              content: [
                {
                  type: "text" as const,
                  text: msg.content,
                  cache_control: { type: "ephemeral" as const },
                },
              ],
            };
          } else {
            return {
              role: "assistant",
              content: msg.content.map((block) => ({
                ...block,
                cache_control: { type: "ephemeral" as const },
              })),
            };
          }
        }
      }),
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
    });

    const readableStream = new ReadableStream<string>({
      async start(controller) {
        for await (const event of stream) {
          switch (event.type) {
            case "message_start":
              {
                controller.enqueue(
                  JSON.stringify({
                    type: "message_start",
                    data: {
                      messageId: event.message.id,
                      model: event.message.model,
                    },
                  }),
                );
              }
              break;

            case "content_block_start":
              if (event.content_block.type === "thinking") {
                controller.enqueue(
                  JSON.stringify({
                    type: event.content_block.type,
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
                const inputTokens = event.usage.input_tokens ?? 0;
                const outputTokens = event.usage.output_tokens;
                const cacheCreationInputTokens =
                  event.usage.cache_creation_input_tokens ?? 0;
                const cacheReadInputTokens =
                  event.usage.cache_read_input_tokens ?? 0;
                const totalTokens =
                  inputTokens +
                  outputTokens +
                  cacheCreationInputTokens +
                  cacheReadInputTokens;
                controller.enqueue(
                  JSON.stringify({
                    type: event.type,
                    data: event.delta, // {stop_reason, stop_sequence}
                    metadata: {
                      inputTokens,
                      outputTokens,
                      cacheCreationInputTokens,
                      cacheReadInputTokens,
                      totalTokens,
                      learningMode: context.learningMode,
                      userLevel: context.userLevel,
                      urgency: context.urgency,
                      complexity: context.complexity,
                    },
                  }),
                );
              }
              break;

            case "message_stop":
              // maybe something
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
      },
    };
  } catch (error: unknown) {
    console.error("Claude API error:", error);
    throw new Error(`Failed to call Claude API: ${getErrorMessage(error)}`);
  }
}

/**
 * Model selection mapping based on learning mode recommendations
 * Updated to include general-chat
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
  "general-chat": "HAIKU", // Always use HAIKU for general conversation
  default: "HAIKU",
};

/**
 * Temperature settings optimized for each learning mode
 * Updated to include general-chat
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
  "general-chat": 0.7, // Higher temperature for more natural conversation
  default: 0.2,
};

/**
 * Gets the appropriate prompt for a given learning mode.
 * @param mode The learning mode to get the prompt for.
 * @returns The prompt for the specified learning mode.
 */
export function getPromptForLearningMode(mode: LearningMode): string {
  // For general chat, return the prompt directly
  if (mode === "general-chat") {
    return CACHED_SYSTEM_PROMPTS.GENERAL_CHAT;
  }

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
 * Updated to include general-chat detection
 * @param query The user query to analyze.
 * @returns The detected learning mode.
 */
export function detectLearningMode(query: string): LearningMode {
  const queryLower = query.toLowerCase();

  // Check for general conversation indicators first
  const generalChatMatches = GENERAL_CHAT_KEYWORDS.filter((keyword) =>
    queryLower.includes(keyword),
  );

  // Check for technical indicators
  const techIndicators = [
    "code",
    "programming",
    "function",
    "variable",
    "class",
    "method",
    "algorithm",
    "database",
    "server",
    "api",
    "framework",
    "library",
  ];
  const techMatches = techIndicators.filter((indicator) =>
    queryLower.includes(indicator),
  );

  // If there are general chat indicators and no tech indicators, it's general chat
  if (generalChatMatches.length > 0 && techMatches.length === 0) {
    return "general-chat";
  }

  // Otherwise, check for specific technical modes
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
  // General chat always uses HAIKU
  if (learningMode === "general-chat") {
    return "HAIKU";
  }

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
