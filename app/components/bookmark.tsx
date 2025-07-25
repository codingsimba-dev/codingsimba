import React from "react";
import { Bookmark, BookmarkCheck, Loader2, Plus, X, Tag } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { useFetcher } from "react-router";
import { cn } from "~/utils/misc";
import { useOptionalUser } from "~/hooks/user";

export enum BookmarkIntent {
  CREATE_BOOKMARK = "CREATE_BOOKMARK",
  UPDATE_BOOKMARK = "UPDATE_BOOKMARK",
  DELETE_BOOKMARK = "DELETE_BOOKMARK",
}

/**
 * Props for the BookmarkButton component
 */
interface BookmarkButtonProps {
  /** Unique identifier of the content to bookmark */
  itemId: string;
  /** Type of content being bookmarked */
  contentType: "article" | "tutorial";
  /** Whether the content is already bookmarked */
  isBookmarked: boolean;
  /** Size variant for the button */
  size?: "sm" | "md" | "lg";
  /** Whether to show text label */
  showText?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Existing bookmark data if already bookmarked */
  existingBookmark?: {
    id: string;
    notes?: string | null;
    tags?: string | null;
  };
}

/**
 * A comprehensive bookmark button component with tag and note management.
 *
 * This component provides a complete bookmarking interface with:
 * - Self-contained dialog with internal state management
 * - Tag input with autocomplete and chip display
 * - Optional notes textarea for additional context
 * - Loading states during form submission
 * - Form validation (at least one tag is required)
 * - Automatic dialog closure on successful submission
 * - Visual feedback for bookmarked vs unbookmarked states
 * - Edit functionality for existing bookmarks
 *
 * The component handles the entire bookmarking workflow, including:
 * - Opening/closing the dialog
 * - Managing form state (tags and notes)
 * - Submitting bookmark data via fetcher
 * - Resetting form on successful submission
 * - Tag management (add, remove, validation)
 *
 * @param {BookmarkButtonProps} props - Component configuration
 * @param {string} props.itemId - Unique identifier of the content to bookmark
 * @param {"article" | "tutorial"} props.contentType - Type of content being bookmarked
 * @param {boolean} props.isBookmarked - Whether content is already bookmarked
 * @param {"sm" | "md" | "lg"} [props.size="md"] - Size variant for the button
 * @param {boolean} [props.showText=true] - Whether to show text label
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.existingBookmark] - Existing bookmark data for editing
 *
 * @example
 * ```tsx
 * // Basic usage
 * <BookmarkButton
 *   itemId="article-123"
 *   isBookmarked={false}
 *   contentType="article"
 * />
 *
 * // Compact version without text
 * <BookmarkButton
 *   itemId="tutorial-456"
 *   isBookmarked={true}
 *   contentType="tutorial"
 *   size="sm"
 *   showText={false}
 * />
 *
 * // With existing bookmark data for editing
 * <BookmarkButton
 *   itemId="article-123"
 *   isBookmarked={true}
 *   contentType="article"
 *   existingBookmark={{
 *     id: "bookmark-123",
 *     notes: "Great article about React hooks",
 *     tags: "react,hooks,frontend"
 *   }}
 * />
 * ```
 *
 * @returns {JSX.Element} A bookmark button that opens a bookmarking dialog
 */
export function BookmarkButton({
  itemId,
  contentType,
  isBookmarked,
  size = "md",
  showText = true,
  className,
  existingBookmark,
}: BookmarkButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const fetcher = useFetcher();
  const user = useOptionalUser();

  const isPending = fetcher.state === "submitting";
  const canCloseDialog = fetcher.state === "idle" && fetcher.data?.success;

  React.useEffect(() => {
    if (existingBookmark) {
      setNotes(existingBookmark.notes || "");
      if (existingBookmark.tags) {
        setTags(
          existingBookmark.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        );
      }
    }
  }, [existingBookmark]);

  React.useEffect(() => {
    if (!open) {
      if (!existingBookmark) {
        setTags([]);
        setNotes("");
      }
      setTagInput("");
    }
  }, [open, existingBookmark]);

  React.useEffect(() => {
    if (canCloseDialog) {
      setOpen(false);
    }
  }, [canCloseDialog]);

  const sizeClasses = {
    sm: "h-8 px-2 text-xs",
    md: "h-9 px-3 text-sm",
    lg: "h-10 px-4 text-base",
  };

  const iconSizes = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5",
  };

  function handleAddTag() {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  }

  function handleSubmit() {
    if (tags.length === 0) return;
    const formData: Record<string, string> = {
      notes,
      userId: user?.id ?? "",
      tags: tags.join(","),
      itemId: existingBookmark?.id ?? itemId,
    };

    fetcher.submit(
      {
        intent: existingBookmark
          ? BookmarkIntent.UPDATE_BOOKMARK
          : BookmarkIntent.CREATE_BOOKMARK,
        data: JSON.stringify(formData),
      },
      { method: "post" },
    );
  }

  function handleDelete() {
    if (!existingBookmark) return;
    const formData: Record<string, string> = {
      userId: user?.id ?? "",
      itemId: existingBookmark.id,
    };
    fetcher.submit(
      {
        intent: BookmarkIntent.DELETE_BOOKMARK,
        data: JSON.stringify(formData),
      },
      { method: "post" },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={isPending}
          aria-label={isBookmarked ? "Edit bookmark" : "Add bookmark"}
          className={cn(
            "border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            sizeClasses[size],
            isBookmarked &&
              "bg-primary text-primary-foreground hover:bg-primary/90",
            className,
          )}
        >
          {isPending ? (
            <Loader2
              className={cn(
                iconSizes[size],
                "text-muted-foreground animate-spin",
              )}
            />
          ) : isBookmarked ? (
            <BookmarkCheck className={iconSizes[size]} />
          ) : (
            <Bookmark className={iconSizes[size]} />
          )}
          {showText && (
            <span>
              {isPending
                ? "Saving..."
                : isBookmarked
                  ? "Bookmarked"
                  : "Bookmark"}
            </span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingBookmark ? "Edit Bookmark" : "Add Bookmark"}
          </DialogTitle>
          <DialogDescription>
            {existingBookmark
              ? "Update your bookmark with new tags and notes."
              : `Save this ${contentType} to your bookmarks with tags and notes.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tags Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-muted ml-1 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyPress}
                maxLength={20}
                disabled={tags.length >= 10}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              {tags.length}/10 tags • Press Enter to add
            </p>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              placeholder={`Add notes about this ${contentType}...`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-muted-foreground text-xs">
              {notes.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {existingBookmark && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Delete Bookmark"
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || tags.length === 0}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : existingBookmark ? (
              "Update Bookmark"
            ) : (
              "Save Bookmark"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
