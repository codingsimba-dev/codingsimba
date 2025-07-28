// import React from "react";
// import type { Route } from "../+types/index";
// import { motion } from "framer-motion";
// import { Button } from "~/components/ui/button";
// import { ChevronRight, CreditCard } from "lucide-react";
// import { EmptyState } from "~/components/empty-state";
// import { Link, useLoaderData, useNavigate } from "react-router";
// import { format } from "date-fns";
// import { cn } from "~/utils/misc";

// export function Subscription() {
//   const { subscription } = useLoaderData<Route.ComponentProps["loaderData"]>();
//   const navigate = useNavigate();
//   const statusesToCheck = ["canceled", "past_due", "unpaid"];
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//     >
//       <div className="border-border bg-card mb-8 rounded-xl border shadow-sm">
//         <div className="border-border border-b p-6">
//           <h2 className="text-xl font-bold">Subscription Details</h2>
//         </div>
//         <div className="p-6">
//           {!subscription ? (
//             <EmptyState
//               icon={<CreditCard className="size-8" />}
//               title="No Subscription Found!"
//               description="You don't have an active subscription."
//               action={{
//                 label: "Subscribe Now",
//                 onClick: () => navigate("/subscription"),
//               }}
//             />
//           ) : (
//             <>
//               <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
//                       {subscription.product.name} Plan
//                     </div>
//                     <div className="text-muted-foreground">
//                       ${subscription.amount / 100} /{" "}
//                       {subscription.recurringInterval}
//                     </div>
//                   </div>
//                   <div
//                     className={cn(
//                       "rounded-full px-3 py-1 text-sm font-medium capitalize",
//                       {
//                         "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400":
//                           subscription.status === "active",
//                         "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400":
//                           subscription.status === "canceled",
//                         "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400":
//                           subscription.status === "incomplete",
//                         "bg-muted text-muted-foreground":
//                           subscription.status === "incomplete_expired",
//                       },
//                     )}
//                   >
//                     {subscription.status}
//                   </div>
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <div className="border-border flex items-center justify-between border-b pb-4">
//                   <div className="font-medium"> Started on</div>
//                   <div>
//                     {format(subscription.currentPeriodStart, "MMM d, yyyy")}
//                   </div>
//                 </div>
//                 {subscription.currentPeriodEnd &&
//                 !subscription.cancelAtPeriodEnd ? (
//                   <div className="border-border flex items-center justify-between border-b pb-4">
//                     <div className="font-medium">Next billing date</div>
//                     <div>
//                       {format(subscription.currentPeriodEnd, "MMM d, yyyy")}
//                     </div>
//                   </div>
//                 ) : null}
//                 {statusesToCheck.includes(subscription.status) ? (
//                   <div className="border-border flex items-center justify-between border-b pb-4">
//                     <div className="font-medium">Ended on</div>
//                     <div>
//                       {subscription.endedAt
//                         ? format(subscription.endedAt, "MMM d, yyyy")
//                         : "N/A"}
//                     </div>
//                   </div>
//                 ) : null}
//                 {subscription.cancelAtPeriodEnd &&
//                 subscription.currentPeriodEnd ? (
//                   <div className="border-border flex items-center justify-between border-b pb-4">
//                     <div className="font-medium">
//                       Subscription will be canceled on
//                     </div>
//                     <div>
//                       {format(subscription.currentPeriodEnd, "MMM d, yyyy")}
//                     </div>
//                   </div>
//                 ) : null}
//                 <div className="border-border flex items-center justify-between border-b pb-4">
//                   <div className="font-medium">Billing history</div>
//                   <Link to={`/subscription/portal`} target="_blank">
//                     <Button variant="link" className="h-auto p-0">
//                       View all
//                       <ChevronRight className="ml-1 h-4 w-4" />
//                     </Button>
//                   </Link>
//                 </div>
//                 <div className="flex justify-end gap-6">
//                   <Link to={`/subscription/portal`} target="_blank">
//                     <Button variant="outline">Manage Subscription</Button>
//                   </Link>
//                   <Link to={`/subscription/portal`} target="_blank">
//                     <Button
//                       variant="outline"
//                       className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
//                     >
//                       Cancel Subscription
//                     </Button>
//                   </Link>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </motion.div>
//   );
// }

