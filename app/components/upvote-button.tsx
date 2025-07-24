import React from "react";
import { Heart } from "lucide-react";
import { cn } from "~/utils/misc";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Props for the UpvoteButton component
 */
interface UpvoteButtonProps {
  /** Total number of likes for the content */
  totalLikes: number;
  /** Whether the current user has liked the content */
  isFilled: boolean;
  /** Whether the button should be disabled (e.g., user has reached max likes) */
  isDisabled: boolean;
  /** Callback function called when the upvote button is clicked */
  onUpvote: () => void;
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
export function UpvoteButton({
  totalLikes,
  isFilled,
  isDisabled,
  onUpvote,
  className,
  size = "md",
  showMaxLabel = false,
  showFloatingAnimation = true,
}: UpvoteButtonProps) {
  const [showFloating, setShowFloating] = React.useState(false);
  const [animationKey, setAnimationKey] = React.useState(0);

  /**
   * Handles the upvote button click with optional floating animation
   */
  const handleUpvote = () => {
    if (showFloatingAnimation) {
      setShowFloating(true);
      setAnimationKey((prev) => prev + 1);

      setTimeout(() => {
        setShowFloating(false);
      }, 1000);
    }

    onUpvote();
  };
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
        <span className={textSizes[size]}>{totalLikes.toLocaleString()}</span>
        {showMaxLabel && isDisabled ? (
          <sub className="text-muted-foreground">max</sub>
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
