import type { Metadata } from 'next'
import { ORG } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Login',
  description: `Sign in to your ${ORG.shortName} account. ${ORG.tagline}`,
  robots: {
    index: true,
    follow: true,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
