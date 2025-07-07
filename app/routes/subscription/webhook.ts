import { Webhooks } from "@polar-sh/remix";
import type { Plan, SubscriptionType } from "~/generated/prisma";
import { prisma } from "~/utils/db.server";
import { invariant } from "~/utils/misc";
import { logWebhookEvent as logWebhookEventToDB } from "~/utils/subcription.server";

interface WebhookMetrics {
  totalReceived: number;
  successful: number;
  failed: number;
  lastProcessedAt: Date;
}

const webhookMetrics: WebhookMetrics = {
  totalReceived: 0,
  successful: 0,
  failed: 0,
  lastProcessedAt: new Date(),
};

const planMap: Record<string, Plan> = {
  basic: "basic",
  premium: "premium",
  pro: "pro",
  team_starter: "team_starter",
  team_pro: "team_pro",
  team_enterprise: "team_enterprise",
};

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 15000];

async function logWebhookEvent(
  event: string,
  data: unknown,
  success: boolean,
  error?: unknown,
) {
  await logWebhookEventToDB({
    event,
    data,
    success,
    error,
  });

  webhookMetrics.totalReceived++;
  if (success) {
    webhookMetrics.successful++;
  } else {
    webhookMetrics.failed++;
  }
  webhookMetrics.lastProcessedAt = new Date();
}

async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAYS[attempt]),
      );
      console.warn(
        `Retrying ${operationName}, attempt ${attempt + 1}/${maxRetries + 1}`,
      );
    }
  }

  throw lastError;
}

export function getWebhookMetrics(): WebhookMetrics {
  return { ...webhookMetrics };
}

export async function loader() {
  return {
    status: "healthy",
    metrics: getWebhookMetrics(),
    timestamp: new Date().toISOString(),
  };
}

export const action = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,

  onSubscriptionUpdated: async (subscription) => {
    try {
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
      logWebhookEvent("subscription_updated", data, true);
      console.log("Subscription updated successfully:", data.id);
    } catch (error) {
      logWebhookEvent("subscription_updated", subscription.data, false, error);
      console.error("Error updating subscription:", error);
      throw error;
    }
  },

  onCustomerCreated: async (customer) => {
    try {
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

      logWebhookEvent("customer_created", data, true);
      console.log("Updated user with Polar customer ID:", data.id);
    } catch (error) {
      logWebhookEvent("customer_created", customer.data, false, error);
      console.error("Error updating user with Polar customer ID:", error);
      throw error;
    }
  },

  onCustomerDeleted: async (customer) => {
    try {
      const data = customer.data;
      invariant(data.id, "Customer ID is required");

      await withRetry(
        () =>
          prisma.user.delete({
            where: { polarCustomerId: data.id },
          }),
        `customer deleted for ${data.id}`,
      );

      logWebhookEvent("customer_deleted", data, true);
      console.log("Customer deleted successfully:", data.id);
    } catch (error) {
      logWebhookEvent("customer_deleted", customer.data, false, error);
      console.error("Error deleting customer:", error);
      throw error;
    }
  },

  onPayload: async (payload) => {
    logWebhookEvent("payload_received", payload.data, true);
    console.log("Webhook received:", payload.type, payload.data?.id);
  },
});
