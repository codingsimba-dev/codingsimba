import { getErrorMessage } from "../misc";
import {
  callClaudeAPI,
  LEARNING_MODE_TEMPERATURE_MAP,
  selectOptimalModel,
  getPromptForLearningMode,
  type BaseMessage,
  type ConversationContext,
  type LearningMode,
  type RAGContext,
  type StreamingAIResponse,
} from "./anthropic";

import {
  CACHED_SYSTEM_PROMPTS,
  DEBUG_KEYWORDS,
  SYSTEM_DESIGN_KEYWORDS,
  ALGORITHM_KEYWORDS,
  TUTORIAL_KEYWORDS,
  REVIEW_KEYWORDS,
  CAREER_KEYWORDS,
  ANALYSIS_KEYWORDS,
  GENERAL_CHAT_KEYWORDS, // Added missing import
  COMPLEXITY_INDICATORS,
  SIMPLICITY_INDICATORS,
  SOFTWARE_INDICATORS, // Added missing import
} from "./constants";

type UserLevel = "beginner" | "intermediate" | "advanced";

// ==================== ENHANCED QUERY ANALYSIS ====================

/**
 * Enhanced query analysis with detailed pattern recognition
 */
interface EnhancedQueryAnalysis {
  learningMode: LearningMode;
  complexity: "simple" | "complex";
  urgency: "low" | "medium" | "high";
  userLevel: UserLevel;
  techKeywords: string[];
  confidence: number;
  reasoning: string[];
  isGeneralChat: boolean; // Added missing property
}

/**
 * Performs comprehensive query analysis with confidence scoring
 */
function performEnhancedQueryAnalysis(
  userQuery: string,
): EnhancedQueryAnalysis {
  const queryLower = userQuery.toLowerCase();
  const reasoning: string[] = [];
  let confidence = 0.6; // base confidence

  // Check if this is general conversation first
  const generalChatMatches = GENERAL_CHAT_KEYWORDS.filter((keyword) =>
    queryLower.includes(keyword),
  );

  const isGeneralChat =
    generalChatMatches.length > 0 ||
    (!SOFTWARE_INDICATORS.some((indicator) => queryLower.includes(indicator)) &&
      queryLower.length < 50 &&
      !queryLower.includes("code") &&
      !queryLower.includes("debug") &&
      !queryLower.includes("algorithm"));

  if (isGeneralChat) {
    reasoning.push(
      `General conversation: ${generalChatMatches.length > 0 ? "chat keywords detected" : "no technical indicators"}`,
    );
  }

  // Enhanced learning mode detection with confidence scoring
  let learningMode: LearningMode = "default";
  let modeConfidence = 0.5;

  const modeKeywords = {
    "debug-code": DEBUG_KEYWORDS,
    "system-design": SYSTEM_DESIGN_KEYWORDS,
    "analyze-algorithm": ALGORITHM_KEYWORDS,
    "create-tutorial": TUTORIAL_KEYWORDS,
    "code-review": REVIEW_KEYWORDS,
    "career-advice": CAREER_KEYWORDS,
    "analyse-code": ANALYSIS_KEYWORDS,
  };

  for (const [mode, keywords] of Object.entries(modeKeywords)) {
    const matches = keywords.filter((keyword) => queryLower.includes(keyword));
    if (matches.length > 0) {
      const currentConfidence = Math.min(0.95, 0.5 + matches.length * 0.15);
      if (currentConfidence > modeConfidence) {
        learningMode = mode as LearningMode;
        modeConfidence = currentConfidence;
        reasoning.push(`Detected ${mode}: ${matches.length} keyword matches`);
      }
    }
  }

  // Enhanced complexity detection
  const complexityMatches = COMPLEXITY_INDICATORS.filter((indicator) =>
    queryLower.includes(indicator),
  );
  const simplicityMatches = SIMPLICITY_INDICATORS.filter((indicator) =>
    queryLower.includes(indicator),
  );

  let complexity: "simple" | "complex" = "simple";
  if (complexityMatches.length > simplicityMatches.length) {
    complexity = "complex";
    reasoning.push(
      `Complex query: ${complexityMatches.length} complexity indicators`,
    );
  } else if (userQuery.length > 100) {
    complexity = "complex";
    reasoning.push("Complex query: length > 100 characters");
  }

  // Enhanced urgency detection
  const urgencyKeywords = [
    "urgent",
    "quickly",
    "asap",
    "emergency",
    "critical",
    "immediate",
    "fast",
    "now",
  ];
  const urgencyMatches = urgencyKeywords.filter((keyword) =>
    queryLower.includes(keyword),
  );

  let urgency: "low" | "medium" | "high" = "medium";
  if (urgencyMatches.length > 0) {
    urgency = "high";
    reasoning.push(`High urgency: ${urgencyMatches.length} urgency indicators`);
  } else if (
    queryLower.includes("when you have time") ||
    queryLower.includes("eventually")
  ) {
    urgency = "low";
    reasoning.push("Low urgency: relaxed timing indicators");
  }

  // Enhanced user level detection
  const beginnerIndicators = [
    "beginner",
    "new to",
    "just started",
    "learning",
    "basic",
    "simple",
    "help me understand",
    "what is",
    "explain like",
  ];
  const advancedIndicators = [
    "advanced",
    "expert",
    "complex",
    "optimize",
    "performance",
    "architecture",
    "scalable",
    "production",
    "enterprise",
  ];

  const beginnerMatches = beginnerIndicators.filter((indicator) =>
    queryLower.includes(indicator),
  );
  const advancedMatches = advancedIndicators.filter((indicator) =>
    queryLower.includes(indicator),
  );

  let userLevel: UserLevel = "intermediate";
  if (beginnerMatches.length > 0) {
    userLevel = "beginner";
    reasoning.push(
      `Beginner level: ${beginnerMatches.length} beginner indicators`,
    );
  } else if (advancedMatches.length > 0) {
    userLevel = "advanced";
    reasoning.push(
      `Advanced level: ${advancedMatches.length} advanced indicators`,
    );
  }

  // Extract technical keywords
  const techTerms = [
    "javascript",
    "typescript",
    "python",
    "java",
    "react",
    "vue",
    "angular",
    "node",
    "express",
    "mongodb",
    "postgres",
    "mysql",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "redis",
    "graphql",
    "rest",
    "api",
    "microservices",
  ];
  const techKeywords = techTerms.filter((term) => queryLower.includes(term));

  // Calculate overall confidence
  confidence =
    (modeConfidence +
      (techKeywords.length > 0 ? 0.8 : 0.6) +
      reasoning.length * 0.1) /
    3;
  confidence = Math.min(0.95, Math.max(0.3, confidence));

  return {
    learningMode,
    complexity,
    urgency,
    userLevel,
    techKeywords,
    confidence: Math.round(confidence * 100) / 100,
    reasoning,
    isGeneralChat, // Added missing property
  };
}

