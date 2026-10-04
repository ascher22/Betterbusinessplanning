import { buildSiteKeywords, PAGE_H1_HEADING } from "@/lib/seo-keywords"
import { CANONICAL_HOST, SITE_DISPLAY_NAME } from "@/lib/site-url"

/** ≥15 characters for Bing / SEO tools. */
export const SITE_TITLE = `${SITE_DISPLAY_NAME} - Login to Your Benefits Account`

export const SITE_DESCRIPTION =
  "BBP Admin member portal. Sign in securely to manage your benefits with Better Business Planning, Inc."

export const SITE_KEYWORDS: string[] = buildSiteKeywords()

export { PAGE_H1_HEADING }

export const LAYOUT_DESCRIPTION = SITE_DESCRIPTION

/** Live SERP-style default title used by some audits / docs (≥15 chars). */
export const SERP_DEFAULT_TITLE = SITE_TITLE

const VISIBLE_HOST_TOKENS = [
  CANONICAL_HOST.toLowerCase(),
  CANONICAL_HOST.replace(/^www\./, "").toLowerCase(),
  // Registrable domains — a subdomain always contains its registrable domain, so
  // these cover betterbusinessplanning.wealthcareportal.com, wealthcareportal.com,
  // bbpadmin.com, www.bbpadmin.com, BBPAdmin.com, bbp-dac.com.
  "wealthcareportal.com",
  "bbpadmin.com",
  "bbp-dac.com",
]

/**
 * URL chrome (scheme, path, query) is meta-only too — never visible body copy.
 * The TLD pattern is a safety net so a future domain keyword added to
 * seo-keywords.ts cannot silently leak into the visible `Related searches:` block.
 */
function hasUrlChrome(keyword: string): boolean {
  return (
    /https?:\/\//i.test(keyword) ||
    keyword.includes("/") ||
    /\b(?:[a-z0-9-]+\.)+(?:com|net|org|io|gov|edu|co|us|uk|biz|info|ai|app|dev)\b/i.test(keyword)
  )
}

/**
 * Body-safe keywords for the visible `Related searches: …` crawler body block.
 * Raw domain tokens stay in `<meta name="keywords">` only — Yandex still reads
 * meta keywords; a domain in visible body copy reads as stuffing to Google/Bing.
 *
 * This is a placement change, not a deletion: the filtered tokens remain in
 * SITE_KEYWORDS, so the meta ∪ body union is unchanged (Absolute Keyword
 * Preservation Rule judges on that union).
 */
export function buildVisibleKeywords(): string[] {
  return SITE_KEYWORDS.filter(
    (k) =>
      !hasUrlChrome(k) && !VISIBLE_HOST_TOKENS.some((h) => k.toLowerCase().includes(h)),
  )
}

export const SITE_VISIBLE_KEYWORDS = buildVisibleKeywords()
