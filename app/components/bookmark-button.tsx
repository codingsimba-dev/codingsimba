import React from "react";
import { Bookmark } from "lucide-react";
import { cn } from "~/utils/misc";

/**
 * Props for the BookmarkButton component
 */
interface BookmarkButtonProps {
  /** Whether the content is currently bookmarked by the user */
  isBookmarked: boolean;
  /** Callback function called when the bookmark button is clicked */
  onBookmark: () => void;
  /** Additional CSS classes to apply to the button */
  className?: string;
  /** Size variant of the button */
  size?: "sm" | "md" | "lg";
  /** Whether to show text label alongside the bookmark icon */
  showText?: boolean;
  /** Whether the button should be disabled */
  isDisabled?: boolean;
}

/**
 * A reusable bookmark button component with visual feedback for bookmark status.
 *
 * Features:
 * - Displays filled/unfilled bookmark icon based on bookmark status
 * - Optional text label display
 * - Multiple size variants
 * - Disabled state support
 * - Hover effects and transitions
 *
 * @example
 * ```tsx
 * <BookmarkButton
 *   isBookmarked={true}
 *   onBookmark={() => handleBookmark()}
 *   showText={true}
 *   size="md"
 * />
 * ```
 */
export function BookmarkButton({
  isBookmarked,
  onBookmark,
  className,
  size = "md",
  showText = true,
  isDisabled = false,
}: BookmarkButtonProps) {
  /** Size classes for different button variants */
  const sizeClasses = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  };

  /** Text size classes for different button variants */
  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <button
      onClick={onBookmark}
      disabled={isDisabled}
      className={cn(
        "hover:text-foreground text-muted-foreground flex items-center space-x-1 transition-colors",
        className,
      )}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Bookmark
        className={cn(sizeClasses[size], {
          "fill-blue-500 text-blue-500": isBookmarked,
          "hover:fill-blue-500 hover:text-blue-500": !isBookmarked,
        })}
      />
      {showText && (
        <span className={textSizes[size]}>
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </span>
      )}
    </button>
  );
}
