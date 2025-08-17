import React from "react";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { href, Link } from "react-router";
import { slogan } from "~/utils/constants";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Sparkles, Bot, Brain } from "lucide-react";

export function HeroText() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-xl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-1 text-sm font-medium text-blue-600 dark:bg-gradient-to-r dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-400"
      >
        <Sparkles className="h-4 w-4" />
        {slogan}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
      >
        Transform your{" "}
        <span className="text-blue-600 dark:text-blue-500">coding skills</span>{" "}
        with our{" "}
        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI-powered learning platform
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="text-muted-foreground mb-2 text-lg leading-relaxed"
      >
        Accelerate your journey from beginner to professional developer with our
        comprehensive AI learning ecosystem.
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="text-muted-foreground mb-2 leading-relaxed"
      >
        Get contextually-aware tutorials and courses powered by RAG technology,
        real-time code reviews, monthly coding challenges, and access to an
        advanced software engineering AI assistant trained on your learning
        progress.
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="text-muted-foreground mb-8 leading-relaxed"
      >
        Whether you&apos;re starting out or advancing your career, our platform
        adapts to your pace and provides the depth serious developers need.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row sm:flex-wrap"
      >
        <Link to={href("/courses")} prefetch="intent">
          <Button
            size="lg"
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-white hover:from-blue-700 hover:to-purple-700"
          >
            <Brain className="mr-2 h-4 w-4" />
            Start Learning
          </Button>
        </Link>

        <Link to={"/chat"} prefetch="intent">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-purple-200 px-8 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
          >
            <Bot className="mr-2 h-4 w-4" />
            Try AI Assistant
          </Button>
        </Link>
        <Link to={href("/challenges")} prefetch="intent">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-green-200 px-8 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
          >
            Join Challenges
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="mt-12 flex items-center gap-2"
      >
        <div className="flex -space-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Avatar key={i} className="size-8 border">
              <AvatarFallback>{`U${i + 1}`}</AvatarFallback>
              <AvatarImage
                src="https://cdn.sanity.io/media-libraries/ml4WNZcKpiTm/images/252788fa66eda851b93b61ec9701706f0f8014b1-65x59.jpg"
                alt={`User ${i}`}
              />
            </Avatar>
          ))}
        </div>
        <div className="text-sm">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-transparent dark:from-blue-500 dark:to-purple-500">
            1,000+
          </span>{" "}
          developers learning with AI
        </div>
      </motion.div>
    </motion.div>
  );
}

export function HeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="relative hidden md:block"
    >
      <div className="perspective-1000 relative aspect-square w-full">
        {/* <div className="to-background absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-300/20 blur-3xl" /> */}
        <div className="relative h-full w-full rotate-3 transform transition-transform duration-500 hover:rotate-0">
          <div className="border-border bg-card absolute inset-0 overflow-hidden rounded-xl border shadow-xl">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-destructive h-3 w-3 rounded-full" />
                  <div className="bg-chart-4 h-3 w-3 rounded-full" />
                  <div className="bg-chart-2 h-3 w-3 rounded-full" />
                </div>
                <div className="text-muted-foreground text-xs">
                  tekbreed.com
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-muted h-6 w-3/4 animate-pulse rounded" />
                <div className="bg-muted h-4 w-full animate-pulse rounded" />
                <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
                <div className="bg-muted h-4 w-4/6 animate-pulse rounded" />
                <div className="bg-primary mt-6 h-10 w-1/3 rounded-md" />
              </div>
              <div className="mt-4 space-y-4">
                <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
                <div className="bg-muted h-4 w-4/6 animate-pulse rounded" />
              </div>
            </div>
          </div>
          <div className="border-border bg-card absolute -right-12 top-[60%] h-40 w-40 rotate-6 transform rounded-lg border p-4 shadow-lg">
            <div className="bg-muted mb-2 h-4 w-3/4 rounded" />
            <div className="bg-muted mb-2 h-3 w-full rounded" />
            <div className="bg-muted mb-2 h-3 w-5/6 rounded" />
            <div className="bg-muted h-3 w-4/6 rounded" />
          </div>
          <div className="border-border bg-card absolute -left-12 top-[20%] h-32 w-32 -rotate-3 transform rounded-lg border p-3 shadow-lg">
            <div className="bg-primary mb-2 h-4 w-full rounded" />
            <div className="bg-muted mb-2 h-3 w-5/6 rounded" />
            <div className="bg-muted mb-2 h-3 w-full rounded" />
            <div className="bg-muted h-3 w-4/6 rounded" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
