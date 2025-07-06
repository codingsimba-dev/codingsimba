import { HeroSection } from "./hero";
// import { CoursesSection } from "./courses";
import { ContactSection } from "./contact";
import { NewsLetterSection } from "./news-letter";
import { countArticles } from "~/utils/content.server/articles/utils";
import { generateMetadata } from "~/utils/meta";
import { Subscription } from "./subscription";
import { FAQSection } from "./faqs";
import { readMdxDirectory } from "~/utils/misc.server";
import { getSubscription, listProducts } from "~/utils/subcription.server";

export async function loader() {
  const articlesCount = countArticles();
  const faqs = readMdxDirectory("faqs");
  const products = listProducts();
  const subscription = await getSubscription(
    "8ce5c81d-3ee8-4db0-bf29-3764669cc414",
  );
  return { articlesCount, faqs, products, subscription };
}

export default function HomeRoute() {
  return (
    <>
      {generateMetadata({})}
      <HeroSection />
      {/* <CoursesSection /> */}
      <FAQSection />
      <Subscription />
      <ContactSection />
      <NewsLetterSection />
    </>
  );
}
