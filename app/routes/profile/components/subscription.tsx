import React from "react";
import type { Route } from "../+types/index";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { ChevronRight, CreditCard } from "lucide-react";
import { EmptyState } from "~/components/empty-state";
import { Link, useLoaderData, useNavigate } from "react-router";
import { format } from "date-fns";
import { cn } from "~/utils/misc";

export function Subscription() {
  const { subscription } = useLoaderData<Route.ComponentProps["loaderData"]>();
  const navigate = useNavigate();
  const statusesToCheck = ["canceled", "past_due", "unpaid"];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border-border bg-card mb-8 rounded-xl border shadow-sm">
        <div className="border-border border-b p-6">
          <h2 className="text-xl font-bold">Subscription Details</h2>
        </div>
        <div className="p-6">
          {!subscription ? (
            <EmptyState
              icon={<CreditCard className="size-8" />}
              title="No Subscription Found!"
              description="You don't have an active subscription."
              action={{
                label: "Subscribe Now",
                onClick: () => navigate("/subscription"),
              }}
            />
          ) : (
            <>
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {subscription.product.name} Plan
                    </div>
                    <div className="text-muted-foreground">
                      ${subscription.amount / 100} /{" "}
                      {subscription.recurringInterval}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-medium capitalize",
                      {
                        "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400":
                          subscription.status === "active",
                        "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400":
                          subscription.status === "canceled",
                        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400":
                          subscription.status === "incomplete",
                        "bg-muted text-muted-foreground":
                          subscription.status === "incomplete_expired",
                      },
                    )}
                  >
                    {subscription.status}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="border-border flex items-center justify-between border-b pb-4">
                  <div className="font-medium"> Started on</div>
                  <div>
                    {format(subscription.currentPeriodStart, "MMM d, yyyy")}
                  </div>
                </div>
                {subscription.currentPeriodEnd &&
                !subscription.cancelAtPeriodEnd ? (
                  <div className="border-border flex items-center justify-between border-b pb-4">
                    <div className="font-medium">Next billing date</div>
                    <div>
                      {format(subscription.currentPeriodEnd, "MMM d, yyyy")}
                    </div>
                  </div>
                ) : null}
                {statusesToCheck.includes(subscription.status) ? (
                  <div className="border-border flex items-center justify-between border-b pb-4">
                    <div className="font-medium">Ended on</div>
                    <div>
                      {subscription.endedAt
                        ? format(subscription.endedAt, "MMM d, yyyy")
                        : "N/A"}
                    </div>
                  </div>
                ) : null}
                {subscription.cancelAtPeriodEnd &&
                subscription.currentPeriodEnd ? (
                  <div className="border-border flex items-center justify-between border-b pb-4">
                    <div className="font-medium">
                      Subscription will be canceled on
                    </div>
                    <div>
                      {format(subscription.currentPeriodEnd, "MMM d, yyyy")}
                    </div>
                  </div>
                ) : null}
                <div className="border-border flex items-center justify-between border-b pb-4">
                  <div className="font-medium">Billing history</div>
                  <Link to={`/subscription/portal`} target="_blank">
                    <Button variant="link" className="h-auto p-0">
                      View all
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="flex justify-end gap-6">
                  <Link to={`/subscription/portal`} target="_blank">
                    <Button variant="outline">Manage Subscription</Button>
                  </Link>
                  <Link to={`/subscription/portal`} target="_blank">
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Cancel Subscription
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
