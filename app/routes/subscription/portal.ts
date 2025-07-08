import { CustomerPortal } from "@polar-sh/remix";
import type { Route } from "./+types/portal";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { redirectWithToast } from "~/utils/toast.server";
import { getErrorMessage } from "~/utils/misc";

const { NODE_ENV } = process.env;

async function validatePortalAccess(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    select: { id: true },
  });

  if (!subscription) {
    throw redirectWithToast(`/profile?tab=Subscription`, {
      type: "error",
      description: "You don't have an active subscription",
    });
  }
  return { subscription };
}

export async function loader(loaderArgs: Route.LoaderArgs) {
  const { request } = loaderArgs;
  try {
    const userId = await requireUserId(request);
    await validatePortalAccess(userId);
    return CustomerPortal({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      getCustomerId: async () => userId,
      server: NODE_ENV === "development" ? "sandbox" : "production",
    })(loaderArgs);
  } catch (error) {
    const searchParams = new URLSearchParams({ tab: "Subscription" });
    throw redirectWithToast(`/profile?${searchParams.toString()}`, {
      type: "error",
      description: getErrorMessage(error),
    });
  }
}
