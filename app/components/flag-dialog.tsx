import React from "react";
import { useFetcher } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/utils/misc";
import { Flag, Loader2 } from "lucide-react";
import { useOptionalUser } from "~/hooks/user";

/**
 * Available flag reasons for content moderation
 *
 * These reasons are used to categorize flagged content for review by moderators.
 * Each reason corresponds to a specific violation of community guidelines.
 */
export const flagReasons = [
  "spam",
  "inappropriate",
  "harassment",
  "misinformation",
  "copyright",
  "violence",
  "hate_speech",
  "adult_content",
  "scam",
  "other",
] as const;

/**
 * Size variants for the flag button icon
 *
 * Maps size prop to corresponding CSS classes for consistent sizing.
 */
const sizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

/**
 * Text size variants for the flag button label
 *
 * Maps size prop to corresponding text size classes.
 */
const textSizes = {
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
} as const;

/**
 * Props for the FlagDialog component
 *
 * @interface FlagDialogProps
 */
interface FlagDialogProps {
  /** Unique identifier of the content item being flagged */
  itemId: string;
  /** Whether the content has already been flagged by the current user */
  isFlagged: boolean;
  /** Type of content being flagged - determines the action intent and display text */
  contentType: "article" | "tutorial" | "comment" | "reply";
  /** Size variant for the flag button and icon */
  size?: "sm" | "md" | "lg";
  /** Whether to display the text label alongside the flag icon */
  showText?: boolean;
  /** Additional CSS classes to apply to the flag button */
  className?: string;
}

/**
 * A reusable dialog component for flagging content for moderation review.
 *
 * This component provides a complete flagging interface with:
 * - Self-contained dialog with internal state management
 * - Reason selection dropdown with predefined violation categories
 * - Optional details textarea for additional context
 * - Loading states during form submission
 * - Form validation (reason is required)
 * - Automatic dialog closure on successful submission
 * - Visual feedback for flagged vs unflaggged states
 *
 * The component handles the entire flagging workflow, including:
 * - Opening/closing the dialog
 * - Managing form state
 * - Submitting flag data via fetcher
 * - Resetting form on successful submission
 *
 * @param {FlagDialogProps} props - Component configuration
 * @param {string} props.itemId - Unique identifier of the content to flag
 * @param {boolean} props.isFlagged - Whether content is already flagged
 * @param {"article" | "tutorial" | "comment" | "reply"} props.contentType - Type of content being flagged
 * @param {"sm" | "md" | "lg"} [props.size="md"] - Size variant for the button
 * @param {boolean} [props.showText=true] - Whether to show text label
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FlagDialog
 *   itemId="article-123"
 *   isFlagged={false}
 *   contentType="article"
 * />
 *
 * // Compact version without text
 * <FlagDialog
 *   itemId="comment-456"
 *   isFlagged={true}
 *   contentType="comment"
 *   size="sm"
 *   showText={false}
 * />
 * ```
 *
 * @returns {JSX.Element} A flag button that opens a flagging dialog
 */
export function FlagDialog({
  itemId,
  contentType,
  isFlagged,
  size = "md",
  showText = true,
  className,
}: FlagDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [flagData, setFlagData] = React.useState({
    reason: "",
    details: "",
  });

  const fetcher = useFetcher();
  const user = useOptionalUser();
  const isPending = fetcher.state !== "idle";
  const shouldCloseDialog = fetcher.state === "idle";

  /**
   * Submits the flag data to the server
   *
   * Creates a form submission with the flag reason, details, and metadata
   * for processing by the moderation system.
   */
  function handleSubmit() {
    fetcher.submit(
      {
        intent: `flag-${contentType}`,
        data: JSON.stringify({
          itemId,
          userId: user?.id,
          reason: flagData.reason,
          details: flagData.details,
        }),
      },
      { method: "POST" },
    );
  }

  /**
   * Resets form data and closes dialog when submission completes
   *
   * Monitors the fetcher state and automatically closes the dialog
   * and resets form data when the submission is successful.
   */
  React.useEffect(() => {
    if (shouldCloseDialog) {
      setIsOpen(false);
      setFlagData({ reason: "", details: "" });
    }
  }, [shouldCloseDialog]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          disabled={isPending || isFlagged}
          aria-label={isFlagged ? "Remove flag" : "Flag content"}
          className={cn(
            "hover:text-foreground text-muted-foreground flex items-center space-x-1 transition-colors",
            className,
          )}
        >
          <Flag
            className={cn(sizeClasses[size], {
              "fill-red-500 text-red-500": isFlagged,
              "hover:fill-red-500 hover:text-red-500": !isFlagged,
            })}
          />
          {showText ? (
            <span className={textSizes[size]}>
              {isFlagged ? "Flagged" : "Flag"}
            </span>
          ) : null}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Flag this {contentType}</DialogTitle>
          <DialogDescription>
            Please select a reason for flagging this {contentType}.
          </DialogDescription>
        </DialogHeader>
        <Select
          value={flagData.reason}
          onValueChange={(value) => setFlagData({ ...flagData, reason: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Reason</SelectLabel>
              {flagReasons.map((reason) => (
                <SelectItem key={reason} value={reason} className="capitalize">
                  {reason.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Textarea
          value={flagData.details}
          onChange={(e) =>
            setFlagData({ ...flagData, details: e.target.value })
          }
          placeholder="Enter additional details (optional)"
          className="mt-4"
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !flagData.reason}
          >
            {`Flag ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`}
            {isPending ? (
              <Loader2 className="ml-2 size-4 animate-spin" />
            ) : null}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
