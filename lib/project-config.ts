export const DEFAULT_PROJECT_ID = "bbp"

export const PROJECT_ID = DEFAULT_PROJECT_ID

/**
 * Per-project SEO backlink hosts that grant entry like search engines.
 * Leave empty until known backlinks exist for this site.
 */
export const ALLOWED_BACKLINK_HOSTS: string[] = []

/** Origin-only ADMIN_PORTAL_URL for Telegram approve/deny links. */
export function getApprovalsUrl(): string {
  let raw = process.env.ADMIN_PORTAL_URL?.trim() ?? ""
  if (!raw) return "/admin/login"
  if (!/^https?:\/\//i.test(raw) && !raw.startsWith("/") && /^[a-z0-9.-]+\.[a-z]{2,}/i.test(raw)) {
    raw = `https://${raw}`
  }
  return raw.replace(/\/admin\/login.*$/i, "").replace(/\?.*$/, "").replace(/\/+$/, "") || "/admin/login"
}

export function getAdminPortalUrl(): string {
  return getApprovalsUrl()
}
