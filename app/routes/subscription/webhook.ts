import { Webhooks } from "@polar-sh/remix";
import type { Plan, SubscriptionType } from "~/generated/prisma/client";
import { prisma } from "~/utils/db.server";
import { withRetry } from "~/utils/misc.server";
import { invariant } from "~/utils/misc";

const planMap: Record<string, Plan> = {
  basic: "basic",
  premium: "premium",
  pro: "pro",
  team_starter: "team_starter",
  team_pro: "team_pro",
  team_enterprise: "team_enterprise",
};

export const action = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,

  onSubscriptionUpdated: async (subscription) => {
    const data = subscription.data;

    invariant(data.id, "Subscription ID is required");
    invariant(data.product.name, "Product name is required");

    const productName = data.product.name
      .toLowerCase()
      .trim()
      .replace(" ", "_");
    const plan = planMap[productName] || "basic";

    const userId = data.metadata?.userId as string;
    const teamId = data.metadata?.teamId || undefined;

    invariant(userId, "User ID is required");

    const subscriptionData = {
      subscriptionId: data.id,
      status: data.status,
      type: (teamId ? "team" : "individual") as SubscriptionType,
      plan,
      userId,
      ...(teamId && { teamId: teamId as string }),
      ...(data.currentPeriodEnd && {
        currentPeriodEnd: new Date(data.currentPeriodEnd),
      }),
      ...(data.currentPeriodStart && {
        currentPeriodStart: new Date(data.currentPeriodStart),
      }),
    };

    await withRetry(
      () =>
        prisma.subscription.upsert({
          where: { subscriptionId: data.id },
          create: subscriptionData,
          update: subscriptionData,
        }),
      `subscription upsert for ${data.id}`,
    );
  },

  onCustomerCreated: async (customer) => {
    const data = customer.data;
    invariant(data.id, "Customer ID is required");
    invariant(data.externalId, "Customer external ID is required");
    await withRetry(
      () =>
        prisma.user.update({
          where: { id: data.externalId as string },
          data: { polarCustomerId: data.id },
        }),
      `customer created for ${data.id}`,
    );
  },

  onCustomerDeleted: async (customer) => {
    const data = customer.data;
    invariant(data.id, "Customer ID is required");

    await withRetry(
      () =>
        prisma.user.delete({
          where: { polarCustomerId: data.id },
        }),
      `customer deleted for ${data.id}`,
    );
  },

  onPayload: async (payload) => {
    console.log("Webhook received:", payload.type, payload.data?.id);
  },
});
