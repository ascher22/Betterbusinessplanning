import {
  getBackupDatabaseUrl,
  getDatabaseUrlForShard,
  hasBackupDatabaseUrl,
  hasDatabaseUrl,
  normalizeNeonDatabaseUrl,
} from '@/lib/database-urls'

export { hasDatabaseUrl, hasBackupDatabaseUrl }

export async function getSqlForShard(shardIndex = 0) {
  const url = getDatabaseUrlForShard(shardIndex)
  const { neon } = await import('@neondatabase/serverless')
  return neon(normalizeNeonDatabaseUrl(url))
}

export async function getSqlForBackup() {
  const url = getBackupDatabaseUrl()
  if (!url) {
    throw new Error('DATABASE_BACKUP_FALLBACK is not configured.')
  }
  const { neon } = await import('@neondatabase/serverless')
  return neon(normalizeNeonDatabaseUrl(url))
}

/** Primary shard (SEO v1, backward-compatible default). */
export async function getSql() {
  return getSqlForShard(0)
}
