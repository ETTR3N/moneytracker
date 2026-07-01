"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useMotionValue, useMotionValueEvent } from "motion/react";

export default function AnimatedNumber({
  value,
  formatter,
  className,
}: {
  value: number;
  formatter: (n: number) => string;
  className?: string;
}) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(formatter(0));
  const firstRun = useRef(true);

  useMotionValueEvent(motionValue, "change", (latest) => {
    setDisplay(formatter(latest));
  });

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: firstRun.current ? 1 : 0.6,
      ease: [0.16, 1, 0.3, 1],
    });
    firstRun.current = false;
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={className}>{display}</span>;
}
