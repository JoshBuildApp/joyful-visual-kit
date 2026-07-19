/**
 * gallery-admin-plugin — dev-only Vite middleware backing the gallery
 * curate mode (/gallery?curate). Never part of the production build
 * (`apply: 'serve'`), so none of this — including Cloudflare credentials —
 * exists on the deployed site.
 *
 * Endpoints (all POST, all under /__gallery):
 *
 *   /upload?subject=<slug>&filename=<name>
 *     Raw file bytes in the body. Uploads to Cloudflare (Stream for
 *     video/audio, Images for stills) and returns { ok, entry } — the
 *     manifest entry the client appends to its working copy. Nothing is
 *     written to disk here; the user still hits Save.
 *
 *   /commit
 *     { items, projects, remove?, deleteRemote? }
 *     Persists src/data/gallery.json + src/data/projects.json. If
 *     deleteRemote is true, also deletes `remove` items ({cfId, kind})
 *     from Cloudflare — explicit opt-in per save, never the default.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { findCredentials } from './cf-credentials.mjs'
import {
  classify,
  STREAM_MAX_BYTES,
  uploadBufferToStream,
  uploadBufferToImages,
  buildStreamEntry,
  buildImageEntry,
  deleteFromStream,
  deleteFromImages,
} from './cf-lib.mjs'

const MANIFEST_PATH = new URL('../src/data/gallery.json', import.meta.url).pathname
const PROJECTS_PATH = new URL('../src/data/projects.json', import.meta.url).pathname

const CREDS_HINT =
  'Missing Cloudflare credentials. Store them in Keychain:\n' +
  '  security add-generic-password -U -a "$USER" -s "joyful-visual-kit-cf-token" -w\n' +
  '  security add-generic-password -U -a "$USER" -s "joyful-visual-kit-cf-account" -w'

// Buffer the request body, aborting as soon as it exceeds maxBytes —
// don't hold 500 MB in memory just to reject it afterwards.
function readBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > maxBytes) {
        req.destroy()
        const err = new Error(`Request body exceeds ${Math.round(maxBytes / 1024 / 1024)} MiB`)
        err.statusCode = 413
        reject(err)
        return
      }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function send(res, status, payload) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(payload))
}

function isManifestEntry(e) {
  return e && typeof e === 'object' && typeof e.cfId === 'string' && typeof e.sourceKey === 'string'
}

function isProject(p) {
  return p && typeof p === 'object' && typeof p.slug === 'string' && p.slug.length > 0 && typeof p.label === 'string'
}

async function handleUpload(req, res, url) {
  const filename = (url.searchParams.get('filename') || '').trim()
  const rawSubject = (url.searchParams.get('subject') || '').trim().toLowerCase()
  const subject = rawSubject || null
  if (!filename) return send(res, 400, { ok: false, error: 'filename query param is required' })

  const kind = classify(filename)
  if (!kind) return send(res, 400, { ok: false, error: `Unsupported file type: ${filename}` })

  const { token, accountId } = findCredentials()
  if (!token || !accountId) return send(res, 500, { ok: false, error: CREDS_HINT })

  // Stream's basic upload caps at 200 MiB; Cloudflare Images rejects large
  // stills on its own. Either way, never buffer more than the Stream cap.
  const buf = await readBody(req, STREAM_MAX_BYTES + 1024 * 1024)
  if (buf.length === 0) return send(res, 400, { ok: false, error: 'Empty upload body' })
  if ((kind === 'video' || kind === 'audio') && buf.length > STREAM_MAX_BYTES) {
    return send(res, 413, {
      ok: false,
      error: `${filename} exceeds the 200 MiB Stream basic-upload cap — upload it via the Cloudflare dashboard.`,
    })
  }

  const item = { sourceKey: subject ? `${subject}/${filename}` : filename, subject, filename }
  let entry
  if (kind === 'image') {
    const r = await uploadBufferToImages({ accountId, token, buf, filename })
    entry = buildImageEntry(item, r)
  } else {
    const r = await uploadBufferToStream({ accountId, token, buf, filename })
    entry = buildStreamEntry(item, r, kind)
  }
  send(res, 200, { ok: true, entry })
}

async function handleCommit(req, res) {
  const body = JSON.parse((await readBody(req, 32 * 1024 * 1024)).toString('utf8'))
  const { items, projects, remove = [], deleteRemote = false, baseline } = body

  if (!Array.isArray(items) || !items.every(isManifestEntry)) {
    return send(res, 400, { ok: false, error: 'items must be an array of manifest entries' })
  }
  if (!Array.isArray(projects) || !projects.every(isProject)) {
    return send(res, 400, { ok: false, error: 'projects must be an array of { slug, label }' })
  }

  // Conflict check: if gallery.json on disk no longer matches what the page
  // loaded (desktop sync ran, another tab saved), refuse rather than clobber.
  if (Array.isArray(baseline)) {
    try {
      const onDisk = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
      const diskIds = onDisk.map((e) => e.cfId).sort().join(',')
      const baseIds = [...baseline].sort().join(',')
      if (diskIds !== baseIds) {
        return send(res, 409, {
          ok: false,
          error: 'gallery.json changed on disk since this page loaded — reload the page and redo your edits.',
        })
      }
    } catch {
      // unreadable/missing manifest — let the write proceed and recreate it
    }
  }

  let deleted = 0
  const deleteErrors = []
  if (deleteRemote && Array.isArray(remove) && remove.length > 0) {
    const { token, accountId } = findCredentials()
    if (!token || !accountId) {
      deleteErrors.push('No Cloudflare credentials — nothing was deleted remotely.')
    } else {
      for (const it of remove) {
        if (!it?.cfId) continue
        try {
          if (it.kind === 'image') await deleteFromImages({ accountId, token, id: it.cfId })
          else await deleteFromStream({ accountId, token, uid: it.cfId })
          deleted++
        } catch (err) {
          deleteErrors.push(`${it.cfId}: ${err.message}`)
        }
      }
    }
  }

  await writeFile(PROJECTS_PATH, JSON.stringify(projects, null, 2) + '\n', 'utf8')
  await writeFile(MANIFEST_PATH, JSON.stringify(items, null, 2) + '\n', 'utf8')
  send(res, 200, { ok: true, count: items.length, deleted, deleteErrors })
}

export function galleryAdmin() {
  return {
    name: 'gallery-admin',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__gallery', async (req, res) => {
        // req.url is the remainder after the /__gallery mount point
        const url = new URL(req.url || '/', 'http://localhost')
        if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'POST only' })
        try {
          if (url.pathname === '/upload') return await handleUpload(req, res, url)
          if (url.pathname === '/commit') return await handleCommit(req, res)
          send(res, 404, { ok: false, error: `Unknown endpoint ${url.pathname}` })
        } catch (err) {
          send(res, err?.statusCode || 500, { ok: false, error: String(err?.message || err) })
        }
      })
    },
  }
}
