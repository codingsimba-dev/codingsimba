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
        <img src={getImgSrc({ fileKey: "tekbreedlogo.png" })} width={40} />
        <img src={getImgSrc({ fileKey: "tekbreedtext.png" })} width={100} />
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
