import groq from "groq";

/**
 * GROQ query to fetch all roadmap items from Sanity CMS.
 * Returns roadmap entries with their planning and progress information.
 *
 * @returns Array of roadmap objects with title, description, category, dates, status, progress, and content
 */
export const roadmapQuery = groq`
  *[_type == "roadmap"] {
    title,
    description,
    category,
    startDate,
    status,
    progress,
    content,
  }
`;

/**
 * GROQ query to fetch all journey items from Sanity CMS.
 * Returns journey entries that represent key milestones in the company's history.
 *
 * @returns Array of journey objects with title, description, year, image, category, published status, and content
 */
export const journeyQuery = groq`
  *[_type == "journey" && published == true] {
    title,
    description,
    year,
    "image": image.asset->url,
    category,
    published,
    content,
  }
`;

/**
 * GROQ query to fetch all FAQ items from Sanity CMS.
 * Returns frequently asked questions organized by category.
 *
 * @returns Array of FAQ objects with question, answer, category, published status, and content
 */
export const faqQuery = groq`
  *[_type == "faqs" && published == true] {
    question,
    answer,
    category,
    published,
    order
  }
`;

/**
 * GROQ query to fetch all team member profiles from Sanity CMS.
 * Returns team member information including roles, bios, and social links.
 *
 * @returns Array of team member objects with name, role, bio, image, specialties, order, and social links
 */
export const teamMemberQuery = groq`
  *[_type == "teamMember"] {
    name,
    role,
    bio,
    "image": image.asset->url,
    specialties,
    order,
    social,
  }
`;

/**
 * GROQ query to fetch a single page by slug from Sanity CMS.
 * Returns a specific page based on the provided slug parameter.
 *
 * @param slug - The unique identifier for the page to retrieve
 * @returns Single page object with title, slug, description, and content, or null if not found
 */
export const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    title,
    slug,
    description,
    content,
  }
`;
