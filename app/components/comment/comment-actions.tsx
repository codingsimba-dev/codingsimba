import React from "react";
import { FilePenLine, Trash2, Loader } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { cn } from "~/utils/misc";
import { userHasPermission } from "~/utils/permissions";
import { useOptionalUser } from "~/hooks/user";
import type { CommentData } from "./comment";
import type { ReplyData } from "./reply";
import { useFetcher } from "react-router";
import { CommentIntent } from ".";

/**
 * Props for the CommentActions component
 */
interface CommentActionsProps {
  /** The item to display actions for */
  item: CommentData | ReplyData;
  /** Type of content for display purposes */
  contentType: "comment" | "reply";
  /** Additional CSS classes */
  className?: string;
  /** Function to handle update */
  onUpdate?: () => void;
  /** Function to handle delete */
  onDelete?: () => void;
}

/**
 * Reusable component for comment and reply edit/delete actions
 *
 * This component provides consistent edit and delete functionality
 * for both comments and replies, with proper loading states and
 * confirmation dialogs.
 *
 * @param {CommentActionsProps} props - Component configuration
 * @param {"comment" | "reply"} props.contentType - Type of content for display
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * ```tsx
 * <CommentActions
 *   contentType="comment"
 * />
 * ```
 *
 * @returns {JSX.Element} Edit and delete action buttons
 */
export function CommentActions({
  item,
  onUpdate = () => {},
  onDelete = () => {},
  contentType,
  className = "",
}: CommentActionsProps) {
  const fetcher = useFetcher();
  const user = useOptionalUser();

  const userId = user?.id;
  const isOwner = userId === item.authorId;
  const canDelete = userHasPermission(
    user,
    isOwner ? "DELETE:COMMENT:OWN" : "DELETE:COMMENT:ANY",
  );
  const canUpdate = userHasPermission(
    user,
    isOwner ? "UPDATE:COMMENT:OWN" : "UPDATE:COMMENT:ANY",
  );

  const isUpdating =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("intent") === CommentIntent.UPDATE_COMMENT;
  const isDeleting =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("intent") === CommentIntent.DELETE_COMMENT;

  const buttonClasses = cn(
    "flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground",
    className,
  );

  return (
    <>
      {canUpdate ? (
        <button
          onClick={onUpdate}
          disabled={isUpdating || isDeleting}
          className={buttonClasses}
          aria-label={
            isUpdating ? `updating ${contentType}` : `update ${contentType}`
          }
        >
          {isUpdating ? (
            <Loader className="mr-1 size-4 animate-spin" />
          ) : (
            <FilePenLine className="text-primary mr-1 size-4" />
          )}
          Edit
        </button>
      ) : null}
      {canDelete ? (
        <AlertDialog>
          <AlertDialogTrigger disabled={isDeleting} className={buttonClasses}>
            {isDeleting ? (
              <Loader className="mr-1 size-4 animate-spin" />
            ) : (
              <Trash2 className="text-destructive mr-1 size-4" />
            )}
            Delete
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this {contentType}?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Yes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
}