import React from "react";
import type { Route } from "../+types/index";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { ChevronRight, CreditCard } from "lucide-react";
import { EmptyState } from "~/components/empty-state";
import { Link, useLoaderData, useNavigate } from "react-router";
import { format } from "date-fns";
import { cn } from "~/utils/misc";

// types.ts
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "unpaid"
  | "trialing";

export interface SubscriptionProduct {
  name: string;
}

export interface SubscriptionData {
  product: SubscriptionProduct;
  amount: number;
  recurringInterval: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd?: Date | null;
  endedAt?: Date | null;
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionProps {
  subscription: SubscriptionData | null;
}

export const ENDED_STATUSES: SubscriptionStatus[] = [
  "canceled",
  "past_due",
  "unpaid",
];

export function getStatusConfig(status: SubscriptionStatus) {
  const configs = {
    active: {
      className:
        "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      label: "Active",
    },
    canceled: {
      className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      label: "Canceled",
    },
    incomplete: {
      className:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
      label: "Incomplete",
    },
    incomplete_expired: {
      className: "bg-muted text-muted-foreground",
      label: "Expired",
    },
    past_due: {
      className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      label: "Past Due",
    },
    unpaid: {
      className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      label: "Unpaid",
    },
    trialing: {
      className:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      label: "Trial",
    },
  };

  return (
    configs[status] || {
      className: "bg-muted text-muted-foreground",
      label: status,
    }
  );
}

export function shouldShowEndDate(status: SubscriptionStatus): boolean {
  return ENDED_STATUSES.includes(status);
}

export function shouldShowNextBilling(
  status: SubscriptionStatus,
  currentPeriodEnd: Date | null | undefined,
  cancelAtPeriodEnd: boolean,
): boolean {
  return !!(currentPeriodEnd && !cancelAtPeriodEnd && status === "active");
}

export function shouldShowCancellationDate(
  cancelAtPeriodEnd: boolean,
  currentPeriodEnd: Date | null | undefined,
): boolean {
  return !!(cancelAtPeriodEnd && currentPeriodEnd);
}

interface SubscriptionCardProps {
  title: string;
  children: React.ReactNode;
}

/**
 * A comprehensive subscription management component for the profile page.
 *
 * This component displays subscription information with:
 * - Subscription plan details with status indicators
 * - Billing information and important dates
 * - Status-aware conditional rendering for different subscription states
 * - Action buttons for subscription management
 * - Empty state for users without subscriptions
 * - Responsive design with proper visual hierarchy
 *
 * The component has been refactored into smaller, focused components:
 * - SubscriptionCard: Consistent card layout wrapper
 * - SubscriptionEmptyState: Empty state for no subscription
 * - SubscriptionPlanHeader: Plan info with status badge
 * - SubscriptionDetails: Billing dates and subscription timeline
 * - BillingHistorySection: Link to billing portal
 * - SubscriptionActions: Manage and cancel buttons
 * - ActiveSubscriptionContent: Complete active subscription display
 * - Utility functions for status handling and date logic
 *
 * @returns {JSX.Element} A subscription management interface
 */
export function Subscription() {
  const { subscription } = useLoaderData<Route.ComponentProps["loaderData"]>();
  const navigate = useNavigate();

  const handleSubscribeClick = () => {
    navigate("/subscription");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SubscriptionCard title="Subscription Details">
        {!subscription ? (
          <SubscriptionEmptyState onSubscribeClick={handleSubscribeClick} />
        ) : (
          <ActiveSubscriptionContent subscription={subscription} />
        )}
      </SubscriptionCard>
    </motion.div>
  );
}

export function SubscriptionCard({ title, children }: SubscriptionCardProps) {
  return (
    <div className="border-border bg-card mb-8 rounded-xl border shadow-sm">
      <div className="border-border border-b p-6">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

interface SubscriptionEmptyStateProps {
  onSubscribeClick: () => void;
}

export function SubscriptionEmptyState({
  onSubscribeClick,
}: SubscriptionEmptyStateProps) {
  return (
    <EmptyState
      icon={<CreditCard className="size-8" />}
      title="No Subscription Found!"
      description="You don't have an active subscription."
      action={{
        label: "Subscribe Now",
        onClick: onSubscribeClick,
      }}
    />
  );
}

interface SubscriptionPlanHeaderProps {
  subscription: SubscriptionData;
}

export function SubscriptionPlanHeader({
  subscription,
}: SubscriptionPlanHeaderProps) {
  const statusConfig = getStatusConfig(subscription.status);

  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <div className="flex items-center justify-between">
        <SubscriptionPlanInfo subscription={subscription} />
        <SubscriptionStatusBadge statusConfig={statusConfig} />
      </div>
    </div>
  );
}

function SubscriptionPlanInfo({
  subscription,
}: {
  subscription: SubscriptionData;
}) {
  return (
    <div>
      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
        {subscription.product.name} Plan
      </div>
      <div className="text-muted-foreground">
        ${subscription.amount / 100} / {subscription.recurringInterval}
      </div>
    </div>
  );
}

function SubscriptionStatusBadge({
  statusConfig,
}: {
  statusConfig: { className: string; label: string };
}) {
  return (
    <div
      className={cn(
        "rounded-full px-3 py-1 text-sm font-medium capitalize",
        statusConfig.className,
      )}
    >
      {statusConfig.label}
    </div>
  );
}

interface SubscriptionDetailsProps {
  subscription: SubscriptionData;
}

export function SubscriptionDetails({
  subscription,
}: SubscriptionDetailsProps) {
  return (
    <div className="space-y-4">
      <SubscriptionDetailRow
        label="Started on"
        value={format(subscription.currentPeriodStart, "MMM d, yyyy")}
      />

      {shouldShowNextBilling(
        subscription.status,
        subscription.currentPeriodEnd,
        subscription.cancelAtPeriodEnd,
      ) && (
        <SubscriptionDetailRow
          label="Next billing date"
          value={format(subscription.currentPeriodEnd!, "MMM d, yyyy")}
        />
      )}

      {shouldShowEndDate(subscription.status) && (
        <SubscriptionDetailRow
          label="Ended on"
          value={
            subscription.endedAt
              ? format(subscription.endedAt, "MMM d, yyyy")
              : "N/A"
          }
        />
      )}

      {shouldShowCancellationDate(
        subscription.cancelAtPeriodEnd,
        subscription.currentPeriodEnd,
      ) && (
        <SubscriptionDetailRow
          label="Subscription will be canceled on"
          value={format(subscription.currentPeriodEnd!, "MMM d, yyyy")}
        />
      )}
    </div>
  );
}

function SubscriptionDetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-border flex items-center justify-between border-b pb-4">
      <div className="font-medium">{label}</div>
      <div>{value}</div>
    </div>
  );
}

