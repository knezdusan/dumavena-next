import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dumavena.com"),
  title: {
    default: "Dumavena — Websites, Marketing & IT Consulting",
    template: "%s | Dumavena",
  },
  description:
    "Dumavena builds stunning websites, drives targeted traffic with SEO and internet marketing, and provides strategic IT consulting for growing businesses.",
  keywords: [
    "website building",
    "internet marketing",
    "SEO",
    "IT consulting",
    "web design",
    "digital agency",
  ],
  authors: [{ name: "Dumavena LLC" }],
  creator: "Dumavena LLC",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dumavena.com",
    siteName: "Dumavena",
    title: "Dumavena — Websites, Marketing & IT Consulting",
    description:
      "We build stunning websites, drive targeted traffic with SEO and internet marketing, and provide strategic IT consulting.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dumavena — Websites, Marketing & IT Consulting",
    description:
      "We build stunning websites, drive targeted traffic with SEO and internet marketing, and provide strategic IT consulting.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${geistSans.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-(--color-base) text-(--color-text)"
        suppressHydrationWarning
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
