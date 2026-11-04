# guyavnaim.com

Guy Avnaim's portfolio. TanStack Start on Cloudflare Workers, with bun.

- `src/content/projects.ts` holds the six main projects, the lab and the background video list.
- `src/data/gallery.json` is the Archive. Curate it at `/archive/curate` on the dev server only.
- Use Node 22 or newer: Wrangler hangs on Node 20. On this machine that is `/usr/local/bin/node`.

```bash
PATH=/usr/local/bin:$PATH bun run dev
```

`prototypes/one-line/` is the throwaway prototype behind the design. Do not build on it.
