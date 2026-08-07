import {
  isSeoTelegramConfigured,
  sendSearchCrawlerNotification,
  sendSeoAdminMessage,
} from "@/lib/telegram-seo-admin"

import type { VerificationStatus } from "./verification-cache"

const SEP = "━━━━━━━━━━━━━━━━━"

export type BotCrawlAlertPayload = {
  siteName: string
  botLabel: string
  category: string
  status: VerificationStatus
  verifyMethod: "cidr" | "dns" | null
  url: string
  ip: string
  asnProvider: string
  userAgent: string
  timestampIso: string
}

export async function sendBotCrawlAlert(payload: BotCrawlAlertPayload): Promise<boolean> {
  if (!isSeoTelegramConfigured()) return false

  return sendSearchCrawlerNotification({
    botLabel: payload.botLabel,
    category: payload.category,
    status: payload.status,
    verifyMethod: payload.verifyMethod,
    url: payload.url,
    ip: payload.ip,
    asnProvider: payload.asnProvider,
    userAgent: payload.userAgent,
    timestampIso: payload.timestampIso,
  })
}

export type SuspiciousSessionAlertPayload = {
  siteName: string
  url: string
  ip: string
  asnProvider: string
  flags: string[]
  userAgent: string
  timestampIso: string
}

export async function sendSuspiciousSessionAlert(
  payload: SuspiciousSessionAlertPayload,
): Promise<boolean> {
  if (!isSeoTelegramConfigured()) return false

  const lines = [
    "🤖 Suspicious browser session",
    "",
    "📊 Status: ⚠️ LIKELY_AUTOMATED",
    `🏷️ Site: ${payload.siteName}`,
    `🔗 URL: ${payload.url}`,
    `🌐 IP: ${payload.ip || "Unknown"}`,
    `🏢 ASN/Provider: ${payload.asnProvider}`,
    `🚩 Flags: ${payload.flags.join(", ")}`,
    `💻 User-Agent: ${payload.userAgent}`,
    `🕐 Time: ${payload.timestampIso}`,
    SEP,
  ]

  return sendSeoAdminMessage(lines.join("\n"))
}
