import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Send, X } from "lucide-react";
import { Button } from "../ui/button";
import { useOptionalUser } from "~/hooks/user";
import { MDXEditor } from "../mdx/editor";
import { getImgSrc, getInitials } from "~/utils/misc";

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
  onSubmit: handleFormSubmit,
}: CommentFormProps) {
  const hideSubmitButton = !comment.trim();
  const user = useOptionalUser();

  function onSubmit() {
    if (hideSubmitButton || !comment.trim()) return;
    handleFormSubmit();
  }

  return (
    <div className="mb-4 mt-2">
      <div className="flex w-full flex-1 flex-col items-start space-x-4 md:flex-row">
        {!isForUpdate ? (
          <Avatar className="border-border flex items-center justify-center border">
            <AvatarImage
              src={getImgSrc({
                fileKey: user?.image?.fileKey,
                seed: user?.name ?? "",
              })}
              alt={user!.name}
            />
            <AvatarFallback>{getInitials(user!.name)}</AvatarFallback>
          </Avatar>
        ) : null}
        <div className="flex w-full max-w-full flex-1 flex-col">
          <MDXEditor setValue={setComment} value={comment} />
          {!hideSubmitButton ? (
            <div className="mt-2 flex justify-end">
              {isForUpdate ? (
                <Button
                  size={"icon"}
                  onClick={onCancel}
                  className="mr-4 flex items-center gap-2"
                  variant={"destructive"}
                >
                  <X />
                </Button>
              ) : null}
              <Button
                type="submit"
                size={"icon"}
                disabled={hideSubmitButton}
                onClick={onSubmit}
                className="flex items-center gap-2"
              >
                <Send />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
