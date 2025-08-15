import { z } from "zod";
import { invariant } from "../misc";
import {
  SOFTWARE_ENG_DOMAINS,
  SOFTWARE_CATEGORIES,
  TECHNICAL_TERMS,
} from "./constants";

const BRAVE_BASE_URL =
  "https://api.search.brave.com/res/v1/web/search" as const;

const BraveSearchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string(),
  date: z.string().optional(),
  profile: z
    .object({
      url: z.string(),
      name: z.string(),
      long_name: z.string(),
      img: z.string(),
    })
    .optional(),
  extra_snippets: z.array(z.string()).optional(),
  family_friendly: z.boolean().optional(),
});

const BraveNewsResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string(),
  date: z.string(),
  source: z.string(),
  thumbnail: z
    .object({
      src: z.string(),
      alt: z.string().optional(),
    })
    .optional(),
});

const BraveSearchResponseSchema = z.object({
  web: z
    .object({
      type: z.literal("search"),
      results: z.array(BraveSearchResultSchema),
    })
    .optional(),
  news: z
    .object({
      type: z.literal("news"),
      results: z.array(BraveNewsResultSchema),
    })
    .optional(),
  query: z.object({
    original: z.string(),
    altered: z.string().optional(),
    safesearch: z.string(),
    is_navigational: z.boolean(),
    is_news_breaking: z.boolean().optional(),
    spellcheck_off: z.boolean(),
    country: z.string(),
    bad_results: z.boolean(),
    should_fallback: z.boolean(),
  }),
});

type BraveSearchResponse = z.infer<typeof BraveSearchResponseSchema>;
type BraveSearchResult = z.infer<typeof BraveSearchResultSchema>;
type BraveNewsResult = z.infer<typeof BraveNewsResultSchema>;

interface SearchOptions {
  query: string;
  count?: number;
  offset?: number;
  country?: string;
  language?: string;
  safesearch?: "strict" | "moderate" | "off";
  freshness?: "pd" | "pw" | "pm" | "py"; // past day, week, month, year
  includeNews?: boolean;
  resultsFilter?: "web" | "news" | "both";
  domainFilter?: string[]; // Filter by specific domains
  excludeDomains?: string[]; // Exclude specific domains
}

export interface EnhancedSearchResult {
  title: string;
  url: string;
  description: string;
  date?: string;
  source: string;
  type: "web" | "news";
  relevanceScore?: number;
  isTechnical?: boolean;
  isRecent?: boolean;
  snippet?: string;
}

export interface SearchAnalytics {
  query: string;
  totalResults: number;
  webResults: number;
  newsResults: number;
  processingTime: number;
  isNavigational: boolean;
  isBreakingNews?: boolean;
  suggestedQuery?: string;
}

// Software engineering domains for enhanced filtering

/**
 * Enhanced web search with comprehensive software engineering focus
 */
