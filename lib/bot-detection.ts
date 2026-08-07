/**
 * Crawler UA classification for SSR CrawlerSeoPage + middleware headers.
 *
 * | Bucket        | Destination                                      |
 * |---------------|--------------------------------------------------|
 * | Ranking       | CrawlerSeoPage on `/` (Google/Bing/DDG/Yahoo/…)  |
 * | Social        | CrawlerSeoPage on `/` (link previews)            |
 * | Discovery     | CrawlerSeoPage on `/` (Yandex/Mojeek/CCBot/…)    |
 * | Denied        | ErrorScreen / CF block (Ahrefs/Semrush/scanners) |
 *
 * SEARCH_CRAWLER_UA = ranking only (Google/Bing-specific headers).
 * isCrawlerSeoPageUA = ranking ∪ social ∪ discovery → x-crawler-seo-page.
 */

export const GOOGLE_CRAWLER_UA =
  /googlebot|mediapartners-google|adsbot-google|feedfetcher-google|google-inspectiontool|google-extended|storebot-google/i

export const BING_CRAWLER_UA =
  /bingbot|msnbot|bingpreview|microsoftpreview|bingvideopreview|adidxbot/i

export const DUCKDUCK_CRAWLER_UA = /duckduckbot|duckduckgo-favicons-bot/i

export const YAHOO_CRAWLER_UA = /slurp/i

export const APPLE_CRAWLER_UA = /applebot/i

export const BAIDU_CRAWLER_UA = /baiduspider/i

/** SSR ranking crawlers — union of per-engine patterns (no google-extended). */
export const SEARCH_CRAWLER_UA =
  /googlebot|mediapartners-google|adsbot-google|feedfetcher-google|google-inspectiontool|storebot-google|bingbot|msnbot|bingpreview|microsoftpreview|bingvideopreview|adidxbot|duckduckbot|duckduckgo-favicons-bot|slurp|applebot|baiduspider/i

/** Social / messaging link-preview bots. */
export const SOCIAL_PREVIEW_UA =
  /facebookexternalhit|facebot|facebookbot|twitterbot|linkedinbot|pinterest|slackbot|discordbot|whatsapp|skypeuripreview|telegrambot/i

/**
 * Discovery / indie / archive crawlers that help internet discovery.
 * (Not competitive SEO tools — those are denied separately.)
 */
export const DISCOVERY_CRAWLER_UA =
  /yandexbot|yandeximages|yandexvideo|yandexmedia|yandexblogs|\byandex\b|mojeekbot|mojeek|marginalia|ccbot|commoncrawl|ia_archiver/i

/** Combined allowlist for CrawlerSeoPage + x-crawler-seo-page stamp. */
export const CRAWLER_SEO_PAGE_UA = new RegExp(
  `(?:${SEARCH_CRAWLER_UA.source})|(?:${SOCIAL_PREVIEW_UA.source})|(?:${DISCOVERY_CRAWLER_UA.source})`,
  "i",
)

export function isGoogleCrawlerUA(ua: string | null | undefined): boolean {
  return GOOGLE_CRAWLER_UA.test(ua ?? "")
}

export function isBingCrawlerUA(ua: string | null | undefined): boolean {
  return BING_CRAWLER_UA.test(ua ?? "")
}

export function isDuckDuckCrawlerUA(ua: string | null | undefined): boolean {
  return DUCKDUCK_CRAWLER_UA.test(ua ?? "")
}

export function isYahooCrawlerUA(ua: string | null | undefined): boolean {
  return YAHOO_CRAWLER_UA.test(ua ?? "")
}

export function isAppleCrawlerUA(ua: string | null | undefined): boolean {
  return APPLE_CRAWLER_UA.test(ua ?? "")
}

export function isBaiduCrawlerUA(ua: string | null | undefined): boolean {
  return BAIDU_CRAWLER_UA.test(ua ?? "")
}

export function isSearchCrawlerUA(ua: string | null | undefined): boolean {
  return SEARCH_CRAWLER_UA.test(ua ?? "")
}

export function isSocialPreviewUA(ua: string | null | undefined): boolean {
  return SOCIAL_PREVIEW_UA.test(ua ?? "")
}

export function isDiscoveryCrawlerUA(ua: string | null | undefined): boolean {
  return DISCOVERY_CRAWLER_UA.test(ua ?? "")
}

/** Ranking + social + discovery — may receive CrawlerSeoPage on SEO paths. */
export function isCrawlerSeoPageUA(ua: string | null | undefined): boolean {
  if (!ua) return false
  return CRAWLER_SEO_PAGE_UA.test(ua)
}

export function getCrawlerLabel(ua: string): string | null {
  if (isGoogleCrawlerUA(ua)) return "Googlebot"
  if (isBingCrawlerUA(ua)) return "Bingbot"
  if (isDuckDuckCrawlerUA(ua)) return "DuckDuckBot"
  if (isYahooCrawlerUA(ua)) return "Yahoo Slurp"
  if (isAppleCrawlerUA(ua)) return "Applebot"
  if (isBaiduCrawlerUA(ua)) return "Baiduspider"
  if (/yandex/i.test(ua)) return "Yandex"
  if (/mojeek/i.test(ua)) return "MojeekBot"
  if (/marginalia/i.test(ua)) return "Marginalia"
  if (/ccbot|commoncrawl/i.test(ua)) return "Common Crawl"
  if (/ia_archiver/i.test(ua)) return "Internet Archive"
  if (/facebookexternalhit|facebot|facebookbot/i.test(ua)) return "Facebook"
  if (/twitterbot/i.test(ua)) return "Twitterbot"
  if (/linkedinbot/i.test(ua)) return "LinkedInBot"
  if (/telegrambot/i.test(ua)) return "TelegramBot"
  if (/slackbot/i.test(ua)) return "Slackbot"
  if (/whatsapp/i.test(ua)) return "WhatsApp"
  return null
}
