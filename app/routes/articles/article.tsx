import React from "react";
import type { Route } from "./+types/article";
import { DetailsHeader } from "../../components/details-header";
import { Tags } from "./components/tags";
import { Share } from "../../components/share-content";
import { Author } from "../../components/author";
import { RelatedArticles } from "./components/related-articles";
import { TableOfContent } from "../../components/table-of-content";
import { ContentEmailSubscriptionForm } from "~/components/content-email-subscription-form";
import { PopularTags } from "./components/popular-tags";
import { Markdown } from "~/components/mdx";
import {
  getArticleDetails,
  getPopularTags,
} from "~/utils/content.server/articles/utils";
import { EngagementMetrics } from "~/components/engagement-metrics";
import { invariant, invariantResponse } from "~/utils/misc";
import { useFetcher } from "react-router";
import { Comments } from "~/components/comment";
import { Separator } from "~/components/ui/separator";
import { StatusCodes } from "http-status-codes";
import {
  addComment,
  addReply,
  updateComment,
  deleteComment,
  upvoteComment,
  updateReply,
  deleteReply,
  upvoteReply,
  trackPageView,
  upvoteArticle,
} from "./action.server";
import { getArticleMetrics, getArticleComments } from "./loader.server";
import { UpdateSchema } from "~/hooks/content";
import { z } from "zod";
import { useOptionalUser } from "~/hooks/user";
import { usePageView, type PageViewData } from "use-page-view";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { generateMetadata } from "~/utils/meta";

const SearchParamsSchema = z.object({
  commentTake: z.coerce.number().default(5),
  replyTake: z.coerce.number().default(3),
  intent: z.string().optional(),
});

export async function loader({ request, params }: Route.LoaderArgs) {
  const searchParams = Object.fromEntries(
    new URL(request.url).searchParams.entries(),
  );
  const parsedParams = await SearchParamsSchema.safeParseAsync(searchParams);
  invariantResponse(parsedParams.success, "Invalid comment search params", {
    status: StatusCodes.BAD_REQUEST,
  });

  invariant(params.articleSlug, "Article slug is required");

  const articleSlug = params.articleSlug;

  const tags = getPopularTags();
  const metrics = getArticleMetrics({ articleSlug });
  const comments = getArticleComments({
    articleSlug,
    ...parsedParams.data,
  });
  const article = await getArticleDetails(articleSlug);
  invariantResponse(article, `Article with title: '${articleSlug}' not found`, {
    status: StatusCodes.NOT_FOUND,
  });

  return {
    tags,
    metrics,
    comments,
    article,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const result = await UpdateSchema.safeParseAsync(
    Object.fromEntries(await request.formData()),
  );
  invariantResponse(result.success, "Invalid form data", {
    status: StatusCodes.BAD_REQUEST,
  });

  const data = result.data;

  switch (data.intent) {
    case "add-comment":
      return await addComment(data);
    case "add-reply":
      return await addReply(data);
    case "update-comment":
      return await updateComment(request, data);
    case "delete-comment":
      return await deleteComment(request, data);
    case "upvote-comment":
      return await upvoteComment(data);
    case "update-reply":
      return await updateReply(request, data);
    case "delete-reply":
      return await deleteReply(request, data);
    case "upvote-reply":
      return await upvoteReply(data);
    case "upvote-article":
      return await upvoteArticle(data);
    case "track-page-view":
      return await trackPageView(data);

    default:
      throw new Error("Invalid intent");
  }
}

export default function ArticleDetailsRoute({
  loaderData,
}: Route.ComponentProps) {
  const { article } = loaderData;
  const metadata = generateMetadata({
    title: article.title,
    image: article.image,
    imageAlt: article.title,
    url: `articles/${article.slug}`,
    description: article.excerpt,
    keywords: article.tags
      .map((t) => t.slug)
      .join(",")
      .replace(/-/g, "_"),
    type: "article",
  });

  const user = useOptionalUser();
  const fetcher = useFetcher();

  const handlePageView = React.useCallback(async (data: PageViewData) => {
    await fetcher.submit(
      { ...data, itemId: data.pageId, intent: "track-page-view" },
      { method: "post" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  usePageView({
    pageId: article.id,
    trackOnce: true,
    trackOnceDelay: 30,
    onPageView: handlePageView,
  });

  return (
    <>
      {metadata}
      <DetailsHeader item={article} />
      {/* Article content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Main content */}
          <main className="w-full max-w-full lg:col-span-8">
            <article className="mb-8">
              <div className="relative mb-8 aspect-video overflow-hidden rounded-xl">
                <img
                  src={article.image}
                  alt={article.title}
                  className="aspect-video h-full w-full object-cover"
                />
              </div>
              <TableOfContent className="block lg:hidden" />
              <Markdown
                source={article.content}
                sandpackTemplates={article.sandpackTemplates}
              />
            </article>
            <EngagementMetrics className="md:hidden" />
            <p>
              Comment below the topics you may like me to create articles or
              tutorials on!
            </p>
            <Separator className="mb-4 mt-2" />
            <Comments />
            <Tags />
            <Share item={article} itemType="article" />
            <Author author={article.author} />
            {/* Related articles */}
            <div>
              <h2 className="mb-6 text-2xl font-bold">Related Articles</h2>
              <RelatedArticles />
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20">
              <TableOfContent className="hidden lg:block" />
              <EngagementMetrics className="hidden md:block" />
              {!user?.isSubscribed ? <ContentEmailSubscriptionForm /> : null}
              <PopularTags />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        403: () => <p>You do not have permission</p>,
        404: ({ params }) => (
          <p>Article with ${params.articleId} does not exist</p>
        ),
      }}
    />
  );
}
