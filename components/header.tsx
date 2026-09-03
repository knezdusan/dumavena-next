"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/content";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        open
          ? "bg-(--color-base) border-b border-(--color-border)"
          : scrolled
            ? "bg-(--color-base)/85 backdrop-blur-md border-b border-(--color-border)"
            : "bg-transparent"
      }`}
    >
      <div className="container-wide flex items-center justify-between h-16 px-5 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2"
          aria-label="Dumavena home"
        >
          <span className="font-display text-xl font-medium tracking-tight text-(--color-text)">
            Dumavena
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-(--color-text-muted) mt-1">
            LLC
          </span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-(--color-text-secondary) hover:text-(--color-text) transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden flex flex-col gap-1.5 p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span
            className={`block w-5 h-px bg-(--color-text) transition-all duration-200 ${
              open ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`block w-5 h-px bg-(--color-text) transition-all duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-px bg-(--color-text) transition-all duration-200 ${
              open ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-16 z-60 h-[calc(100dvh-4rem)] overflow-y-auto border-t border-(--color-border) bg-(--color-base) md:hidden">
          <nav
            className="flex min-h-full flex-col gap-2 px-6 py-8"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-2xl font-display text-(--color-text) py-3 border-b border-(--color-border)"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="text-2xl font-display text-(--color-text-secondary) py-3 border-b border-(--color-border)"
            >
              About
            </Link>
            <Link
              href="/faq"
              onClick={() => setOpen(false)}
              className="text-2xl font-display text-(--color-text-secondary) py-3 border-b border-(--color-border)"
            >
              FAQ
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
