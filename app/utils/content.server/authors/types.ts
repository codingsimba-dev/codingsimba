import { z } from "zod";

/**
 * Schema for social media links
 * Defines the structure of social media URLs for an author.
 *
 * @property {string} [github] - GitHub profile URL
 * @property {string} [linkedin] - LinkedIn profile URL
 * @property {string} [twitter] - Twitter/X profile URL
 * @property {string} [website] - Personal website URL
 */
const SocialLinksSchema = z.object({
  github: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  website: z.string().url().optional(),
});

/**
 * Schema for a complete author
 * Defines the structure of an author in the system.
 *
 * @property {string} id - Unique identifier for the author
 * @property {string} name - Full name of the author
 * @property {string} slug - URL-friendly identifier for the author
 * @property {string} image - URL of the author's profile image
 * @property {string} bio - Author's biography
 * @property {string[]} skills - Array of skills/tags for the author
 * @property {string} supportUrl - URL of the author's support page
 * @property {SocialLinksSchema} [socialLinks] - Social media links
 * @property {boolean} isActive - Whether the author is currently active
 * @property {string} createdAt - Creation timestamp
 */
export const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string(),
  bio: z.string(),
  skills: z.array(z.string()),
  supportUrl: z.string().url().optional(),
  socialLinks: SocialLinksSchema.optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime({ offset: true }),
});

/**
 * Type representing a complete author
 */
export type Author = z.infer<typeof AuthorSchema>;

/**
 * Type representing social media links
 */
export type SocialLinks = z.infer<typeof SocialLinksSchema>;
