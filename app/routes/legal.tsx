import type { Route } from "./+types/legal";
import { StatusCodes } from "http-status-codes";
import { Markdown } from "~/components/mdx";
import { Header } from "~/components/page-header";
import { getPage } from "~/utils/content.server/system/utils";
import { generateMetadata } from "~/utils/meta";
import { invariantResponse, invariant } from "~/utils/misc";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.pageSlug, "Page slug is required");
  const pageContent = await getPage(params.pageSlug);
  invariantResponse(pageContent, `Page ${params.pageSlug} not found`, {
    status: StatusCodes.NOT_FOUND,
  });

  return { pageContent };
}

export default function LegalRoute({ loaderData }: Route.ComponentProps) {
  const { pageContent } = loaderData;
  const metadata = generateMetadata({
    title: pageContent.title,
    description: pageContent.description,
  });

  return (
    <>
      {metadata}
      <Header title={pageContent.title} description={pageContent.description} />
      <section className="mx-auto max-w-3xl">
        <Markdown source={pageContent.content} className="pt-0" />
      </section>
    </>
  );
}