/**
 * Enhanced query enhancement with detailed instructions
 */
function enhanceQueryWithDetailedInstructions(
  userQuery: string,
  analysis: EnhancedQueryAnalysis,
): string {
  let enhancedQuery = userQuery.trim();

  // Add learning mode context
  if (analysis.learningMode !== "default") {
    enhancedQuery += `\n\n**LEARNING MODE**: ${analysis.learningMode.toUpperCase().replace("-", " ")}`;
    enhancedQuery += `\nPlease respond according to the ${analysis.learningMode} learning mode guidelines.`;

    // Mode-specific instructions
    switch (analysis.learningMode) {
      case "debug-code":
        enhancedQuery +=
          "\nFocus on systematic debugging approach, error analysis, and solution steps with code examples.";
        if (analysis.urgency === "high") {
          enhancedQuery +=
            "\nPrioritize immediate debugging steps and quick resolution paths.";
        }
        break;
      case "system-design":
        enhancedQuery +=
          "\nProvide architectural insights, design patterns, scalability considerations, and trade-offs.";
        if (analysis.urgency === "high") {
          enhancedQuery +=
            "\nPrioritize critical architectural decisions and MVP considerations.";
        }
        break;
      case "analyze-algorithm":
        enhancedQuery +=
          "\nInclude complexity analysis, multiple approaches, optimization strategies, and implementation details.";
        break;
      case "create-tutorial":
        enhancedQuery +=
          "\nProvide comprehensive step-by-step explanations with examples and progressive complexity.";
        break;
      case "code-review":
        enhancedQuery +=
          "\nAnalyze code quality, best practices, potential issues, and improvement suggestions.";
        break;
      case "career-advice":
        enhancedQuery +=
          "\nProvide practical career guidance with industry insights and actionable recommendations.";
        break;
    }
  }

  // Add user context
  enhancedQuery += `\n\n**USER CONTEXT**:`;
  enhancedQuery += `\n- Skill Level: ${analysis.userLevel}`;
  enhancedQuery += `\n- Complexity: ${analysis.complexity}`;
  enhancedQuery += `\n- Response Style: ${analysis.urgency === "high" ? "concise and actionable" : "detailed and comprehensive"}`;

  if (analysis.techKeywords.length > 0) {
    enhancedQuery += `\n- Detected Technologies: ${analysis.techKeywords.join(", ")}`;
  }

  // Add response format instructions
  enhancedQuery += `\n\n**RESPONSE FORMAT**:`;

  if (analysis.urgency === "high") {
    enhancedQuery += `\n- Prioritize immediate, actionable solutions`;
    enhancedQuery += `\n- Keep explanations focused and direct`;
    enhancedQuery += `\n- Include essential code examples only`;
  } else {
    enhancedQuery += `\n- Provide comprehensive explanations with context`;
    enhancedQuery += `\n- Include multiple practical examples`;
    enhancedQuery += `\n- Explain reasoning behind recommendations`;
  }

  if (analysis.userLevel === "beginner") {
    enhancedQuery += `\n- Explain technical terms and concepts clearly`;
    enhancedQuery += `\n- Include fundamental background information`;
    enhancedQuery += `\n- Use simple, clear examples`;
  } else if (analysis.userLevel === "advanced") {
    enhancedQuery += `\n- Assume familiarity with advanced concepts`;
    enhancedQuery += `\n- Focus on optimization and best practices`;
    enhancedQuery += `\n- Include edge cases and performance considerations`;
  }

  if (analysis.complexity === "complex") {
    enhancedQuery += `\n- Break down complex topics into logical sections`;
    enhancedQuery += `\n- Use diagrams or structured explanations where helpful`;
    enhancedQuery += `\n- Address multiple aspects and considerations`;
  }

  return enhancedQuery;
}

