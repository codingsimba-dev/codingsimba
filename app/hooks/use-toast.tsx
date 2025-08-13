import React from "react";
import type { Toast } from "~/utils/toast.server";
import { toast } from "sonner";

export function useToast(toastSession?: Toast | null) {
  React.useEffect(() => {
    if (toastSession) {
      window.setTimeout(() => {
        toast[toastSession.type](toastSession.title, {
          id: toastSession.id,
          description: toastSession.description,
        });
      }, 0);
    }
  }, [toastSession]);
}
