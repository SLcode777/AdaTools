# Domain Names Reminder Module

## Overview

This module allows users to track their domain names and receive automatic email reminders before expiration dates.

## Features

- List all domain names with expiration dates
- Track registrar information with clickable links
- Monitor auto-renewal status
- Sort domains by name, registrar, or expiration date
- Configure email reminders (1 month and/or 1 week before expiration)
- Visual indicators for expiring and expired domains

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```env
# Resend API Key for sending emails
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email sender address (must be verified in Resend)
EMAIL_FROM=noreply@yourdomain.com

# Secret token for cron job authentication
CRON_SECRET_DOMAIN_NAME_MODULE=your-secret-token-here
```

### 2. Database Migration

Run the Prisma migration to create the necessary database tables:

```bash
pnpm prisma migrate dev --name add_domain_names
```

### 3. Resend Configuration

1. Create an account at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add and verify your sending domain
4. Update `EMAIL_FROM` with your verified email address

## Usage

### Adding Domains

1. Click the "Add Domain" button
2. Fill in the domain information:
   - Domain name (e.g., example.com)
   - Registrar (e.g., Porkbun, Namecheap)
   - Registrar URL (optional, for quick access)
   - Expiration date
   - Auto-renewal status
   - Email reminder preferences

### Managing Domains

- **Edit**: Click the edit icon to modify domain information
- **Delete**: Click the delete icon to remove a domain
- **Sort**: Click column headers to sort by registrar, domain, or expiration date

### Email Reminders

The system will automatically send email reminders based on your preferences:

- **1 Month Reminder**: Sent 30 days before expiration (if enabled)
- **1 Week Reminder**: Sent 7 days before expiration (if enabled)

Emails include:

- Domain name
- Registrar with clickable link
- Expiration date
- Auto-renewal status

## Automated Reminders

### Setting up a Cron Job

You can set up automated reminders using a cron service like:

#### Option 1: Vercel Cron Jobs

Add to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/domain-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

#### Option 2: External Cron Service (e.g., cron-job.org)

Create a scheduled job that calls:

```
GET https://yourdomain.com/api/cron/domain-reminders
Headers:
  Authorization: Bearer your-cron-secret-token
```

#### Option 3: Manual Trigger

You can also manually trigger reminders by calling the API endpoint:

```bash
curl -X GET https://yourdomain.com/api/cron/domain-reminders \
  -H "Authorization: Bearer your-cron-secret-token"
```

## Security

- The cron endpoint is protected by a secret token
- Only authenticated users can view and manage their domains
- Email addresses are never exposed to other users

## Troubleshooting

### Emails Not Sending

1. Verify your `RESEND_API_KEY` is correct
2. Ensure your sending domain is verified in Resend
3. Check that `EMAIL_FROM` matches a verified email address
4. Review Resend dashboard for error logs

### Cron Job Not Running

1. Verify `CRON_SECRET_DOMAIN_NAME_MODULE` matches in both your environment and cron service
2. Check cron service logs for errors
3. Ensure the endpoint is accessible from the internet

### Domains Not Appearing

1. Ensure you're logged in
2. Check browser console for errors
3. Verify database migration completed successfully
