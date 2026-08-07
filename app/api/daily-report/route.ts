import { NextRequest, NextResponse } from 'next/server'
import { generateDailyReport, formatDailyReportForTelegram } from '@/lib/daily-report'
import { sendTelegramMessage } from '@/lib/telegram'

// Internal route for cron job only - not for public access
export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (Vercel adds x-vercel-signature header)
    const signature = request.headers.get('x-vercel-signature')
    const isVercelCron = !!signature
    
    // For local testing, allow requests (no signature needed in dev)
    const isLocal = process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'development'
    
    // In production, only allow Vercel cron requests
    if (!isLocal && !isVercelCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    
    const report = await generateDailyReport(date)
    
    if (!report) {
      // No activities for this date - send a simple message
      const message = `📊 Daily Activity Report - ${date}\n\nNo activities recorded for this date.`
      await sendTelegramMessage(message)
      return NextResponse.json({ 
        message: `No activities found for ${date}`,
        date 
      })
    }
    
    // Format and send to Telegram
    const telegramMessage = formatDailyReportForTelegram(report)
    await sendTelegramMessage(telegramMessage)
    
    return NextResponse.json({ 
      success: true,
      date,
      message: 'Daily report sent to Telegram'
    })
  } catch (error) {
    console.error('Daily report error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

