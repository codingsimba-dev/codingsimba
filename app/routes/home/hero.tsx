import { Navbar } from "~/components/navbar";
import { HeroBackground } from "./components/hero/hero-background";
import { HeroText } from "./components/hero/hero-text";
import { HeroCard } from "./components/hero/hero-card";
import { ExploreButton } from "./components/hero/explore-button";

export function HeroSection() {
  return (
    <header className="relative flex min-h-screen flex-col items-start justify-start overflow-hidden">
      <HeroBackground />
      <div className="z-20 mb-12 w-full md:mb-20">
        <Navbar />
      </div>
      <div className="container relative z-10 mx-auto grid items-center gap-12 px-4 md:grid-cols-2">
        <HeroText />
        <HeroCard />
      </div>
      <ExploreButton />
    </header>
  );
}
