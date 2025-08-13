import { faqQuery, journeyQuery, pageQuery, teamMemberQuery } from "./queries";
import { client } from "../loader";
import type { FAQ, Changelog, Journey, TeamMember, Page } from "./types";
import { bundleMDX } from "~/utils/mdx.server";
import { changelogQuery } from "./queries";

/**
 * Fetches all changelog items from Sanity CMS.
 * Returns changelog entries with their release information and updates.
 *
 * @returns Promise resolving to an array of changelog objects
 * @throws {Error} If the Sanity client fails to fetch data
 *
 * @example
 * ```ts
 * const changelogs = await getChangelogs();
 * changelogs.forEach(changelog => {
 *   console.log(changelog.title);
 * });
 * ```
 */
export async function getChangelogs() {
  const changelog = await client.fetch<Changelog[]>(changelogQuery);
  return Promise.all(
    (changelog || []).map(async (changelog) => ({
      ...changelog,
      content: (await bundleMDX({ source: changelog.content })).code,
    })),
  );
}

/**
 * Fetches all journey items from Sanity CMS.
 * Returns journey entries that represent key milestones in the company's history.
 *
 * @returns Promise resolving to an array of journey objects
 * @throws {Error} If the Sanity client fails to fetch data
 *
 * @example
 * ```ts
 * const journeys = await getJourneys();
 * const publishedJourneys = journeys.filter(journey => journey.published);
 * ```
 */
export async function getJourneys() {
  const journey = await client.fetch<Journey[]>(journeyQuery);
  return Promise.all(
    journey.map(async (journey) => ({
      ...journey,
      content: (await bundleMDX({ source: journey.content })).code,
    })),
  );
}

/**
 * Fetches all FAQ items from Sanity CMS.
 * Returns frequently asked questions organized by category.
 *
 * @returns Promise resolving to an array of FAQ objects
 * @throws {Error} If the Sanity client fails to fetch data
 *
 * @example
 * ```ts
 * const faqs = await getFAQs();
 * const publishedFaqs = faqs.filter(faq => faq.published);
 * ```
 */
export async function getFAQs() {
  const faq = await client.fetch<FAQ[]>(faqQuery);
  return faq.sort((a, b) => a.order - b.order);
}

/**
 * Fetches all team member profiles from Sanity CMS.
 * Returns team member information including roles, bios, and social links.
 *
 * @returns Promise resolving to an array of team member objects
 * @throws {Error} If the Sanity client fails to fetch data
 *
 * @example
 * ```ts
 * const teamMembers = await getTeamMembers();
 * const sortedMembers = teamMembers.sort((a, b) => a.order - b.order);
 * ```
 */
export async function getTeamMembers() {
  const teamMember = await client.fetch<TeamMember[]>(teamMemberQuery);
  return Promise.all(
    teamMember.map(async (teamMember) => ({
      ...teamMember,
      bio: (await bundleMDX({ source: teamMember.bio })).code,
    })),
  );
}

/**
 * Fetches a single page by slug from Sanity CMS.
 * Returns a specific page based on the provided slug parameter.
 *
 * @param slug - The unique identifier for the page to retrieve
 * @returns Promise resolving to a single page object or null if not found
 * @throws {Error} If the Sanity client fails to fetch data
 *
 * @example
 * ```ts
 * const page = await getPage("about");
 * if (page) {
 *   console.log(page.title, page.content);
 * }
 * ```
 */
export async function getPage(slug: string) {
  const page = await client.fetch<Page>(pageQuery, { slug });
  const content = await bundleMDX({ source: page.content });
  return {
    ...page,
    content: content.code,
  };
}
