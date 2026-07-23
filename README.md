# sunnyavula-site

Personal portfolio for **Sunny Avula** — an interactive 3D "aerial desk" landing page
that links to four bodies of work: **Research**, **ATT Agency**, **Markets**, and
**Leadership & Policy**.

See **[CLAUDE.md](./CLAUDE.md)** for the full spec: concept, architecture, content
facts (source of truth for copy), environment variables, and the phased build plan.

## Stack

Next.js 15 (App Router, TypeScript) · Tailwind CSS v4 · react-three-fiber ·
deployed to **Cloudflare Workers** via the OpenNext adapter.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy (Cloudflare Workers)

```bash
npm run preview    # OpenNext build + run the Worker locally
npm run deploy     # OpenNext build + deploy
```

`deploy` needs `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` in the environment
(see `.env.local` and CLAUDE.md). Everything else is configured in `wrangler.jsonc`.
