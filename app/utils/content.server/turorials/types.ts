import { z } from "zod";
import { AuthorSchema } from "../authors/types";
import {
  CategorySchema,
  ComponentSchema,
  SandpackTemplateSchema,
} from "../shared-types";

/**
 * Schema for a tutorial lesson
 * Defines the structure of a lesson within a tutorial.
 */
export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  sandpackTemplates: z.array(SandpackTemplateSchema),
  reactComponents: z.array(ComponentSchema),
});

/**
 * Schema for a chatbot tutorial lesson
 * Defines the structure of an id and title of a lesson within a tutorial.
 */
export const ChatBotLessonSchema = z.object({
  id: z.string(),
  title: z.string(),
});

/**
 * Schema for a tutorial module
 * Defines the structure of a module within a tutorial.
 */
export const ModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  order: z.number(),
  createdAt: z.string().datetime({ offset: true }),
  published: z.boolean(),
  lessons: z.array(LessonSchema).nullable(),
  tutorial: z
    .object({
      id: z.string(),
    })
    .nullable(),
});

/**
 * Schema for a complete tutorial
 * Defines the structure of a tutorial in the system.
 */
export const TutorialSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  image: z.string().nullable(),
  overview: z.string().optional(),
  category: CategorySchema.nullable(),
  author: AuthorSchema.nullable(),
  tags: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
      }),
    )
    .nullable(),
  modules: z
    .array(
      z.object({
        id: z.string(),
      }),
    )
    .nullable(),
  lessonsCount: z.number(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

/**
 * Schema for tutorial details (from tutorialDetailsQuery)
 */
export const TutorialDetailsSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  image: z.string().nullable(),
  overview: z.string().optional(),
  category: CategorySchema.nullable(),
  author: AuthorSchema.nullable(),
  tags: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
      }),
    )
    .nullable(),
});

/**
 * Schema for lessons list (from lessonsQuery)
 */
export const LessonsListSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
  }),
);

/**
 * Schema for modules list (from modulesQuery)
 */
export const ModulesListSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    order: z.number(),
    lessons: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
      }),
    ),
  }),
);

/**
 * Schema for lesson details (from lessonDetailsQuery)
 */
export const LessonDetailsSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  sandpackTemplates: z.array(SandpackTemplateSchema),
  reactComponents: z.array(ComponentSchema),
});

/**
 * Schema for tutorials query response
 */
export const TutorialsQueryResponseSchema = z.object({
  tutorials: z.array(TutorialSchema),
  total: z.number(),
});

/**
 * Schema for tag with count (from tagQuery)
 */
export const TagWithCountSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  count: z.number(),
});

/**
 * Schema for category (from categoryQuery)
 */
export const CategoryListSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
  }),
);

/**
 * Type representing a complete tutorial
 */
export type Tutorial = z.infer<typeof TutorialSchema>;

/**
 * Type representing tutorial details
 */
export type TutorialDetails = z.infer<typeof TutorialDetailsSchema>;

/**
 * Type representing a single lesson
 */
export type Lesson = z.infer<typeof LessonSchema>;

/**
 * Type representing a single chat bot lesson
 */
export type ChatBotLesson = z.infer<typeof ChatBotLessonSchema>;

/**
 * Type representing a tutorial module
 */
export type Module = z.infer<typeof ModuleSchema>;

/**
 * Type representing lesson details
 */
export type LessonDetails = z.infer<typeof LessonDetailsSchema>;

/**
 * Type representing lessons list
 */
export type LessonsList = z.infer<typeof LessonsListSchema>;

/**
 * Type representing modules list
 */
export type ModulesList = z.infer<typeof ModulesListSchema>;

/**
 * Type representing tutorials query response
 */
export type TutorialsQueryResponse = z.infer<
  typeof TutorialsQueryResponseSchema
>;

/**
 * Type representing tag with count
 */
export type TagWithCount = z.infer<typeof TagWithCountSchema>;

/**
 * Type representing category list
 */
export type CategoryList = z.infer<typeof CategoryListSchema>;
