import React from "react";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
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
        className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
      >
        Master{" "}
        <span className="text-blue-600 dark:text-blue-500">coding skills</span>{" "}
        with{" "}
        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI-powered learning
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="text-muted-foreground mb-8 text-xl leading-relaxed"
      >
        Transform your coding skills with our AI-powered learning platform. Get
        personalized tutorials, intelligent code reviews, and instant answers
        from our advanced software engineering assistant.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row sm:flex-wrap"
      >
        <Link to={"/courses"} prefetch="intent">
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
        <Link to={"/challenges"} prefetch="intent">
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
