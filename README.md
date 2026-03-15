# Lungo Templates

Starter templates for [Lungo](https://github.com/marcoschwartz/lungo) — a Next.js-like framework powered by Go.

## Templates

### [Starter](./starter)
Minimal starter — home page, about page, API route. The "Hello World" of Lungo.

```bash
cd starter
go mod tidy
LUNGO_DEV=1 go run .
```

### [SaaS](./saas)
Full SaaS app — login, dashboard with Chart.js, tasks CRUD with JSON storage, settings, pricing, server actions, cookie-based auth, multi-source SSR loaders.

```bash
cd saas
go mod tidy
npx @tailwindcss/cli -i app/input.css -o static/styles.css
LUNGO_DEV=1 go run .
```

**Demo credentials:** demo@example.com / demo123

## Using a template

```bash
git clone https://github.com/marcoschwartz/lungo-templates
cp -r lungo-templates/saas my-app
cd my-app
go mod tidy
LUNGO_DEV=1 go run .
```

Open http://localhost:3000

## License

MIT
