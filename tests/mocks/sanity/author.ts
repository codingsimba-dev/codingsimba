import path from "path";
import fs from "fs/promises";
import matter from "gray-matter";
import { authorArticlesQuery } from "~/utils/content.server/authors/queries";
import { authorDetailsQuery } from "~/utils/content.server/authors/queries";
import { readPageContent } from "~/utils/misc.server";
import type { Author } from "~/utils/content.server/authors/types";

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * In-memory cache for authors to avoid repeated file system reads
 */
const authorCache = new Map<string, Author[]>();

/**
 * Clears the author cache for development and testing
 */
export function clearAuthorCache(): void {
  authorCache.clear();
}

// ============================================================================
// CONTENT LOADING UTILITIES
// ============================================================================

/**
 * Loads authors from MDX files in the fixtures directory
 */
export async function getAuthorsFromDirectory(): Promise<Author[]> {
  const cacheKey = "authors";

  if (authorCache.has(cacheKey)) {
    return authorCache.get(cacheKey)!;
  }

  try {
    const contentDir = path.join(
      process.cwd(),
      "tests/fixtures/sanity",
      "authors",
    );
    const files = await fs.readdir(contentDir);
    const mdxFiles = files.filter((file) => file.endsWith(".mdx"));

    console.log(`Found MDX files for authors:`, mdxFiles.length);

    const authors = await Promise.all(
      mdxFiles.map(async (file) => {
        try {
          const slug = file.replace(/\.mdx$/, "");
          const content = await readPageContent({
            basePath: "tests/fixtures/sanity",
            pageName: `authors/${slug}`,
          });

          if (!content) {
            console.warn(`No content found for: ${slug}`);
            return null;
          }

          // Parse frontmatter using gray-matter
          const { data: frontmatter } = matter(content);

          return {
            ...frontmatter,
            slug,
          } as Author;
        } catch (error) {
          console.error(`Error processing author ${file}:`, error);
          return null;
        }
      }),
    );

    const validAuthors = authors.filter(Boolean) as Author[];
    authorCache.set(cacheKey, validAuthors);
    console.log(`Processed authors:`, validAuthors.length);
    return validAuthors;
  } catch (error) {
    console.error(`Error loading authors:`, error);
    return [];
  }
}

// ============================================================================
// QUERY MATCHING UTILITIES
// ============================================================================

/**
 * Normalizes GROQ queries for consistent matching
 */
export function normalizeQuery(query: string): string {
  return query
    .replace(/\s+/g, " ")
    .replace(/\s*([=!<>]+)\s*/g, "$1")
    .trim();
}

/**
 * Strategies for matching GROQ queries to handlers
 */
export const matchStrategies = {
  /**
   * Exact string matching after normalization
   */
  exact: (received: string, expected: string) =>
    normalizeQuery(received) === normalizeQuery(expected),

  /**
   * Pattern matching with parameter substitution
   */
  pattern: (received: string, pattern: string) => {
    const receivedNorm = normalizeQuery(received);
    const patternNorm = normalizeQuery(pattern);

    const regexPattern = patternNorm
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\\\$\w+/g, '[^"\\s]+');
    return new RegExp(`^${regexPattern}$`).test(receivedNorm);
  },
};

// ============================================================================
// QUERY HANDLER INTERFACE
// ============================================================================

/**
 * Interface for query handlers that process GROQ queries
 */
export interface QueryHandler {
  name: string;
  match: (query: string) => boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handle: (url: URL) => Promise<any> | any;
  priority?: number;
}

// ============================================================================
// AUTHOR QUERY RESOLVERS
// ============================================================================

/**
 * Handles resolution of references for author content items
 */
export class AuthorQueryResolver {
  /**
   * Loads all authors from the fixtures
   */
  static async getAuthors() {
    return await getAuthorsFromDirectory();
  }

  /**
   * Handles queries for author details by slug
   */
  static async handleAuthorDetailsQuery(url: URL) {
    const slug = url.searchParams.get("$slug");
    const authors = await AuthorQueryResolver.getAuthors();
    const author = authors.find((a) => a.slug === slug?.replace(/["']/g, ""));
    if (!author) {
      throw new Error("Author not found");
    }
    return author;
  }

  /**
   * Handles queries for articles by a specific author
   */
  static async handleAuthorArticlesQuery(url: URL) {
    const authorSlug = url.searchParams.get("$slug");
    if (!authorSlug) {
      throw new Error("Author slug parameter is required");
    }

    const authors = await AuthorQueryResolver.getAuthors();
    const author = authors.find(
      (a) => a.slug === authorSlug.replace(/["']/g, ""),
    );
    if (!author) {
      throw new Error("Author not found");
    }

    // Import article functionality to resolve author articles
    const { getArticlesFromDirectory, resolveArticlesReferences } =
      await import("./article");
    const articles = await getArticlesFromDirectory();
    const authorArticles = articles.filter(
      (article) => article.author.id === author.id,
    );

    return resolveArticlesReferences(authorArticles);
  }
}

// ============================================================================
// AUTHOR QUERY HANDLER REGISTRY
// ============================================================================

/**
 * Registry of all author query handlers
 * Handlers are matched in order of priority (highest first)
 */
export const authorQueryHandler: QueryHandler[] = [
  {
    name: "author-details-query",
    priority: 100,
    match: (q: string) => matchStrategies.pattern(q, authorDetailsQuery),
    handle: async (url: URL) =>
      AuthorQueryResolver.handleAuthorDetailsQuery(url),
  },
  {
    name: "author-articles-query",
    priority: 95,
    match: (q: string) => matchStrategies.pattern(q, authorArticlesQuery),
    handle: async (url: URL) =>
      AuthorQueryResolver.handleAuthorArticlesQuery(url),
  },
];
