"use server";

import { headers } from "next/headers";
import { z } from "zod";

const schema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(60, "Name must be 60 characters or less"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(60, "Email must be 60 characters or less"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be 500 characters or less"),
  // Honeypot field — should be empty
  company: z.string().max(0, "Spam detected").optional(),
});

export type ContactState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// Resend error shape — they return { name, message, ... } on failure.
type ResendError = {
  name?: string;
  message?: string;
  statusCode?: number;
};

function describeResendError(error: unknown): string {
  // Missing API key — most common local-dev failure
  if (!process.env.RESEND_API_KEY) {
    return "Email delivery is not configured. Please email us directly at info@dumavena.com.";
  }

  const resendError = error as ResendError;
  const name = resendError?.name ?? "";
  const statusCode = resendError?.statusCode;
  const message = resendError?.message ?? "";

  // 422: unverified from-address (sending from a domain not verified in Resend)
  if (statusCode === 422 || name === "validation_error") {
    return "The sender address is not verified in Resend. Email us directly at info@dumavena.com while we fix this.";
  }

  // 403: missing/invalid API key
  if (statusCode === 403 || name === "forbidden") {
    return "Email delivery credentials are invalid. Please email us directly at info@dumavena.com.";
  }

  // 429: rate limited
  if (statusCode === 429 || name === "rate_limit_exceeded") {
    return "Too many messages sent recently. Please wait a few minutes and try again.";
  }

  // Network / DNS issues
  if (
    name === "network_error" ||
    message.toLowerCase().includes("fetch") ||
    message.toLowerCase().includes("network")
  ) {
    return "Could not reach the email service. Please check your connection and try again.";
  }

  // Generic fallback — never expose internal details to the user
  return "Something went wrong sending your message. Please try emailing us directly at info@dumavena.com.";
}

// --- Rate limiting (in-memory, per-IP) ---
// 3 submissions per 10 minutes per IP. In-memory means it resets on server
// restart and is per-instance (fine for single-server deployments; for
// multi-instance, swap this for Redis or Upstash rate limit).
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const rateLimitMap = new Map<string, number[]>();

async function getClientIp(): Promise<string> {
  const h = await headers();
  // Try common proxy headers first, then fall back to a generic key
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterMs: number;
} {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateLimitMap.get(ip) ?? []).filter(
    (t) => t > windowStart,
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    const oldest = timestamps[0];
    const retryAfterMs = oldest + RATE_LIMIT_WINDOW_MS - now;
    return { allowed: false, retryAfterMs };
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return { allowed: true, retryAfterMs: 0 };
}

// Periodically prune stale IPs to prevent the Map from growing unbounded.
// Checked on each call rather than a setInterval so it works in serverless too.
function pruneRateLimitMap() {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  for (const [ip, timestamps] of rateLimitMap) {
    const fresh = timestamps.filter((t) => t > windowStart);
    if (fresh.length === 0) {
      rateLimitMap.delete(ip);
    } else if (fresh.length !== timestamps.length) {
      rateLimitMap.set(ip, fresh);
    }
  }
}

export async function submitContact(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    company: formData.get("company"),
  };

  const validated = schema.safeParse(raw);

  if (!validated.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Rate limit check — after validation so spam bots still waste effort on
  // invalid input but real users hitting validation errors don't consume quota.
  pruneRateLimitMap();
  const ip = await getClientIp();
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    const retryAfterMin = Math.ceil(retryAfterMs / 60000);
    return {
      success: false,
      message: `You've sent too many messages recently. Please try again in ${retryAfterMin} minute${retryAfterMin === 1 ? "" : "s"}.`,
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { name, email, message } = validated.data;

    const { data, error } = await resend.emails.send({
      from:
        process.env.CONTACT_FROM_EMAIL || "Dumavena <onboarding@resend.dev>",
      to: process.env.CONTACT_TO_EMAIL || "info@dumavena.com",
      replyTo: `${name} <${email}>`,
      subject: `New contact form submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d4a24e;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    if (error) {
      // Resend returns { data: null, error } on failure — log full detail for ops
      console.error("Resend returned an error:", {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
      });
      return {
        success: false,
        message: describeResendError(error),
      };
    }

    // Sanity check — should not happen, but guards against a malformed success
    if (!data?.id) {
      console.error("Resend send returned no message id:", { data });
      return {
        success: false,
        message:
          "Something went wrong sending your message. Please try emailing us directly at info@dumavena.com.",
      };
    }

    return {
      success: true,
      message: "Thank you, we will reach out soon!",
    };
  } catch (error) {
    console.error("Contact form threw:", error);
    return {
      success: false,
      message: describeResendError(error),
    };
  }
}
