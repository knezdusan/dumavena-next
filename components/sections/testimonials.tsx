"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { testimonials } from "@/lib/content";

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 60%", "end 40%"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="testimonials"
      ref={ref}
      className="section-padding scroll-mt-24 relative overflow-hidden"
    >
      <div
        className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)",
        }}
      />

      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-(--color-text-muted)">
            Client words
          </span>
          <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight text-(--color-text)">
            What clients say
            <br />
            <span className="text-(--color-text-secondary)">
              after the work ships
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_auto] gap-12 md:gap-16 items-start">
          <div className="min-h-[280px] md:min-h-[240px]">
            {testimonials.map((testimonial, index) => (
              <motion.blockquote
                key={testimonial.name}
                initial={false}
                animate={{
                  opacity: index === activeIndex ? 1 : 0,
                  y: index === activeIndex ? 0 : 20,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`${index === activeIndex ? "relative" : "absolute inset-0"} max-w-2xl`}
              >
                <p className="font-display text-xl md:text-2xl leading-relaxed text-(--color-text)">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border border-(--color-border) object-cover"
                  />
                  <div>
                    <div className="text-sm font-medium text-(--color-text)">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-(--color-text-muted)">
                      {testimonial.company}
                    </div>
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>

          <div className="hidden md:flex flex-col gap-3 min-w-[180px]">
            <div className="relative w-px h-full bg-(--color-border) absolute">
              <motion.div
                style={{ height: lineHeight }}
                className="absolute top-0 left-0 w-px bg-(--color-accent)"
              />
            </div>
            <div className="flex flex-col gap-1">
              {testimonials.map((t, index) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`text-left text-xs py-1.5 px-3 rounded transition-colors ${
                    index === activeIndex
                      ? "text-(--color-accent)"
                      : "text-(--color-text-muted) hover:text-(--color-text-secondary)"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex md:hidden gap-2 mt-4">
            {testimonials.map((t, index) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show testimonial from ${t.name}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-8 bg-(--color-accent)"
                    : "w-1.5 bg-(--color-border)"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
