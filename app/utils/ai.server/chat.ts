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
  type AIResponse,
  type BaseMessage,
  type ConversationContext,
  type LearningMode,
  type ModelType,
  type RAGContext,
  type StreamingAIResponse,
} from "./anthropic";

import { SYSTEM_PROMPTS } from "./constants";

/**
 * RAG-powered learning assistant with streaming support
 */
export async function askRAGAssistant(
  userQuery: string,
  contexts: RAGContext["contexts"] = [],
  options: {
    userLevel?: "beginner" | "intermediate" | "advanced";
    autoDetectLevel?: boolean;
    streaming?: boolean; // Add streaming option
  } = {},
): Promise<AIResponse | StreamingAIResponse> {
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
    if (contexts.length > 0) {
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
      metadata: {
        userLevel,
        contextCount: contexts.length,
        queryType: "rag",
      },
    };

    const response = await callClaudeAPI(
      conversationContext,
      options.streaming,
    );

    if (options.streaming) {
      return response as StreamingAIResponse;
    } else {
      const nonStreamingResponse = response as AIResponse;
      console.log(
        `RAG Assistant response: ${nonStreamingResponse.usage.totalTokens} tokens in ${nonStreamingResponse.processingTime}ms`,
      );

      nonStreamingResponse.metadata = {
        userLevel,
        contextCount: contexts.length,
        queryType: "rag",
      };

      return nonStreamingResponse;
    }
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
    // Auto-detection options
    autoDetectMode?: boolean;
    autoDetectComplexity?: boolean;
    autoDetectSearch?: boolean;

    // Manual overrides
    learningMode?: LearningMode;
    complexity?: "simple" | "complex";
    forceModel?: ModelType;

    // Search options
    enableSearch?: boolean;
    searchType?: "general" | "software" | "recent";
    searchCount?: number;
    webSearchResults?: Array<{
      title: string;
      url: string;
      description: string;
      content?: string;
    }>;

    urgency?: "low" | "medium" | "high";

    // Response preferences
    includeReasoning?: boolean;
    includeSearchAnalytics?: boolean;
    streaming?: boolean; // Add streaming option
  } = {},
): Promise<
  (AIResponse | StreamingAIResponse) & {
    reasoning?: string;
    searchAnalytics?: SearchAnalytics;
  }