export function BillingHistorySection() {
  return (
    <div className="border-border flex items-center justify-between border-b pb-4">
      <div className="font-medium">Billing history</div>
      <Link to="/subscription/portal" target="_blank">
        <Button variant="link" className="h-auto p-0">
          View all
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

export function SubscriptionActions() {
  return (
    <div className="flex justify-end gap-6">
      <ManageSubscriptionButton />
      <CancelSubscriptionButton />
    </div>
  );
}

function ManageSubscriptionButton() {
  return (
    <Link to="/subscription/portal" target="_blank">
      <Button variant="outline">Manage Subscription</Button>
    </Link>
  );
}

function CancelSubscriptionButton() {
  return (
    <Link to="/subscription/portal" target="_blank">
      <Button
        variant="outline"
        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        Cancel Subscription
      </Button>
    </Link>
  );
}

interface ActiveSubscriptionContentProps {
  subscription: SubscriptionData;
}

export function ActiveSubscriptionContent({
  subscription,
}: ActiveSubscriptionContentProps) {
  return (
    <>
      <SubscriptionPlanHeader subscription={subscription} />
      <div className="space-y-4">
        <SubscriptionDetails subscription={subscription} />
        <BillingHistorySection />
        <SubscriptionActions />
      </div>
    </>
  );
}
