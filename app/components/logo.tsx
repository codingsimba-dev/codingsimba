import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { useMobileNav } from "~/utils/mobile-nav-provider";
import { getImgSrc } from "~/utils/misc";

export function Logo() {
  const { closeMobileNav } = useMobileNav();
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={closeMobileNav}
    >
      <Link
        to="/"
        className="relative z-10 flex items-center gap-1 text-xl font-bold md:text-2xl"
      >
        <img
          src={getImgSrc({ fileKey: "tekbreedlogo.png", path: "assets" })}
          width={40}
        />
        <img
          src={getImgSrc({ fileKey: "tekbreedtext.png", path: "assets" })}
          width={100}
          // height={100}
        />
        {/* <motion.span
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-extrabold text-transparent dark:from-blue-400 dark:to-purple-400"
          whileHover={{
            scale: [1, 1.2, 1],
            transition: { duration: 0.5 },
          }}
        >
          Coding
        </motion.span>

        <motion.span
          className="bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 bg-clip-text font-bold text-transparent dark:from-gray-200 dark:via-gray-400 dark:to-gray-200"
          whileHover={{
            scale: [1, 1.3, 1],
            transition: { duration: 0.5 },
          }}
        >
          Simba
        </motion.span> */}
      </Link>

      {/* Explosion particles */}
      <AnimatePresence>
        {isHovered && (
          <>
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute z-0 h-2 w-2 rounded-full bg-yellow-400"
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: [1, 0],
                  scale: [1, 2],
                  x: Math.random() * 100 - 50,
                  y: Math.random() * 100 - 50,
                  background: ["#facc15", "#f97316", "#ef4444", "#ffffff"],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: i * 0.02,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Shockwave circle */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 z-0 rounded-full border-2 border-orange-500"
            initial={{
              scale: 0,
              opacity: 1,
            }}
            animate={{
              scale: 3,
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
