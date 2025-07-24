import React from "react";
import { Check, Copy, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import type { Article } from "~/utils/content.server/articles/types";
import type { Tutorial } from "~/utils/content.server/turorials/types";
import { cn } from "~/utils/misc";

export function Share({
  item,
  itemType,
  className,
}: {
  item: Article | Tutorial;
  itemType: "article" | "tutorial";
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const shareText = item.title;

  const shareUrl = `https://tekbreed.com/${itemType === "article" ? "articles" : "tutorials"}/${itemType === "article" ? item.slug : item.id}`;
  const shareHashtags =
    item.tags
      ?.map((tag) => tag.slug)
      .join(",")
      .replace(/-/g, "_") || "";

  const shareViaTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText,
  )}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(
    shareHashtags,
  )}&via=tekbreed`;

  const shareViaLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl,
  )}&title=${encodeURIComponent(shareText)}`;

  function copyToClipboard() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
      });
    }

    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => {
      window.clearTimeout(timeout);
    };
  }

  return (
    <section
      className={cn("border-border mb-8 border-b border-t py-6", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="font-medium">
          Share this {itemType === "article" ? "article" : "tutorial"}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            asChild
          >
            <Link to={shareViaTwitter} target="_blank">
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Share on Twitter</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            asChild
          >
            <Link to={shareViaLinkedIn} target="_blank">
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">Share on LinkedIn</span>
            </Link>
          </Button>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            {copied ? (
              <Check className="h-4 w-4 font-bold text-blue-500" />
            ) : (
              <Copy className="size-4" />
            )}
            <span className="sr-only">Copy link</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