> {
  try {
    // Auto-detect learning mode if not specified
    const detectedMode =
      options.autoDetectMode !== false
        ? detectLearningMode(userQuery)
        : "default";

    const learningMode = options.learningMode || detectedMode;

    // Auto-detect complexity if not specified
    const detectedComplexity =
      options.autoDetectComplexity !== false
        ? detectComplexity(userQuery)
        : undefined;

    const complexity = options.complexity || detectedComplexity;

    // Auto-detect if search is needed
    const shouldSearch =
      options.autoDetectSearch !== false
        ? shouldPerformSearch(userQuery, learningMode)
        : false;

    const enableSearch = options.enableSearch ?? shouldSearch;

    let searchResults: EnhancedSearchResult[] = [];
    let searchAnalytics: SearchAnalytics | undefined;

    // Perform search if needed and not already provided
    if (enableSearch && !options.webSearchResults?.length) {
      try {
        const searchType =
          options.searchType || getSearchType(userQuery, learningMode);
        const searchCount = options.searchCount || 8;

        console.log(
          `Performing ${searchType} search for query: "${userQuery}"`,
        );

        let searchResponse;
        switch (searchType) {
          case "software":
            searchResponse = await searchSoftwareEngineering(userQuery, {
              count: searchCount,
            });
            break;
          case "recent":
            searchResponse = await searchRecentTech(userQuery, "pw");
            break;
          default:
            searchResponse = await searchWeb({
              query: userQuery,
              count: searchCount,
              includeNews: learningMode === "career-advice",
            });
        }

        searchResults = searchResponse.results;
        searchAnalytics = searchResponse.analytics;

        console.log(`Search completed: ${searchResults.length} results found`);
      } catch (searchError) {
        console.warn(
          "Search failed, continuing without search results:",
          searchError,
        );
      }
    }

    let enhancedQuery = userQuery;

    // Add web search context from search results or provided results
    const webResults =
      searchResults.length > 0
        ? searchResults.map((result) => ({
            title: result.title,
            url: result.url,
            description: result.description,
            content: result.snippet,
          }))
        : options.webSearchResults;

    if (webResults?.length) {
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
    }

    // Add learning mode context
    if (learningMode !== "default") {
      enhancedQuery += `\n\nLEARNING MODE: ${learningMode.toUpperCase().replace("-", " ")}`;
      enhancedQuery += `\nPlease respond according to the ${learningMode} learning mode guidelines and provide the level of detail and specialization expected for this mode.`;
    }

    // Add urgency context with mode-specific adjustments
    if (options.urgency === "high") {
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

    // Add complexity hints for better model selection
    if (complexity) {
      enhancedQuery += `\n\nComplexity Level: ${complexity.toUpperCase()} - Adjust explanation depth accordingly.`;
    }

    // Select optimal model
    const selectedModel =
      options.forceModel ||
      selectOptimalModel(learningMode, userQuery, complexity);
    const temperature = LEARNING_MODE_TEMPERATURE_MAP[learningMode] || 0.3;

    // Get system prompt
    const systemPrompt =
      learningMode === "default"
        ? SYSTEM_PROMPTS.SUPERCHARGED_ASSISTANT
        : getPromptForLearningMode(learningMode);

    const messages = [
      ...conversation,
      { role: "user" as const, content: enhancedQuery },
    ];

    const metadata = {
      learningMode,
      detectedMode,
      selectedModel,
      temperature,
      complexity,
      detectedComplexity,
      urgency: options.urgency,
      searchPerformed: enableSearch,
      searchType:
        options.searchType ||
        (enableSearch ? getSearchType(userQuery, learningMode) : undefined),
      searchResultCount: searchResults.length,
      autoDetected: {
        mode: options.autoDetectMode !== false,
        complexity: options.autoDetectComplexity !== false,
        search: options.autoDetectSearch !== false,
      },
    };

    const conversationContext: ConversationContext = {
      messages,
      systemPrompt: systemPrompt,
      model: selectedModel,
      temperature,
      metadata,
    };

    const response = await callClaudeAPI(
      conversationContext,
      options.streaming,
    );

    if (options.streaming) {
      const streamingResponse = response as StreamingAIResponse;
      streamingResponse.metadata = metadata;

      // Generate reasoning if requested
      let reasoning = "";
      if (options.includeReasoning) {
        reasoning = `Learning Mode: ${learningMode} (${options.learningMode ? "specified" : "auto-detected"})
Model: ${selectedModel} (optimized for ${learningMode})
Complexity: ${complexity} (${options.complexity ? "specified" : "auto-detected"})
Temperature: ${temperature} (optimized for task type)
Search: ${enableSearch ? "enabled" : "disabled"} ${enableSearch ? `(${searchResults.length} results)` : ""}`;
      }

      return {
        ...streamingResponse,
        ...(options.includeReasoning && { reasoning }),
        ...(options.includeSearchAnalytics &&
          searchAnalytics && { searchAnalytics }),
      };
    } else {
      const nonStreamingResponse = response as AIResponse;

      console.log(
        `AI Assistant [${learningMode}] response: ` +
          `${nonStreamingResponse.usage.totalTokens} tokens in ${nonStreamingResponse.processingTime}ms ` +
          `using ${selectedModel} model (temp: ${temperature})`,
      );

      nonStreamingResponse.metadata = metadata;

      // Generate reasoning if requested
      let reasoning = "";
      if (options.includeReasoning) {
        reasoning = `Learning Mode: ${learningMode} (${options.learningMode ? "specified" : "auto-detected"})
Model: ${selectedModel} (optimized for ${learningMode})
Complexity: ${complexity} (${options.complexity ? "specified" : "auto-detected"})
Temperature: ${temperature} (optimized for task type)
Search: ${enableSearch ? "enabled" : "disabled"} ${enableSearch ? `(${searchResults.length} results)` : ""}`;
      }

      return {
        ...nonStreamingResponse,
        ...(options.includeReasoning && { reasoning }),
        ...(options.includeSearchAnalytics &&
          searchAnalytics && { searchAnalytics }),
      };
    }
  } catch (error) {
    console.error(`AI Assistant error:`, error);
    throw new Error(`AI Assistant failed: ${getErrorMessage(error)}`);
  }
}
