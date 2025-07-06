import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowDown } from "lucide-react";

export function ExploreButton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="absolute bottom-8 left-0 right-0 flex justify-center"
    >
      <Link
        to="/courses"
        className="flex flex-col items-center text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <span className="mb-2 text-sm">Explore</span>
        <ArrowDown className="h-5 w-5 animate-bounce" />
      </Link>
    </motion.div>
  );
}
