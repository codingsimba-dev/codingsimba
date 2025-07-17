import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useSearchParams } from "react-router";
import { useDebounce } from "~/utils/misc";

type HeaderProps = {
  title?: string;
  description?: string;
  placeholder?: string;
  enableSearch?: boolean;
};

export function Header({
  title,
  description,
  placeholder,
  enableSearch = false,
}: HeaderProps) {
  const SEARCH = "search";
  const DB_DELAY = 300;

  const [search, setSearch] = React.useState("");
  const [searchParams, setSearchParams] = useSearchParams();

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

  const handleSearchChange = useDebounce((value: string) => {
    setSearchParams(
      (prevParams) => {
        const params = new URLSearchParams(prevParams);
        params.delete(SEARCH);
        if (value) {
          params.set(SEARCH, value);
        } else {
          params.delete(SEARCH);
        }
        return params;
      },
      { preventScrollReset: true },
    );
  }, DB_DELAY);

  React.useEffect(() => {
    setSearch(searchParams.get(SEARCH) ?? "");
  }, [searchParams, setSearch]);

  return (
    <header className="mt-13 relative isolate overflow-hidden border-b border-gray-200 py-6 dark:border-gray-800">
      {/* Background container with higher stacking context */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-950 dark:to-indigo-950" />

        {/* Animated shapes */}
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
        <div className="mx-auto text-center">
          <motion.h1
            className="text-2xl font-bold capitalize md:text-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h1>
          <motion.p
            className="mb-2 text-lg text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {description}
          </motion.p>
          {enableSearch ? (
            <motion.div
              className="relative mx-auto max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                size={20}
              />
              <Input
                type="search"
                value={search}
                placeholder={placeholder}
                onChange={(e) => {
                  const value = e.target.value.trim().toLowerCase();
                  setSearch(value);
                  handleSearchChange(value);
                }}
                className="rounded-full border-gray-300 bg-white py-6 pl-10 text-base shadow-sm transition-shadow duration-300 hover:shadow-md focus:shadow-md dark:border-gray-700 dark:bg-gray-900"
              />
            </motion.div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
