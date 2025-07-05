import { z } from "zod";
import { AuthorSchema } from "../authors/types";
import {
  CategorySchema,
  ComponentSchema,
  SandpackTemplateSchema,
  TagsSchema,
} from "../shared-types";

/**
 * Schema for related articles
 * Defines the structure of articles that are related to the current article.
 *
 * @property {string} id - Unique identifier for the related article
 * @property {string} title - Title of the related article
 * @property {string} slug - URL-friendly identifier for the related article
 * @property {string} createdAt - Creation timestamp of the related article
 * @property {string} image - URL of the related article's image
 * @property {string} excerpt - Short description of the related article
 */
const RelatedArticlesSchema = z
  .array(
    z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      createdAt: z.string(),
      category: CategorySchema,
      author: AuthorSchema,
      image: z.string().url(),
      excerpt: z.string(),
      content: z.string(),
    }),
  )
  .default([]);

/**
 * Schema for a complete article
 * Defines the structure of an article in the system.
 *
 * @property {string} id - Unique identifier for the article
 * @property {string} title - Title of the article
 * @property {string} slug - URL-friendly identifier for the article
 * @property {string} createdAt - Creation timestamp
 * @property {CategorySchema} category - The article's category
 * @property {Author} [author] - The article's author (optional for backward compatibility)
 * @property {TagsSchema} tags - Array of tags associated with the article
 * @property {string} image - URL of the article's main image
 * @property {string} excerpt - Short description of the article
 * @property {string} content - The mdx bundled content of the article
 * @property {string} markdown - The markdown content before processing
 * @property {string} html - The processed html content before processing
 * @property {RelatedArticlesSchema} relatedArticles - Array of related articles
 * @property {SandpackTemplateSchema[]} sandpackTemplates - Array of associated Sandpack templates
 * @property {ComponentSchema[]} reactComponents - Array of React components used in the article
 */
export const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  category: CategorySchema,
  tags: TagsSchema,
  author: AuthorSchema,
  image: z.string(),
  featured: z.boolean().nullable(),
  published: z.boolean().nullable(),
  excerpt: z.string(),
  content: z.string(),
  markdown: z.string(),
  html: z.string(),
  relatedArticles: RelatedArticlesSchema,
  sandpackTemplates: z.array(SandpackTemplateSchema),
  reactComponents: z.array(ComponentSchema),
});

/**
 * Type representing a complete article
 */
export type Article = z.infer<typeof ArticleSchema>;

/**
 * Type representing an array of related articles
 */
export type RelatedArticles = z.infer<typeof RelatedArticlesSchema>;

/**
 * Type representing a Sandpack template
 */
export type SandpackTemplate = z.infer<typeof SandpackTemplateSchema>;

/**
 * Type representing a React component
 */
export type Component = z.infer<typeof ComponentSchema>;
