import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Loader, Send, X } from "lucide-react";
import { Button } from "../ui/button";
import { useOptionalUser } from "~/hooks/user";
import { MDXEditor } from "../mdx/editor";
import { getImgSrc, getInitials, useRequireAuth } from "~/utils/misc";
import { useFetcher } from "react-router";
import { anonymous, anonymousSeed, CommentIntent } from ".";

type CommentFormProps = {
  isForUpdate?: boolean;
  comment: string;
  setComment: (comment: string) => void;
  onCancel?: () => void;
  onSubmit: () => void;
  isPending?: boolean;
};

export function CommentForm({
  isForUpdate = false,
  comment,
  setComment,
  onCancel,
  onSubmit,
}: CommentFormProps) {
  const user = useOptionalUser();
  const requireAuth = useRequireAuth();
  const fetcher = useFetcher({
    key: isForUpdate ? CommentIntent.UPDATE_COMMENT : CommentIntent.ADD_COMMENT,
  });

  const disableSubmitButton = !comment.trim() && !!user;

  const intent =
    fetcher.formData?.get("intent") ===
    (isForUpdate ? CommentIntent.UPDATE_COMMENT : CommentIntent.ADD_COMMENT);

  const isAdding = fetcher.state !== "idle" && intent;

  return (
    <div className="mb-4 mt-2">
      <div className="flex w-full flex-1 flex-col items-start space-x-4 md:flex-row">
        {!isForUpdate ? (
          <Avatar className="border-border flex items-center justify-center border">
            <AvatarImage
              src={getImgSrc({
                fileKey: user?.image?.fileKey,
                seed: user?.name ?? anonymousSeed,
              })}
              alt={user?.name}
            />
            <AvatarFallback>
              {getInitials(user?.name ?? anonymous)}
            </AvatarFallback>
          </Avatar>
        ) : null}
        <div className="flex w-full max-w-full flex-1 flex-col">
          <MDXEditor setValue={setComment} value={comment} />

          <div className="mt-2 flex justify-end gap-4">
            {isForUpdate ? (
              <Button
                size={"icon"}
                onClick={onCancel}
                disabled={disableSubmitButton || isAdding}
                variant={"destructive"}
              >
                <X />
              </Button>
            ) : null}
            <Button
              type="submit"
              size={user ? "icon" : "sm"}
              disabled={disableSubmitButton || isAdding}
              onClick={() => requireAuth(onSubmit)}
            >
              {isAdding ? (
                <Loader className="animate-spin" />
              ) : user ? (
                <Send />
              ) : (
                "Sign In to add a comment"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
