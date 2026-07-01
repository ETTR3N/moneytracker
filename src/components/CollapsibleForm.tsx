"use client";

import { motion, AnimatePresence } from "motion/react";

export default function CollapsibleForm({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="pt-1 pb-1">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
