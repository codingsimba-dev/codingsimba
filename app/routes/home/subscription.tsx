import React from "react";
import type { Route } from "./+types/index";
import { motion } from "framer-motion";
import { Check, Star, Users, Zap, Crown, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Await,
  Link,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import { Skeleton } from "~/components/ui/skeleton";
import { useOptionalUser } from "~/hooks/user";
import { cn } from "~/utils/misc";

/**
 * Feature definitions for each subscription plan
 *
 * Maps plan names to their feature lists. Used to display features
 * in the pricing cards based on the plan type.
 */
export const features = {
  basic: [
    "Access to free courses and tutorials",
    "Basic articles and workshops",
    "Basic monthly coding challenges",
    "Discord community access",
    "Email support",
  ],
  premium: [
    "Everything in Basic",
    "Access to all premium tutorials and workshops",
    "Priority community support",
    "Access to premium monthly coding challenges",
    "AI Learning Assistant (300 credits/month)",
  ],
  pro: [
    "Everything in Premium",
    "Access to all courses and programs",
    "AI Learning Assistant (Unlimited credits/month)",
    "Advanced certificates and badges",
    "1-on-1 mentorship sessions (2/month)",
  ],
  "team starter": [
    "Everything in Pro for each member",
    "Team dashboard and analytics",
    "Progress tracking for all members",
    "Team certificates",
    "Basic team reporting",
    "Email support",
  ],
  "team pro": [
    "Everything in Team Starter",
    "Custom learning paths",
    "Advanced team analytics",
    "Skills assessment tools",
    "Integration with Slack/Teams",
  ],
  enterprise: [
    "Everything in Team Pro",
    "Unlimited team members",
    "Custom integrations",
    "Dedicated account manager",
    "Custom branding",
  ],
};

/**
 * Main subscription component that handles loading states and data fetching
 *
 * This component manages the async loading of products from the loader
 * and displays a loading skeleton while data is being fetched.
 *
 * @example
 * ```tsx
 * <Subscription />
 * ```
 *
 * @returns {JSX.Element} The subscription section with loading states
 */
export function Subscription() {
  const { products } = useLoaderData<Route.ComponentProps["loaderData"]>();
  return (
    <React.Suspense fallback={<SubscriptionSkeleton />}>
      <Await resolve={products}>
        {(products) => <SubscriptionPromise products={products} />}
      </Await>
    </React.Suspense>
  );
}

/**
 * Subscription content component that renders the pricing plans
 *
 * This component processes the products data from Polar, groups them
 * by type (individual/team), sorts them by price, and renders the
 * pricing interface with tabs for different plan categories.
 *
 * @param {Object} props - Component props
 * @param {Awaited<Route.ComponentProps["loaderData"]["products"]>} props.products - Resolved products data from Polar API
 *
 * @example
 * ```tsx
 * <SubscriptionPromise products={productsData} />
 * ```
 *
 * @returns {JSX.Element} The complete subscription pricing interface
 */
export function SubscriptionPromise({
  products,
}: {
  products: Awaited<Route.ComponentProps["loaderData"]["products"]>;
}) {
  const groups = {
    individual: "individual",
    team: "team",
  } as const;

  /**
   * Groups products by their metadata group (individual or team)
   * Creates separate arrays for individual and team plans
   */
  const product = products.result.items.reduce(
    (acc, item) => {
      const group = item.metadata.group as keyof typeof groups;
      if (group in groups) {
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(item);
      }
      return acc;
    },
    {} as Record<keyof typeof groups, (typeof products.result.items)[number][]>,
  );

  function checkProductType(item: (typeof product.individual)[number]) {
    return (
      item.prices?.[0]?.amountType !== "free" &&
      item.prices?.[0]?.amountType !== "custom"
    );
  }

  const productIds = product.individual
    .filter(checkProductType)
    .map((item) => item.id);
  const teamProductIds = product.team
    .filter(checkProductType)
    .map((item) => item.id);

  /**
   * Sorts products by price and type
   *
   * Custom plans are sorted to the end (highest tier),
   * while fixed-price plans are sorted by price (lowest to highest)
   *
   * @param {Array} productList - Array of products to sort
   * @returns {Array} Sorted array of products
   */
  function sortProducts(productList: (typeof product.individual)[number][]) {
    const getPriceAmount = (
      price: (typeof productList)[number]["prices"][number] | undefined,
    ) => {
      if (!price) return 0;
      return price.amountType === "fixed" &&
        "priceAmount" in price &&
        typeof price.priceAmount === "number"
        ? price.priceAmount
        : 0;
    };

    const checkIsCustom = (
      price: (typeof productList)[number]["prices"][number] | undefined,
    ) => {
      return price?.amountType === "custom";
    };

    return productList.sort((a, b) => {
      const priceA = a.prices?.[0];
      const priceB = b.prices?.[0];

      if (checkIsCustom(priceA) && !checkIsCustom(priceB)) return 1;
      if (!checkIsCustom(priceA) && checkIsCustom(priceB)) return -1;
      if (checkIsCustom(priceA) && checkIsCustom(priceB)) return 0;

      const amountA = getPriceAmount(priceA);
      const amountB = getPriceAmount(priceB);
      return amountA - amountB;
    });
  }

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute left-0 top-0 h-1/3 w-1/3 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-1/3 w-1/3 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Choose Your Learning Path
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Flexible pricing that scales with your needs - whether you&apos;re
            learning solo or building a team.
          </p>
        </motion.div>

        <Tabs defaultValue="individual" className="mx-auto max-w-6xl">
          <TabsList className="mx-auto mb-12 flex w-fit">
            <TabsTrigger value={groups.individual} className="py-3 text-lg">
              Individual Plans
            </TabsTrigger>
            <TabsTrigger value={groups.team} className="py-3 text-lg">
              Team Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value={groups.individual}>
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
              {sortProducts(product[groups.individual]).map((item, index) => (
                <PricingCard
                  key={index}
                  plan={item}
                  index={index}
                  productIds={productIds}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value={groups.team}>
            <div className="space-y-8">
              <TeamPricingExplanation />

              <div className="grid gap-8 lg:grid-cols-3">
                {sortProducts(product[groups.team]).map((item, index) => (
                  <PricingCard
                    key={index}
                    plan={item}
                    index={index}
                    productIds={teamProductIds}
                  />
                ))}
              </div>

              <VolumeDiscounts />
            </div>
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            All plans include a 14-day free trial
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <span>✓ No setup fees</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Secure payments</span>
            <span>✓ 24/7 support</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

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
 * @param {Awaited<Route.ComponentProps["loaderData"]["products"]>["result"]["items"][number]} props.plan - Product data from Polar
 * @param {number} props.index - Index for animation delays
 * @param {string[]} props.productIds - Array of product IDs for form submission
 *
 * @example
 * ```tsx
 * <PricingCard plan={productData} index={0} productIds={["prod_1", "prod_2"]} />
 * ```
 *
 * @returns {JSX.Element} A pricing card with plan details and contextual CTA
 */
function PricingCard({
  plan,
  index,
  productIds,
}: {
  plan: Awaited<
    Route.ComponentProps["loaderData"]["products"]
  >["result"]["items"][number];
  index: number;
  productIds: string[];
}) {
  const { subscription } = useLoaderData<Route.ComponentProps["loaderData"]>();
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
   * Determines the subscription action based on current subscription status and price comparison
   *
   * @returns Object containing button text, disabled state, and action type
   */
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
          href: "/courses", // Redirect to courses for free plan
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
  function getPriceAmount(price: (typeof plan.prices)[number]): number {
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
          "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600":
            isPopular,
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
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-8 shadow-lg dark:bg-gray-900",
        "border-gray-200 dark:border-gray-800",
        {
          "border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-400 dark:ring-blue-400/20":
            isPopular,
        },
        {
          "scale-105": isTeam && isPopular,
        },
        {
          "border-green-500 ring-2 ring-green-500/20 dark:border-green-400 dark:ring-green-400/20":
            user &&
            subscription?.status === "active" &&
            subscription.product.name.toLowerCase() === plan.name.toLowerCase(),
        },
      )}
    >
      {isPopular ? (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
          <div className="flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white dark:bg-blue-500">
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
          <div className="flex items-center gap-1 rounded-full bg-green-600 px-4 py-1 text-sm font-medium text-white dark:bg-green-500">
            <Check className="size-4 fill-current" />
            Current Plan
          </div>
        </div>
      ) : null}

      <div className="mb-8 text-center">
        {/* Show current subscription indicator for authenticated users */}
        {user && subscription?.status === "active" && (
          <div className="mb-4">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            >
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
            <span className="ml-2 text-lg text-gray-500 line-through dark:text-gray-400">
              ${plan.metadata.originalPrice}
            </span>
          ) : null}
          {!isFree && !isCustom ? (
            <span className="ml-2 text-gray-500 dark:text-gray-400">
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
        <p className="text-gray-600 dark:text-gray-300">{plan.description}</p>
      </div>

      <ul className="mb-8 flex-grow space-y-4">
        {features[plan.name.toLowerCase() as keyof typeof features].map(
          (feature, featureIndex) => (
            <li key={featureIndex} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {feature}
              </span>
            </li>
          ),
        )}
      </ul>

      {renderActionButton()}

      {plan.metadata.perSeat && price.amountType !== "custom" && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Example: 10 members = ${getPriceAmount(price!) * 10}
            /month
          </p>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Team pricing explanation component
 *
 * Displays information about per-seat pricing for team plans,
 * including benefits like no setup fees and flexible member management.
 *
 * @returns {JSX.Element} Team pricing information section
 */
function TeamPricingExplanation() {
  return (
    <div className="mb-12 text-center">
      <div className="mx-auto max-w-4xl rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/30">
        <h3 className="mb-3 text-xl font-semibold text-blue-900 dark:text-blue-100">
          Simple Per-Seat Pricing
        </h3>
        <p className="mb-4 text-blue-700 dark:text-blue-200">
          Our team plans scale with your organization. Pay only for active team
          members with no hidden fees.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          >
            ✓ No setup fees
          </Badge>
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          >
            ✓ Add/remove members anytime
          </Badge>
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          >
            ✓ Prorated billing
          </Badge>
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          >
            ✓ Volume discounts available
          </Badge>
        </div>
      </div>
    </div>
  );
}

/**
 * Volume discounts component
 *
 * Displays available volume discounts for team plans based on
 * member count, encouraging larger team purchases.
 *
 * @returns {JSX.Element} Volume discounts information section
 */
function VolumeDiscounts() {
  return (
    <div className="mt-12">
      <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-8 dark:border-purple-800 dark:from-purple-950/30 dark:to-blue-950/30">
        <div className="mb-6 text-center">
          <h3 className="mb-2 text-2xl font-bold">
            Volume Discounts Available
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Save more as your team grows with our automatic volume discounts
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { discount: "5%", memberCount: "25+ members" },
            { discount: "10%", memberCount: "50+ members" },
            { discount: "15%", memberCount: "100+ members" },
            { discount: "20%", memberCount: "250+ members" },
          ].map((item) => (
            <MembersCount key={item.discount} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Individual discount tier component
 *
 * Displays a single volume discount tier with the discount percentage
 * and required member count.
 *
 * @param {Object} props - Component props
 * @param {string} props.discount - Discount percentage (e.g., "5%")
 * @param {string} props.memberCount - Required member count (e.g., "25+ members")
 *
 * @returns {JSX.Element} A discount tier card
 */
function MembersCount({
  discount,
  memberCount,
}: {
  discount: string;
  memberCount: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-4 text-center dark:bg-gray-900">
      <div className="mb-1 text-2xl font-bold text-green-600">{discount}</div>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {memberCount}
      </div>
    </div>
  );
}

/**
 * Skeleton component for individual pricing cards
 *
 * Shows loading placeholders while pricing data is being fetched.
 * Uses the same layout as the actual PricingCard component.
 *
 * @param {Object} props - Component props
 * @param {number} props.index - Index for animation delays
 *
 * @returns {JSX.Element} A skeleton pricing card
 */
function PricingCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative flex flex-col rounded-2xl border bg-white p-8 shadow-lg dark:bg-gray-900"
    >
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="mb-4">
          <Skeleton className="mx-auto h-12 w-20" />
        </div>
        <Skeleton className="mx-auto h-4 w-48" />
      </div>

      <div className="mb-8 flex-grow space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>

      <Skeleton className="h-14 w-full" />
    </motion.div>
  );
}

/**
 * Main skeleton component for the subscription section
 *
 * Shows loading placeholders for the entire subscription interface
 * while products data is being fetched from the Polar API.
 *
 * @returns {JSX.Element} A skeleton version of the subscription section
 */
function SubscriptionSkeleton() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute left-0 top-0 h-1/3 w-1/3 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-1/3 w-1/3 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <Skeleton className="mx-auto mb-4 h-12 w-96" />
          <Skeleton className="mx-auto h-6 w-80" />
        </motion.div>

        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 flex w-fit">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="ml-2 h-12 w-32" />
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <PricingCardSkeleton key={index} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
