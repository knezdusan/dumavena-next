import type { Metadata } from "next";
import { ScrollReveal } from "@/components/scroll-effects";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The rules and regulations for using Dumavena's website and services.",
};

const sections = [
  {
    title: "Acceptance of Terms",
    body: `Welcome to ${site.legalName}. These Terms of Service outline the rules and regulations for using our website and services. By accessing or using our website, you agree to comply with these terms. If you do not agree with any part of these terms, please refrain from using our services.`,
  },
  {
    title: "Intellectual Property",
    body: "All content, including text, graphics, logos, and images, on this website is the property of Dumavena LLC and protected by applicable intellectual property laws. You may not use, modify, reproduce, or distribute any content without our prior written consent.",
  },
  {
    title: "User Responsibilities",
    body: "When using our website and services, you agree to: (1) Provide accurate and up-to-date information during the registration process. (2) Maintain the confidentiality of your account credentials and not share them with third parties. (3) Use our website and services for lawful purposes and not engage in any illegal or unauthorized activities. (4) Respect the rights of other users and not engage in any behavior that may infringe upon their rights or disrupt their experience. (5) Adhere to any additional guidelines or rules specific to certain services or features on our website.",
  },
  {
    title: "Limitations of Liability",
    body: "While we strive to provide accurate and reliable information, we make no warranties or representations regarding the completeness, accuracy, or reliability of the content on our website. We shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from the use or inability to use our website or services.",
  },
  {
    title: "External Links",
    body: "Our website may contain links to third-party websites or services. We do not endorse, control, or assume responsibility for the content or practices of these external sites. Accessing and using these third-party links is at your own risk.",
  },
  {
    title: "Termination",
    body: "We reserve the right to terminate or suspend your access to our website and services at any time, without prior notice or liability, for any reason whatsoever, including breach of these Terms of Service.",
  },
  {
    title: "Governing Law",
    body: `These Terms of Service shall be governed by and construed in accordance with the laws of ${site.jurisdiction}. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of ${site.jurisdiction}.`,
  },
  {
    title: "Changes to Terms of Service",
    body: "We reserve the right to update or modify these Terms of Service at any time without prior notice. Any changes will be effective upon posting on this page.",
  },
];

export default function TermsPage() {
  return (
    <section className="section-padding pt-32">
      <div className="container-wide max-w-3xl">
        <ScrollReveal>
          <span className="text-xs uppercase tracking-[0.2em] text-(--color-text-muted)">
            Legal
          </span>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight text-(--color-text)">
            Terms of Service
          </h1>
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
                If you have any questions, concerns, or requests regarding these
                Terms of Service, please contact us at{" "}
                <a
                  href={`mailto:${site.email}`}
                  className="text-(--color-accent) hover:text-(--color-accent-soft) transition-colors"
                >
                  {site.email}
                </a>
                .
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
