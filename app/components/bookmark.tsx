import React from "react";
import { Bookmark as BookmarkIcon, Loader2, Plus, X, Tag } from "lucide-react";
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

/**
 * Intent types for bookmark operations
 *
 * These constants define the different actions that can be performed
 * on bookmarks through the form submission system.
 */
export enum BookmarkIntent {
  /** Create a new bookmark with tags and notes */
  CREATE_BOOKMARK = "CREATE_BOOKMARK",
  /** Update an existing bookmark's tags and notes */
  UPDATE_BOOKMARK = "UPDATE_BOOKMARK",
  /** Delete an existing bookmark */
  DELETE_BOOKMARK = "DELETE_BOOKMARK",
}

/**
 * Props for the Bookmark component
 *
 * @interface BookmarkButtonProps
 */
interface BookmarkButtonProps {
  /** Unique identifier of the content to bookmark (Sanity ID for new bookmarks, bookmark ID for updates) */
  itemId: string;
  /** Type of content being bookmarked - determines the display text and validation */
  contentType: "article" | "tutorial";
  /** Whether the content is already bookmarked by the current user */
  isBookmarked: boolean;
  /** Size variant for the button styling */
  size?: "sm" | "md" | "lg";
  /** Whether to display the text label alongside the bookmark icon */
  showText?: boolean;
  /** Additional CSS classes to apply to the button */
  className?: string;
  /** Existing bookmark data for editing - includes tags and notes */
  existingBookmark?: {
    /** Unique identifier of the bookmark */
    id: string;
    /** Optional notes associated with the bookmark */
    notes?: string | null;
    /** Array of tags associated with the bookmark */
    bookmarkTags?: {
      tag: {
        name: string;
      };
    }[];
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
 * - Delete functionality for existing bookmarks
 *
 * The component handles the entire bookmarking workflow, including:
 * - Opening/closing the dialog
 * - Managing form state (tags and notes)
 * - Submitting bookmark data via fetcher
 * - Resetting form on successful submission
 * - Tag management (add, remove, validation)
 * - Loading state management for different operations
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
 * // Basic usage for new bookmark
 * <Bookmark
 *   itemId="article-123"
 *   isBookmarked={false}
 *   contentType="article"
 * />
 *
 * // Compact version without text
 * <Bookmark
 *   itemId="tutorial-456"
 *   isBookmarked={true}
 *   contentType="tutorial"
 *   size="sm"
 *   showText={false}
 * />
 *
 * // With existing bookmark data for editing
 * <Bookmark
 *   itemId="article-123"
 *   isBookmarked={true}
 *   contentType="article"
 *   existingBookmark={{
 *     id: "bookmark-123",
 *     notes: "Great article about React hooks",
 *     bookmarkTags: [
 *       { tag: { name: "react" } },
 *       { tag: { name: "hooks" } }
 *     ]
 *   }}
 * />
 * ```
 *
 * @returns {JSX.Element} A bookmark button that opens a bookmarking dialog
 */
export function Bookmark({
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

  const intent = fetcher.formData?.get("intent");
  const isPending = fetcher.state !== "idle";
  const data = fetcher.data;
  const isSuccess = data && data?.success === true && fetcher.state === "idle";

  /**
   * Initialize form data when existing bookmark is provided
   *
   * Populates the form fields with existing bookmark data when editing
   * an existing bookmark, including notes and tags.
   */
  React.useEffect(() => {
    if (existingBookmark) {
      setNotes(existingBookmark.notes || "");
      if (existingBookmark.bookmarkTags?.length) {
        setTags(existingBookmark.bookmarkTags.map((bt) => bt.tag.name));
      }
    }
  }, [existingBookmark]);

  /**
   * Handle successful form submission
   *
   * Closes the dialog and resets form data when a successful submission
   * is detected. Only resets form data for new bookmarks, preserving
   * existing data for edits.
   */
  React.useEffect(() => {
    if (isSuccess) {
      setOpen(false);
      if (!existingBookmark) {
        setTags([]);
        setNotes("");
      }
      setTagInput("");
    }
  }, [isSuccess, existingBookmark]);

  /** CSS classes for different button sizes */
  const sizeClasses = {
    sm: "h-8 px-2 text-xs",
    md: "h-9 px-3 text-sm",
    lg: "h-10 px-4 text-base",
  };

  /** Icon sizes for different button variants */
  const iconSizes = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5",
  };

  /** Maximum number of tags allowed per bookmark */
  const TAG_LIMIT = 5;

  /**
   * Adds a new tag to the bookmark
   *
   * Validates the tag input and adds it to the tags array if it's:
   * - Not empty after trimming
   * - Not already in the tags array
   * - Within the tag limit
   *
   * @param {string} tagInput - The tag input value to process
   */
  function handleAddTag() {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < TAG_LIMIT) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  }

  /**
   * Removes a tag from the bookmark
   *
   * @param {string} tagToRemove - The tag to remove from the tags array
   */
  function handleRemoveTag(tagToRemove: string) {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  }

  /**
   * Handles keyboard events for tag input
   *
   * Allows users to press Enter to add a tag, providing a better UX
   * for keyboard navigation.
   *
   * @param {React.KeyboardEvent} e - The keyboard event
   */
  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  }

  /**
   * Submits the bookmark form data
   *
   * Creates or updates a bookmark with the current tags and notes.
   * Validates that at least one tag is present before submission.
   * Uses different intents for create vs update operations.
   */
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

  /**
   * Deletes an existing bookmark
   *
   * Removes the bookmark from the database. Only available for
   * existing bookmarks, not for new ones.
   */
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
      <DialogTrigger
        disabled={isPending}
        aria-label={isBookmarked ? "Edit bookmark" : "Add bookmark"}
        className={cn("flex items-center", sizeClasses[size], className)}
      >
        {isPending ? (
          <Loader2
            className={cn(
              iconSizes[size],
              "text-muted-foreground mr-1 animate-spin",
            )}
          />
        ) : (
          <BookmarkIcon
            className={cn(
              iconSizes[size],
              "text-muted-foreground hover:text-muted-foreground mr-1 size-4 transition-colors",
              { "fill-blue-500 text-blue-500": isBookmarked },
            )}
          />
        )}
        {showText && <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>}
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
                disabled={tags.length >= TAG_LIMIT}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= TAG_LIMIT}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              {tags.length}/{TAG_LIMIT} tags • Press Enter to add
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
              Delete
              {isPending && intent === BookmarkIntent.DELETE_BOOKMARK ? (
                <Loader2 className="ml-2 size-4 animate-spin" />
              ) : null}
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
            {existingBookmark ? "Update" : "Save"}
            {isPending &&
            (intent === BookmarkIntent.CREATE_BOOKMARK ||
              intent === BookmarkIntent.UPDATE_BOOKMARK) ? (
              <Loader2 className="ml-2 size-4 animate-spin" />
            ) : null}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
