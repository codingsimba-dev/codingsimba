import type { Route } from "./+types/index";
import { Header } from "~/components/page-header";
import { Mission } from "./components/mission";
import { Impact } from "./components/impact";
import { Values } from "./components/values";
import { Journey } from "./components/journey";
import { Skills } from "./components/skills";
import { Team } from "./components/team";
import { CTA } from "./components/cta";
import { countArticles } from "~/utils/content.server/articles/utils";
import { generateMetadata } from "~/utils/meta";
import { getJourneys } from "~/utils/content.server/system/utils";

export async function loader() {
  const articlesCount = countArticles();
  const journeyData = getJourneys();

  return { articlesCount, journeyData };
}

export default function AboutRoute({ loaderData }: Route.ComponentProps) {
  const { articlesCount, journeyData } = loaderData;
  const title = "About TekBreed";
  const metadata = generateMetadata({ title });
  return (
    <>
      {metadata}
      <Header
        title={title}
        description="We are passionate about coding, teaching, and building tools that make a difference for individuals and organizations."
      />
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <Mission />
        <Impact articlesCount={articlesCount} />
        <Journey journeyData={journeyData} />
        <Skills />
        <Team />
        <Values />
        <CTA />
      </div>
    </>
  );
}
