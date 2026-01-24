This is a [Next.js](https://nextjs.org) project using [Convex](https://convex.dev) for the backend and [Clerk](https://clerk.com) for authentication.

## Getting Started

Install dependencies:

```bash
bun install
```

Copy environment variables:

```bash
cp .env.example .env.local
```

Start Convex development server (this will prompt you to create a project on first run):

```bash
bunx convex dev
```

In a separate terminal, run the Next.js development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables

Fill in `.env.local` with:

- `NEXT_PUBLIC_CONVEX_URL` - Auto-populated by `convex dev`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `CLERK_SECRET_KEY` - From Clerk dashboard
- `CLERK_FRONTEND_API_URL` - Your Clerk Frontend API URL (for Convex auth config)

## Clerk + Convex Auth Setup

1. Go to [Clerk Dashboard → JWT Templates](https://dashboard.clerk.com/~/jwt-templates)
2. Create a new template using the **Convex** preset
3. Keep the template name as `convex`
4. Copy your Clerk Frontend API URL to `CLERK_FRONTEND_API_URL`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
