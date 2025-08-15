/**
 * DeleteComment Component
 *
 * Renders a delete button for a comment or reply, with permission checks,
 * loading state, and a confirmation dialog. Only users with the correct
 * permissions (owner or admin) will see the delete option.
 *
 * Features:
 * - Shows a delete icon/button if the user has permission.
 * - Displays a confirmation dialog before deletion.
 * - Shows a loading spinner while the delete action is in progress.
 * - Submits the delete action using a fetcher.
 *
 * Props:
 * - item: The comment or reply data object.
 * - contentType: "comment" | "reply" (for dialog text).
 * - className: Optional additional CSS classes.
 *
 * Usage:
 * ```tsx
 * <DeleteComment
 *   item={comment}
 *   contentType="comment"
 * />
 * ```
 */

import { Trash2, Loader } from "lucide-react";
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

interface CommentActionsProps {
  item: CommentData | ReplyData;
  contentType: "comment" | "reply";
  className?: string;
}

export function DeleteComment({
  item,
  contentType,
  className = "",
}: CommentActionsProps) {
  const user = useOptionalUser();
  const fetcher = useFetcher();

  const userId = user?.id;
  const isOwner = userId === item.authorId;
  const canDelete = userHasPermission(
    user,
    isOwner ? "DELETE:COMMENT:OWN" : "DELETE:COMMENT:ANY",
  );

  function deleteComment() {
    fetcher.submit(
      {
        intent: CommentIntent.DELETE_COMMENT,
        data: JSON.stringify({ userId, itemId: item.id }),
      },
      { method: "post" },
    );
  }

  const isDeleting =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("intent") === CommentIntent.DELETE_COMMENT;

  const buttonClasses = cn(
    "flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground",
    className,
  );

  return (
    <>
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
              <AlertDialogAction onClick={deleteComment}>Yes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
}
