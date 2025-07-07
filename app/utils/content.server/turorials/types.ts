import { z } from "zod";
import { AuthorSchema } from "../authors/types";
import {
  CategorySchema,
  ComponentSchema,
  SandpackTemplateSchema,
  TagsSchema,
} from "../shared-types";

/**
 * Schema for a tutorial lesson
 * Defines the structure of a lesson within a tutorial.
 */

const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  sandpackTemplates: z.array(SandpackTemplateSchema),
  reactComponents: z.array(ComponentSchema),
});

/**
 * Schema for a complete tutorial
 * Defines the structure of a tutorial in the system.
 */
export const TutorialSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  image: z.string(),
  overview: z.string(),
  category: CategorySchema,
  author: AuthorSchema,
  tags: TagsSchema,
  published: z.boolean(),
  premium: z.boolean(),
  createdAt: z.string().datetime({ offset: true }),
  lessons: z.array(LessonSchema.pick({ id: true })),
  lessonsCount: z.number(),
});

/**
 * Type representing a complete tutorial
 */
export type Tutorial = z.infer<typeof TutorialSchema>;

/**
 * Type representing a single lesson
 */
export type Lesson = z.infer<typeof LessonSchema>;
