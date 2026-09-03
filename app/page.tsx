import type { Metadata } from "next";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Portfolio } from "@/components/sections/portfolio";
import { PromotionCounter } from "@/components/sections/promotion-counter";
import { Services } from "@/components/sections/services";
import { Testimonials } from "@/components/sections/testimonials";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Dumavena — Websites, Marketing & IT Consulting",
  description:
    "Dumavena builds stunning websites, drives targeted traffic with SEO and internet marketing, and provides strategic IT consulting for growing businesses.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.legalName,
    description:
      "Website building, internet marketing, and IT consulting services.",
    url: site.url,
    email: site.email,
    priceRange: "$$$",
    areaServed: "Global",
    serviceType: ["Website Building", "Internet Marketing", "IT Consulting"],
    offerCatalog: {
      "@type": "OfferCatalog",
      offers: [
        {
          "@type": "Offer",
          name: "Website Building",
          price: "430",
          priceCurrency: "USD",
          description: "Professional website building starting from $430",
        },
        {
          "@type": "Offer",
          name: "Internet Marketing",
          price: "630",
          priceCurrency: "USD",
          description: "Internet marketing and SEO starting from $630",
        },
        {
          "@type": "Offer",
          name: "IT Consulting",
          price: "330",
          priceCurrency: "USD",
          description: "Strategic IT consulting starting from $330",
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <PromotionCounter />
      <Services />
      <Portfolio />
      <Testimonials />
      <Contact />
    </>
  );
}
