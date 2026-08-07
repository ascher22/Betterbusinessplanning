'use client'

import { useEffect, useState } from 'react'

const LOGIN_READY_KEY = 'loginReady'

/**
 * Protects sign-in flow routes (/login/2fa-verify, /login/verify-code).
 * Redirects to homepage if user hasn't completed the initial sign-in step.
 * @returns allowed - true when flow is valid, false while checking or when redirecting
 */
export function useRequireLoginFlow(): boolean {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const ok = sessionStorage.getItem(LOGIN_READY_KEY)
      if (!ok) {
        window.location.replace('/')
        return
      }
      setAllowed(true)
    } catch {
      window.location.replace('/')
    }
  }, [])

  return allowed
}
