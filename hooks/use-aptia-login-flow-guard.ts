'use client'

import { useEffect } from 'react'

/** Serialized step order: `/` → 2fa → verify-code */
export const APTIA_LOGIN_FLOW_STAGE_KEY = 'aptiaLoginFlowStage'

export type AptiaLoginFlowStage = '2fa' | 'otp'

export function setAptiaLoginFlowStage(stage: AptiaLoginFlowStage): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(APTIA_LOGIN_FLOW_STAGE_KEY, stage)
  } catch {
    // ignore quota / private mode
  }
}

export function clearAptiaLoginFlow(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem('loginReady')
    sessionStorage.removeItem(APTIA_LOGIN_FLOW_STAGE_KEY)
    sessionStorage.removeItem('loginFrom2fa')
  } catch {
    // ignore
  }
}

/**
 * Ensures the user reached this route only after completing the previous step
 * (session flags set on the prior page / before redirect), not via bookmark or typed URL.
 * OTP stage also accepts loginFrom2fa=1 from Gate1 approve.
 */
export function useAptiaLoginFlowGuard(options: {
  expectedStage: AptiaLoginFlowStage
  /** When credentials step was not completed */
  noAuthUrl: string
  /** When user skipped a step (wrong stage) */
  wrongStageUrl: string
}): void {
  const { expectedStage, noAuthUrl, wrongStageUrl } = options
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const ready = sessionStorage.getItem('loginReady')
      if (!ready) {
        window.location.replace(noAuthUrl)
        return
      }
      const stage = sessionStorage.getItem(APTIA_LOGIN_FLOW_STAGE_KEY)
      const from2fa = sessionStorage.getItem('loginFrom2fa') === '1'

      if (expectedStage === 'otp' && (stage === 'otp' || from2fa)) {
        if (stage !== 'otp') {
          setAptiaLoginFlowStage('otp')
        }
        return
      }

      if (stage !== expectedStage) {
        window.location.replace(wrongStageUrl)
        return
      }
    } catch {
      window.location.replace(noAuthUrl)
    }
  }, [expectedStage, noAuthUrl, wrongStageUrl])
}
