import type { Metadata } from "next";
import { ScrollReveal } from "@/components/scroll-effects";
import { faqs, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Dumavena's website building, internet marketing, and IT consulting services.",
};

export default function FAQPage() {
  return (
    <section className="section-padding pt-32">
      <div className="container-wide max-w-3xl">
        <ScrollReveal>
          <span className="text-xs uppercase tracking-[0.2em] text-(--color-text-muted)">
            FAQ
          </span>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4rem)] leading-tight text-(--color-text)">
            Frequently asked
            <br />
            <span className="text-(--color-text-secondary)">questions</span>
          </h1>
        </ScrollReveal>

        <div className="mt-16 flex flex-col gap-px bg-(--color-border) border border-(--color-border) rounded-2xl overflow-hidden">
          {faqs.map((faq, index) => (
            <ScrollReveal key={faq.question} delay={index * 0.05}>
              <details className="group bg-(--color-surface) hover:bg-(--color-surface-raised) transition-colors">
                <summary className="flex items-start justify-between gap-4 p-6 md:p-8 cursor-pointer list-none">
                  <h2 className="font-display text-lg md:text-xl text-(--color-text) pr-4">
                    {faq.question}
                  </h2>
                  <span className="shrink-0 mt-1 w-6 h-6 flex items-center justify-center text-(--color-text-muted) group-open:text-(--color-accent) transition-colors">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      role="img"
                      aria-label={faq.question}
                    >
                      <title>{faq.question}</title>
                      <path
                        d="M7 1v12M1 7h12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="group-open:opacity-0 transition-opacity"
                      />
                      <path
                        d="M1 7h12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="opacity-0 group-open:opacity-100 transition-opacity"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 md:px-8 pb-6 md:pb-8 -mt-1">
                  <p className="text-(--color-text-secondary) leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <p className="mt-12 text-center text-(--color-text-secondary)">
            Still have questions?{" "}
            <a
              href={`mailto:${site.email}`}
              className="text-(--color-accent) hover:text-(--color-accent-soft) transition-colors border-b border-(--color-accent)/30"
            >
              Email us
            </a>{" "}
            or use the{" "}
            <a
              href="/#contact"
              className="text-(--color-accent) hover:text-(--color-accent-soft) transition-colors border-b border-(--color-accent)/30"
            >
              contact form
            </a>
            .
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
