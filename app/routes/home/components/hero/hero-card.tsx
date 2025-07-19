import { motion } from "framer-motion";

export function HeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="relative hidden md:block"
    >
      <div className="perspective-1000 relative aspect-square w-full">
        <div className="to-background absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-300/20 blur-3xl" />
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
