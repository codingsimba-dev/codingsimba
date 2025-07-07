import { CustomerPortal } from "@polar-sh/remix";
import type { Route } from "./+types/portal";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { redirectWithToast } from "~/utils/toast.server";
import { getErrorMessage, invariant } from "~/utils/misc";
import { logPortalAccess as logPortalAccessToDB } from "~/utils/subcription.server";

const { NODE_ENV } = process.env;

interface PortalMetrics {
  totalAccesses: number;
  successfulAccesses: number;
  failedAccesses: number;
  lastAccessedAt: Date;
}

const portalMetrics: PortalMetrics = {
  totalAccesses: 0,
  successfulAccesses: 0,
  failedAccesses: 0,
  lastAccessedAt: new Date(),
};

// Enhanced logging function that uses the generic DB logger
async function logPortalAccess(
  userId: string,
  success: boolean,
  error?: unknown,
) {
  await logPortalAccessToDB({
    success,
    error,
  });

  // Update in-memory metrics
  portalMetrics.totalAccesses++;
  if (success) {
    portalMetrics.successfulAccesses++;
  } else {
    portalMetrics.failedAccesses++;
  }
  portalMetrics.lastAccessedAt = new Date();
}

async function validatePortalAccess(userId: string) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "active",
      },
      select: { id: true, subscriptionId: true },
    });

    invariant(subscription, "No active subscription found");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { polarCustomerId: true },
    });

    invariant(user?.polarCustomerId, "No Polar customer ID found");

    return { subscription, polarCustomerId: user.polarCustomerId };
  } catch (error) {
    logPortalAccess(userId, false, error);
    throw error;
  }
}

export async function loader(loaderArgs: Route.LoaderArgs) {
  const { request } = loaderArgs;
  try {
    const userId = await requireUserId(request);
    await validatePortalAccess(userId);
    logPortalAccess(userId, true);

    return CustomerPortal({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      getCustomerId: async () => userId,
      server: NODE_ENV === "development" ? "sandbox" : "production",
    })(loaderArgs);
  } catch (error) {
    const errorMessage = getErrorMessage(error);

    try {
      const userId = await requireUserId(request);
      logPortalAccess(userId, false, error);
    } catch {
      console.error(
        "Portal access failed - user not authenticated:",
        errorMessage,
      );
    }

    const searchParams = new URLSearchParams({ tab: "Subscription" });
    throw redirectWithToast(`/profile?${searchParams.toString()}`, {
      type: "error",
      description: errorMessage,
    });
  }
}

export function getPortalMetrics(): PortalMetrics {
  return { ...portalMetrics };
}

export async function action() {
  return {
    status: "healthy",
    metrics: getPortalMetrics(),
    timestamp: new Date().toISOString(),
  };
}
