import React from "react";
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
import { useFlag } from "~/hooks/use-flag";
import { cn } from "~/utils/misc";
import { Flag } from "lucide-react";

/**
 * Available flag reasons for content moderation
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
 * Size variants for the flag button
 */
const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

const textSizes = {
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
} as const;

/**
 * Props for the FlagDialog component
 */
interface FlagDialogProps {
  /** ID of the item being flagged */
  itemId: string;
  /** Whether the content is already flagged */
  isFlagged: boolean;
  /** Type of content being flagged */
  contentType: "article" | "tutorial" | "comment" | "reply";
  /** Size of the flag button */
  size?: "sm" | "md" | "lg";
  /** Whether to show text label */
  showText?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A reusable dialog component for flagging content.
 *
 * Features:
 * - Self-contained dialog with internal state management
 * - Reason selection dropdown
 * - Optional details textarea
 * - Loading states during submission
 * - Form validation
 *
 * @example
 * ```tsx
 * <FlagDialog
 *   itemId="article-123"
 *   isFlagged={false}
 *   contentType="article"
 *   size="md"
 *   showText={true}
 * />
 * ```
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

  const { isPending, handleFlag } = useFlag(itemId, contentType);

  /**
   * Handles the flag submission and resets form data
   */
  const handleSubmit = () => {
    handleFlag(flagData.reason, flagData.details);
    setFlagData({ reason: "", details: "" });
    setIsOpen(false);
  };

  /**
   * Resets form data when dialog opens
   */
  React.useEffect(() => {
    if (isOpen) {
      setFlagData({ reason: "", details: "" });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          disabled={isPending}
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
          {showText && (
            <span className={textSizes[size]}>
              {isFlagged ? "Flagged" : "Flag"}
            </span>
          )}
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
            {isPending
              ? "Flagging..."
              : `Flag ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
