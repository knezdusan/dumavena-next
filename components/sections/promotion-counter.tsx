"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

export function PromotionCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "center 40%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
  });

  const percentage = useTransform(smoothProgress, [0, 1], [0, 30]);
  const displayValue = useTransform(percentage, (v) =>
    Math.round(v).toString(),
  );
  const circleLength = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center justify-center py-20"
    >
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
          role="img"
          aria-label="Promotion progress indicator"
        >
          <title>Promotion progress indicator</title>
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            pathLength={1}
            style={{ pathLength: circleLength }}
          />
        </svg>
        <div className="relative flex flex-col items-center">
          <motion.span
            className="font-display text-5xl text-(--color-accent) tabular-nums"
            style={{ "--sc-p": displayValue } as React.CSSProperties}
          >
            <motion.span style={{ display: "inline-block" }}>
              {displayValue}
            </motion.span>
          </motion.span>
          <span className="text-xs uppercase tracking-wider text-(--color-text-muted) mt-1">
            % off
          </span>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-8 text-center max-w-md text-(--color-text-secondary)"
      >
        A limited-time promotion across every service we offer.
        <br />
        Website building, internet marketing, and IT consulting.
      </motion.p>
    </div>
  );
}
