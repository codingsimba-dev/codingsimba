import { motion } from "framer-motion";
import { Navbar } from "~/components/navbar";
import { HeroText, HeroCard } from "./components/hero";
import { href, Link } from "react-router";
import { ArrowDown } from "lucide-react";
import { cn } from "~/utils/misc";

export function HeroSection() {
  return (
    <header className="relative flex min-h-screen flex-col items-start justify-start overflow-hidden">
      <HeroBackground />
      <div className="z-20 mb-10 w-full md:mb-16">
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

function ExploreButton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      className="absolute bottom-8 left-0 right-0 hidden justify-center md:flex"
    >
      <Link
        to={href("/courses")}
        className="text-muted-foreground hover:text-foreground flex flex-col items-center transition-colors"
      >
        <span className="mb-2 text-sm">Explore</span>
        <ArrowDown className="h-5 w-5 animate-bounce" />
      </Link>
    </motion.div>
  );
}

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Top gradient */}
      <div
        className={cn(
          "absolute left-0 right-0 top-0 h-[500px]",
          "via-blue-500/2 bg-gradient-to-b from-blue-500/5 to-transparent",
        )}
      />

      {/* Grid pattern */}
      <div
        className={cn(
          "absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)]",
          "bg-[size:24px_24px]",
        )}
      />

      {/* Radial gradient */}
      <div
        className={cn(
          "absolute left-[10%] right-[10%] top-[20%] h-[500px]",
          "bg-radial-gradient from-blue-500/10 via-blue-300/5 to-transparent",
        )}
      />

      {/* Floating elements */}
      <div className="animate-float-slow absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="animate-float absolute bottom-1/3 right-1/3 h-96 w-96 rounded-full bg-blue-400/5 blur-3xl" />
    </div>
  );
}
