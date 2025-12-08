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

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
