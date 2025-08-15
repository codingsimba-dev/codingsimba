/**
 * UpdateComment Component
 *
 * Renders an edit button for a comment or reply, with permission checks,
 * loading state, and submission logic. Only users with the correct
 * permissions (owner or admin) will see the edit option.
 *
 * Features:
 * - Shows an edit icon/button if the user has permission.
 * - Displays a loading spinner while the update action is in progress.
 * - Submits the update action using a fetcher.
 *
 * Props:
 * - item: The comment or reply data object.
 * - body: The updated text content for the comment or reply.
 * - contentType: "comment" | "reply" (for accessibility and display).
 * - className: Optional additional CSS classes.
 *
 * Usage:
 * ```tsx
 * <UpdateComment
 *   item={comment}
 *   body={updatedBody}
 *   contentType="comment"
 * />
 * ```
 */

import { FilePenLine, Loader } from "lucide-react";
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
  onUpdate: () => void;
  className?: string;
}

export function UpdateComment({
  item,
  contentType,
  onUpdate,
  className = "",
}: CommentActionsProps) {
  const user = useOptionalUser();
  const fetcher = useFetcher({ key: CommentIntent.UPDATE_COMMENT });

  const userId = user?.id;
  const isOwner = userId === item.authorId;
  const canUpdate = userHasPermission(
    user,
    isOwner ? "UPDATE:COMMENT:OWN" : "UPDATE:COMMENT:ANY",
  );

  const isUpdating =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("intent") === CommentIntent.UPDATE_COMMENT &&
    JSON.parse(fetcher.formData?.get("data") as string).itemId === item.id;

  return (
    <>
      {canUpdate ? (
        <button
          onClick={onUpdate}
          disabled={isUpdating}
          className={cn(
            "text-muted-foreground hover:text-foreground flex items-center space-x-1 text-sm",
            className,
          )}
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
    </>
  );
}
