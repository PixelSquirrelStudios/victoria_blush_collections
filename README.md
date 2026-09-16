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
