import { HeroSection } from "./hero";
// import { CoursesSection } from "./courses";
import { ContactSection } from "./contact";
import { NewsLetterSection } from "./news-letter";
import { countArticles } from "~/utils/content.server/articles/utils";
import { generateMetadata } from "~/utils/meta";
import { Subscription } from "./subscription";
import { FAQSection } from "./faqs";
import { readMdxDirectory } from "~/utils/misc.server";
import { listProducts } from "~/utils/subcription.server";

export async function loader() {
  const articlesCount = countArticles();
  const faqs = readMdxDirectory("faqs");
  const products = listProducts();
  return { articlesCount, faqs, products };
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
