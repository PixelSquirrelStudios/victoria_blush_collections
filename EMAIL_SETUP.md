# Contact Form Email Setup

## What's Been Implemented

✅ Installed Resend email service package
✅ Created server action at `lib/actions/contact.actions.ts`
✅ Updated Contact form to send real emails
✅ Beautiful HTML email template with your brand styling
✅ Error handling and user feedback

## Required: Set Up Resend API Key

### Step 1: Get Your Resend API Key

1. Go to [resend.com](https://resend.com) and sign up for a free account
2. Once logged in, go to **API Keys** in the dashboard
3. Click **Create API Key**
4. Give it a name like "Victoria Blush Collections"
5. Copy the API key (it starts with `re_`)

### Step 2: Add API Key to Your Project

Add this line to your `.env.local` file (create it if it doesn't exist):

```
RESEND_API_KEY=re_your_actual_api_key_here
```

### Step 3: Verify Domain (Important!)

For the "from" email address to work properly:

1. In Resend dashboard, go to **Domains**
2. Add your domain: `victoriablushcollections.co.uk`
3. Follow their instructions to add DNS records
4. Wait for verification (usually takes a few minutes)

**OR** for testing/development:

- Use Resend's free test domain: `onboarding@resend.dev`
- Update line 18 in `lib/actions/contact.actions.ts` to use this temporarily

### Step 4: Restart Your Dev Server

After adding the environment variable:

```bash
# Stop your current server (Ctrl+C)
npm run dev
```

## Email Details

- **To:** hello@victoriablushcollections.co.uk
- **From:** Victoria Blush Collections <noreply@victoriablushcollections.co.uk>
- **Reply-To:** Customer's email (so you can reply directly)
- **Format:** Beautiful HTML email with your brand colors

## Testing

1. Fill out the contact form on your website
2. Submit the form
3. Check hello@victoriablushcollections.co.uk for the email
4. You should be able to click reply to respond directly to the customer

## Resend Free Plan

- 100 emails/day
- 3,000 emails/month
- Should be plenty for contact form submissions!

## Need Help?

If you encounter any issues:

- Check that `.env.local` has the API key
- Verify the server restarted after adding the key
- Check Resend dashboard logs for delivery status
- Ensure domain is verified in Resend (or use test domain)
