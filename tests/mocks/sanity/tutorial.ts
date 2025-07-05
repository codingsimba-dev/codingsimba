import path from "path";
import fs from "fs/promises";
import matter from "gray-matter";
import { readPageContent } from "~/utils/misc.server";
import {
  categoryQuery,
  tutorialDetailsQuery,
} from "~/utils/content.server/turorials/queries";
import type { Lesson, Tutorial } from "~/utils/content.server/turorials/types";
import type { Category, Tag } from "~/utils/content.server/shared-types";
import type { Author } from "~/utils/content.server/authors/types";

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * In-memory cache for tutorials and lessons
 */
const tutorialCache = new Map<string, Tutorial[]>();
const lessonCache = new Map<string, Lesson[]>();

/**
 * Clears the tutorial cache for development and testing
 */
export function clearTutorialCache(): void {
  tutorialCache.clear();
  lessonCache.clear();
}

// ============================================================================
// CONTENT LOADING UTILITIES
// ============================================================================

/**
 * Generic function to load content from MDX files in a directory
 */
async function loadContentFromDirectory<T>(
  directoryName: string,
  transform: (slug: string, frontmatter: Record<string, unknown>) => T | null,
): Promise<T[]> {
  try {
    const contentDir = path.join(
      process.cwd(),
      "tests/fixtures/sanity",
      directoryName,
    );
    const files = await fs.readdir(contentDir);
    const mdxFiles = files.filter((file) => file.endsWith(".mdx"));

    const items = await Promise.all(
      mdxFiles.map(async (file) => {
        try {
          const slug = file.replace(/\.mdx$/, "");
          const content = await readPageContent({
            basePath: "tests/fixtures/sanity",
            pageName: `${directoryName}/${slug}`,
          });

          if (!content) return null;

          const { data: frontmatter } = matter(content);
          return transform(slug, frontmatter);
        } catch (error) {
          console.error(`Error processing ${directoryName} ${file}:`, error);
          return null;
        }
      }),
    );

    return items.filter(Boolean) as T[];
  } catch (error) {
    console.error(`Error loading ${directoryName}:`, error);
    return [];
  }
}

/**
 * Loads tutorials from MDX files in the fixtures directory
 */
export async function getTutorialsFromDirectory(): Promise<Tutorial[]> {
  const cacheKey = "tutorials";

  if (tutorialCache.has(cacheKey)) {
    return tutorialCache.get(cacheKey)!;
  }

  const [authors, categories, lessons] = await Promise.all([
    getAuthorsFromDirectory(),
    getCategoriesFromDirectory(),
    getTutorialLessonsFromDirectory(),
  ]);

  const tutorials = await loadContentFromDirectory<Tutorial>(
    "tutorials",
    (slug, frontmatter) => {
      // Find the author and category by ID
      const author = authors.find((a) => a.id === frontmatter.authorId);
      const category = categories.find((c) => c.id === frontmatter.categoryId);

      if (!author || !category) {
        console.warn(`Missing author or category for tutorial ${slug}`);
        return null;
      }

      // Get lesson IDs and create the lessons array structure
      const lessonIds = (frontmatter.lessons as string[]) || [];
      const tutorialLessons = lessonIds
        .map((lessonId) => lessons.find((l) => l.id === lessonId))
        .filter(Boolean)
        .map((lesson) => ({ id: lesson!.id }));

      return {
        ...frontmatter,
        slug,
        author,
        category,
        lessons: tutorialLessons,
        lessonsCount: tutorialLessons.length,
        image: frontmatter.image || "",
        published: frontmatter.published ?? true,
        premium: frontmatter.premium ?? false,
        createdAt: frontmatter.createdAt || new Date().toISOString(),
      } as Tutorial;
    },
  );

  const validTutorials = tutorials.filter(Boolean) as Tutorial[];
  tutorialCache.set(cacheKey, validTutorials);
  console.log(`Processed tutorials:`, validTutorials.length);
  return validTutorials;
}

/**
 * Loads tutorial lessons from MDX files in the fixtures directory
 */
