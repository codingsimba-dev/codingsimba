import type { Author } from "~/utils/content.server/authors/types";
import { ArrowBigRight, User } from "lucide-react";
import { Link } from "react-router";
import { SupportMeButton } from "~/components/ui/support-me-button";
import { Button } from "~/components/ui/button";
import { Badge } from "./ui/badge";
import { EmptyState } from "./empty-state";

export function Author({ author }: { author: Author }) {
  if (!author) {
    return (
      <EmptyState
        icon={<User className="size-8" />}
        title="No Author"
        description="No author found"
      />
    );
  }
  return (
    <div className="bg-muted/50 mb-8 rounded-xl p-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <div className="flex h-24 w-24 items-center justify-center">
          <img
            src={author.image}
            alt={author.name}
            width={96}
            className="min-h-24 min-w-24 rounded-full"
            loading="lazy"
          />
        </div>
        <div>
          <h3 className="mb-2 text-lg font-black">
            <span className="text-muted-foreground"> Written by</span>{" "}
            <Link
              to={`/authors/${encodeURIComponent(author.slug)}`}
              className="hover:text-primary transition-colors"
            >
              {author.name}
            </Link>
          </h3>
          <p className="text-muted-foreground">{author.bio}</p>
          <div className="my-4">
            <h3 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
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
