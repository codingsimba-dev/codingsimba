import type { Route } from "./+types/author";
import { Link } from "react-router";
import {
  getAuthorArticles,
  getAuthorBySlug,
} from "~/utils/content.server/authors/utils";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import {
  Github,
  Linkedin,
  Twitter,
  Globe,
  Calendar,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { getImgSrc, getSeed, invariant, invariantResponse } from "~/utils/misc";
import { StatusCodes } from "http-status-codes";
import { generateMetadata } from "~/utils/meta";
import { ArticleCard } from "~/routes/articles/components/article-card";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { format } from "date-fns";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.authorSlug, "Author slug is required");
  const author = await getAuthorBySlug(params.authorSlug);
  invariantResponse(
    author,
    `Author with slug: '${params.authorSlug}' not found`,
    {
      status: StatusCodes.NOT_FOUND,
    },
  );
  const articles = await getAuthorArticles(params.authorSlug);
  return {
    author,
    articles,
  };
}

export default function AuthorDetailsRoute({
  loaderData,
}: Route.ComponentProps) {
  const { author, articles } = loaderData;

  const metadata = generateMetadata({
    title: `${author.name} | Coding Simba`,
    image: author.image,
    imageAlt: author.name,
    url: `authors/${author.slug}`,
    description: author.bio,
    type: "website",
  });

  return (
    <>
      {metadata}
      <div className="mt-13 container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/articles">
              <ArrowLeft className="size-4" />
              Back to Articles
            </Link>
          </Button>
        </div>

        {/* Author Header */}
        <div className="mb-8 rounded-xl bg-gray-50 p-8 dark:bg-gray-900">
          <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left">
            <img
              src={
                env.MODE === "development"
                  ? getImgSrc({
                      seed: getSeed(author.name),
                    })
                  : author.image
              }
              alt={author.name}
              className="mb-6 size-32 rounded-full object-cover md:mb-0 md:mr-8"
            />
            <div className="flex-1">
              <h1 className="mb-4 text-3xl font-bold">{author.name}</h1>
              <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
                {author.bio}
              </p>

              {/* Skills */}
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {author.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              {author.socialLinks && (
                <div className="flex gap-3">
                  {author.socialLinks.github && (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={author.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="size-4" />
                      </a>
                    </Button>
                  )}
                  {author.socialLinks.linkedin && (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={author.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="size-4" />
                      </a>
                    </Button>
                  )}
                  {author.socialLinks.twitter && (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={author.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="size-4" />
                      </a>
                    </Button>
                  )}
                  {author.socialLinks.website && (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={author.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="size-4" />
                      </a>
                    </Button>
                  )}
                </div>
              )}

              {/* Member Since */}
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="size-4" />
                <span>
                  Member since {format(author.createdAt, "MMMM yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Author's Articles */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Articles by {author.name}</h2>
            <span className="text-gray-600 dark:text-gray-300">
              {articles.length} article{articles.length !== 1 ? "s" : ""}
            </span>
          </div>

          {articles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.slug}`}
                  prefetch="intent"
                >
                  <ArticleCard article={article} index={index} />
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                  <ExternalLink className="size-8 text-gray-400" />
                </div>
                <CardTitle className="mb-2">No articles yet</CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  {author.name} hasn&apos;t published any articles yet. Check
                  back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
