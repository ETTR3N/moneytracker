"use client";

import { Children } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Wraps already-rendered keyed children in animated <li> elements.
 * Takes children (not a render-prop) so Server Components can use it too --
 * functions can't cross the server/client boundary, but rendered JSX can.
 */
export default function AnimatedList({
  children,
  className,
  itemClassName,
}: {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
}) {
  const items = Children.toArray(children);

  return (
    <ul className={className ?? "flex flex-col gap-2"}>
      <AnimatePresence initial={false}>
        {items.map((child, index) => (
          <motion.li
            key={(child as { key: React.Key | null }).key}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: index * 0.03 } }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={itemClassName}
          >
            {child}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
