import { generateRemixSitemap } from "@forge42/seo-tools/remix/sitemap";
import type { Route } from "./+types/sitemap[.]xml";
import { href } from "react-router";
import { getDomainUrl } from "~/utils/misc";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { routes } = await import("virtual:react-router/server-build");
  const sitemap = await generateRemixSitemap({
    domain: getDomainUrl(request),
    ignore: [
      href("/profile"),
      href("/profile/change-email"),
      href("/profile/password"),
    ],
    routes,
  });

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
