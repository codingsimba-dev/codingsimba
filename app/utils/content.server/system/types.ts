import { z } from "zod";
import { CategorySchema } from "../shared-types";

export const RoadmapSchema = z.object({
  title: z.string(),
  description: z.string(),
  startDate: z.string(),
  status: z.enum(["planned", "in-progress", "completed"]),
  progress: z.number().min(0).max(100),
  details: z.string(),
});

export const JourneySchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string(),
  category: CategorySchema,
  published: z.boolean(),
  year: z.string(),
  details: z.string(),
});

export const FAQSchema = z.object({
  question: z.string(),
  answer: z.string(),
  category: CategorySchema,
  published: z.boolean(),
});

export const TeamMemberSchema = z.object({
  name: z.string(),
  bio: z.string(),
  image: z.string(),
  role: z.string(),
  category: CategorySchema,
  published: z.boolean(),
  specializations: z.array(z.string()),
  order: z.number(),
  social: z.object({
    github: z.string().optional(),
    website: z.string().optional(),
    x: z.string().optional(),
    linkedin: z.string().optional(),
  }),
});

export const PageSchema = z.object({
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  pageType: z.string(),
  published: z.boolean(),
  details: z.string(),
  category: CategorySchema,
  content: z.string(),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type Roadmap = z.infer<typeof RoadmapSchema>;
export type Journey = z.infer<typeof JourneySchema>;
export type FAQ = z.infer<typeof FAQSchema>;
export type Page = z.infer<typeof PageSchema>;
