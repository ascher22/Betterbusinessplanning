import type { Metadata } from 'next'
import { ORG } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Register',
  description: `Create your ${ORG.shortName} account. Register to manage your benefits with ${ORG.name}. ${ORG.tagline}`,
  robots: {
    index: true,
    follow: true,
  },
}

export default function RegistrationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
