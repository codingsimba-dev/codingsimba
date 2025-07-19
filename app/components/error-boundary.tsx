import type { ErrorResponse } from "react-router";
import {
  isRouteErrorResponse,
  useParams,
  useRouteError,
  useNavigate,
  Link,
} from "react-router";
import { motion } from "framer-motion";
import { getErrorMessage } from "~/utils/misc";
import { Button } from "./ui/button";
import {
  AlertTriangle,
  Home,
  RefreshCcw,
  Mail,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

type StatusHandler = (info: {
  error: ErrorResponse;
  params: Record<string, string | undefined>;
}) => React.ReactElement | null;

export function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => (
    <>
      <div className="mx-auto w-full text-3xl font-bold text-red-600">
        {error.status}
      </div>
      <p className="text-gray-700 dark:text-gray-300">{error.data}</p>
    </>
  ),
  statusHandlers,
  unexpectedErrorHandler = (error) => (
    <p className="text-gray-700 dark:text-gray-300">{getErrorMessage(error)}</p>
  ),
}: {
  defaultStatusHandler?: StatusHandler;
  statusHandlers?: Record<number, StatusHandler>;
  unexpectedErrorHandler?: (error: unknown) => React.ReactElement | null;
}) {
  const error = useRouteError();
  const params = useParams();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(true);

  if (typeof document !== "undefined") {
    console.error(error);
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
        delay: 0.2,
      },
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl"
      >
        <div className="overflow-hidden rounded-2xl border border-red-200/50 bg-white/80 shadow-2xl backdrop-blur-sm dark:border-red-800/50 dark:bg-gray-900/80">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
            <motion.div
              variants={itemVariants}
              className="mb-4 flex items-center justify-center"
            >
              <motion.div
                variants={iconVariants}
                whileHover="hover"
                className="rounded-full bg-white/20 p-4"
              >
                <AlertTriangle className="size-12" />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-2 text-center text-3xl font-bold"
            >
              Oops! Something went wrong
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-center text-lg text-red-100"
            >
              We encountered an unexpected error. Don&apos;t worry, we&apos;re
              here to help!
            </motion.p>
          </div>

          {/* Main content */}
          <div className="p-8">
            <motion.div
              variants={itemVariants}
              className="mb-8 flex flex-col justify-center gap-4 sm:flex-row"
            >
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  onClick={() => navigate(0)}
                  className="flex items-center gap-2 border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700"
                  size="lg"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <RefreshCcw className="size-4" />
                  </motion.div>
                  Reload Application
                </Button>
              </motion.div>

              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link to="/">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800"
                    size="lg"
                  >
                    <Home className="size-4" />
                    Go to Homepage
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Support section */}
            <motion.div
              variants={itemVariants}
              className="mb-6 border-t border-gray-200 pt-6 text-center dark:border-gray-700"
            >
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                Need help? We are ready to assist you.
              </p>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  to="/support"
                  className="inline-flex items-center gap-2 font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Mail className="size-4" />
                  Contact Support
                </Link>
              </motion.div>
            </motion.div>

            {/* Error details toggle */}
            <motion.div variants={itemVariants}>
              <motion.button
                onClick={() => setShowDetails(!showDetails)}
                className="flex w-full items-center justify-center gap-2 py-2 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm font-medium">
                  {showDetails ? "Hide" : "Show"} Error Details
                </span>
                <motion.div
                  animate={{ rotate: showDetails ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="size-4" />
                </motion.div>
              </motion.button>

              <motion.div
                initial={false}
                animate={{
                  height: showDetails ? "auto" : 0,
                  opacity: showDetails ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  {isRouteErrorResponse(error) ? (
                    <div className="font-mono text-sm">
                      <div className="mb-2 font-semibold text-red-600 dark:text-red-400">
                        HTTP {error.status} Error
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">
                        {(
                          statusHandlers?.[error.status] ?? defaultStatusHandler
                        )({
                          error,
                          params,
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Technical Details:
                      </h3>
                      <div className="rounded border bg-white p-3 font-mono text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-400">
                        {unexpectedErrorHandler(error)}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-red-300/30"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
