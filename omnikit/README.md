# Lungo + OmniKit Template

A full-stack app template powered by [Lungo](https://github.com/marcoschwartz/lungo) (Go-based React alternative) and [OmniKit](https://github.com/marcoschwartz/omnikit) (API platform).

## Features

- JWT authentication with httpOnly cookies
- Data browser with CRUD operations
- File storage viewer
- Project-scoped multi-tenancy
- Dark mode UI with Tailwind CSS
- Static page caching (login page)
- SSR for authenticated pages

## Quick Start

```bash
cp .env.example .env
# Edit .env with your OmniKit API credentials

npm install              # Tailwind CSS
go mod tidy              # Go dependencies
LUNGO_DEV=1 go run .     # Start dev server
```

## Pages

| Route | Description | Cache Mode |
|-------|-------------|------------|
| `/login` | Sign in form | Static |
| `/dashboard` | Overview with stats & tables | SSR |
| `/data` | Browse & manage table data | SSR |
| `/storage` | View uploaded files | SSR |
| `/settings` | Account & API config | SSR |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OMNIKIT_API_URL` | OmniKit API base URL |
| `OMNIKIT_API_KEY` | API key for server-side requests |
| `OMNIKIT_PROJECT_ID` | Default project scope |
| `LUNGO_DEV` | Set to `1` for dev mode (HMR) |
| `PORT` | Server port (default: 3000) |
| `REVALIDATE_SECRET` | Secret for cache revalidation |
