import type { Author } from "~/utils/content.server/authors/types";
import { ArrowBigRight, Twitter, Globe, Github, Linkedin } from "lucide-react";
import { Link } from "react-router";
import { SupportMeButton } from "~/components/ui/support-me-button";
import { Button } from "~/components/ui/button";
import { Badge } from "./ui/badge";
import { getImgSrc, getSeed } from "~/utils/misc";

export function Author({ author }: { author: Author }) {
  if (!author) {
    return <div>No Author</div>;
  }
  return (
    <div className="mb-8 rounded-xl bg-gray-50 p-6 dark:bg-gray-900">
      <div className="flex items-start gap-4">
        <div className="hidden flex-col sm:flex">
          <div className="flex h-24 w-24 items-center justify-center">
            <img
              src={
                env.MODE === "development"
                  ? getImgSrc({
                      path: "users",
                      seed: getSeed(author.name),
                    })
                  : author.image
              }
              alt={author.name}
              width={96}
              className="min-h-24 min-w-24 rounded-full"
              loading="lazy"
            />
          </div>
          <div className="mt-6">
            {author.socialLinks && (
              <div className="grid grid-cols-2 gap-3">
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
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-lg font-black">
            <span className="text-gray-500"> Written by</span>{" "}
            <Link
              to={`/authors/${encodeURIComponent(author.slug)}`}
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              {author.name}
            </Link>
          </h3>
          <p className="text-gray-600 dark:text-gray-300">{author.bio}</p>
          <div className="my-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {author.skills?.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <SupportMeButton />
            <Button aria-label="Learn more about me" variant={"ghost"} asChild>
              <Link
                to={`/authors/${encodeURIComponent(author.slug)}`}
                prefetch="intent"
              >
                Read more of my articles
                <ArrowBigRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