export async function searchWeb(options: SearchOptions): Promise<{
  results: EnhancedSearchResult[];
  analytics: SearchAnalytics;
}> {
  const startTime = Date.now();

  try {
    const {
      query,
      count = 10,
      safesearch = "moderate",
      freshness,
      includeNews = false,
      domainFilter,
      excludeDomains,
    } = options;

    const trimmedQuery = query.trim();
    invariant(trimmedQuery, "Search query cannot be empty");

    const newsKeywords = [
      // Releases & Updates
      "release",
      "version",
      "update",
      "upgrade",
      "patch",
      "hotfix",
      "rollout",
      // Announcements & Changes
      "announce",
      "announcement",
      "introduce",
      "launch",
      "changes",
      "breaking change",
      // Deprecations & Migrations
      "deprecate",
      "deprecated",
      "migration",
      "EOL",
      "end of life",
      "sunset",
      // Future Developments
      "upcoming",
      "future",
      "roadmap",
      "beta",
      "alpha",
      "preview",
      "experimental",
      // Urgent/Important Notices
      "breaking",
      "critical",
      "security",
      "vulnerability",
      "alert",
      "warning",
      // Trends & Discussions
      "trend",
      "trending",
      "adopt",
      "standard",
      "best practice",
      // Documentation & Changelogs
      "changelog",
      "release notes",
      "documentation",
      "what's new",
      // Time-Sensitive Terms
      "now available",
      "today",
      "recent",
      "latest",
      "new",
    ];

    const shouldIncludeNews =
      includeNews ||
      newsKeywords.some((keyword) => trimmedQuery.includes(keyword));

    const enhancedQuery = enhanceQueryForSoftwareEngineering(trimmedQuery);
    const params = buildSearchParams({
      q: enhancedQuery,
      count: count.toString(),
      safesearch,
      freshness,
      result_filter: shouldIncludeNews ? "both" : "web",
    });

    const response = await fetch(`${BRAVE_BASE_URL}?${params}`);
    const data = BraveSearchResponseSchema.parse(await response.json());
    const results = processSearchResults(data, {
      domainFilter,
      excludeDomains,
      originalQuery: query,
    });

    const analytics: SearchAnalytics = {
      query: enhancedQuery,
      totalResults: results.length,
      webResults: results.filter((r) => r.type === "web").length,
      newsResults: results.filter((r) => r.type === "news").length,
      processingTime: Date.now() - startTime,
      isNavigational: data.query.is_navigational,
      isBreakingNews: data.query.is_news_breaking,
      suggestedQuery: data.query.altered,
    };

    console.log(
      `Search completed: ${analytics.totalResults} results in ${analytics.processingTime}ms`,
    );

    return { results, analytics };
  } catch (error) {
    console.error("Enhanced search error:", error);
    throw new Error(
      `Failed to perform web search: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Specialized search for software engineering topics
 */
export async function searchSoftwareEngineering(
  query: string,
  options: Partial<SearchOptions> = {},
): Promise<{
  results: EnhancedSearchResult[];
  analytics: SearchAnalytics;
}> {
  const enhancedOptions: SearchOptions = {
    query,
    count: 15,
    domainFilter: SOFTWARE_ENG_DOMAINS,
    includeNews: false,
    ...options,
  };
  return searchWeb(enhancedOptions);
}

/**
 * Search for recent software engineering news and updates
 */
export async function searchRecentTech(
  query: string,
  timeframe: "pd" | "pw" | "pm" = "pw",
): Promise<{
  results: EnhancedSearchResult[];
  analytics: SearchAnalytics;
}> {
  return searchWeb({
    query,
    freshness: timeframe,
    includeNews: true,
    count: 20,
  });
}

/**
 * Enhance query with software engineering context
 */
function enhanceQueryForSoftwareEngineering(query: string): string {
  const queryLower = query.toLowerCase();
  const hasSoftwareContext = Object.values(SOFTWARE_CATEGORIES).some(
    (category) => {
      return category.some((term) => queryLower.includes(term));
    },
  );
  if (!hasSoftwareContext) {
    // Add programming context for better software engineering results
    return `${query} programming development`;
  }
  return query;
}

/**
 * Build search parameters
 */
function buildSearchParams(
  params: Record<string, string | undefined>,
): URLSearchParams {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value);
    }
  });
  return searchParams;
}

/**
 * Process and enhance search results
 */
function processSearchResults(
  data: BraveSearchResponse,
  options: {
    domainFilter?: string[];
    excludeDomains?: string[];
    originalQuery: string;
  },
): EnhancedSearchResult[] {
  const results: EnhancedSearchResult[] = [];

  // Process web results
  if (data.web?.results) {
    data.web.results.forEach((result) => {
      if (shouldIncludeResult(result.url, options)) {
        results.push({
          title: result.title,
          url: result.url,
          description: result.description,
          date: result.date,
          source: extractDomain(result.url),
          type: "web" as const,
          relevanceScore: calculateRelevanceScore(
            result,
            options.originalQuery,
          ),
          isTechnical: isTechnicalContent(result),
          isRecent: isRecentContent(result.date),
          snippet: result.extra_snippets?.[0],
        });
      }
    });
  }

  // Process news results
  if (data.news?.results) {
    data.news.results.forEach((result) => {
      if (shouldIncludeResult(result.url, options)) {
        results.push({
          title: result.title,
          url: result.url,
          description: result.description,
          date: result.date,
          source: result.source,
          type: "news" as const,
          relevanceScore: calculateRelevanceScore(
            result,
            options.originalQuery,
          ),
          isTechnical: isTechnicalContent(result),
          isRecent: isRecentContent(result.date),
        });
      }
    });
  }

  // Sort by relevance score (descending)
  return results.sort(
    (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0),
  );
}

/**
 * Determine if a result should be included based on domain filters
 */
function shouldIncludeResult(
  url: string,
  options: {
    domainFilter?: string[];
    excludeDomains?: string[];
  },
): boolean {
  const domain = extractDomain(url);

  // Check exclude list first
  if (options.excludeDomains?.some((excluded) => domain.includes(excluded))) {
    return false;
  }

  // If domain filter is specified, only include matching domains
  if (options.domainFilter?.length) {
    return options.domainFilter.some((allowed) => domain.includes(allowed));
  }

  return true;
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

/**
 * Calculate relevance score based on various factors
 */
function calculateRelevanceScore(
  result: BraveSearchResult | BraveNewsResult,
  originalQuery: string,
): number {
  let score = 0.5; // Base score

  const queryTerms = originalQuery.toLowerCase().split(/\s+/);
  const titleLower = result.title.toLowerCase();
  const descLower = result.description.toLowerCase();

  // Title matches (higher weight)
  queryTerms.forEach((term) => {
    if (titleLower.includes(term)) score += 0.3;
    if (descLower.includes(term)) score += 0.1;
  });

  // Boost for technical domains
  const domain = extractDomain(result.url);
  if (SOFTWARE_ENG_DOMAINS.some((techDomain) => domain.includes(techDomain))) {
    score += 0.2;
  }

  // Boost for recent content (for news results)
  if ("date" in result && isRecentContent(result.date)) {
    score += 0.1;
  }

  return Math.min(score, 1.0); // Cap at 1.0
}

/**
 * Check if content appears to be technical/programming related
 */
function isTechnicalContent(
  result: BraveSearchResult | BraveNewsResult,
): boolean {
  const content = `${result.title} ${result.description}`.toLowerCase();
  return TECHNICAL_TERMS.some((term) => content.includes(term));
}

/**
 * Check if content is recent (within last 6 months)
 */
function isRecentContent(dateString?: string): boolean {
  if (!dateString) return false;

  try {
    const contentDate = new Date(dateString);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return contentDate >= sixMonthsAgo;
  } catch {
    return false;
  }
}
