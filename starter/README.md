# Lungo Starter

A minimal starter template for [Lungo](https://github.com/marcoschwartz/lungo).

## Quick Start

```bash
# Install dependencies
go mod tidy

# Build Tailwind CSS (optional — install @tailwindcss/cli first)
npx @tailwindcss/cli -i app/input.css -o static/styles.css

# Run dev server
LUNGO_DEV=1 go run .
```

Open http://localhost:3000

## Structure

```
app/
├── layout.js       ← shared layout (nav + footer)
├── page.jsx        ← home page (/)
└── about/
    └── page.jsx    ← about page (/about)
main.go             ← server entry point
```

## Production

```bash
go build -o server .
./server
```
