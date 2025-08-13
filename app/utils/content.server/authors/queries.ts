import groq from "groq";

/**
 * GROQ query to fetch detailed information about a specific author
 * @returns {string} GROQ query string that returns author details including:
 * - Basic author information (id, name, slug, etc.)
 * - Profile image URL
 * - Bio and skills
 * - Social media links
 * - Active status and creation date
 */
export const authorDetailsQuery = groq`*[_type == "author" && slug.current == $slug][0] {
  "id": _id,
  name,
  "slug": slug.current,
  "image": image.asset->url,
  bio,
  skills,
  supportUrl,
  socialLinks,
  isActive,
  createdAt,
}`;

/**
 * GROQ query to fetch articles by a specific author
 * @returns {string} GROQ query string that returns:
 * - Articles written by the specified author
 * - Basic article information
 * - Category and tags
 * - Sorted by creation date (newest first)
 */
export const authorArticlesQuery = groq`*[_type == "article" && published == true && author->slug.current == $authorSlug] | order(createdAt desc) {
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
  "image": image.asset->url,
  excerpt,
  content,
}`;
