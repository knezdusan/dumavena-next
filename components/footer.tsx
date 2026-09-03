import Link from "next/link";
import { footerLinks, site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-(--color-border) bg-(--color-surface)">
      <div className="container-wide px-5 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-xs">
            <div className="font-display text-lg text-(--color-text)">
              {site.name}
            </div>
            <p className="mt-2 text-sm text-(--color-text-muted) leading-relaxed">
              {site.tagline}
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-3 inline-block text-sm text-(--color-accent) hover:text-(--color-accent-soft) transition-colors"
            >
              {site.email}
            </a>
          </div>

          <nav className="flex flex-col gap-2" aria-label="Footer navigation">
            <span className="text-xs uppercase tracking-wider text-(--color-text-muted) mb-1">
              Pages
            </span>
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wider text-(--color-text-muted) mb-1">
              Services
            </span>
            <Link
              href="/#website-building"
              className="text-sm text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
            >
              Website Building
            </Link>
            <Link
              href="/#internet-marketing"
              className="text-sm text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
            >
              Internet Marketing
            </Link>
            <Link
              href="/#it-consulting"
              className="text-sm text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
            >
              IT Consulting
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-(--color-border) flex flex-col sm:flex-row justify-between gap-2">
          <p className="text-xs text-(--color-text-muted)">
            &copy; {new Date().getFullYear()} {site.legalName}. All rights
            reserved.
          </p>
          <p className="text-xs text-(--color-text-muted)">
            Governed by the laws of {site.jurisdiction}
          </p>
        </div>
      </div>
    </footer>
  );
}
