# Victoria Blush Collections

A Next.js 15 application with Supabase authentication.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Setup

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then update `.env.local` with your Supabase credentials:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

You can find these in your Supabase project settings at:
https://app.supabase.com/project/_/settings/api

3. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

### Local Booking Payments And Emails

Use Node.js 22.6+ and install the [Stripe CLI](https://docs.stripe.com/stripe-cli). The booking runner finds it on `PATH` or in `~/.local/bin`; `STRIPE_CLI_PATH` can override its location.

Apply [database/bookings.sql](database/bookings.sql) in Supabase before testing. It can be rerun to add the `booking_jobs.scheduled_for` and `booking_jobs.payload` columns to older installations without removing data.

The client dashboard at `/dashboard/bookings` includes upcoming sessions, questionnaires, booking history, rescheduling, and refund tracking. Eligible clients use **Cancel & Request Refund**; cancellation queues a full refund to the original payment method. The booking worker must be running to process refunds. Outside the cancellation deadline, clients are directed to contact Victoria. Admin routes and other clients' bookings remain restricted.

The public-site header shows an account menu for every signed-in user, including clients. It follows sign-in and sign-out changes without requiring a refresh and remains available while profile details load, using the default avatar when needed. Clients have a Manage Bookings link; the admin dashboard link remains admin-only. Signed-out visitors see a Sign In button with a user icon on desktop and mobile; its matching popover links to `/sign-in` and `/sign-up`.

The sign-in and sign-up pages also offer a magic link. Sign-in links are sent only to existing accounts; sign-up links create an account when Supabase sign-ups are enabled. Links return through `/auth/callback`, which sends new users to onboarding, so `<site>/auth/callback` must be in Supabase Auth's allowed redirect URLs. The link must be opened in the same browser that requested it.

After password, Google or magic-link sign-in, users who have not onboarded go to `/onboarding`. Clients then land on `/dashboard/bookings`, and admins land on `/`. Signed-in clients who visit an auth page or finish onboarding are also sent to `/dashboard/bookings`.

Apply [database/booking-profile-emails.sql](database/booking-profile-emails.sql) once in the Supabase SQL Editor to fill existing blank client profile emails from their linked auth accounts. It preserves populated emails and profile roles. New booking-account provisioning now writes the auth account email to the profile; this migration is needed for accounts whose provisioning jobs already completed.

Apply [database/booking-client-avatars.sql](database/booking-client-avatars.sql) in the Supabase SQL Editor to enable client avatar uploads and removals. It permits inserts and deletes only within each signed-in user's own `images/avatars/<user-id>/` folder while keeping other storage writes admin-only. Clients can open Edit Avatar from their dashboard sidebar or header profile; removing an avatar there restores the default image without deleting storage files, while Remove Image during onboarding deletes the uploaded file.

For existing installations, apply [database/booking-calendar-days.sql](database/booking-calendar-days.sql) in the Supabase SQL Editor to switch minimum notice from elapsed hours to UK calendar days. Apply it alongside the updated app; until it runs, the database still uses the old cutoff. It only replaces slot generation and reloads the API schema, preserving saved settings and bookings.

**Minimum days ahead** accepts whole days: on 18 September, a value of 5 permits slots from opening time on 23 September, regardless of the current time of day. The cutoff uses `Europe/London` calendar dates across clock changes. Zero allows remaining times today, never past starts. The existing `notice_hours` storage field is retained (5 days is stored as 120); legacy fractional-day values round up to the next whole day. Cancellation and rescheduling deadlines remain exact elapsed hours, and the maximum advance-booking window is unchanged.

Configure `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`), a test-mode `STRIPE_SECRET_KEY`, and `RESEND_API_KEY` in your local environment. Resend must allow sending from `hello@victoriablushcollections.co.uk`. Zoom jobs additionally require `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, and `ZOOM_CLIENT_SECRET`; `ZOOM_HOST_USER_ID` is optional.

Set the server-only `STRIPE_SHIFT_SESSION_PRODUCT_ID` and `STRIPE_SHIFT_SESSION_PRICE_ID` to your reusable Shift Session product and its fixed, one-time GBP price. They must belong to the same Stripe account and mode as `STRIPE_SECRET_KEY`. The product must be active; prices that add tax on top or transform quantities are not supported.

The dashboard remains the source of the booking amount. Saving settings immediately reuses or creates an active matching Stripe price and sets it as the product's default price before saving to Supabase. If Stripe fails, settings are not saved and the dashboard reports the error. Checkout also resolves the price against the booking's reserved amount, but does not change the product default. New prices include any applicable tax in the dashboard total; existing prices, paid bookings and already-open checkout sessions are not modified. If the database save fails after Stripe succeeds, the Stripe default may already have changed; retry the settings save to complete the sync. Configure separate live-mode product and price IDs for production, and restart local booking services after changing environment settings.

After payment, Stripe returns the buyer to `/auth/booking/complete`. That route checks the payment directly with Stripe, so it does not wait for the webhook. It then creates or links the client account and redirects the buyer to `/dashboard/bookings`. Guests are signed in automatically only in the browser that started checkout, and only if the account was created for that booking. If someone pays using the email of an existing account and isn't signed in, they are not signed in. They see the "check your inbox" page and sign in as usual. Payments that are still processing also fall back to that page. The webhook and job worker still run as before; they don't duplicate the work.

Stop the ordinary development server, then run:

```bash
npm run dev:bookings
```

This starts Next.js at http://localhost:3000, forwards Stripe test checkout webhooks, and processes booking jobs every 15 seconds. It supplies temporary webhook and worker secrets to the server without writing them to disk. `PORT` can select a different local port. Emails and configured Zoom operations are real even though payments are in test mode. Missing Zoom credentials do not prevent confirmation emails, but Zoom jobs will keep retrying.

Keep the Ovatu calendar sync running in a separate terminal:

```bash
npm run bookings:sync
```

Keep both terminals open while testing. Payments only appear in the dashboard after the webhook records them; restarting the listener does not replay earlier payments automatically. Inspect failed webhook deliveries and queued job errors before repeating a purchase. For production, configure persistent server secrets and the Supabase schedule in [database/bookings-cron.sql](database/bookings-cron.sql) instead of using the local runner.

## Features

- ✅ Next.js 15 with App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Supabase Authentication (Sign Up/Sign In)
- ✅ Server Components with auth state
- ✅ Middleware for session management

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage with auth logic
├── components/
│   ├── AuthForm.tsx        # Login/Signup form
│   └── SignOutButton.tsx   # Sign out button
├── lib/
│   └── supabase/
│       ├── client.ts       # Browser client
│       ├── server.ts       # Server client
│       └── middleware.ts   # Auth middleware
└── middleware.ts           # Next.js middleware
```