// ==================== ENHANCED RAG ASSISTANT ====================

/**
 * RAG-powered learning assistant with enhanced query processing
 */
export async function askRAGAssistant(
  userQuery: string,
  messages: RAGContext["messages"],
  contexts: RAGContext["contexts"] = [],
  options: {
    userLevel?: UserLevel;
  } = {},
): Promise<StreamingAIResponse> {
  try {
    // Perform enhanced analysis instead of simple detection
    const analysis = performEnhancedQueryAnalysis(userQuery);
    const userLevel = options.userLevel ?? analysis.userLevel;

    const { enhancedQuery, contextCount } = enhanceRagUserQueryAdvanced(
      userQuery,
      contexts,
      userLevel,
      analysis,
    );

    console.log(`[RAG-ENHANCEMENT] Analysis:`, {
      mode: analysis.learningMode,
      complexity: analysis.complexity,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      isGeneralChat: analysis.isGeneralChat,
    });

    const conversationContext: ConversationContext = {
      messages: [...messages, { role: "user", content: enhancedQuery }],
      systemPrompt: analysis.isGeneralChat ? "GENERAL_CHAT" : "RAG_ASSISTANT",
      model:
        contextCount > 3 || analysis.complexity === "complex"
          ? "SONNET"
          : "HAIKU",
      temperature: analysis.isGeneralChat ? 0.7 : 0.3,
      userLevel,
      contextCount,
      queryType: "rag",
    };

    const response = await callClaudeAPI(conversationContext);
    return response as StreamingAIResponse;
  } catch (error) {
    console.error("Enhanced RAG Assistant error:", error);
    throw new Error(`RAG Assistant failed: ${getErrorMessage(error)}`);
  }
}

