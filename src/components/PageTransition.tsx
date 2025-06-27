"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";

interface PageTransitionProps {
  children: ReactNode;
  transitionType?: "slide" | "fade" | "scale";
}

const slideVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: -20,
  },
};

const fadeVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const scaleVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  in: {
    opacity: 1,
    scale: 1,
  },
  out: {
    opacity: 0,
    scale: 1.05,
  },
};

const getVariants = (type: string) => {
  switch (type) {
    case "slide":
      return slideVariants;
    case "scale":
      return scaleVariants;
    case "fade":
    default:
      return fadeVariants;
  }
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.4, 0.0, 0.2, 1] as const,
  duration: 0.15, // Even faster for instant feel
};

export function PageTransition({
  children,
  transitionType = "fade",
}: PageTransitionProps) {
  const pathname = usePathname();
  const variants = useMemo(() => getVariants(transitionType), [transitionType]);

  return (
    <div className="page-transition-container w-full h-full">
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => {
          window.scrollTo(0, 0);
        }}
      >
        <motion.div
          key={pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={variants}
          transition={pageTransition}
          className="w-full h-full"
          style={{
            willChange: "transform, opacity",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translateZ(0)",
          }}
          layout
          layoutId="page-content"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
