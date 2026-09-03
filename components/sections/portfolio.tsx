"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { portfolio } from "@/lib/content";

export function Portfolio() {
  return (
    <section className="section-padding border-t border-(--color-border)">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-(--color-text-muted)">
            Selected work
          </span>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] text-(--color-text)">
            Projects we shipped
          </h2>
        </motion.div>

        <div className="flex flex-col gap-8">
          {portfolio.map((item, index) => {
            const title = (
              <span className="inline-flex items-center gap-2">
                {item.name}
                {"url" in item ? (
                  <span className="text-base text-(--color-text-muted) transition-transform group-hover/title:translate-x-1">
                    &rarr;
                  </span>
                ) : null}
              </span>
            );

            return (
              <motion.article
                key={item.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)"
              >
                <div className="grid items-center gap-4 p-6 md:grid-cols-[1fr_auto] md:p-8">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-(--color-text-muted)">
                      {item.type}
                    </span>
                    <h3 className="mt-2 font-display text-xl text-(--color-text) transition-colors group-hover:text-(--color-accent) md:text-2xl">
                      {"url" in item ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group/title"
                        >
                          {title}
                        </a>
                      ) : (
                        title
                      )}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-(--color-text-secondary)">
                      {item.description}
                    </p>
                  </div>
                  <span className="font-display text-4xl text-(--color-border) transition-colors group-hover:text-(--color-accent)">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="px-6 pb-6 md:px-8 md:pb-8">
                  <div
                    className={
                      "mobile" in item
                        ? "grid grid-cols-[13fr_6fr] items-start gap-3 md:gap-4"
                        : ""
                    }
                  >
                    <Image
                      src={item.desktop}
                      alt={`${item.name} desktop view`}
                      width={item.desktopWidth}
                      height={item.desktopHeight}
                      sizes="(max-width: 768px) 65vw, 780px"
                      className="h-auto w-full rounded-lg border border-(--color-border) object-contain"
                    />
                    {"mobile" in item ? (
                      <Image
                        src={item.mobile}
                        alt={`${item.name} mobile view`}
                        width={item.mobileWidth}
                        height={item.mobileHeight}
                        sizes="(max-width: 768px) 30vw, 360px"
                        className="h-auto w-full rounded-lg border border-(--color-border) object-contain"
                      />
                    ) : null}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
