import React from "react";
import { Heart } from "lucide-react";
import { cn } from "~/utils/misc";
import { AnimatePresence, motion } from "framer-motion";
import { useFetcher } from "react-router";

/**
 * Intent types for upvote operations
 *
 * These constants define the different actions that can be performed
 * on content through the upvote system.
 */
export enum UpvoteIntent {
  /** Upvote content (articles or tutorials) */
  UPVOTE_CONTENT = "UPVOTE_CONTENT",
  /** Upvote comments */
  UPVOTE_COMMENT = "UPVOTE_COMMENT",
}

/**
 * Props for the Upvote component
 *
 * @interface UpvoteButtonProps
 */
interface UpvoteButtonProps {
  /** Total number of likes for the content across all users */
  totalLikes: number;
  /** Number of likes the current user has given to this content */
  userLikes: number;
  /** Maximum number of likes a user can give to content (default: 5) */
  maxLikes?: number;
  /** Whether the current user has liked the content */
  isLiked: boolean;
  /** Unique identifier of the content being upvoted */
  itemId: string;
  /** Type of content being upvoted - determines the action intent */
  contentType: "article" | "tutorial" | "comment";
  /** User ID for the current user */
  userId: string;
  /** Additional CSS classes to apply to the button */
  className?: string;
  /** Size variant of the button for consistent styling */
  size?: "sm" | "md" | "lg";
  /** Whether to show the "max" label when user reaches maximum likes */
  showMaxLabel?: boolean;
  /** Whether to show the floating "+1" animation when upvoting */
  showFloatingAnimation?: boolean;
}

/**
 * A reusable upvote button component with optimistic updates and floating animation.
 *
 * This component provides a complete upvoting interface with:
 * - Optimistic UI updates for immediate feedback
 * - Floating "+1" animation on successful upvotes
 * - Heart icon that fills based on user's like status
 * - Maximum like limit enforcement with visual feedback
 * - Multiple size variants for different contexts
 * - Loading states during form submission
 * - Automatic form submission to server
 *
 * The component handles the entire upvoting workflow, including:
 * - Optimistic state management for immediate UI feedback
 * - Form submission with proper intent mapping
 * - Animation management for visual feedback
 * - Disabled state when maximum likes reached
 * - Heart icon styling based on like status
 *
 * @param {UpvoteButtonProps} props - Component configuration
 * @param {number} props.totalLikes - Total likes across all users
 * @param {number} props.userLikes - Current user's like count
 * @param {number} [props.maxLikes=5] - Maximum likes allowed per user
 * @param {boolean} props.isLiked - Whether user has liked the content
 * @param {string} props.itemId - Unique identifier of the content
 * @param {"article" | "tutorial" | "comment"} props.contentType - Type of content
 * @param {string} props.userId - Current user's ID
 * @param {string} [props.className] - Additional CSS classes
 * @param {"sm" | "md" | "lg"} [props.size="md"] - Size variant
 * @param {boolean} [props.showMaxLabel=true] - Whether to show max label
 * @param {boolean} [props.showFloatingAnimation=true] - Whether to show animation
 *
 * @example
 * ```tsx
 * // Basic usage for content
 * <Upvote
 *   totalLikes={42}
 *   userLikes={2}
 *   isLiked={true}
 *   itemId="article-123"
 *   contentType="article"
 *   userId="user-456"
 * />
 *
 * // Compact version for comments
 * <Upvote
 *   totalLikes={5}
 *   userLikes={1}
 *   isLiked={true}
 *   itemId="comment-789"
 *   contentType="comment"
 *   userId="user-456"
 *   size="sm"
 *   showMaxLabel={false}
 * />
 * ```
 *
 * @returns {JSX.Element} An upvote button with optimistic updates and animations
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
  /** State for controlling floating animation visibility */
  const [showFloating, setShowFloating] = React.useState(false);
  /** Key for forcing animation re-render */
  const [animationKey, setAnimationKey] = React.useState(0);
  /** Optimistic state for immediate UI updates */
  const [optimisticState, setOptimisticState] = React.useState({
    totalLikes,
    userLikes,
  });
  const fetcher = useFetcher();

  /**
   * Update optimistic state when props change
   *
   * Synchronizes the optimistic state with the actual props
   * to ensure consistency when external data updates.
   */
  React.useEffect(() => {
    setOptimisticState({
      totalLikes,
      userLikes,
    });
  }, [totalLikes, userLikes]);

  /** Whether the button should be disabled (user reached max likes) */
  const isDisabled = optimisticState.userLikes >= maxLikes;
  /** Whether the heart should be filled (user has liked the content) */
  const isFilled = optimisticState.userLikes > 0 || isLiked;
  /** Whether this is content (article/tutorial) vs comment */
  const isContent = contentType === "article" || contentType === "tutorial";

  /**
   * Handles the upvote button click with optimistic updates and floating animation
   *
   * Performs the following actions:
   * 1. Validates that user hasn't reached maximum likes
   * 2. Updates optimistic state immediately for UI feedback
   * 3. Triggers floating animation if enabled
   * 4. Submits form data to server with appropriate intent
   *
   * The optimistic update provides immediate visual feedback while
   * the server request processes in the background.
   */
  function handleUpvote() {
    if (isDisabled) return;

    // Optimistic update for immediate UI feedback
    setOptimisticState((prev) => ({
      totalLikes: prev.totalLikes + 1,
      userLikes: prev.userLikes + 1,
    }));

    // Floating animation for visual feedback
    if (showFloatingAnimation) {
      setShowFloating(true);
      setAnimationKey((prev) => prev + 1);

      setTimeout(() => {
        setShowFloating(false);
      }, 1000);
    }

    // Submit form data to server
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

  /** CSS classes for different button sizes */
  const sizeClasses = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  };

  /** Text sizes for different button variants */
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
          <sub className={cn("text-muted-foreground !text-xs")}>max</sub>
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
