import groq from "groq";

/**
 * GROQ query to fetch the ID of an article by its slug
 * @returns {string} GROQ query string that returns the ID of the article
 */
export const articleIdQuery = groq`*[_type == "article" && slug.current == $slug][0] {
  "id": _id,
}`;

/**
 * Generates a GROQ query for fetching articles with filtering, search, and pagination
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search term to filter articles by title, excerpt, or content
 * @param {string} params.filters - Base filters for the query (e.g., published status)
 * @param {string} params.order - Sort order for the results
 * @returns {string} GROQ query string
 * @example
 * // Get published articles sorted by creation date
 * const query = articlesQuery({
 *   search: "react",
 *   filters: "_type == 'article' && published == true",
 *   order: "createdAt desc"
 * });
 */
export function articlesQuery({
  search,
  filters,
  order,
}: {
  search: string;
  filters: string;
  order: string;
}) {
  const searchCondition = search
    ? `&& (title match $search || excerpt match $search || content match $search)`
    : "";
  const publishedCondition = `&& published == true`;
  return groq`{
    "articles": *[${filters} ${publishedCondition} ${searchCondition}] | order(${order}) [$start...$end] {
      "id": _id,
      title,
      "slug": slug.current,
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
        bio
      },
      "image": image.asset->url,
      excerpt,
      content,
    },
    "total": count(*[${filters}])
  }`;
}

/**
 * GROQ query to count total number of published articles
 * @returns {string} GROQ query string that returns a count
 */
export const countQuery = `count(*[_type == "article" && published == true])`;

/**
 * GROQ query to fetch detailed information about a specific article
 * @returns {string} GROQ query string that returns article details including:
 * - Basic article information (id, title, slug, etc.)
 * - Category information
 * - Tags
 * - Image URL
 * - Content
 * - Associated Sandpack templates
 * - Associated React components
 */
export const articleDetailsQuery = groq`*[_type == "article" && slug.current == $slug][0] {
  "id": _id,
  title,
  "slug": slug.current,
  createdAt,
  "updatedAt": _uppdatedAt,
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
    isActive,
    createdAt,
    bio
  },
  "image": image.asset->url,
  excerpt,
  content,
  "sandpackTemplates": sandpackTemplates[]->{
    "id": _id,
    title,
    "slug": slug.current,
    description,
    template,
    sandpackFiles,
    options,
    customSetup
  },
  "reactComponents": reactComponents[]->{
    "id": _id,
    title,
    file
  }
}`;

/**
 * GROQ query to fetch articles related to a specific article
 * @returns {string} GROQ query string that returns up to 3 related articles based on:
 * - Shared tags
 * - Same category
 * - Excludes the current article
 * - Sorted by creation date
 */
export const relatedQuery = groq`
  *[_type == "article" && published == true && slug.current != $slug && (
    count(tags[@._ref in $tagIds]) > 0 ||
    category._ref == $categoryId
  )
  ] | order(createdAt desc) [0...3] {
    id,
    title,
    slug,
    createdAt,
    image,
    content,
    category->{
      id,
      title,
      slug
    }
  }
`;

/**
 * GROQ query to fetch popular tags with their usage count
 * @returns {string} GROQ query string that returns:
 * - Tag information (id, title, slug)
 * - Count of articles using each tag
 * - Sorted by usage count
 * - Limited to specified number of tags
 */
export const tagQuery = groq`*[_type == "tag"] {
  "id": _id,
  title,
  "slug": slug.current,
  "count": count(*[_type == "article" && references(^._id)]) 
} | order(count desc) [0...$limit]`;

/**
 * Generates a GROQ query for fetching recent articles
 * @returns {string} GROQ query string that returns:
 * - Basic article information
 * - Category information
 * - Image URL
 * - Excerpt
 * - Sorted by creation date (newest first)
 * - Limited to specified number of articles
 */
export function recentArticlesQuery() {
  return groq`*[_type == "article" && published == true] | order(createdAt desc) [0...$limit] {
    "id": _id,
    title,
    "slug": slug.current,
    createdAt,
    "category": category->{
      "id": _id,
      title,
      "slug": slug.current
    },
    "author": author->{
      "id": _id,
      name,
      "slug": slug.current,
      "image": image.asset->url,
      bio
    },
    "image": image.asset->url,
    excerpt,
    content
  }`;
}

export const featuredArticleQuery = `*[_type == "article" && published == true && featured == true][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  content,
  createdAt,
  "category": category->{
    title,
    slug
  },
  "tags": tags[]->{
    title,
    slug
  },
  "author": author->{
    "id": _id,
    name,
    "slug": slug.current,
    "image": image.asset->url,
    bio
  },
  "image": image.asset->url
}`;
