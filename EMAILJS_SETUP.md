# EmailJS Setup Instructions for Metamorphex Contact Form

Your contact form is now configured to send emails directly via EmailJS. Follow these steps to complete the setup:

## Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for a free account (allows 200 emails/month)
3. Verify your email address

## Step 2: Add an Email Service
1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail is easiest):
   - **Gmail**: Click Gmail, sign in with your Google account
   - **Other**: You can also use Outlook, Yahoo, or custom SMTP
4. Give it a name (e.g., "Metamorphex Contact")
5. Copy the **Service ID** (looks like `service_xxxxxxx`)

## Step 3: Create Email Template
1. Go to **Email Templates** in dashboard
2. Click **Create New Template**
3. Set up your template with these exact variable names:

**Subject:**
```
New Contact Form Submission from {{from_name}}
```

**Body:**
```
You have a new inquiry from your website!

Name: {{from_name}}
Email: {{from_email}}
Service Interest: {{service_interest}}

Message:
{{message}}

---
This email was sent from the Metamorphex contact form.
```

4. **Important**: Set the **To Email** to: `contact@metamorphex.tech`
5. Set the **From Email** to: `{{from_email}}` (or your verified sending email)
6. Set the **Reply-To** to: `{{from_email}}`
7. Copy the **Template ID** (looks like `template_xxxxxxx`)

## Step 4: Get Your Public Key
1. Go to **Account** in the dashboard
2. Under **API Keys**, find your **Public Key** (starts with a letter, ~20 characters)
3. Copy this key

## Step 5: Update Your Website Code
Open `index.html` and find these lines near the bottom (around line 850):

```javascript
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';        // From Account > API Keys
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';        // From Email Services
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';      // From Email Templates
```

Replace with your actual values:
```javascript
const EMAILJS_PUBLIC_KEY = 'aBcDeFgHiJkLmNoPqRsT';   // Your actual public key
const EMAILJS_SERVICE_ID = 'service_abc1234';         // Your service ID
const EMAILJS_TEMPLATE_ID = 'template_xyz5678';       // Your template ID
```

## Step 6: Test It!
1. Save the updated `index.html` file
2. Open it in your browser
3. Fill out the contact form
4. Click "Send Message"
5. Check the email inbox for `contact@metamorphex.tech`

## Troubleshooting

**Form shows "Something went wrong":**
- Check browser console (F12) for errors
- Verify all three IDs are correct
- Make sure template variable names match exactly (case-sensitive)
- Confirm your EmailJS account is verified

**Email not received:**
- Check spam folder
- Verify `to_email` in template is set to `contact@metamorphex.tech`
- Check EmailJS dashboard logs for delivery status

**Rate limit errors:**
- Free plan allows 200 emails/month
- Upgrade to paid plan if needed ($8/month for 1,000 emails)

## Security Note
The Public Key is safe to expose in client-side code — it's designed for this. EmailJS handles all security on their end.

## Template Variables Reference
Your form sends these variables to the template:
- `{{from_name}}` - Full name (first + last)
- `{{from_email}}` - Visitor's email address
- `{{service_interest}}` - Selected service or "Not specified"
- `{{message}}` - Project details message
- `{{to_email}}` - Your receiving email (contact@metamorphex.tech)

---

Need help? Check EmailJS docs: https://www.emailjs.com/docs/
