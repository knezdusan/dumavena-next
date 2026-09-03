"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { services } from "@/lib/content";

export function Services() {
  return (
    <section className="section-padding overflow-x-clip">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-2xl"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-(--color-text-muted)">
            What we do
          </span>
          <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight text-(--color-text)">
            Three services.
            <br />
            <span className="text-(--color-text-secondary)">
              One complete solution.
            </span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-24">
          {services.map((service, index) => (
            <ServiceRow key={service.slug} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceRow({
  service,
  index,
}: {
  service: (typeof services)[number];
  index: number;
}) {
  const isReversed = index % 2 === 1;

  return (
    <div
      id={service.slug}
      className="grid scroll-mt-24 items-center gap-8 md:grid-cols-2 md:gap-16"
    >
      <div className={isReversed ? "md:order-2" : ""}>
        <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-(--color-surface) edge-light">
          <Image
            src={service.image}
            alt={service.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, var(--color-accent-glow) 0%, transparent 60%)`,
            }}
          />
          <div className="absolute top-4 left-4 z-10">
            <span className="font-display text-5xl text-white/20 select-none">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-(--color-border) bg-surface/80 backdrop-blur-sm">
            <span className="text-xs uppercase tracking-wider text-(--color-text-muted)">
              {service.priceLabel}
            </span>
          </div>
        </div>
      </div>

      <div className={isReversed ? "md:order-1" : ""}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-xs uppercase tracking-[0.2em] text-(--color-accent)">
            {service.title}
          </span>
          <h3 className="mt-3 font-display text-2xl md:text-3xl leading-tight text-(--color-text)">
            {service.headline}
          </h3>
          <p className="mt-4 text-(--color-text-secondary) leading-relaxed">
            {service.description}
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-3">
            {service.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-(--color-text-secondary)"
              >
                <span className="mt-1.5 w-1 h-1 rounded-full bg-(--color-accent) shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href="/#contact"
            className="mt-8 inline-flex items-center gap-2 text-sm text-(--color-text) hover:text-(--color-accent) transition-colors group"
          >
            <span className="border-b border-(--color-border) group-hover:border-(--color-accent) pb-0.5 transition-colors">
              Send your query
            </span>
            <span className="transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
