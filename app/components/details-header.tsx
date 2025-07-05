import { motion } from "framer-motion";
import { Link, useLocation } from "react-router";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { readingTime } from "reading-time-estimator";
import type { Article } from "~/utils/content.server/articles/types";
import type { Tutorial } from "~/utils/content.server/turorials/types";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getImgSrc, getInitials, getSeed } from "~/utils/misc";

type DetailsHeaderProps = {
  item: Article | Tutorial; // | Tutorial | Course
};

export function DetailsHeader({ item }: DetailsHeaderProps) {
  const location = useLocation();
  const itemType = location.pathname.split("/")[1];
  const isArticle = itemType === "articles";
  // const isTutorial = itemType === "tutorials";
  // const isCourse = itemType === "courses";
  // const isProgram = itemType === "programs"

  const stats = "markdown" in item ? readingTime(item.markdown) : null;

  const shapes = Array.from({ length: 15 }, (_, i) => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return Number((x - Math.floor(x)).toFixed(4));
    };

    return {
      id: i,
      size: Number((seededRandom(i) * 60 + 20).toFixed(2)),
      x: Number((seededRandom(i + 1) * 100).toFixed(2)),
      y: Number((seededRandom(i + 2) * 100).toFixed(2)),
      duration: Number((seededRandom(i + 3) * 20 + 10).toFixed(2)),
      delay: Number((seededRandom(i + 4) * 5).toFixed(2)),
      opacity: Number((seededRandom(i + 5) * 0.12 + 0.03).toFixed(4)),
    };
  });

  return (
    <div className="mt-13 relative isolate overflow-hidden border-b border-gray-200 py-4 dark:border-gray-800">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-950 dark:to-indigo-950" />
        {shapes.map((shape) => (
          <motion.div
            key={shape.id}
            className="absolute rounded-full bg-blue-500 dark:bg-blue-300"
            style={{
              width: shape.size,
              height: shape.size,
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              opacity: shape.opacity,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: shape.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: shape.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link
                    to={`/${itemType}`}
                    className="text-lg capitalize hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {itemType}
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-lg">
                    {item.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>

          <motion.h1
            className="mb-3 mt-2 text-2xl font-bold md:text-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {item.title}
          </motion.h1>
          {"excerpt" in item ? (
            <motion.h1
              className="mb-4 max-w-3xl text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {item.excerpt}
            </motion.h1>
          ) : null}

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.span
              className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {item.category.title}
            </motion.span>
            {item.createdAt ? (
              <>
                <span className="text-gray-500 dark:text-gray-400">•</span>
                <motion.div
                  className="flex items-center text-gray-600 dark:text-gray-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>{format(item.createdAt, "MMMM dd, yyyy")}</span>
                </motion.div>
              </>
            ) : null}

            {isArticle ? (
              <>
                <span className="text-gray-500 dark:text-gray-400">•</span>
                <motion.div
                  className="flex items-center text-gray-600 dark:text-gray-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{stats?.text}</span>
                </motion.div>
                <span className="text-gray-500 dark:text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage
                      src={
                        env.MODE === "development"
                          ? getImgSrc({
                              seed: getSeed(item.author.name),
                            })
                          : item.author.image
                      }
                    />
                    <AvatarFallback>
                      {getInitials(item.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">{item.author.name}</p>
                </div>
              </>
            ) : null}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
