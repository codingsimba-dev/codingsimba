import groq from "groq";

/**
 * Generates a GROQ query for fetching tutorials with filtering, search, and pagination
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search term to filter tutorials by title, excerpt, or content
 * @param {string} params.filters - Base filters for the query (e.g., published status)
 * @param {string} params.order - Sort order for the results
 * @returns {string} GROQ query string
 * @example
 * // Get published tutorials sorted by creation date
 * const query = tutorialsQuery({
 *   search: "react",
 *   filters: "_type == 'tutorial' && published == true",
 *   order: "createdAt desc"
 * });
 */
export function tutorialsQuery({
  search,
  filters,
  order,
}: {
  search: string;
  filters: string;
  order: string;
}) {
  const searchCondition = search ? `&& (title match $search)` : "";
  const publishedCondition = `&& published == true`;
  return groq`{
    "tutorials": *[${filters} ${publishedCondition} ${searchCondition}] | order(${order}) [$start...$end] {
      "id": _id,
      title,
      "slug": slug.current,
      "image": image.asset->url,
      createdAt,
      "updatedAt": _updatedAt,
      "category": category->{
        "id": _id,
        title,
        "slug": slug.current
      },
      "tags": tags[]->{
        "id": _id,
        title,
        "slug": slug.current
      },
      "author": author->{
        "id": _id,
        name,
        "slug": slug.current,
        "image": image.asset->url,
      },
      "lessons": lessons[]->{
        "id": _id
      },
      "lessonsCount": count(*[_type == "lesson" && references(^._id)])
    },
    "total": count(*[${filters}])
  }`;
}

/**
 * GROQ query to count total number of published tutorials
 * @returns {string} GROQ query string that returns a count
 */
export const countQuery = `count(*[_type == "tutorial" && published == true])`;

/**
 * GROQ query to fetch detailed information about a specific tutorial
 * @returns {string} GROQ query string that returns tutorial details including:
 * - Basic tutorial information (id, title, slug, etc.)
 * - Category information
 * - Tags
 * - Image URL
 */
export const tutorialDetailsQuery = groq`*[_type == "tutorial" && _id == $tutorialId][0] {
  "id": _id,
  title,
  "slug": slug.current,
  "image": image.asset->url,
  "category": category->{
    "id": _id,
    title,
    "slug": slug.current
  },
  "tags": tags[]->{
    "id": _id,
    title,
    "slug": slug.current
  },
  "author": author->{
    "id": _id,
    name,
    "slug": slug.current,
    "image": image.asset->url,
    skills,
    socialLinks,
    createdAt,
    bio
  }
}`;

/**
 * GROQ query to fetch lessons for a specific tutorial
 * @returns {string} GROQ query string that returns lessons for a specific tutorial
 */
export const lessonsQuery = groq`*[_type == "lesson" && tutorial._ref == $tutorialId] {
  "id": _id,
  title,
  "slug": slug.current
}`;

/**
 * GROQ query to fetch lesson details
 * @returns {string} GROQ query string that returns lesson details
 */
export const lessonDetailsQuery = groq`*[_type == "lesson" && _id == $lessonId][0] {
  "id": _id,
  title,
  "slug": slug.current,
  content,
  "sandpackTemplates": sandpackTemplates[]->{
    "id": _id,
    title,
    "slug": slug.current,
    description,
    template,
  },
  "reactComponents": reactComponents[]->{
    "id": _id,
    title,
    file
  }
}`;

/**
 * GROQ query to fetch popular tags with their usage count for tutorials
 * @returns {string} GROQ query string that returns:
 * - Tag information (id, title, slug)
 * - Count of tutorials using each tag
 * - Sorted by usage count
 * - Limited to specified number of tags
 */
export const tagQuery = groq`*[_type == "tag"] {
  "id": _id,
  title,
  "slug": slug.current,
  "count": count(*[_type == "tutorial" && references(^._id)]) 
} | order(count desc) [0...$limit]`;

/**
 * GROQ query to fetch all categories
 * @returns {string} GROQ query string that returns:
 * - Category information (id, title, slug)
 * - All categories in the system
 */
export const categoryQuery = groq`*[_type == "category"] {
  "id": _id,
  title,
  "slug": slug.current
}`;
