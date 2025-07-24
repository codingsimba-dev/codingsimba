import React from "react";
import type { Route } from "../../home/+types/index";
import { motion } from "framer-motion";
import { Check, Star, Users, Zap, Crown, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Link, useNavigation, useSubmit } from "react-router";
import { useOptionalUser } from "~/hooks/user";
import { cn } from "~/utils/misc";
import { features } from "./features";

/**
 * Individual pricing card component
 *
 * Renders a single subscription plan card with pricing, features,
 * and call-to-action button. Supports different plan types (free,
 * fixed-price, custom) and team vs individual plans.
 *
 * Features:
 * - Shows different button text based on user authentication and subscription status
 * - Displays "Current Plan" indicator for active subscriptions
 * - Handles upgrade/downgrade actions for existing subscribers
 * - Provides appropriate navigation for unauthenticated users
 * - Visual indicators for popular plans and current subscriptions
 *
 * @param {Object} props - Component props
 * @param {any} props.plan - Product data from Polar
 * @param {number} props.index - Index for animation delays
 * @param {string[]} props.productIds - Array of product IDs for form submission
 * @param {any} props.subscription - Current user subscription data
 * @param {string} props.checkoutAction - Action URL for checkout (default: "/subscription/checkout")
 *
 * @example
 * ```tsx
 * <PricingCard
 *   plan={productData}
 *   index={0}
 *   productIds={["prod_1", "prod_2"]}
 *   subscription={subscriptionData}
 *   checkoutAction="/subscription/checkout"
 * />
 * ```
 *
 * @returns {JSX.Element} A pricing card with plan details and contextual CTA
 */
