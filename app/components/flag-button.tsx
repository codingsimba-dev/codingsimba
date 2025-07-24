import React from "react";
import { Flag } from "lucide-react";
import { cn } from "~/utils/misc";

/**
 * Props for the FlagButton component
 */
interface FlagButtonProps {
  /** Whether the content is currently flagged by the user */
  isFlagged?: boolean;
  /** Callback function called when the flag button is clicked */
  onFlag: () => void;
  /** Additional CSS classes to apply to the button */
  className?: string;
  /** Size variant of the button */
  size?: "sm" | "md" | "lg";
  /** Whether to show text label alongside the flag icon */
  showText?: boolean;
  /** Whether the button should be disabled */
  isDisabled?: boolean;
}

/**
 * A reusable flag button component with visual feedback for flag status.
 *
 * Features:
 * - Displays filled/unfilled flag icon based on flag status
 * - Optional text label display
 * - Multiple size variants
 * - Disabled state support
 * - Hover effects and transitions
 *
 * @example
 * ```tsx
 * <FlagButton
 *   isFlagged={true}
 *   onFlag={() => handleFlag()}
 *   showText={true}
 *   size="md"
 * />
 * ```
 */
export function FlagButton({
  isFlagged = false,
  onFlag,
  className,
  size = "md",
  showText = true,
  isDisabled = false,
}: FlagButtonProps) {
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
      onClick={onFlag}
      disabled={isDisabled}
      className={cn(
        "hover:text-foreground text-muted-foreground flex items-center space-x-1 transition-colors",
        className,
      )}
      aria-label={isFlagged ? "Remove flag" : "Flag content"}
    >
      <Flag
        className={cn(sizeClasses[size], {
          "fill-red-500 text-red-500": isFlagged,
          "hover:fill-red-500 hover:text-red-500": !isFlagged,
        })}
      />
      {showText && (
        <span className={textSizes[size]}>
          {isFlagged ? "Flagged" : "Flag"}
        </span>
      )}
    </button>
  );
}
