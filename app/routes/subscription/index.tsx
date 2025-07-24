import type { Route } from "./+types/index";
import { SubscriptionSection } from "~/routes/subscription/components/subscription-section";
import { getSubscription, listProducts } from "~/utils/subcription.server";
import { getUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { generateMetadata } from "~/utils/meta";
import { Header } from "~/components/page-header";

export async function loader({ request }: Route.LoaderArgs) {
  const products = listProducts();
  const userId = await getUserId(request);
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
    },
  });
  let subscription: Awaited<ReturnType<typeof getSubscription>> | null = null;
  if (activeSubscription) {
    subscription = await getSubscription(activeSubscription.subscriptionId);
  }
  return { products, subscription, activeSubscription };
}

export default function SubscriptionRoute() {
  return (
    <>
      {generateMetadata({})}
      <Header
        title="Choose Your Learning Path"
        description="Flexible pricing that scales with your needs - whether you're
            learning solo or building a team."
      />
      <SubscriptionSection />
    </>
  );
}
