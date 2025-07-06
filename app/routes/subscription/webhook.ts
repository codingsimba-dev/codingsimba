import { Webhooks } from "@polar-sh/remix";
import type { Plan, SubscriptionType } from "~/generated/prisma";
import { prisma } from "~/utils/db.server";
import { invariant } from "~/utils/misc";

const planMap: Record<string, Plan> = {
  basic: "basic",
  premium: "premium",
  pro: "pro",
  "team starter": "team_starter",
  "team pro": "team_pro",
  "team enterprise": "team_enterprise",
};

export const action = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
  onSubscriptionUpdated: async (subscription) => {
    try {
      const data = subscription.data;
      invariant(data.id, "Subscription ID is required");
      invariant(data.product.name, "Product name is required");

      const productName = data.product.name.toLowerCase();
      const plan = planMap[productName] || "basic";

      const userId = data.metadata?.userId as string;
      const teamId = data.metadata?.teamId as string;

      invariant(userId || teamId, "User or team ID is required");

      const subscriptionData = {
        subscriptionId: data.id,
        status: data.status,
        type: (teamId ? "team" : "individual") as SubscriptionType,
        plan,
        ...(teamId ? { teamId } : { userId }),
        ...(data.currentPeriodEnd && {
          currentPeriodEnd: new Date(data.currentPeriodEnd),
        }),
        ...(data.currentPeriodStart && {
          currentPeriodStart: new Date(data.currentPeriodStart),
        }),
      };

      await prisma.subscription.upsert({
        where: { subscriptionId: data.id },
        create: subscriptionData,
        update: subscriptionData,
      });
      console.log("Subscription updated successfully:", data.id);
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  },

  onCustomerCreated: async (customer) => {
    try {
      const data = customer.data;
      invariant(data.id, "Customer ID is required");
      invariant(data.externalId, "Customer external ID is required");
      await prisma.user.update({
        where: { id: data.externalId },
        data: { polarCustomerId: data.id },
      });
      console.log("Updated user with Polar customer ID:", data.id);
    } catch (error) {
      console.error("Error updating user with Polar customer ID:", error);
    }
  },

  onCustomerDeleted: async (customer) => {
    try {
      const data = customer.data;
      invariant(data.id, "Customer ID is required");
      void prisma.user
        .delete({
          where: { polarCustomerId: data.id },
        })
        .catch(() => {});
      console.log("Customer deleted successfully:", data.id);
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  },

  onPayload: async (payload) => {
    console.log("Webhook received:", payload.type, payload.data?.id);
  },
});
