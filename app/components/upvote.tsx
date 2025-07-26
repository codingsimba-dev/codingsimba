import React from "react";
import { Heart } from "lucide-react";
import { cn } from "~/utils/misc";
import { AnimatePresence, motion } from "framer-motion";
import { useFetcher } from "react-router";

export enum UpvoteIntent {
  UPVOTE_CONTENT = "UPVOTE_CONTENT",
  UPVOTE_COMMENT = "UPVOTE_COMMENT",
}

/**
 * Props for the UpvoteButton component
 */
interface UpvoteButtonProps {
  /** Total number of likes for the content */
  totalLikes: number;
  /** Number of likes the current user has given to this content */
  userLikes: number;
  /** Maximum number of likes a user can give to content */
  maxLikes?: number;
  /** Whether the current user has liked the content */
  isLiked: boolean;
  /** Unique identifier of the content being upvoted */
  itemId: string;
  /** Type of content being upvoted */
  contentType: "article" | "tutorial" | "comment";
  /** User ID for the current user */
  userId: string;
  /** Additional CSS classes to apply to the button */
  className?: string;
  /** Size variant of the button */
  size?: "sm" | "md" | "lg";
  /** Whether to show the "max" label when user reaches maximum likes */
  showMaxLabel?: boolean;
  /** Whether to show the floating "+1" animation when upvoting */
  showFloatingAnimation?: boolean;
}

/**
 * A reusable upvote button component with floating animation and like count display.
 *
 * Features:
 * - Displays total likes count
 * - Shows filled/unfilled heart icon based on user's like status
 * - Optional floating "+1" animation when clicked
 * - Optional "max" label when user reaches maximum likes
 * - Multiple size variants
 * - Disabled state support
 *
 * @example
 * ```tsx
 * <UpvoteButton
 *   totalLikes={42}
 *   isFilled={true}
 *   isDisabled={false}
 *   onUpvote={() => handleUpvote()}
 *   showMaxLabel={true}
 * />
 * ```
 */
export function Upvote({
  totalLikes,
  isLiked,
  userLikes,
  maxLikes = 5,
  itemId,
  contentType,
  userId,
  className,
  size = "md",
  showMaxLabel = true,
  showFloatingAnimation = true,
}: UpvoteButtonProps) {
  const [showFloating, setShowFloating] = React.useState(false);
  const [animationKey, setAnimationKey] = React.useState(0);
  const [optimisticState, setOptimisticState] = React.useState({
    totalLikes,
    userLikes,
  });
  const fetcher = useFetcher();

  // Update optimistic state when props change
  React.useEffect(() => {
    setOptimisticState({
      totalLikes,
      userLikes,
    });
  }, [totalLikes, userLikes]);

  const isDisabled = optimisticState.userLikes >= maxLikes;
  const isFilled = optimisticState.userLikes > 0 || isLiked;
  const isContent = contentType === "article" || contentType === "tutorial";

  /**
   * Handles the upvote button click with optimistic updates and floating animation
   */
  function handleUpvote() {
    if (isDisabled) return;

    // Optimistic update
    setOptimisticState((prev) => ({
      totalLikes: prev.totalLikes + 1,
      userLikes: prev.userLikes + 1,
    }));

    // Floating animation
    if (showFloatingAnimation) {
      setShowFloating(true);
      setAnimationKey((prev) => prev + 1);

      setTimeout(() => {
        setShowFloating(false);
      }, 1000);
    }

    // Submit form data
    fetcher.submit(
      {
        intent: isContent
          ? UpvoteIntent.UPVOTE_CONTENT
          : UpvoteIntent.UPVOTE_COMMENT,
        data: JSON.stringify({ itemId, userId }),
      },
      { method: "post" },
    );
  }
  /** Size classes for different button variants */
  const sizeClasses = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className="relative flex items-center">
      <button
        onClick={handleUpvote}
        disabled={isDisabled}
        className={cn(
          "hover:text-foreground text-muted-foreground flex items-center gap-1 transition-colors",
          className,
        )}
        aria-label="Upvote"
      >
        <Heart
          className={cn("transition-colors", sizeClasses[size], {
            "fill-red-500 text-red-500": isFilled,
            "hover:fill-red-500 hover:text-red-500": !isDisabled,
            "opacity-80": isDisabled,
          })}
        />
        <span className={textSizes[size]}>
          {optimisticState.totalLikes.toLocaleString()}
        </span>
        {showMaxLabel && isDisabled ? (
          <sub className={cn("text-muted-foreground text-xs", textSizes[size])}>
            max
          </sub>
        ) : null}
      </button>
      <AnimatePresence>
        {showFloating && (
          <motion.div
            key={animationKey}
            initial={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            animate={{
              opacity: 0,
              y: -40,
              scale: 1.2,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 1,
              ease: "easeOut",
            }}
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-2"
          >
            <span className="text-lg font-bold text-red-500">+1</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
