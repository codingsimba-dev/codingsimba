import { z } from "zod";

/**
 * Zod schema for changelog items.
 * Defines the structure for changelog entries with release information and updates.
 */
export const ChangelogSchema = z.object({
  title: z.string(),
  version: z.string(),
  date: z.string(),
  order: z.number(),
  content: z.string(),
});

/**
 * Zod schema for journey items.
 * Defines the structure for journey entries representing company milestones.
 */
export const JourneySchema = z.object({
  title: z.string(),
  description: z.string(),
  year: z.string(),
  image: z.string(),
  category: z.string(),
  published: z.boolean(),
  content: z.string(),
});

/**
 * Zod schema for FAQ items.
 * Defines the structure for frequently asked questions with categorization.
 */
export const FAQSchema = z.object({
  question: z.string(),
  answer: z.string(),
  category: z.string(),
  order: z.number(),
  published: z.boolean(),
});

/**
 * Zod schema for team member profiles.
 * Defines the structure for team member information including social links.
 */
export const TeamMemberSchema = z.object({
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  image: z.string(),
  specialties: z.array(z.string()),
  order: z.number(),
  social: z.object({
    github: z.string().optional(),
    website: z.string().optional(),
    x: z.string().optional(),
    linkedin: z.string().optional(),
  }),
});

/**
 * Zod schema for page content.
 * Defines the structure for static page content with metadata.
 */
export const PageSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  content: z.string(),
});

/**
 * TypeScript types inferred from Zod schemas.
 * These provide type safety when working with content data.
 */
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type Changelog = z.infer<typeof ChangelogSchema>;
export type Journey = z.infer<typeof JourneySchema>;
export type FAQ = z.infer<typeof FAQSchema>;
export type Page = z.infer<typeof PageSchema>;
