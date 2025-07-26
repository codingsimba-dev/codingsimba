import type { Route } from "./+types/article";
import { DetailsHeader } from "../../components/page-details-header";
import { Tags } from "./components/tags";
import { Share } from "../../components/share-content";
import { Author } from "../../components/author";
import { RelatedArticles } from "./components/related-articles";
import { TableOfContent } from "./components/table-of-content";
import { ContentEmailSubscriptionForm } from "~/components/content-email-subscription-form";
import { PopularTags } from "./components/popular-tags";
import { Markdown } from "~/components/mdx";
import {
  getArticleDetails,
  getPopularTags,
} from "~/utils/content.server/articles/utils";
import { invariant, invariantResponse } from "~/utils/misc";
import { CommentIntent, Comments } from "~/components/comment";
import { Separator } from "~/components/ui/separator";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { useOptionalUser } from "~/hooks/user";
import { usePageView } from "use-page-view";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { generateMetadata } from "~/utils/meta";
import { Metrics } from "./components/metrics";
import { checkHoneypot } from "~/utils/honeypot.server";
import { UpvoteIntent } from "~/components/upvote";
import { ReportIntent } from "~/components/report";
import { BookmarkIntent } from "~/components/bookmark";
import {
  getContentComments,
  getContentMetrics,
} from "~/utils/content.server/loader.server";
import {
  ActionSchema,
  addComment,
  bookmarkContent,
  deleteBookmark,
  deleteComment,
  deleteReport,
  reportComment,
  reportContent,
  trackPageView,
  updateBookmark,
  updateComment,
  upvoteComment,
  upvoteContent,
} from "~/utils/content.server/action";
import { useFetcher } from "react-router";
import { useCallback } from "react";

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
  const articleSlug = params.articleSlug;
  invariant(articleSlug, "Article slug is required");

  const tags = getPopularTags();
  const metrics = getContentMetrics({
    slugOrId: articleSlug,
    type: "ARTICLE",
  });
  const comments = getContentComments({
    slugOrId: articleSlug,
    type: "ARTICLE",
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
  const formData = await request.formData();
  await checkHoneypot(formData);
  const formDataObj = Object.fromEntries(formData);
  const submittedData = {
    data: JSON.parse(formDataObj.data as string),
    intent: formDataObj.intent,
  };

  const result = await ActionSchema.safeParseAsync(submittedData);
  invariantResponse(result.success, "Invalid form data", {
    status: StatusCodes.BAD_REQUEST,
  });

  enum MiscTypes {
    TRACK_PAGE_VIEW = "TRACK_PAGE_VIEW",
  }

  const { data, intent } = result.data;

  switch (
    intent as
      | CommentIntent
      | MiscTypes
      | UpvoteIntent
      | ReportIntent
      | BookmarkIntent
  ) {
    case CommentIntent.ADD_COMMENT:
      return await addComment(data);
    case CommentIntent.UPDATE_COMMENT:
      return await updateComment(request, data);
    case CommentIntent.DELETE_COMMENT:
      return await deleteComment(request, data);
    case UpvoteIntent.UPVOTE_COMMENT:
      return await upvoteComment(data);
    case MiscTypes.TRACK_PAGE_VIEW:
      return await trackPageView({
        pageId: data.pageId as string,
        type: "ARTICLE",
      });
    case UpvoteIntent.UPVOTE_CONTENT:
      return await upvoteContent(data);
    case BookmarkIntent.CREATE_BOOKMARK:
      return await bookmarkContent(data);
    case BookmarkIntent.UPDATE_BOOKMARK:
      return await updateBookmark(data);
    case BookmarkIntent.DELETE_BOOKMARK:
      return await deleteBookmark(data);
    case ReportIntent.REPORT_CONTENT:
      return await reportContent(data);
    case ReportIntent.REPORT_COMMENT:
      return await reportComment(data);
    case ReportIntent.DELETE_REPORT:
      return await deleteReport(data);
    default:
      return new Response("Invalid intent", {
        status: StatusCodes.BAD_REQUEST,
      });
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

  const trackPageView = useCallback(() => {
    fetcher.submit({
      intent: "TRACK_PAGE_VIEW",
      data: { pageId: article.id },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  usePageView({
    pageId: article.id,
    trackOnce: true,
    trackOnceDelay: 30,
    onPageView: trackPageView,
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

              {/* Article excerpt */}
              <div className="bg-muted rounded-lg p-6">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <TableOfContent className="block lg:hidden" />
              <Markdown
                source={article.content}
                sandpackTemplates={article.sandpackTemplates}
              />
            </article>
            <Metrics className="md:hidden" />
            <p>
              Share the topics you&apos;d like to see covered in future
              articles.
            </p>
            <Separator className="mb-4 mt-2" />
            <Comments />
            <Tags tags={article.tags} />
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
              <Metrics className="hidden md:block" />
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