export function PricingCard({
  plan,
  index,
  productIds,
  subscription,
}: {
  plan: Awaited<
    Route.ComponentProps["loaderData"]["products"]
  >["result"]["items"][number];
  index: number;
  productIds: string[];
  subscription:
    | Awaited<Route.ComponentProps["loaderData"]["subscription"]>
    | null
    | undefined;
}) {
  const user = useOptionalUser();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isTeam = plan.metadata.group === "team";
  const price = plan.prices?.[0];
  const isCustom = price.amountType === "custom";
  const isFree = price.amountType === "free";
  const isPopular = !!plan.metadata.popular;

  const isSubmitting =
    navigation.state === "submitting" &&
    navigation.formData?.get("planName") === plan.name;

  /**
   * Determines the subscription action based on user authentication and current subscription status
   *
   * @returns Object containing button text, disabled state, href, and action type
   */
  const getSubscriptionAction = () => {
    // If user is not authenticated, show sign in button
    if (!user) {
      return {
        buttonText: isFree ? "Get Started" : "Sign In to Subscribe",
        isDisabled: isSubmitting,
        href: "/signin",
        action: "signin" as const,
      };
    }

    // If no active subscription, show subscribe button
    if (!subscription || subscription.status !== "active") {
      if (isFree) {
        return {
          buttonText: "Get Started",
          isDisabled: isSubmitting,
          href: "/tutorials", // Redirect to tutorials for free plan
          action: "free" as const,
        };
      }

      if (isCustom) {
        return {
          buttonText: plan.metadata.buttonText,
          isDisabled: isSubmitting,
          href: "/contact",
          action: "custom" as const,
        };
      }

      return {
        buttonText: plan.metadata.buttonText,
        isDisabled: isSubmitting,
        href: "/subscription/checkout",
        action: "subscribe" as const,
      };
    }

    // User has active subscription - check if this is their current plan
    const isCurrentSubscription =
      subscription.product.name.toLowerCase() === plan.name.toLowerCase();

    if (isCurrentSubscription) {
      return {
        buttonText: "Manage Subscription",
        isDisabled: false,
        href: "/subscription/portal",
        action: "manage" as const,
      };
    }

    // Compare prices to determine upgrade/downgrade
    const currentPrice = subscription.amount / 100;
    const planPrice = getPriceAmount(price!);

    if (planPrice > currentPrice) {
      return {
        buttonText: "Upgrade Subscription",
        isDisabled: isSubmitting,
        href: "/subscription/portal",
        action: "upgrade" as const,
      };
    } else if (planPrice < currentPrice && !isCustom) {
      return {
        buttonText: "Downgrade Subscription",
        isDisabled: isSubmitting,
        href: "/subscription/portal",
        action: "downgrade" as const,
      };
    } else if (isCustom) {
      return {
        buttonText: plan.metadata.buttonText,
        isDisabled: isSubmitting,
        href: "/contact",
        action: "custom" as const,
      };
    } else {
      return {
        buttonText: plan.metadata.buttonText,
        isDisabled: isSubmitting,
        href: "/subscription/portal",
        action: "change" as const,
      };
    }
  };

  /**
   * Handles button click based on the subscription action type
   *
   * @param event - The click event
   */
  function handleSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // For actions that don't need form submission, let the Link handle navigation
    if (
      ["signin", "free", "manage", "custom"].includes(subscriptionAction.action)
    ) {
      return;
    }

    // For subscription actions, submit the form
    submit(
      { products: productIds, group: plan.metadata.group, planName: plan.name },
      { method: "post", action: subscriptionAction.href },
    );
  }

  /**
   * Extracts the price amount from a price object
   * The price is in cents, so we divide by 100 to get the price in dollars
   *
   * @param {Object} price - Price object from Polar
   * @returns {number} Price amount in dollars (divided by 100)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getPriceAmount(price: any): number {
    if (price.amountType === "fixed" && "priceAmount" in price) {
      return price.priceAmount / 100;
    }
    return 0;
  }

  /**
   * Maps icon names to React components
   *
   * @param {string} iconName - Name of the icon to render
   * @returns {JSX.Element} The corresponding icon component
   */
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap":
        return <Zap className="size-5" />;
      case "Star":
        return <Star className="size-5" />;
      case "Crown":
        return <Crown className="size-5" />;
      case "Users":
        return <Users className="size-5" />;
      default:
        return <Star className="size-5" />;
    }
  };

  const subscriptionAction = getSubscriptionAction();

  /**
   * Renders the appropriate action button based on the subscription action type
   */
  const renderActionButton = () => {
    const buttonContent = (
      <Button
        onClick={handleSubmit}
        className={cn("w-full py-6 text-lg", {
          "bg-primary text-primary-foreground hover:bg-primary/90": isPopular,
        })}
        variant={plan.metadata.buttonVariant as "default" | "outline"}
        disabled={subscriptionAction.isDisabled}
      >
        {subscriptionAction.buttonText}
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
      </Button>
    );

    // For actions that need direct navigation, wrap in Link
    if (
      ["signin", "free", "manage", "custom"].includes(subscriptionAction.action)
    ) {
      return <Link to={subscriptionAction.href}>{buttonContent}</Link>;
    }

    // For subscription actions, return the button directly
    return buttonContent;
  };

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={cn(
        "bg-card relative flex flex-col rounded-2xl border p-8 shadow-lg",
        "border-border",
        {
          "border-primary ring-primary/20 ring-2": isPopular,
        },
        {
          "scale-105": isTeam && isPopular,
        },
        {
          "border-success ring-success/20 ring-2":
            user &&
            subscription?.status === "active" &&
            subscription.product.name.toLowerCase() === plan.name.toLowerCase(),
        },
      )}
    >
      {isPopular ? (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
          <div className="bg-primary text-primary-foreground flex items-center gap-1 rounded-full px-4 py-1 text-sm font-medium">
            <Star className="size-4 fill-current" />
            Most Popular
          </div>
        </div>
      ) : null}

      {/* Show current plan badge for authenticated users */}
      {user &&
      subscription?.status === "active" &&
      subscription.product.name.toLowerCase() === plan.name.toLowerCase() ? (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
          <div className="bg-success text-success-foreground flex items-center gap-1 rounded-full px-4 py-1 text-sm font-medium">
            <Check className="size-4 fill-current" />
            Current Plan
          </div>
        </div>
      ) : null}

      <div className="mb-8 text-center">
        {/* Show current subscription indicator for authenticated users */}
        {user && subscription?.status === "active" && (
          <div className="mb-4">
            <Badge variant="secondary" className="bg-success/10 text-success">
              Current Plan: {subscription.product.name}
            </Badge>
          </div>
        )}

        <div className="mb-4 flex items-center justify-center gap-2">
          {getIcon(plan.metadata.icon as string)}
          <h3 className="text-2xl font-bold capitalize">{plan.name}</h3>
        </div>
        <div className="mb-4">
          <span className="text-4xl font-bold">
            {isFree
              ? "Free"
              : isCustom
                ? "Custom"
                : `$${getPriceAmount(price!)}`}
          </span>
          {plan.metadata.originalPrice ? (
            <span className="text-muted-foreground ml-2 text-lg line-through">
              ${plan.metadata.originalPrice}
            </span>
          ) : null}
          {!isFree && !isCustom ? (
            <span className="text-muted-foreground ml-2">
              {isTeam
                ? `/per seat /${price.recurringInterval}`
                : ` / ${price.recurringInterval}`}
            </span>
          ) : null}
        </div>
        {plan.metadata.minSeats ? (
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              Minimum {plan.metadata.minSeats} members
            </Badge>
          </div>
        ) : null}
        {plan.metadata.maxMembers && Number(plan.metadata.maxMembers) < 999 ? (
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              Up to {plan.metadata.maxMembers} members
            </Badge>
          </div>
        ) : null}
        <p className="text-muted-foreground">{plan.description}</p>
      </div>

      <ul className="mb-8 flex-grow space-y-4">
        {features[plan.name.toLowerCase() as keyof typeof features]?.map(
          (feature, featureIndex) => (
            <li key={featureIndex} className="flex items-start gap-3">
              <Check className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
              <span className="text-card-foreground">{feature}</span>
            </li>
          ),
        )}
      </ul>

      {renderActionButton()}

      {plan.metadata.perSeat && price.amountType !== "custom" && (
        <div className="mt-4 text-center">
          <p className="text-muted-foreground text-xs">
            Example: 10 members = ${getPriceAmount(price!) * 10}
            /month
          </p>
        </div>
      )}
    </motion.div>
  );
}
