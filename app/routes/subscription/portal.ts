import type { Route } from "./+types/portal";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { redirectWithToast } from "~/utils/toast.server";
import { getErrorMessage } from "~/utils/misc";
import { createCustomerSession } from "~/utils/subcription.server";
import { redirect } from "react-router";

async function validatePortalAccess(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (!subscription) {
    throw new Error("You don't have an active subscription");
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const userId = await requireUserId(request);
    await validatePortalAccess(userId);
    const session = await createCustomerSession(userId);
    return redirect(session.customerPortalUrl);
  } catch (error) {
    const searchParams = new URLSearchParams({ tab: "Subscription" });
    throw await redirectWithToast(`/profile?${searchParams.toString()}`, {
      type: "error",
      description: getErrorMessage(error),
    });
  }
}
