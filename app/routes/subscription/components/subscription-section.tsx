import React from "react";
import type { Route as SubscriptionRoute } from "../+types/index";
import type { Route as HomeRoute } from "../../home/+types/index";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Await, useLoaderData } from "react-router";
import { PricingCard } from "./pricing-card";
import { TeamPricingExplanation } from "./team-pricing-explanation";
import { VolumeDiscounts } from "./volume-discounts";
import { SubscriptionSkeleton } from "./skeleton";

/**
 * Main subscription component that handles loading states and data fetching
 *
 * This component manages the async loading of products from the loader
 * and displays a loading skeleton while data is being fetched.
 *
 * @param {Object} props - Component props
 * @param {Promise<any>} props.products - Promise that resolves to products data
 * @param {any} props.subscription - Current user subscription data
 * @param {string} props.checkoutAction - Action URL for checkout (default: "/subscription/checkout")
 *
 * @example
 * ```tsx
 * <SubscriptionSection products={productsPromise} subscription={subscriptionData} />
 * ```
 *
 * @returns {JSX.Element} The subscription section with loading states
 */
export function SubscriptionSection() {
  const { products, subscription } = useLoaderData<
    | SubscriptionRoute.ComponentProps["loaderData"]
    | HomeRoute.ComponentProps["loaderData"]
  >();
  return (
    <React.Suspense fallback={<SubscriptionSkeleton />}>
      <Await resolve={products}>
        {(resolvedProducts) => (
          <ResolvedSubscription
            resolvedProducts={resolvedProducts}
            subscription={subscription}
          />
        )}
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
 * @param {any} props.products - Resolved products data from Polar API
 * @param {any} props.subscription - Current user subscription data
 * @param {string} props.checkoutAction - Action URL for checkout
 *
 * @example
 * ```tsx
 * <ResolveSubscription products={productsData} subscription={subscriptionData} />
 * ```
 *
 * @returns {JSX.Element} The complete subscription pricing interface
 */
function ResolvedSubscription({
  resolvedProducts,
  subscription,
}: {
  resolvedProducts: Awaited<HomeRoute.ComponentProps["loaderData"]["products"]>;
  subscription: Awaited<HomeRoute.ComponentProps["loaderData"]["subscription"]>;
}) {
  const groups = {
    individual: "individual",
    team: "team",
  } as const;

  /**
   * Groups products by their metadata group (individual or team)
   * Creates separate arrays for individual and team plans
   */
  const product = resolvedProducts.result.items.reduce(
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
    {} as Record<
      keyof typeof groups,
      (typeof resolvedProducts.result.items)[number][]
    >,
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
  function sortProducts(
    productList: (typeof resolvedProducts.result.items)[number][],
  ) {
    const getPriceAmount = (
      price: (typeof productList)[number]["prices"][number],
    ) => {
      if (!price) return 0;
      return price.amountType === "fixed" &&
        "priceAmount" in price &&
        typeof price.priceAmount === "number"
        ? price.priceAmount
        : 0;
    };

    const checkIsCustom = (
      price: (typeof productList)[number]["prices"][number],
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
    <section className="bg-background relative overflow-hidden py-24">
      <div className="container relative z-10 mx-auto px-4">
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
              {sortProducts(product[groups.individual]).map(
                (item, index: number) => (
                  <PricingCard
                    key={index}
                    plan={item}
                    index={index}
                    productIds={productIds}
                    subscription={subscription}
                  />
                ),
              )}
            </div>
          </TabsContent>

          <TabsContent value={groups.team}>
            <div className="space-y-8">
              <TeamPricingExplanation />

              <div className="grid gap-8 lg:grid-cols-3">
                {sortProducts(product[groups.team]).map(
                  (item, index: number) => (
                    <PricingCard
                      key={index}
                      plan={item}
                      index={index}
                      productIds={teamProductIds}
                      subscription={subscription}
                    />
                  ),
                )}
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
          <p className="text-muted-foreground mb-4">
            All plans include a 14-day free trial
          </p>
          <div className="text-muted-foreground/80 flex flex-wrap justify-center gap-8 text-sm">
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
