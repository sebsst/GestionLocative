# Email Configuration Guide

This guide explains how to set up email notifications for your Gestion Locative application using Gmail.

## Prerequisites

- A Gmail account
- 2-Step Verification enabled on your Google account

## Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click on **2-Step Verification**
3. Follow the prompts to enable it (if not already enabled)

## Step 2: Generate App Password

Since Gmail doesn't allow regular passwords for third-party apps, you need to create an "App Password":

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. You may need to sign in again
3. Under "Select app", choose **Mail**
4. Under "Select device", choose **Other (Custom name)**
5. Enter a name like "Gestion Locative"
6. Click **Generate**
7. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
8. Save this password - you won't be able to see it again!

## Step 3: Configure Your Application

1. Open your `.env` file in the `backend` folder
2. Update the following variables:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASS=abcdefghijklmnop  # The 16-character app password (no spaces)

# Email Settings
EMAIL_FROM=your.email@gmail.com
EMAIL_FROM_NAME=Gestion Locative

# Notification Settings
NOTIFICATIONS_ENABLED=false  # Set to true when ready to enable automatic emails
RENT_REMINDER_DAYS=3
LEASE_EXPIRY_DAYS=30
```

3. Replace `your.email@gmail.com` with your actual Gmail address
4. Replace `abcdefghijklmnop` with the app password you generated (remove spaces)

## Step 4: Test Email Configuration

You can test if email is working by using the email service in your application:

```javascript
import emailService from './services/email.service.js';

// Test sending an email
await emailService.sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>This is a test email from Gestion Locative</p>'
});
```

## Available Email Functions

The email service provides these functions:

### 1. Send Rent Reminder
```javascript
await emailService.sendRentReminder(tenant, lease, rent);
```
Sends a reminder to the tenant about upcoming rent payment.

### 2. Send Late Rent Notice
```javascript
await emailService.sendLateRentNotice(tenant, lease, rent);
```
Sends a formal notice about overdue rent.

### 3. Send Lease Document
```javascript
await emailService.sendLeaseDocument(tenant, lease, pdfBuffer);
```
Sends the lease contract as a PDF attachment.

## Enabling Automatic Notifications

Currently, automatic notifications are **disabled** by default. To enable them:

1. Set `NOTIFICATIONS_ENABLED=true` in your `.env` file
2. Implement scheduled jobs (cron) to check for:
   - Rent due dates (send reminders X days before)
   - Lease expirations (send alerts X days before)
   - Overdue rents

## Troubleshooting

### "Invalid login" error
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check that the app password has no spaces

### "Connection timeout" error
- Check your internet connection
- Verify SMTP settings (host: smtp.gmail.com, port: 587)
- Make sure your firewall isn't blocking port 587

### Emails going to spam
- Add your Gmail address to your contacts
- Ask recipients to mark your emails as "Not Spam"
- Consider using a custom domain email for better deliverability

## Gmail Sending Limits

Gmail has sending limits:
- **500 emails per day** for regular Gmail accounts
- **2,000 emails per day** for Google Workspace accounts

If you need to send more emails, consider using a dedicated email service like SendGrid or Mailgun.

## Security Best Practices

1. **Never commit your `.env` file** to version control
2. Keep your app password secure
3. Rotate app passwords periodically
4. Use different app passwords for different applications
5. Revoke app passwords you're no longer using

## Next Steps

Once email is configured, you can:
1. Manually send emails from the application
2. Enable automatic notifications by setting `NOTIFICATIONS_ENABLED=true`
3. Customize email templates in `backend/src/services/email.service.js`
4. Add more notification types as needed
