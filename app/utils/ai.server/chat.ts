import { getErrorMessage } from "../misc";
import {
  searchWeb,
  searchSoftwareEngineering,
  searchRecentTech,
  type SearchAnalytics,
  type EnhancedSearchResult,
} from "./search";
import {
  callClaudeAPI,
  detectComplexity,
  detectLearningMode,
  getSearchType,
  LEARNING_MODE_TEMPERATURE_MAP,
  selectOptimalModel,
  shouldPerformSearch,
  getPromptForLearningMode,
  type BaseMessage,
  type ConversationContext,
  type LearningMode,
  type RAGContext,
  type StreamingAIResponse,
} from "./anthropic";

import { CACHED_SYSTEM_PROMPTS } from "./constants";

/**
 * RAG-powered learning assistant with streaming support
 */
export async function askRAGAssistant(
  userQuery: string,
  contexts: RAGContext["contexts"] = [],
  options: {
    userLevel?: "beginner" | "intermediate" | "advanced";
    autoDetectLevel?: boolean;
    streaming?: boolean;
  } = {},
): Promise<StreamingAIResponse> {
  try {
    // Auto-detect user level if enabled and not specified
    let userLevel = options.userLevel;
    if (options.autoDetectLevel && !userLevel) {
      const queryLower = userQuery.toLowerCase();
      if (
        queryLower.includes("beginner") ||
        queryLower.includes("new to") ||
        queryLower.includes("just started")
      ) {
        userLevel = "beginner";
      } else if (
        queryLower.includes("advanced") ||
        queryLower.includes("expert") ||
        queryLower.includes("complex")
      ) {
        userLevel = "advanced";
      } else {
        userLevel = "intermediate";
      }
    }

    let enhancedQuery = userQuery;

    // Add context if provided
    let contextCount = 0;
    if (contexts.length > 0) {
      contextCount = contexts.length;
      const contextSection = contexts
        .map(
          (
            ctx,
          ) => `<context source="${ctx.source}" relevance="${ctx.score.toFixed(3)}">
${ctx.text}
</context>`,
        )
        .join("\n\n");

      enhancedQuery = `${userQuery}

Relevant context:
${contextSection}

Please provide a comprehensive answer using the provided context. If the context doesn't fully address the question, supplement with your general knowledge while clearly distinguishing between context-based and general information.`;
    }

    // Add user level guidance
    if (userLevel) {
      enhancedQuery += `\n\nUser Level: ${userLevel} - Please adjust your explanation complexity accordingly.`;
    }

    const conversationContext: ConversationContext = {
      messages: [{ role: "user", content: enhancedQuery }],
      systemPrompt: "RAG_ASSISTANT",
      model: "HAIKU",
      temperature: 0.3,
      userLevel,
      contextCount,
      queryType: "rag",
    };
    const response = await callClaudeAPI(conversationContext);
    return response as StreamingAIResponse;
  } catch (error) {
    console.error("RAG Assistant error:", error);
    throw new Error(`RAG Assistant failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Smart AI assistant with streaming support
 */
export async function askAIAssistant(
  userQuery: string,
  conversation: BaseMessage[] = [],
  options: {
    learningMode?: LearningMode;
    complexity?: "simple" | "complex";
    searchType?: "general" | "software" | "recent";
    urgency?: "low" | "medium" | "high";
    thinking?: boolean;
  } = {},
): Promise<
  StreamingAIResponse & {
    reasoning?: string;
    searchAnalytics?: SearchAnalytics;
  }
> {
  try {
    // Auto-detect learning mode if not specified
    const learningMode = options.learningMode ?? detectLearningMode(userQuery);
    const complexity = options.complexity ?? detectComplexity(userQuery);

    // Auto-detect if search is needed
    const enableSearch = shouldPerformSearch(userQuery, learningMode);
    const webSearch = await performWebSearch(enableSearch, {
      userQuery,
      learningMode,
    });

    const webResults = webSearch?.searchResults?.length
      ? webSearch.searchResults.map((result) => ({
          title: result.title,
          url: result.url,
          description: result.description,
          content: result.snippet,
        }))
      : undefined;

    const webContext = fineTuneWebResults(
      userQuery,
      learningMode,
      options.urgency,
      complexity,
      webResults,
    );

    const enhancedQuery = webContext?.enhancedQuery ?? userQuery;
    // Select optimal model
    const selectedModel = selectOptimalModel(
      learningMode,
      userQuery,
      complexity,
    );
    const temperature = LEARNING_MODE_TEMPERATURE_MAP[learningMode];

    // Get system prompt
    const systemPrompt =
      learningMode === "default"
        ? CACHED_SYSTEM_PROMPTS.SUPERCHARGED_ASSISTANT
        : getPromptForLearningMode(learningMode);

    const messages = [
      ...conversation,
      { role: "user" as const, content: enhancedQuery },
    ];

    const conversationContext: ConversationContext = {
      messages,
      systemPrompt: systemPrompt,
      model: selectedModel,
      learningMode,
      temperature,
      urgency: options.urgency,
      complexity,
      searchPerformed: enableSearch,
      searchType:
        options.searchType ||
        (enableSearch ? getSearchType(userQuery, learningMode) : undefined),
      searchResultCount: webContext?.searchResultCount,
    };
    const response = await callClaudeAPI(conversationContext, options.thinking);
    const streamingResponse = response as StreamingAIResponse;
    streamingResponse.metadata = {
      learningMode,
      selectedModel,
      temperature,
      complexity,
      urgency: options.urgency,
      searchPerformed: enableSearch,
      searchType:
        options.searchType ||
        (enableSearch ? getSearchType(userQuery, learningMode) : undefined),
      searchResultCount: webContext?.searchResultCount,
    };

    return {
      ...streamingResponse,
      ...(webSearch?.searchAnalytics && {
        searchAnalytics: webSearch.searchAnalytics,
      }),
    };
  } catch (error) {
    console.error(`AI Assistant error:`, error);
    throw new Error(`AI Assistant failed: ${getErrorMessage(error)}`);
  }
}

async function performWebSearch(
  enableSearch: boolean,
  options: {
    userQuery: string;
    learningMode: LearningMode;
    webSearchResults?: EnhancedSearchResult[];
    searchType?: string;
  },
) {
  if (!enableSearch) return undefined;
  try {
    const searchType =
      options.searchType ??
      getSearchType(options.userQuery, options.learningMode);
    const searchCount = 8;

    let searchResponse: {
      results: EnhancedSearchResult[];
      analytics?: SearchAnalytics;
    };
    switch (searchType) {
      case "software":
        searchResponse = await searchSoftwareEngineering(options.userQuery, {
          count: searchCount,
        });
        break;
      case "recent":
        searchResponse = await searchRecentTech(options.userQuery, "pw");
        break;
      default:
        searchResponse = await searchWeb({
          query: options.userQuery,
          count: searchCount,
          includeNews: options.learningMode === "career-advice",
        });
    }

    return {
      searchResults: searchResponse.results,
      searchAnalytics: searchResponse.analytics,
    };
  } catch (searchError) {
    console.warn(
      "Search failed, continuing without search results:",
      searchError,
    );
  }
}

function fineTuneWebResults(
  userQuery: string,
  learningMode: LearningMode,
  urgency?: string,
  complexity?: string,
  webResults?: {
    title: string;
    url: string;
    description: string;
    content?: string;
  }[],
) {
  if (!webResults?.length) return;
  let enhancedQuery = userQuery;
  const searchResultCount = webResults.length;
  const webContext = webResults
    .slice(0, 6)
    .map(
      (result) => `<web_source url="${result.url}" title="${result.title}">
${result.description}
${result.content ? `\n\nContent:\n${result.content.substring(0, 800)}...` : ""}
</web_source>`,
    )
    .join("\n\n");

  enhancedQuery = `${userQuery}

Recent web sources:
${webContext}
Please incorporate relevant information from these sources in your response while providing your expert analysis and recommendations.`;

  if (learningMode !== "default") {
    enhancedQuery += `\n\nLEARNING MODE: ${learningMode.toUpperCase().replace("-", " ")}`;
    enhancedQuery += `\nPlease respond according to the ${learningMode} learning mode guidelines and provide the level of detail and specialization expected for this mode.`;
  }

  if (urgency === "high") {
    if (learningMode === "debug-code") {
      enhancedQuery +=
        "\n\nUrgency: HIGH - Focus on immediate debugging steps and quick resolution paths.";
    } else if (learningMode === "system-design") {
      enhancedQuery +=
        "\n\nUrgency: HIGH - Prioritize critical architectural decisions and MVP considerations.";
    } else {
      enhancedQuery +=
        "\n\nUrgency: HIGH - Prioritize actionable solutions and key insights.";
    }
  }

  if (complexity) {
    enhancedQuery += `\n\nComplexity Level: ${complexity.toUpperCase()} - Adjust explanation depth accordingly.`;
  }

  return {
    enhancedQuery,
    searchResultCount,
  };
}
