import { motion } from "framer-motion";
import { ArrowDownAZ } from "lucide-react";
import { EmptyState } from "~/components/empty-state";
import { Container } from "./container";

export function Programs() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Container title="My Programs">
        <EmptyState
          icon={<ArrowDownAZ className="size-8" />}
          title="Not Implemented!"
          description="We are working to implement this feature."
        />
      </Container>
    </motion.div>
  );
}
