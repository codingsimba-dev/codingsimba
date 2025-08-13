import type { Route } from "./+types/index";
import { HeroSection } from "./hero";
// import { CoursesSection } from "./courses";
import { countArticles } from "~/utils/content.server/articles/utils";
import { generateMetadata } from "~/utils/meta";
import { FAQSection } from "./faqs";
import { getSubscription, listProducts } from "~/utils/subcription.server";
import { getFAQs } from "~/utils/content.server/system/utils";
import { getUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { SubscriptionSection } from "~/routes/subscription/components/subscription-section";
import { Footer } from "~/components/footer";

export async function loader({ request }: Route.LoaderArgs) {
  const articlesCount = countArticles();
  const faqs = getFAQs();
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
  return { articlesCount, faqs, products, subscription, activeSubscription };
}

export default function HomeRoute() {
  return (
    <>
      {generateMetadata({})}
      <HeroSection />
      {/* <CoursesSection /> */}
      <FAQSection />
      <SubscriptionSection />
      <Footer />
    </>
  );
}