export async function getTutorialLessonsFromDirectory(): Promise<Lesson[]> {
  const cacheKey = "tutorial-lessons";

  if (lessonCache.has(cacheKey)) {
    return lessonCache.get(cacheKey)!;
  }

  const lessons = await loadContentFromDirectory<Lesson>(
    "tutorial-lessons",
    (slug, frontmatter) =>
      ({
        ...frontmatter,
        slug,
      }) as Lesson,
  );

  lessonCache.set(cacheKey, lessons);
  console.log(`Processed tutorial lessons:`, lessons.length);
  return lessons;
}

// ============================================================================
// REFERENCE RESOLUTION
// ============================================================================

/**
 * Loads all tags from the fixtures
 */
export async function getTagsFromDirectory(): Promise<Tag[]> {
  return loadContentFromDirectory<Tag>(
    "tags",
    (slug, frontmatter) =>
      ({
        ...frontmatter,
        slug,
      }) as Tag,
  );
}

/**
 * Loads all categories from the fixtures
 */
export async function getCategoriesFromDirectory(): Promise<Category[]> {
  return loadContentFromDirectory<Category>(
    "categories",
    (slug, frontmatter) =>
      ({
        ...frontmatter,
        slug,
      }) as Category,
  );
}

/**
 * Loads all authors from the fixtures
 */
export async function getAuthorsFromDirectory(): Promise<Author[]> {
  return loadContentFromDirectory<Author>(
    "authors",
    (slug, frontmatter) =>
      ({
        ...frontmatter,
        slug,
      }) as Author,
  );
}

/**
 * Resolves references for a single tutorial without lessons
 * Converts SanityTutorial to Tutorial with populated author, category, and tags
 */
export async function resolveTutorialReferences(
  tutorial: Tutorial,
): Promise<Tutorial> {
  // Since we're using Sanity types, author and category should already be full objects
  // We just need to ensure tags are properly resolved
  const tags = await getTagsFromDirectory();

  const resolvedTags = (tutorial.tags || [])
    .map((t: Tag) => tags.find((tag) => tag.id === t.id))
    .filter((tag): tag is Tag => tag !== undefined);

  return {
    ...tutorial,
    tags: resolvedTags,
    lessonsCount: tutorial.lessons.length,
  };
}

/**
 * Resolves references for multiple tutorials
 */
