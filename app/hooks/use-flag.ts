import { useFetcher } from "react-router";
import { useOptionalUser } from "~/hooks/user";

/**
 * Hook for handling content flagging functionality
 *
 * @param itemId - Unique identifier of the content to be flagged
 * @param type - Type of content being flagged
 * @returns Object with flagging state and handlers
 *
 * @example
 * ```tsx
 * const { isPending, handleFlag } = useFlag("article-123", "article");
 * ```
 */
export function useFlag(
  itemId: string,
  type: "article" | "tutorial" | "comment" | "reply",
) {
  const user = useOptionalUser();
  const userId = user?.id;
  const fetcher = useFetcher();

  const intent = `flag-${type}`;

  /**
   * Handles flag submission with reason and details
   */
  const handleFlag = (reason: string, details: string) => {
    fetcher.submit(
      {
        intent,
        data: JSON.stringify({
          itemId,
          userId: userId!,
          reason,
          details,
        }),
      },
      { method: "post" },
    );
  };

  return {
    isPending:
      fetcher.state === "submitting" &&
      fetcher.formData?.get("intent") === intent &&
      fetcher.formData?.get("itemId") === itemId,
    error: fetcher.data?.error,
    handleFlag,
  };
}
