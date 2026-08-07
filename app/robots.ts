import { MetadataRoute } from "next"
import { SITE_ORIGIN } from "@/lib/site-url"

/**
 * Landing-only crawl policy for search agents.
 * Allow `/` (homepage). Disallow APIs and gated OTP / sign-in flows.
 * Per project: add your OTP path prefixes (e.g. `/sign-in`, `/verify-method`).
 */
const CRAWL_DISALLOW = [
  "/api/",
  "/login/2fa-verify",
  "/login/verify-code",
  "/registration",
  "/registration/",
] as const

/** AI / training crawlers — block site-wide; does not affect Googlebot/Bingbot search indexing. */
const AI_TRAINING_AGENTS = [
  "Google-Extended",
  "Applebot-Extended",
  "DuckAssistBot",
  "GPTBot",
  "ChatGPT-User",
  "anthropic-ai",
  "ClaudeBot",
  "Claude-Web",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "FacebookBot",
  "Diffbot",
  "omgili",
  "YouBot",
] as const

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...CRAWL_DISALLOW],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [...CRAWL_DISALLOW],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [...CRAWL_DISALLOW],
      },
      {
        userAgent: "DuckDuckBot",
        allow: "/",
        disallow: [...CRAWL_DISALLOW],
      },
      {
        userAgent: "Applebot",
        allow: "/",
        disallow: [...CRAWL_DISALLOW],
      },
      {
        userAgent: "Baiduspider",
        allow: "/",
        disallow: [...CRAWL_DISALLOW],
      },
      ...AI_TRAINING_AGENTS.map((userAgent) => ({
        userAgent,
        disallow: ["/"],
      })),
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  }
}
