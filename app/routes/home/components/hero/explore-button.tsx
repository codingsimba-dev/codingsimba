import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowDown } from "lucide-react";

export function ExploreButton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      className="absolute bottom-8 left-0 right-0 flex justify-center"
    >
      <Link
        to="/courses"
        className="text-muted-foreground hover:text-foreground flex flex-col items-center transition-colors"
      >
        <span className="mb-2 text-sm">Explore</span>
        <ArrowDown className="h-5 w-5 animate-bounce" />
      </Link>
    </motion.div>
  );
}