## Authentication Flow

1. Users can sign up or sign in using email and password
2. After signup, users need to confirm their email (check Supabase email settings)
3. Once authenticated, the homepage displays user information
4. Sessions are automatically refreshed via middleware

## Dynamic Page Sections

Run [database/sections.sql](database/sections.sql) in the Supabase SQL Editor before deploying the updated education page. It creates the `sections` table, access policies and ordering functions, and seeds the supplied education copy. It does not alter the existing `education` row or hero. Do not rerun `education_table.sql`, which drops that table.

- Manage content at `/dashboard/edit-education`: **Sections** contains add, edit, delete and ordering controls; **Education Hero** edits the existing hero separately.
- Each record has a generated UUID, `type` (education by default, or homepage), heading, HTML copy, optional CTA text/link, background colour, position, optional `image_url`/`image_alt` and `sort_order`.
- Left and Right sections can upload an image using the existing image uploader. The image appears opposite the text on desktop and below it on mobile. Centre hides the image without clearing it. Remove Image clears the form selection; Save Section persists the removal without deleting the storage file, matching hero editing.
- Drag the handle or use the up/down buttons to save ordering immediately. Ordering is independent for each page. New sections and sections moved to another type are appended to that page.
- Education sections replace the old content after its hero. Homepage sections appear after the homepage hero, before the existing homepage content; no homepage sections are seeded.
- The support offerings occupy three records so each can have its own CTA. All supplied copy is included across ten records, alternating light green and white.
- CTA links initially use email enquiries. Replace the Shift Session links with the actual booking URL when available.
- Copy uses TinyMCE with the same CDN/GPL configuration as the example form. HTML and CTA links are validated and sanitised on the server. Review TinyMCE's licensing requirements for your deployment.
- Public visitors can read sections. Writes require a signed-in Supabase user, matching the existing education content policy. Restrict these policies to an editor role before allowing non-editor accounts.
- The migration can be rerun without overwriting existing sections. Seeds are inserted only when no education sections exist; rerunning after deliberately deleting every education section will restore the seeds.

Run `npm run test:sections` with Node.js 22.6+ to check migration safety, seeded content, permissions, editing, deletion, ordering and rich-text sanitisation in an isolated PostgreSQL engine. No live database credentials are used. Existing dependency peer conflicts may require `npm install --legacy-peer-deps`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
