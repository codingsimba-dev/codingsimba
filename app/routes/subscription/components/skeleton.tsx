import { motion } from "framer-motion";
import { Skeleton } from "~/components/ui/skeleton";

/**
 * Skeleton component for individual pricing cards
 *
 * Shows loading placeholders while pricing data is being fetched.
 * Uses the same layout as the actual PricingCard component.
 *
 * @param {Object} props - Component props
 * @param {number} props.index - Index for animation delays
 *
 * @returns {JSX.Element} A skeleton pricing card
 */
export function PricingCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-card relative flex flex-col rounded-2xl border p-8 shadow-lg"
    >
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="mb-4">
          <Skeleton className="mx-auto h-12 w-20" />
        </div>
        <Skeleton className="mx-auto h-4 w-48" />
      </div>

      <div className="mb-8 flex-grow space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>

      <Skeleton className="h-14 w-full" />
    </motion.div>
  );
}

/**
 * Main skeleton component for the subscription section
 *
 * Shows loading placeholders for the entire subscription interface
 * while products data is being fetched from the Polar API.
 *
 * @returns {JSX.Element} A skeleton version of the subscription section
 */
export function SubscriptionSkeleton() {
  return (
    <section className="bg-background relative overflow-hidden py-24">
      <div className="absolute left-0 top-0 h-1/3 w-1/3 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-1/3 w-1/3 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <Skeleton className="mx-auto mb-4 h-12 w-96" />
          <Skeleton className="mx-auto h-6 w-80" />
        </motion.div>

        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 flex w-fit">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="ml-2 h-12 w-32" />
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <PricingCardSkeleton key={index} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
