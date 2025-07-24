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

/**
 * Props for the CommentActions component
 */
interface CommentActionsProps {
  /** Whether the user can edit the content */
  canUpdate: boolean;
  /** Whether the user can delete the content */
  canDelete: boolean;
  /** Whether the content is currently being updated */
  isUpdating: boolean;
  /** Whether the content is currently being deleted */
  isDeleting: boolean;
  /** Type of content for display purposes */
  contentType: "comment" | "reply";
  /** Function to handle edit action */
  onEdit: () => void;
  /** Function to handle delete action */
  onDelete: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable component for comment and reply edit/delete actions
 *
 * This component provides consistent edit and delete functionality
 * for both comments and replies, with proper loading states and
 * confirmation dialogs.
 *
 * @param {CommentActionsProps} props - Component configuration
 * @param {boolean} props.canUpdate - Whether user can edit the content
 * @param {boolean} props.canDelete - Whether user can delete the content
 * @param {boolean} props.isUpdating - Whether content is being updated
 * @param {boolean} props.isDeleting - Whether content is being deleted
 * @param {"comment" | "reply"} props.contentType - Type of content for display
 * @param {() => void} props.onEdit - Function to handle edit action
 * @param {() => void} props.onDelete - Function to handle delete action
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * ```tsx
 * <CommentActions
 *   canUpdate={canUpdate}
 *   canDelete={canDelete}
 *   isUpdating={isUpdating}
 *   isDeleting={isDeleting}
 *   contentType="comment"
 *   onEdit={() => setEditMode(true)}
 *   onDelete={handleDelete}
 * />
 * ```
 *
 * @returns {JSX.Element} Edit and delete action buttons
 */
export function CommentActions({
  canUpdate,
  canDelete,
  isUpdating,
  isDeleting,
  contentType,
  onEdit,
  onDelete,
  className = "",
}: CommentActionsProps) {
  const buttonClasses = cn(
    "flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground",
    className,
  );

  return (
    <>
      {canUpdate ? (
        <button
          onClick={onEdit}
          disabled={isUpdating}
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
