"use client";

import { motion } from "motion/react";
import { site } from "@/lib/content";
import { ContactForm } from "./contact-form";

export function Contact() {
  return (
    <section
      id="contact"
      className="section-padding scroll-mt-24 border-t border-(--color-border)"
    >
      <div className="container-wide">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-(--color-text-muted)">
              Get in touch
            </span>
            <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] leading-tight text-(--color-text)">
              Let&apos;s build
              <br />
              <span className="text-(--color-text-secondary)">
                something together
              </span>
            </h2>
            <p className="mt-6 text-(--color-text-secondary) leading-relaxed max-w-md">
              Tell us about your project and goals. We&apos;ll get back to you
              within 24 hours with next steps and a quote.
            </p>
            <div className="mt-8 flex flex-col gap-2">
              <a
                href={`mailto:${site.email}`}
                className="text-sm text-(--color-accent) hover:text-(--color-accent-soft) transition-colors"
              >
                {site.email}
              </a>
              <p className="text-xs text-(--color-text-muted)">
                Or email us directly if you prefer
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
