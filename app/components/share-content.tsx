import React from "react";
import { Check, Copy, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router";
import type { Article } from "~/utils/content.server/articles/types";
import type { Tutorial } from "~/utils/content.server/turorials/types";
import { cn } from "~/utils/misc";
import { VisuallyHidden } from "./ui/visually-hidden";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

/**
 * Props for the Share component
 */
interface ShareProps {
  /** The content item to be shared (article or tutorial) */
  item: Article | Tutorial;
  /** The type of content being shared */
  itemType: "article" | "tutorial";
  /** Additional CSS classes for styling */
  className?: string;
}

/**
 * A comprehensive social sharing component for articles and tutorials.
 *
 * This component provides a complete sharing interface with:
 * - Multiple social media platforms (Reddit, Twitter/X, LinkedIn, Bluesky)
 * - Copy-to-clipboard functionality for direct link sharing
 * - Automatic URL generation based on content type
 * - Hashtag integration from content tags
 * - Visual feedback for successful actions
 * - Accessible design with screen reader support
 *
 * The component automatically generates sharing URLs for each platform
 * and handles the clipboard API for direct link copying.
 *
 * @param {ShareProps} props - Component configuration
 * @param {Article | Tutorial} props.item - The content item to share
 * @param {"article" | "tutorial"} props.itemType - Type of content
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * ```tsx
 * // Share an article
 * <Share
 *   item={articleData}
 *   itemType="article"
 *   className="my-4"
 * />
 *
 * // Share a tutorial
 * <Share
 *   item={tutorialData}
 *   itemType="tutorial"
 * />
 * ```
 *
 * @returns {JSX.Element} A social sharing interface with multiple platform options
 */
export function Share({ item, itemType, className }: ShareProps) {
  const [copied, setCopied] = React.useState(false);

  const shareText = item.title;

  const shareUrl = `https://tekbreed.com/${itemType === "article" ? "articles" : "tutorials"}/${itemType === "article" ? item.slug : item.id}`;
  const shareHashtags =
    item.tags
      ?.map((tag) => tag.slug)
      .join(",")
      .replace(/-/g, "_") || "";

  const shareViaReddit = `https://www.reddit.com/submit?url=${encodeURIComponent(
    shareUrl,
  )}&title=${encodeURIComponent(shareText)}`;

  const shareViaTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText,
  )}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(
    shareHashtags,
  )}&via=tekbreed`;

  const shareViaLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl,
  )}&title=${encodeURIComponent(shareText)}`;

  const shareViaBluesky = `https://bsky.app/intent/compose?text=${encodeURIComponent(
    shareText,
  )}%20${encodeURIComponent(shareUrl)}`;

  /**
   * Copies the share URL to the user's clipboard
   *
   * Uses the modern Clipboard API when available and provides
   * visual feedback by setting the copied state to true for 2 seconds.
   *
   * @returns {void}
   *
   * @returns {() => void} Cleanup function to clear the timeout
   */
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
          <ShareToReddit shareViaReddit={shareViaReddit} />
          <ShareToTwitter shareViaTwitter={shareViaTwitter} />
          <ShareToBluesky shareViaBluesky={shareViaBluesky} />
          <ShareToLinkedIn shareViaLinkedIn={shareViaLinkedIn} />
          <CopyLink copyToClipboard={copyToClipboard} copied={copied} />
        </div>
      </div>
    </section>
  );
}

/**
 * Props for the ShareToReddit component
 */
interface ShareToRedditProps {
  /** The pre-formatted Reddit sharing URL */
  shareViaReddit: string;
}

/**
 * Reddit sharing button component
 *
 * Opens Reddit's submit page with pre-filled content and URL.
 * Uses Reddit's official sharing API for optimal user experience.
 *
 * @param {ShareToRedditProps} props - Component props
 * @param {string} props.shareViaReddit - Pre-formatted Reddit sharing URL
 *
 * @returns {JSX.Element} A button that opens Reddit's submit page
 */
