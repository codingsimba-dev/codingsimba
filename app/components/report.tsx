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
 * Intent types for report operations
 *
 * These constants define the different actions that can be performed
 * on content through the reporting system.
 */
export enum ReportIntent {
  /** Report a comment for moderation */
  REPORT_COMMENT = "REPORT_COMMENT",
  /** Report content (articles or tutorials) for moderation */
  REPORT_CONTENT = "REPORT_CONTENT",
  /** Delete/remove an existing report */
  DELETE_REPORT = "DELETE_REPORT",
}

/**
 * Available flag reasons for content moderation
 *
 * These reasons are used to categorize flagged content for review by moderators.
 * Each reason corresponds to a specific violation of community guidelines.
 * The reasons are displayed in a user-friendly format in the UI.
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
 * Maps size prop to corresponding CSS classes for consistent sizing
 * across different contexts where the report button is used.
 */
const sizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

/**
 * Text size variants for the flag button label
 *
 * Maps size prop to corresponding text size classes for consistent
 * typography across different button sizes.
 */
const textSizes = {
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
} as const;

/**
 * Props for the Report component
 *
 * @interface ReportButtonProps
 */
interface ReportButtonProps {
  /** Unique identifier of the content item being flagged */
  itemId: string;
  /** Whether the content has already been flagged by the current user */
  isReported: boolean;
  /** Type of content being flagged - determines the action intent and display text */
  contentType: "article" | "tutorial" | "comment";
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
 * - Form validation (reason is required for new reports)
 * - Automatic dialog closure on successful submission
 * - Visual feedback for flagged vs unflaggged states
 * - Support for both creating and removing reports
 *
 * The component handles the entire flagging workflow, including:
 * - Opening/closing the dialog
 * - Managing form state (reason and details)
 * - Submitting flag data via fetcher
 * - Resetting form on successful submission
 * - Dynamic content based on report status
 * - Proper intent mapping for different content types
 *
 * @param {ReportButtonProps} props - Component configuration
 * @param {string} props.itemId - Unique identifier of the content to flag
 * @param {boolean} props.isReported - Whether content is already flagged
 * @param {"article" | "tutorial" | "comment"} props.contentType - Type of content being flagged
 * @param {"sm" | "md" | "lg"} [props.size="md"] - Size variant for the button
 * @param {boolean} [props.showText=true] - Whether to show text label
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * ```tsx
 * // Basic usage for new report
 * <Report
 *   itemId="article-123"
 *   isReported={false}
 *   contentType="article"
 * />
 *
 * // Compact version without text
 * <Report
 *   itemId="comment-456"
 *   isReported={true}
 *   contentType="comment"
 *   size="sm"
 *   showText={false}
 * />
 *
 * // With custom styling
 * <Report
 *   itemId="tutorial-789"
 *   isReported={false}
 *   contentType="tutorial"
 *   className="my-custom-class"
 * />
 * ```
 *
 * @returns {JSX.Element} A flag button that opens a flagging dialog
 */
export function Report({
  itemId,
  contentType,
  isReported,
  size = "md",
  showText = true,
  className,
}: ReportButtonProps) {
  /** State for controlling dialog visibility */
  const [isOpen, setIsOpen] = React.useState(false);
  /** State for managing form data */
  const [flagData, setFlagData] = React.useState({
    reason: "",
    details: "",
  });

  const fetcher = useFetcher();
  const user = useOptionalUser();
  const isPending = fetcher.state !== "idle";
  const canCloseDialog = fetcher.state === "idle";
  /** Whether this is content (article/tutorial) vs comment */
  const isContent = contentType === "article" || contentType === "tutorial";

  /**
   * Submits the flag data to the server
   *
   * Creates a form submission with the flag reason, details, and metadata
   * for processing by the moderation system. The intent is determined based on:
   * - Whether this is a new report or removing an existing one
   * - The type of content being reported (content vs comment)
   *
   * The form data includes:
   * - itemId: The ID of the content being flagged
   * - userId: The ID of the user submitting the flag
   * - reason: The selected reason for flagging (for new reports)
   * - details: Additional context provided by the user (for new reports)
   */
  function handleSubmit() {
    const intent = isReported
      ? ReportIntent.DELETE_REPORT
      : isContent
        ? ReportIntent.REPORT_CONTENT
        : ReportIntent.REPORT_COMMENT;
    fetcher.submit(
      {
        intent,
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
   * and resets form data when the submission is successful. This ensures
   * a clean state for the next interaction.
   */
  React.useEffect(() => {
    if (canCloseDialog) {
      setIsOpen(false);
      setFlagData({ reason: "", details: "" });
    }
  }, [canCloseDialog]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          disabled={isPending}
          aria-label={isReported ? "Delete report" : "Report content"}
          className={cn(
            "hover:text-foreground text-muted-foreground flex items-center space-x-1 transition-colors",
            className,
          )}
        >
          <Flag
            className={cn(sizeClasses[size], {
              "fill-red-500 text-red-500": isReported,
              "hover:fill-red-500 hover:text-red-500": !isReported,
            })}
          />
          {showText ? (
            <span className={textSizes[size]}>
              {isReported ? "Reported" : "Report"}
            </span>
          ) : null}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReported
              ? `Remove report for this ${contentType}`
              : `Report this ${contentType}`}
          </DialogTitle>
          <DialogDescription>
            {isReported
              ? `Are you sure you want to remove your report for this ${contentType}?`
              : `Please select a reason for reporting this ${contentType}.`}
          </DialogDescription>
        </DialogHeader>
        {!isReported && (
          <>
            <Select
              value={flagData.reason}
              onValueChange={(value) =>
                setFlagData({ ...flagData, reason: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Reason</SelectLabel>
                  {flagReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason.replace("_", " ").toLocaleUpperCase()}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="space-y-2">
              <Textarea
                value={flagData.details}
                onChange={(e) =>
                  setFlagData({ ...flagData, details: e.target.value })
                }
                placeholder="Enter additional details (optional)"
                maxLength={500}
                rows={3}
              />
              <p className="text-muted-foreground text-xs">
                {flagData.details.length}/500 characters
              </p>
            </div>
          </>
        )}
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
            disabled={isPending || (!isReported && !flagData.reason)}
            variant={isReported ? "destructive" : "default"}
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            {isReported
              ? `Remove Report`
              : `Report ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
