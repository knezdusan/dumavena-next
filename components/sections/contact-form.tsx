"use client";

import { useActionState, useEffect, useRef } from "react";
import { type ContactState, submitContact } from "@/app/actions";

const initialState: ContactState = {
  success: false,
  message: "",
};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContact,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.success && successRef.current) {
      successRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [state.success]);

  if (state.success) {
    return (
      <div
        ref={successRef}
        className="rounded-xl border border-(--color-accent)/30 bg-(--color-accent-glow) p-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-(--color-accent)/10 mb-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 10l3.5 3.5L15 7"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="font-display text-xl text-(--color-text)">
          {state.message}
        </p>
        <button
          type="button"
          onClick={() => formRef.current?.reset()}
          className="mt-4 text-sm text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* Honeypot field — hidden from users, catches bots */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company">Company (leave empty)</label>
        <input
          type="text"
          id="company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="name"
          className="text-xs uppercase tracking-wider text-(--color-text-muted)"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          minLength={3}
          maxLength={60}
          placeholder="Your name"
          className="rounded-lg bg-(--color-surface) border border-(--color-border) px-4 py-3 text-(--color-text) placeholder:text-(--color-text-muted) focus:border-(--color-accent) focus:outline-none transition-colors"
          aria-invalid={!!state.errors?.name}
        />
        {state.errors?.name && (
          <p className="text-xs text-red-400">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-xs uppercase tracking-wider text-(--color-text-muted)"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          maxLength={60}
          placeholder="you@example.com"
          className="rounded-lg bg-(--color-surface) border border-(--color-border) px-4 py-3 text-(--color-text) placeholder:text-(--color-text-muted) focus:border-(--color-accent) focus:outline-none transition-colors"
          aria-invalid={!!state.errors?.email}
        />
        {state.errors?.email && (
          <p className="text-xs text-red-400">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="message"
          className="text-xs uppercase tracking-wider text-(--color-text-muted)"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={500}
          rows={5}
          placeholder="Tell us about your project..."
          className="rounded-lg bg-(--color-surface) border border-(--color-border) px-4 py-3 text-(--color-text) placeholder:text-(--color-text-muted) focus:border-(--color-accent) focus:outline-none transition-colors resize-y"
          aria-invalid={!!state.errors?.message}
        />
        <div className="flex justify-between items-center">
          {state.errors?.message ? (
            <p className="text-xs text-red-400">{state.errors.message[0]}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-(--color-text-muted)">
            500 char max
          </span>
        </div>
      </div>

      {state.message && !state.success && (
        <p className="text-sm text-red-400" role="alert">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-(--color-accent) text-(--color-base) font-medium text-sm hover:bg-(--color-accent-soft) transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