export async function resolveTutorialsReferences(
  tutorials: Tutorial[],
): Promise<Tutorial[]> {
  return Promise.all(tutorials.map(resolveTutorialReferences));
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

  /**
   * Contains matching for partial query matching
   */
  contains: (received: string, fragment: string) =>
    normalizeQuery(received).includes(normalizeQuery(fragment)),
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
// TUTORIAL QUERY RESOLVERS
// ============================================================================

/**
 * Handles resolution of references for tutorial content items
 */
export class TutorialQueryResolver {
  /**
   * Loads all tutorials from the fixtures
   */
  static async getTutorials() {
    return await getTutorialsFromDirectory();
  }

  /**
   * Loads all tutorial lessons from the fixtures
   */
  static async getTutorialLessons() {
    return await getTutorialLessonsFromDirectory();
  }

  /**
   * Handles queries for tutorial details by slug
   */
  static async handleTutorialDetailsQuery(url: URL) {
    const tutorialId = url.searchParams.get("$tutorialId");
    const tutorials = await TutorialQueryResolver.getTutorials();
    const tutorial = tutorials.find(
      (t) => t.id === tutorialId?.replace(/["']/g, ""),
    );

    if (!tutorial) {
      throw new Error("Tutorial not found");
    }
    return resolveTutorialReferences(tutorial);
  }

  /**
   * Handles queries for all tutorials with filtering
   */
  static async handleTutorialsQuery(url: URL) {
    const search =
      url.searchParams.get("$search")?.replace(/\*/g, "") || undefined;
    const category = url.searchParams.get("$category") || undefined;
    const tag = url.searchParams.get("$tag") || undefined;
    const order = url.searchParams.get("$order") || "createdAt desc";
    const start = Math.max(0, Number(url.searchParams.get("$start") ?? 0));
    const end = Number(url.searchParams.get("$end") ?? start + 6);
    const pageSize = end - start;
    const tutorials = await TutorialQueryResolver.getTutorials();

    const resolvedTutorials = await resolveTutorialsReferences(tutorials);

    let filteredTutorials = resolvedTutorials.filter((t) => t.published);

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredTutorials = filteredTutorials.filter((t) =>
        t.title.toLowerCase().includes(searchTerm),
      );
    }

    if (category) {
      filteredTutorials = filteredTutorials.filter(
        (t) => t.category.slug === category,
      );
    }

    if (tag) {
      filteredTutorials = filteredTutorials.filter((t) =>
        t.tags.some((tagItem) => tagItem.slug === tag),
      );
    }

    if (/createdAt\s+desc/i.test(order)) {
      filteredTutorials.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    } else if (/createdAt\s+asc/i.test(order)) {
      filteredTutorials.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
    }

    const paginatedTutorials = filteredTutorials.slice(start, start + pageSize);
    const tutorialsWithLessonsCount = paginatedTutorials.map((tutorial) => ({
      ...tutorial,
      lessonsCount: tutorial.lessons.length,
    }));

    return {
      tutorials: tutorialsWithLessonsCount,
      total: filteredTutorials.length,
    };
  }

  /**
   * Handles queries for tutorial lessons by tutorial slug
   */
  static async handleTutorialLessonsQuery(url: URL) {
    const tutorialId = url.searchParams.get("$tutorialId");
    if (!tutorialId) {
      throw new Error("Tutorial slug parameter is required");
    }

    const tutorials = await TutorialQueryResolver.getTutorials();
    const tutorial = tutorials.find(
      (t) => t.id === tutorialId.replace(/["']/g, ""),
    );
    if (!tutorial) {
      throw new Error("Tutorial not found");
    }

    const lessons = await TutorialQueryResolver.getTutorialLessons();
    const tutorialLessons = lessons.filter((lesson) =>
      tutorial.lessons.some((l) => l.id === lesson.id),
    );

    return tutorialLessons.map((lesson) => ({
      ...lesson,
      sandpackTemplates: [], // TODO: Resolve sandpack templates
      reactComponents: [], // TODO: Resolve react components
    }));
  }

  /**
   * Handles queries for individual lesson details by lesson ID
   */
  static async handleLessonDetailsQuery(url: URL) {
    const lessonId = url.searchParams.get("$lessonId");
    if (!lessonId) {
      throw new Error("Lesson ID parameter is required");
    }

    const lessons = await TutorialQueryResolver.getTutorialLessons();
    const lesson = lessons.find((l) => l.id === lessonId.replace(/["']/g, ""));

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    return {
      ...lesson,
      sandpackTemplates: [], // TODO: Resolve sandpack templates
      reactComponents: [], // TODO: Resolve react components
    };
  }
}

// ============================================================================
// TUTORIAL QUERY HANDLER REGISTRY
// ============================================================================

/**
 * Registry of all tutorial query handlers
 * Handlers are matched in order of priority (highest first)
 */
export const tutorialQueryHandler: QueryHandler[] = [
  {
    name: "tutorial-details-query",
    priority: 95,
    match: (q: string) => matchStrategies.pattern(q, tutorialDetailsQuery),
    handle: async (url: URL) =>
      TutorialQueryResolver.handleTutorialDetailsQuery(url),
  },
  {
    name: "tutorials-query",
    priority: 50,
    match: (q: string) =>
      q.includes('_type == "tutorial"') &&
      q.includes("published == true") &&
      q.includes('"total": count(*'),
    handle: async (url: URL) => TutorialQueryResolver.handleTutorialsQuery(url),
  },
  {
    name: "lesson-details-query",
    priority: 90,
    match: (q: string) =>
      q.includes('_type == "lesson"') &&
      q.includes("_id == $lessonId") &&
      q.includes("[0]"),
    handle: async (url: URL) =>
      TutorialQueryResolver.handleLessonDetailsQuery(url),
  },
  {
    name: "tutorial-lessons-query",
    priority: 85,
    match: (q: string) =>
      q.includes('_type == "lesson"') &&
      q.includes("tutorial._ref == $tutorialId"),
    handle: async (url: URL) =>
      TutorialQueryResolver.handleTutorialLessonsQuery(url),
  },
  {
    name: "categories-query",
    priority: 80,
    match: (q: string) => matchStrategies.exact(q, categoryQuery),
    handle: async () => getCategoriesFromDirectory(),
  },
];
