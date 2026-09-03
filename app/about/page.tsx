import type { Metadata } from "next";
import { ScrollReveal } from "@/components/scroll-effects";
import { Contact } from "@/components/sections/contact";

export const metadata: Metadata = {
  title: "About",
  description:
    "Dumavena is a dedicated team of professionals helping businesses succeed in the digital world through website building, internet marketing, and IT consulting.",
};

export default function AboutPage() {
  return (
    <>
      <section className="section-padding pt-32">
        <div className="container-wide max-w-3xl">
          <ScrollReveal>
            <span className="text-xs uppercase tracking-[0.2em] text-(--color-text-muted)">
              About us
            </span>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4rem)] leading-tight text-(--color-text)">
              We build the digital
              <br />
              <span className="text-(--color-accent)">
                foundation for growing businesses
              </span>
            </h1>
          </ScrollReveal>

          <div className="mt-12 flex flex-col gap-8 text-lg leading-relaxed text-(--color-text-secondary)">
            <ScrollReveal delay={0.1}>
              <p>
                At Dumavena, we are a dedicated team of professionals passionate
                about helping businesses succeed in the digital world. With
                expertise in website building, internet marketing, and IT
                consulting, we provide comprehensive solutions tailored to your
                unique needs.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p>
                Our mission is to empower your online presence by creating
                stunning websites that captivate your audience and deliver
                exceptional user experiences. Through strategic internet
                marketing, we drive targeted traffic to your site, boost
                visibility, and generate tangible results.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p>
                With our IT consulting services, we optimize your technology
                infrastructure, ensuring it aligns with your business goals and
                enhances overall performance. Our experienced consultants
                provide expert guidance to maximize the value of your technology
                investments.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <p>
                We pride ourselves on our attention to detail, creativity, and
                commitment to client satisfaction. We partner with you to
                understand your vision and deliver tailored solutions that help
                your business thrive.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="text-(--color-text)">
                Join us on the journey to digital success. Contact us today and
                let&apos;s turn your online aspirations into reality.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Contact />
    </>
  );
}