function enhanceRagUserQueryAdvanced(
  userQuery: string,
  contexts: RAGContext["contexts"],
  userLevel: UserLevel,
  analysis: EnhancedQueryAnalysis,
) {
  // Start with enhanced query
  let enhancedQuery = enhanceQueryWithDetailedInstructions(userQuery, analysis);

  let contextCount = 0;
  if (contexts.length) {
    contextCount = contexts.length;
    const contextSection = contexts
      .map((ctx) => `<web_source_url>${ctx}</web_source_url>`)
      .join("\n\n");

    enhancedQuery += `\n\n**CONTEXT INTEGRATION**:`;
    enhancedQuery += `\nRelevant context from ${contextCount} sources:`;
    enhancedQuery += `\n${contextSection}`;
    enhancedQuery += `\n\nPlease provide a comprehensive answer using the provided context.`;
    enhancedQuery += `\nClearly distinguish between context-based and general knowledge information.`;
    enhancedQuery += `\nCite sources when referencing specific context information.`;
  }

  // Add user level specific instructions (adjusted for general chat)
  if (userLevel) {
    if (analysis.isGeneralChat) {
      enhancedQuery += `\n\nUSER PREFERENCE: ${userLevel.toUpperCase()} EXPLANATIONS`;
      switch (userLevel) {
        case "beginner":
          enhancedQuery += `\n- Use clear, simple language and provide helpful background`;
          enhancedQuery += `\n- Explain any technical terms that come up naturally`;
          break;
        case "advanced":
          enhancedQuery += `\n- Can include nuanced perspectives and sophisticated insights`;
          enhancedQuery += `\n- Comfortable with complex topics and detailed discussions`;
          break;
        default:
          enhancedQuery += `\n- Balance accessibility with depth in explanations`;
          break;
      }
    } else {
      enhancedQuery += `\n\nUSER EXPERTISE: ${userLevel.toUpperCase()}`;
      switch (userLevel) {
        case "beginner":
          enhancedQuery += `\n- Provide step-by-step explanations with clear definitions`;
          enhancedQuery += `\n- Include background context and fundamental concepts`;
          enhancedQuery += `\n- Use analogies and simple examples`;
          break;
        case "advanced":
          enhancedQuery += `\n- Focus on advanced concepts and optimization techniques`;
          enhancedQuery += `\n- Include performance considerations and edge cases`;
          enhancedQuery += `\n- Assume familiarity with standard practices`;
          break;
        default:
          enhancedQuery += `\n- Balance practical examples with conceptual explanations`;
          enhancedQuery += `\n- Include both basic and intermediate level insights`;
          break;
      }
    }
  }

  return { enhancedQuery, contextCount };
}

// ==================== ENHANCED AI ASSISTANT ====================

/**
 * Smart AI assistant with enhanced query processing and streaming support
 */
