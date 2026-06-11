# Rotaract District 3131 ERP

Production-ready enterprise resource planning platform for Rotaract District 3131.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (Auth.js v5)
- **State:** Zustand (UI) + TanStack React Query (server state)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Generate an auth secret:

```bash
openssl rand -base64 32
```

### 3. Set up the database

```bash
npm run db:push
npm run db:seed
```

For Supabase production setup, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documentation

| File | Description |
|------|-------------|
| [REQUIREMENTS.md](./REQUIREMENTS.md) | Functional requirements, roles, and access matrix |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Vercel + Supabase production deployment guide |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register, forgot-password
│   ├── (dashboard)/     # Protected dashboard routes
│   └── api/             # REST API routes
├── components/
│   ├── auth/            # Auth form components
│   ├── layout/          # Sidebar, navbar, shells
│   ├── reporting/       # STAR monthly reporting
│   ├── events/          # Events browsing & reporting
│   ├── bluebook/        # Council bluebook tasks
│   ├── providers/       # React Query, session providers
│   └── ui/              # shadcn/ui primitives
├── config/              # Site, theme, navigation config
├── lib/                 # Auth, Prisma, utilities
├── stores/              # Zustand stores
└── types/               # Shared TypeScript types
```

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Password reset (UI only) |
| `/dashboard` | Main dashboard |
| `/dashboard/reporting` | STAR reporting hub |
| `/dashboard/reporting/admin` | Admin monthly reporting |
| `/dashboard/reporting/events` | Events reporting |
| `/dashboard/bluebook` | Council bluebook |
| `/dashboard/clubs` | Clubs |
| `/dashboard/members` | Members |
| `/dashboard/council-scores` | Council leaderboard |
