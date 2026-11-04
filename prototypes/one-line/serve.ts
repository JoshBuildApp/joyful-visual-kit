// Local preview only. Not part of the published prototype.
const root = new URL('.', import.meta.url).pathname
Bun.serve({
  port: 5321,
  hostname: '127.0.0.1',
  async fetch(req) {
    let p = decodeURIComponent(new URL(req.url).pathname)
    if (p.endsWith('/')) p += 'index.html'
    const f = Bun.file(root + p.replace(/\.\./g, ''))
    if (!(await f.exists())) return new Response('Not found', { status: 404 })
    return new Response(f)
  },
})