function ShareToReddit({ shareViaReddit }: ShareToRedditProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        asChild
        className="border-border flex size-9 items-center justify-center rounded-full border p-2"
      >
        <Link to={shareViaReddit} target="_blank">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="100"
            height="100"
            viewBox="0 0 48 48"
            className="h-4 w-4"
          >
            <path
              d="M 26.982422 4 A 1.50015 1.50015 0 0 0 25.53125 5.1933594 L 23.267578 16.056641 C 18.506267 16.191332 14.224863 17.604342 10.955078 19.900391 C 10.074583 19.382721 9.1001578 19 8 19 C 4.7041348 19 2 21.704135 2 25 C 2 27.200293 3.2381442 29.068794 5.015625 30.107422 C 5.057351 34.081578 7.3252158 37.61154 10.753906 40.060547 C 14.214444 42.532301 18.878002 44 24 44 C 29.121998 44 33.785556 42.532301 37.246094 40.060547 C 40.674784 37.61154 42.942649 34.081578 42.984375 30.107422 C 44.761856 29.068794 46 27.200293 46 25 C 46 21.704135 43.295865 19 40 19 C 38.899842 19 37.925417 19.382721 37.044922 19.900391 C 34.142824 17.862533 30.438975 16.54803 26.308594 16.177734 L 28.167969 7.25 L 34.126953 8.3847656 C 34.521571 9.885206 35.877358 11 37.5 11 C 39.43 11 41 9.43 41 7.5 C 41 5.57 39.43 4 37.5 4 C 36.343507 4 35.323173 4.5703812 34.685547 5.4375 L 27.28125 4.0273438 A 1.50015 1.50015 0 0 0 26.982422 4 z M 24 19 C 28.860322 19 33.181616 20.532907 36.074219 22.833984 A 1.50015 1.50015 0 0 0 38.009766 22.777344 C 38.555219 22.289378 39.234684 22 40 22 C 41.674135 22 43 23.325865 43 25 C 43 26.327215 42.148302 27.416873 40.960938 27.822266 A 1.50015 1.50015 0 0 0 39.951172 29.371094 C 39.976627 29.662669 40 29.869 40 30 C 40 32.884575 38.375166 35.566894 35.501953 37.619141 C 32.62874 39.671387 28.543002 41 24 41 C 19.456998 41 15.37126 39.671387 12.498047 37.619141 C 9.6248341 35.566894 8 32.884575 8 30 C 8 29.869 8.0233731 29.662669 8.0488281 29.371094 A 1.50015 1.50015 0 0 0 7.0390625 27.822266 C 5.8516972 27.416873 5 26.327215 5 25 C 5 23.325865 6.3258652 22 8 22 C 8.7653157 22 9.4447805 22.289378 9.9902344 22.777344 A 1.50015 1.50015 0 0 0 11.925781 22.833984 C 14.818384 20.532907 19.139678 19 24 19 z M 16.5 23 C 15.125 23 13.903815 23.569633 13.128906 24.441406 C 12.353997 25.313179 12 26.416667 12 27.5 C 12 28.583333 12.353997 29.686821 13.128906 30.558594 C 13.903815 31.430367 15.125 32 16.5 32 C 17.875 32 19.096185 31.430367 19.871094 30.558594 C 20.646003 29.686821 21 28.583333 21 27.5 C 21 26.416667 20.646003 25.313179 19.871094 24.441406 C 19.096185 23.569633 17.875 23 16.5 23 z M 31.5 23 C 30.125 23 28.903815 23.569633 28.128906 24.441406 C 27.353997 25.313179 27 26.416667 27 27.5 C 27 28.583333 27.353997 29.686821 28.128906 30.558594 C 28.903815 31.430367 30.125 32 31.5 32 C 32.875 32 34.096185 31.430367 34.871094 30.558594 C 35.646003 29.686821 36 28.583333 36 27.5 C 36 26.416667 35.646003 25.313179 34.871094 24.441406 C 34.096185 23.569633 32.875 23 31.5 23 z M 16.5 26 C 17.124999 26 17.403816 26.180367 17.628906 26.433594 C 17.853997 26.686821 18 27.083333 18 27.5 C 18 27.916667 17.853997 28.313179 17.628906 28.566406 C 17.403816 28.819633 17.124999 29 16.5 29 C 15.875001 29 15.596184 28.819633 15.371094 28.566406 C 15.146003 28.313179 15 27.916667 15 27.5 C 15 27.083333 15.146003 26.686821 15.371094 26.433594 C 15.596184 26.180367 15.875001 26 16.5 26 z M 31.5 26 C 32.124999 26 32.403816 26.180367 32.628906 26.433594 C 32.853997 26.686821 33 27.083333 33 27.5 C 33 27.916667 32.853997 28.313179 32.628906 28.566406 C 32.403816 28.819633 32.124999 29 31.5 29 C 30.875001 29 30.596184 28.819633 30.371094 28.566406 C 30.146003 28.313179 30 27.916667 30 27.5 C 30 27.083333 30.146003 26.686821 30.371094 26.433594 C 30.596184 26.180367 30.875001 26 31.5 26 z M 30.486328 33.978516 A 1.50015 1.50015 0 0 0 29.439453 34.439453 C 29.439453 34.439453 29.176818 34.729613 28.298828 35.142578 C 27.420838 35.555543 26.027889 35.998047 24 35.998047 C 21.972111 35.998047 20.579162 35.555543 19.701172 35.142578 C 18.823182 34.729613 18.560547 34.439453 18.560547 34.439453 A 1.50015 1.50015 0 0 0 17.484375 33.984375 A 1.50015 1.50015 0 0 0 16.439453 36.560547 C 16.439453 36.560547 17.176818 37.270887 18.423828 37.857422 C 19.670838 38.443957 21.527889 38.998047 24 38.998047 C 26.472111 38.998047 28.329162 38.443957 29.576172 37.857422 C 30.823182 37.270887 31.560547 36.560547 31.560547 36.560547 A 1.50015 1.50015 0 0 0 30.486328 33.978516 z"
              className="fill-foreground"
            />
          </svg>
          <VisuallyHidden>Share on Reddit</VisuallyHidden>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>Share on Reddit</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Props for the ShareToLinkedIn component
 */
interface ShareToLinkedInProps {
  /** The pre-formatted LinkedIn sharing URL */
  shareViaLinkedIn: string;
}

/**
 * LinkedIn sharing button component
 *
 * Opens LinkedIn's sharing dialog with pre-filled content and URL.
 * Uses LinkedIn's official sharing API for optimal user experience.
 *
 * @param {ShareToLinkedInProps} props - Component props
 * @param {string} props.shareViaLinkedIn - Pre-formatted LinkedIn sharing URL
 *
 * @returns {JSX.Element} A button that opens LinkedIn's sharing dialog
 */
function ShareToLinkedIn({ shareViaLinkedIn }: ShareToLinkedInProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        asChild
        className="border-border flex size-9 items-center justify-center rounded-full border p-2"
      >
        <Link to={shareViaLinkedIn} target="_blank">
          <Linkedin className="size-4" />
          <VisuallyHidden>Share on LinkedIn</VisuallyHidden>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>Share on LinkedIn</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Props for the ShareToTwitter component
 */
interface ShareToTwitterProps {
  /** The pre-formatted Twitter/X sharing URL */
  shareViaTwitter: string;
}

/**
 * Twitter/X sharing button component
 *
 * Opens Twitter's compose dialog with pre-filled content, URL, and hashtags.
 * Uses Twitter's official sharing API and includes the @tekbreed handle.
 *
 * @param {ShareToTwitterProps} props - Component props
 * @param {string} props.shareViaTwitter - Pre-formatted Twitter sharing URL
 *
 * @returns {JSX.Element} A button that opens Twitter's compose dialog
 */
function ShareToTwitter({ shareViaTwitter }: ShareToTwitterProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        asChild
        className="border-border flex size-9 items-center justify-center rounded-full border p-2"
      >
        <Link to={shareViaTwitter} target="_blank">
          <Twitter className="size-4" />
          <VisuallyHidden>Share on Twitter</VisuallyHidden>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>Share on Twitter</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Props for the ShareToBluesky component
 */
interface ShareToBlueskyProps {
  /** The pre-formatted Bluesky sharing URL */
  shareViaBluesky: string;
}

/**
 * Bluesky sharing button component
 *
 * Opens Bluesky's compose dialog with pre-filled content and URL.
 * Uses Bluesky's official sharing API for optimal user experience.
 *
 * @param {ShareToBlueskyProps} props - Component props
 * @param {string} props.shareViaBluesky - Pre-formatted Bluesky sharing URL
 *
 * @returns {JSX.Element} A button that opens Bluesky's compose dialog
 */
function ShareToBluesky({ shareViaBluesky }: ShareToBlueskyProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        asChild
        className="border-border flex size-9 items-center justify-center rounded-full border p-2"
      >
        <Link to={shareViaBluesky} target="_blank">
          <svg
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            id="Bluesky--Streamline-Simple-Icons"
            className="h-4 w-4"
          >
            <desc>Bluesky Streamline Icon: https://streamlinehq.com</desc>
            <title>Bluesky</title>
            <path
              d="M12 10.8c-1.087 -2.114 -4.046 -6.053 -6.798 -7.995C2.566 0.944 1.561 1.266 0.902 1.565 0.139 1.908 0 3.08 0 3.768c0 0.69 0.378 5.65 0.624 6.479 0.815 2.736 3.713 3.66 6.383 3.364 0.136 -0.02 0.275 -0.039 0.415 -0.056 -0.138 0.022 -0.276 0.04 -0.415 0.056 -3.912 0.58 -7.387 2.005 -2.83 7.078 5.013 5.19 6.87 -1.113 7.823 -4.308 0.953 3.195 2.05 9.271 7.733 4.308 4.267 -4.308 1.172 -6.498 -2.74 -7.078a8.741 8.741 0 0 1 -0.415 -0.056c0.14 0.017 0.279 0.036 0.415 0.056 2.67 0.297 5.568 -0.628 6.383 -3.364 0.246 -0.828 0.624 -5.79 0.624 -6.478 0 -0.69 -0.139 -1.861 -0.902 -2.206 -0.659 -0.298 -1.664 -0.62 -4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"
              className="fill-foreground"
              strokeWidth="1"
            />
          </svg>
          <VisuallyHidden>Share on Bluesky</VisuallyHidden>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>Share on Bluesky</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Props for the CopyLink component
 */
interface CopyLinkProps {
  /** Function to handle copying the link to clipboard */
  copyToClipboard: () => void;
  /** Whether the link has been successfully copied */
  copied: boolean;
}

/**
 * Copy link button component
 *
 * Provides a button to copy the current page URL to the user's clipboard.
 * Shows visual feedback with a checkmark icon when the link is successfully copied.
 * The copied state automatically resets after 2 seconds.
 *
 * @param {CopyLinkProps} props - Component props
 * @param {() => void} props.copyToClipboard - Function to copy link to clipboard
 * @param {boolean} props.copied - Whether the link has been copied
 *
 * @returns {JSX.Element} A button that copies the current URL to clipboard
 */
function CopyLink({ copyToClipboard, copied }: CopyLinkProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={copyToClipboard}
        className="border-border flex size-9 items-center justify-center rounded-full border p-2"
      >
        {copied ? (
          <Check className="size-4 font-bold text-blue-500" />
        ) : (
          <Copy className="size-4" />
        )}
        <VisuallyHidden>Copy link</VisuallyHidden>
      </TooltipTrigger>
      <TooltipContent>
        <p>Copy link</p>
      </TooltipContent>
    </Tooltip>
  );
}
