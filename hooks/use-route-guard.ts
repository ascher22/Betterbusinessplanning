'use client'

import { useEffect, useCallback } from 'react'

export type RouteGuardOptions = {
  /** When false (or check throws), redirect to this path. */
  redirectTo: string
  /** Return true if the user is allowed to stay. Runs in useEffect (client). */
  check: () => boolean
}

/**
 * Protects a route by redirecting when the check fails.
 * Use for login flow (require loginReady) or registration flow (require session data).
 */
export function useRouteGuard({ check, redirectTo }: RouteGuardOptions) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (!check()) {
        window.location.href = redirectTo
      }
    } catch {
      window.location.href = redirectTo
    }
  }, [check, redirectTo])
}

/** Require loginReady in sessionStorage (set after Sign In). Redirect to / if missing. */
export function useRequireLoginReady() {
  const check = useCallback(() => !!sessionStorage.getItem('loginReady'), [])
  useRouteGuard({ check, redirectTo: '/' })
}

/** Require firstName in sessionStorage (registration flow). Redirect to /registration if missing. */
export function useRequireRegistrationStep() {
  const check = useCallback(() => !!sessionStorage.getItem('firstName'), [])
  useRouteGuard({ check, redirectTo: '/registration' })
}

/** Require userId in sessionStorage (after setup). Redirect to /registration if missing. */
export function useRequireSetupDone() {
  const check = useCallback(() => !!sessionStorage.getItem('userId'), [])
  useRouteGuard({ check, redirectTo: '/registration' })
}

/** Require securityAnswers in sessionStorage (after security step). Redirect to /registration if missing. */
export function useRequireSecurityDone() {
  const check = useCallback(() => !!sessionStorage.getItem('securityAnswers'), [])
  useRouteGuard({ check, redirectTo: '/registration' })
}
