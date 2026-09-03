export const site = {
  name: "Dumavena",
  legalName: "Dumavena LLC",
  email: "info@dumavena.com",
  url: "https://dumavena.com",
  jurisdiction: "State of Wyoming",
  tagline:
    "Websites that convert. Marketing that scales. Technology that lasts.",
};

export const services = [
  {
    slug: "website-building",
    title: "Website Building",
    price: 430,
    priceLabel: "from $430",
    headline: "Sites built to convert, not just to impress",
    description:
      "We design and build responsive, SEO-optimized websites that turn visitors into customers. From simple informational pages to robust e-commerce platforms, every site is crafted to align with your brand and drive measurable results.",
    features: [
      "Responsive design for every screen",
      "SEO-optimized architecture",
      "Conversion-focused layouts",
      "Built on modern web technology",
    ],
    image: "/images/portfolio/br-desc.jpg",
    icon: "/images/website-building.jpg",
  },
  {
    slug: "internet-marketing",
    title: "Internet Marketing",
    price: 630,
    priceLabel: "from $630",
    headline: "Traffic that finds you, leads that convert",
    description:
      "Targeted SEO, pay-per-click advertising, and social media marketing that drives qualified traffic to your site. We handle keyword research, on-page optimization, content strategy, and campaign management to generate leads and grow your business.",
    features: [
      "Search engine optimization (SEO)",
      "Pay-per-click advertising",
      "Social media marketing",
      "Content & email marketing",
    ],
    image: "/images/internet-marketing-services.jpg",
    icon: "/images/internet-marketing.jpg",
  },
  {
    slug: "it-consulting",
    title: "IT Consulting",
    price: 330,
    priceLabel: "from $330",
    headline: "Technology infrastructure that performs",
    description:
      "Strategic IT consulting to optimize your technology infrastructure. From strategy development and infrastructure assessment to cybersecurity and cloud solutions, we ensure your technology investments deliver maximum value.",
    features: [
      "IT strategy & infrastructure assessment",
      "Cybersecurity measures",
      "Cloud computing solutions",
      "Software selection & implementation",
    ],
    image: "/images/it-consulting-services.jpg",
    icon: "/images/it-consulting.jpg",
  },
] as const;

export const testimonials = [
  {
    name: "Daniel Clifford",
    company: "Booking Ready LLC",
    avatar: "/images/testimonials/daniel.jpg",
    quote:
      "The team at Dumavena created a stunning website for my business. Their attention to detail truly impressed me. Our old website was outdated, and they revamped it beautifully. It now reflects our brand image and has received positive feedback from our clients.",
  },
  {
    name: "Jonathan Walters",
    company: "Readsomnia.com",
    avatar: "/images/testimonials/jonathan.jpg",
    quote:
      "My website's traffic has skyrocketed, leading to a significant increase in leads and conversions.",
  },
  {
    name: "Jeanette Harmon",
    company: "Security Trails",
    avatar: "/images/testimonials/jjeanette.jpg",
    quote:
      "I highly recommend Dumavena for their exceptional IT consulting services. They helped streamline our technology infrastructure and enhance our overall efficiency. They guided us through complex technology decisions, ensuring our systems are secure and efficient.",
  },
  {
    name: "Patrick Abrahms",
    company: "Serbian Property doo",
    avatar: "/images/testimonials/patrick.jpg",
    quote:
      "They took the time to understand our unique requirements and created a website that truly represents our brand.",
  },
  {
    name: "Kira Whittle",
    company: "Model Tattoo",
    avatar: "/images/testimonials/kira.jpg",
    quote:
      "Working with Dumavena was a game-changer for our business. Their website building, internet marketing, and IT consulting services provided us with a complete solution that exceeded our expectations.",
  },
] as const;

export const faqs = [
  {
    question: "What services does Dumavena offer?",
    answer:
      "We offer a range of services to help businesses succeed in the digital realm. Our core services include professional website building, strategic internet marketing promotion, and comprehensive IT consulting. We provide end-to-end solutions tailored to your unique needs.",
  },
  {
    question: "How can Dumavena help improve my online presence?",
    answer:
      "Our website building service focuses on creating visually stunning and user-friendly websites that leave a lasting impression on your visitors. Our internet marketing strategies drive targeted traffic to your website, boost online visibility, and enhance brand recognition. Additionally, our IT consulting services optimize your technology infrastructure, ensuring optimal performance and efficiency.",
  },
  {
    question: "Can Dumavena assist with search engine optimization (SEO)?",
    answer:
      "Absolutely. As part of our internet marketing service, we employ effective SEO techniques including keyword optimization, content optimization, and backlink strategies to enhance your website's search engine ranking and attract organic traffic.",
  },
  {
    question: "How experienced is the team?",
    answer:
      "Our team comprises skilled professionals with extensive experience in their respective fields. We have a proven track record of delivering successful projects and helping businesses achieve their digital goals. We stay up-to-date with the latest industry trends and best practices to provide you with cutting-edge solutions.",
  },
  {
    question: "Can Dumavena handle both small and large-scale projects?",
    answer:
      "We cater to businesses of all sizes, from startups and small businesses to large enterprises. We understand the unique challenges and requirements of each business, and our services are designed to scale according to your needs. Whether you need a simple website or a complex e-commerce platform, we have you covered.",
  },
  {
    question: "How do I get started with Dumavena?",
    answer:
      "Getting started is easy. Reach out through our contact form or email us at info@dumavena.com. We'll schedule a consultation to discuss your specific requirements and goals, then develop a customized plan and provide you with a quote.",
  },
] as const;

export const portfolio = [
  {
    name: "Booking Ready",
    description:
      "Responsive website builder platform for rental owners and managers.",
    type: "Web Application",
    desktop: "/images/portfolio/br-desc.jpg",
    desktopWidth: 650,
    desktopHeight: 450,
    mobile: "/images/portfolio/br-mob.jpg",
    mobileWidth: 300,
    mobileHeight: 450,
  },
  {
    name: "Readsomnia",
    description: "An online reading community designed for focused discovery.",
    type: "Community Platform",
    desktop: "/images/portfolio/ro-desc.jpg",
    desktopWidth: 650,
    desktopHeight: 450,
    mobile: "/images/portfolio/ro-mob.jpg",
    mobileWidth: 300,
    mobileHeight: 450,
  },
  {
    name: "VectorMatch",
    description:
      "An AI-powered job agent that connects web developers directly with hidden opportunities and decision makers.",
    type: "AI SaaS Platform",
    url: "https://vectormatch.dev/",
    desktop: "/images/portfolio/vectormatch-desktop.png",
    desktopWidth: 1300,
    desktopHeight: 900,
    mobile: "/images/portfolio/vectormatch-mobile.png",
    mobileWidth: 600,
    mobileHeight: 900,
  },
  {
    name: "Srbija Nekretnine",
    description:
      "A property marketplace for discovering homes, commercial spaces, land, and new developments across Serbia.",
    type: "Real Estate Marketplace",
    url: "https://www.srbija-nekretnine.org/",
    desktop: "/images/portfolio/srbija-nekretnine-desktop.png",
    desktopWidth: 760,
    desktopHeight: 600,
  },
] as const;

export const navLinks = [
  { href: "/#website-building", label: "Websites" },
  { href: "/#internet-marketing", label: "Marketing" },
  { href: "/#it-consulting", label: "Consulting" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#contact", label: "Contact" },
] as const;

export const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-services", label: "Terms of Service" },
] as const;
