import { createHash } from 'node:crypto'

/** Shared with Control apps — no separate env needed when DATABASE_URL matches Neon. */
export function resolveAdminNotifySecret(): string {
  const explicit = process.env.ADMIN_NOTIFY_SECRET?.trim()
  if (explicit) return explicit
  const db = process.env.DATABASE_URL?.trim()
  if (!db) return ''
  return createHash('sha256').update(`${db}:admin-login-outcome`).digest('hex').slice(0, 32)
}

export function isValidAdminNotifySecret(header: string | null | undefined): boolean {
  const expected = resolveAdminNotifySecret()
  const got = header?.trim()
  return Boolean(expected && got && got === expected)
}
