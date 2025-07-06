import { motion } from "framer-motion";

export function HeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className="relative hidden md:block"
    >
      <div className="perspective-1000 relative aspect-square w-full">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-gray-200/20 to-white blur-3xl dark:via-gray-800/20 dark:to-gray-950" />
        <div className="relative h-full w-full rotate-3 transform transition-transform duration-500 hover:rotate-0">
          <div className="absolute inset-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  tekbreed.com
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-6 h-10 w-1/3 rounded-md bg-blue-600 dark:bg-blue-500" />
              </div>
              <div className="mt-4 space-y-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
          <div className="absolute -right-12 top-[60%] h-40 w-40 rotate-6 transform rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mb-2 h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mb-2 h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-4/6 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="absolute -left-12 top-[20%] h-32 w-32 -rotate-3 transform rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-2 h-4 w-full rounded bg-blue-600 dark:bg-blue-500" />
            <div className="mb-2 h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mb-2 h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-4/6 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
