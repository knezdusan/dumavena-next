import type { Metadata } from "next";
import { ScrollReveal } from "@/components/scroll-effects";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Dumavena collects, uses, and protects your personal information.",
};

const sections = [
  {
    title: "Information Collection",
    body: "We may collect personal information such as your name, email address, and contact details when you voluntarily submit them through our website or during the course of our services. We may also collect non-personal information such as IP addresses and browser information for analytics and website improvement purposes.",
  },
  {
    title: "Information Usage",
    body: "The personal information we collect is used to provide you with the services you request and to improve your user experience. We may use your contact information to communicate with you about our services, updates, and promotional offers. We do not sell, rent, or share your personal information with third parties without your consent, except as required by law.",
  },
  {
    title: "Data Protection",
    body: "We employ industry-standard security measures to safeguard your personal information from unauthorized access, disclosure, or alteration. However, please note that no method of data transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    title: "Third-Party Links",
    body: "Our website may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party websites you visit.",
  },
  {
    title: "Cookies",
    body: "We may use cookies to enhance your browsing experience and collect usage data. Cookies are small text files stored on your device. You can adjust your browser settings to refuse cookies, but this may limit certain features of our website.",
  },
  {
    title: "Your Rights",
    body: "You have the right to access, update, or delete your personal information held by us. If you have any concerns or inquiries regarding your data privacy, please contact us using the information provided below.",
  },
  {
    title: "Updates to Privacy Policy",
    body: "We reserve the right to update or modify this Privacy Policy from time to time. Any changes will be posted on this page, and the revised policy will be effective upon posting.",
  },
];

export default function PrivacyPage() {
  return (
    <section className="section-padding pt-32">
      <div className="container-wide max-w-3xl">
        <ScrollReveal>
          <span className="text-xs uppercase tracking-[0.2em] text-(--color-text-muted)">
            Legal
          </span>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight text-(--color-text)">
            Privacy Policy
          </h1>
          <p className="mt-6 text-(--color-text-secondary) leading-relaxed">
            At {site.legalName}, we value the privacy and security of our users.
            This Privacy Policy outlines how we collect, use, and protect the
            information you provide while using our website and services.
          </p>
        </ScrollReveal>

        <div className="mt-12 flex flex-col gap-8">
          {sections.map((section, index) => (
            <ScrollReveal key={section.title} delay={index * 0.05}>
              <div className="border-l border-(--color-border) pl-6">
                <h2 className="font-display text-lg text-(--color-text)">
                  {section.title}
                </h2>
                <p className="mt-3 text-(--color-text-secondary) leading-relaxed">
                  {section.body}
                </p>
              </div>
            </ScrollReveal>
          ))}

          <ScrollReveal delay={0.1}>
            <div className="border-l border-(--color-accent) pl-6">
              <h2 className="font-display text-lg text-(--color-text)">
                Contact Us
              </h2>
              <p className="mt-3 text-(--color-text-secondary) leading-relaxed">
                If you have any questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us at{" "}
                <a
                  href={`mailto:${site.email}`}
                  className="text-(--color-accent) hover:text-(--color-accent-soft) transition-colors"
                >
                  {site.email}
                </a>
                .
              </p>
              <p className="mt-4 text-sm text-(--color-text-muted)">
                By using our website and services, you consent to the terms of
                this Privacy Policy.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
