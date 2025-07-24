import type { Route } from "./+types/article";
import { DetailsHeader } from "../../components/details-header";
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
import { CommentIntent, Comments, ReplyIntent } from "~/components/comment";
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
  bookmarkArticle,
  flagArticle,
  flagReply,
  flagComment,
} from "./action.server";
import { getArticleMetrics, getArticleComments } from "./loader.server";
import { SubmitSchema, useCreate } from "~/hooks/content";
import { z } from "zod";
import { useOptionalUser } from "~/hooks/user";
import { usePageView } from "use-page-view";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { generateMetadata } from "~/utils/meta";
import { Metrics } from "./components/metrics";
import { checkHoneypot } from "~/utils/honeypot.server";

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
  const formData = await request.formData();

  await checkHoneypot(formData);
  const formDataObj = Object.fromEntries(formData);
  const submittedData = {
    data: JSON.parse(formDataObj.data as string),
    intent: formDataObj.intent,
  };

  const result = await SubmitSchema.safeParseAsync(submittedData);
  invariantResponse(result.success, "Invalid form data", {
    status: StatusCodes.BAD_REQUEST,
  });

  enum MiscTypes {
    UPVOTE_ARTICLE = "upvote-article",
    BOOKMARK_ARTICLE = "bookmark-article",
    FLAG_ARTICLE = "flag-article",
    TRACK_PAGE_VIEW = "track-page-view",
    FLAG_COMMENT = "flag-comment",
    FLAG_REPLY = "flag-reply",
  }

  const { data, intent } = result.data;

  switch (intent as CommentIntent | ReplyIntent | MiscTypes) {
    case CommentIntent.ADD_COMMENT:
      return await addComment(data);
    case ReplyIntent.ADD_REPLY:
      return await addReply(data);
    case CommentIntent.UPDATE_COMMENT:
      return await updateComment(request, data);
    case CommentIntent.DELETE_COMMENT:
      return await deleteComment(request, data);
    case CommentIntent.UPVOTE_COMMENT:
      return await upvoteComment(data);
    case ReplyIntent.UPDATE_REPLY:
      return await updateReply(request, data);
    case ReplyIntent.DELETE_REPLY:
      return await deleteReply(request, data);
    case ReplyIntent.UPVOTE_REPLY:
      return await upvoteReply(data);
    case MiscTypes.TRACK_PAGE_VIEW:
      return await trackPageView({ itemId: data.itemId as string });
    case MiscTypes.UPVOTE_ARTICLE:
      return await upvoteArticle(data);
    case MiscTypes.BOOKMARK_ARTICLE:
      return await bookmarkArticle(data);
    case MiscTypes.FLAG_ARTICLE:
      return await flagArticle(data);
    case MiscTypes.FLAG_COMMENT:
      return await flagComment(data);
    case MiscTypes.FLAG_REPLY:
      return await flagReply(data);
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

  const { submit: submitPageView } = useCreate(
    {
      intent: "track-page-view",
      data: { itemId: article.id },
    },
    { showSuccessToast: false },
  );

  usePageView({
    pageId: article.id,
    trackOnce: true,
    trackOnceDelay: 30,
    onPageView: submitPageView,
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
              articles!
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