export async function askAIAssistant(
  userQuery: string,
  conversation: BaseMessage[],
  options: {
    learningMode?: LearningMode;
    complexity?: "simple" | "complex";
    urgency?: "low" | "medium" | "high";
    enableThinking?: boolean;
  } = {},
): Promise<StreamingAIResponse> {
  try {
    // Perform enhanced analysis
    const analysis = performEnhancedQueryAnalysis(userQuery);

    // Use provided options or fall back to analysis
    const finalLearningMode = options.learningMode ?? analysis.learningMode;
    const finalComplexity = options.complexity ?? analysis.complexity;
    const finalUrgency = options.urgency ?? analysis.urgency;

    // Enhanced query processing
    const enhancedQuery = enhanceQueryWithDetailedInstructions(userQuery, {
      ...analysis,
      learningMode: finalLearningMode,
      complexity: finalComplexity,
      urgency: finalUrgency,
    });

    // For general chat, always use HAIKU and appropriate temperature
    const selectedModel = analysis.isGeneralChat
      ? "HAIKU"
      : selectOptimalModel(finalLearningMode, userQuery, finalComplexity);
    const temperature = analysis.isGeneralChat
      ? 0.7
      : (LEARNING_MODE_TEMPERATURE_MAP[finalLearningMode] ?? 0.3);

    const systemPrompt = analysis.isGeneralChat
      ? CACHED_SYSTEM_PROMPTS.GENERAL_CHAT
      : finalLearningMode === "default"
        ? CACHED_SYSTEM_PROMPTS.SUPERCHARGED_ASSISTANT
        : getPromptForLearningMode(finalLearningMode);

    const messages = [
      ...conversation,
      {
        role: "user" as const,
        content: [
          {
            type: "text" as const,
            text: enhancedQuery,
          },
        ],
      },
    ];

    console.log(`[AI-ENHANCEMENT] Analysis:`, {
      detected: analysis.learningMode,
      final: finalLearningMode,
      model: selectedModel,
      confidence: analysis.confidence,
      isGeneralChat: analysis.isGeneralChat,
      reasoning: analysis.reasoning.slice(0, 3), // First 3 reasons
    });

    const conversationContext: ConversationContext = {
      messages,
      systemPrompt: systemPrompt,
      model: selectedModel,
      learningMode: finalLearningMode,
      temperature,
      urgency: finalUrgency,
      complexity: finalComplexity,
    };

    const response = await callClaudeAPI(
      conversationContext,
      // Disable thinking for general chat unless explicitly requested
      analysis.isGeneralChat ? false : options.enableThinking,
    );

    const streamingResponse = response as StreamingAIResponse;
    streamingResponse.metadata = {
      ...streamingResponse.metadata,
      analysis: {
        detectedMode: analysis.learningMode,
        finalMode: finalLearningMode,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        techKeywords: analysis.techKeywords,
        isGeneralChat: analysis.isGeneralChat,
      },
      selectedModel,
      temperature,
      complexity: finalComplexity,
      urgency: finalUrgency,
    };

    return streamingResponse;
  } catch (error) {
    console.error(`Enhanced AI Assistant error:`, error);
    throw new Error(`AI Assistant failed: ${getErrorMessage(error)}`);
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Gets enhancement metadata for debugging/monitoring
 */
export function getEnhancementMetadata(userQuery: string): {
  analysis: EnhancedQueryAnalysis;
  recommendations: {
    model: string;
    temperature: number;
    systemPrompt: string;
  };
} {
  const analysis = performEnhancedQueryAnalysis(userQuery);

  let model: string;
  let temperature: number;
  let systemPrompt: string;

  if (analysis.isGeneralChat) {
    model = "HAIKU";
    temperature = 0.7;
    systemPrompt = "GENERAL_CHAT";
  } else {
    model = selectOptimalModel(
      analysis.learningMode,
      userQuery,
      analysis.complexity,
    );
    temperature = LEARNING_MODE_TEMPERATURE_MAP[analysis.learningMode] ?? 0.3;
    systemPrompt =
      analysis.learningMode === "default"
        ? "SUPERCHARGED_ASSISTANT"
        : analysis.learningMode.toUpperCase().replace("-", "_");
  }

  return {
    analysis,
    recommendations: {
      model,
      temperature,
      systemPrompt,
    },
  };
}

/**
 * Validates query enhancement parameters
 */
export function validateEnhancementInput(
  userQuery: string,
  options: Record<string, string | undefined> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { isValid: boolean; errors: string[]; sanitized: any } {
  const errors: string[] = [];
  const sanitized = { ...options };

  if (
    !userQuery ||
    typeof userQuery !== "string" ||
    userQuery.trim().length === 0
  ) {
    errors.push("User query is required and must be a non-empty string");
  }

  if (
    options.learningMode &&
    !Object.keys(LEARNING_MODE_TEMPERATURE_MAP).includes(options.learningMode)
  ) {
    errors.push(`Invalid learning mode: ${options.learningMode}`);
    sanitized.learningMode = "default";
  }

  if (
    options.complexity &&
    !["simple", "complex"].includes(options.complexity)
  ) {
    errors.push(`Invalid complexity: ${options.complexity}`);
    sanitized.complexity = "simple";
  }

  if (options.urgency && !["low", "medium", "high"].includes(options.urgency)) {
    errors.push(`Invalid urgency: ${options.urgency}`);
    sanitized.urgency = "medium";
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
}

/**
 * Determines if a query should be treated as general conversation
 */
export function isGeneralConversation(userQuery: string): boolean {
  const analysis = performEnhancedQueryAnalysis(userQuery);
  return analysis.isGeneralChat;
}

/**
 * Gets the appropriate system prompt for any query
 */
export function getAppropriateSystemPrompt(userQuery: string): string {
  const analysis = performEnhancedQueryAnalysis(userQuery);

  if (analysis.isGeneralChat) {
    return CACHED_SYSTEM_PROMPTS.GENERAL_CHAT;
  }

  if (analysis.learningMode === "default") {
    return CACHED_SYSTEM_PROMPTS.SUPERCHARGED_ASSISTANT;
  }

  return getPromptForLearningMode(analysis.learningMode);
}
