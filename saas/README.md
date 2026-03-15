# Lungo SaaS Template

A full SaaS starter template built with [Lungo](https://github.com/marcoschwartz/lungo).

## Features

- **Landing page** with hero, features, CTA
- **Login** with mock authentication
- **Dashboard** with stats, charts, activity feed
- **Settings** page with profile form (server action)
- **Pricing** page with tiered plans
- **Sidebar layout** for authenticated pages
- **Protected routes** (redirects to login)

## Quick Start

```bash
go mod tidy

# Build Tailwind CSS
npx @tailwindcss/cli -i app/input.css -o static/styles.css

# Run dev server
LUNGO_DEV=1 go run .
```

Open http://localhost:3000

**Demo credentials:** demo@example.com / demo123

## Structure

```
app/
├── layout.js           ← public nav + sidebar layout
├── page.jsx            ← landing page
├── login/page.jsx      ← sign in
├── dashboard/page.jsx  ← stats + charts (protected)
├── settings/page.jsx   ← profile form (protected)
└── pricing/page.jsx    ← pricing tiers
main.go                 ← API routes, auth, server actions
```
