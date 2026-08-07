import type { Metadata } from "next"

/**
 * Shared robots metadata for indexable pages.
 * Homepage / layout: index, follow only — never noarchive.
 */
export const INDEXABLE_PAGE_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
}
