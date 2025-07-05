import type { QueryParams } from "@sanity/client";
import type { Args } from "../shared-types";
import { client } from "../loader";
import {
  tutorialDetailsQuery,
  tutorialsQuery,
  countQuery,
  lessonsQuery,
  lessonDetailsQuery,
} from "./queries";
import type { Tutorial, Lesson } from "./types";

/**
 * Retrieves a list of tutorials based on specified filtering criteria
 * @param {TutorialsArgs} args - The arguments for filtering and pagination
 * @param {string} [args.search=""] - Search term to filter tutorials
 * @param {string} [args.category=""] - Category slug to filter tutorials
 * @param {string} [args.tag=""] - Tag slug to filter tutorials
 * @param {string} [args.order="createdAt desc"] - Sort order for articles
 * @param {number} [args.start] - Start index for pagination
 * @param {number} [args.end] - End index for pagination
 * @returns {Promise<{articles: Article[], total: number}>} Object containing filtered articles and total count
 * @example
 * // Get the first 10 articles in the "javascript" category
 * const { articles, total } = await getArticles({
 *   category: "javascript",
 *   start: 0,
 *   end: 10
 * });
 */
export async function getTutorials(args: Args) {
  const {
    search = "",
    category = "",
    tag = "",
    order = "createdAt desc",
    start,
    end,
  } = args;

  const queryParams = {
    ...(search && { search: `*${search}*` }),
    ...(category && { category }),
    ...(tag && { tag }),
    start,
    end,
  } as QueryParams;

  let filters = `_type == "tutorial" && published == true`;
  if (category) filters += ` && category->slug.current == $category`;
  if (tag) filters += ` && $tag in tags[]->slug.current`;

  const response = await client.fetch<{
    tutorials: Tutorial[];
    total: number;
  }>(tutorialsQuery({ search, filters, order }), queryParams);
  return {
    tutorials: response.tutorials,
    total: response.total ?? 0,
  };
}

/**
 * Counts the total number of published tutorials
 * @returns {Promise<{count: number}>} Object containing the total count of tutorials
 * @example
 * // Get the total number of published tutorials
 * const { count } = await countTutorials();
 * console.log(`Total tutorials: ${count}`);
 */
export async function countTutorials() {
  return client.fetch<number>(countQuery);
}

/**
 * Retrieves detailed information about a specific tutorial by its slug
 * @param {string} tutorialId - The ID of the tutorial to retrieve
 * @returns {Promise<Tutorial>} Detailed tutorial information
 * @example
 * // Get full details of a tutorial about React hooks
 * const tutorial = await getTutorialDetails("1234567890");
 * console.log(tutorial.title); // "Complete Guide to React Hooks"
 */
export async function getTutorialDetails(tutorialId: string) {
  return await client.fetch<Tutorial>(tutorialDetailsQuery, {
    tutorialId,
  });
}

/**
 * Retrieves the lessons for a specific tutorial
 * @param {string} tutorialId - The ID of the tutorial to retrieve lessons for
 * @returns {Promise<TutorialLesson[]>} Array of tutorial lessons
 * @example
 * // Get the lessons for a tutorial about React hooks
 * const lessons = await getTutorialLessons("1234567890");
 * console.log(lessons.length); // 5
 */
export async function getTutorialLessons(tutorialId: string) {
  return client.fetch<Lesson[]>(lessonsQuery, { tutorialId });
}

/**
 * Retrieve a single lesson content
 * @param {string} lessonId - The ID of the lesson to retrieve
 * @returns {Promise<Lesson>} The lesson content
 * @example
 * // Get the content of a lesson about React hooks
 * const lesson = await getTutorialLessonDetails("1234567890");
 * console.log(lesson.content); // "This is the content of the lesson"
 */
export async function getTutorialLessonDetails(lessonId: string) {
  return client.fetch<Lesson>(lessonDetailsQuery, { lessonId });
}
