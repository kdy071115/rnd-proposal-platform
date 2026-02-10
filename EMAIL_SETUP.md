# Email Configuration for Team Invitations

## SMTP Settings (Gmail Example)

Add these to your `.env` file in the backend directory:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=R&D SaaS Platform

# Frontend URL (for invitation links)
FRONTEND_URL=http://localhost:3000
```

## Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
   - Use this as `SMTP_PASSWORD`

## Other SMTP Providers

### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### AWS SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

## Testing

To test email sending without SMTP credentials, the system will print a warning but won't fail the invitation creation.

## Production Deployment

For production (Vercel + Render):

1. Add environment variables in Render dashboard
2. Set `FRONTEND_URL` to your Vercel domain (e.g., `https://your-app.vercel.app`)
3. Restart the backend service after adding variables
