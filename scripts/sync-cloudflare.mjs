#!/usr/bin/env node
/**
 * sync-cloudflare — upload ~/Desktop/gallery/{subject}/* to Cloudflare and
 * append entries to src/data/gallery.json. Videos go to Stream, images go
 * to Images. Idempotent: files already in the manifest are skipped.
 *
 * Run with: npm run sync-cloudflare
 *
 * Credentials come from macOS Keychain (or env / .env as fallback) — see
 * scripts/cf-credentials.mjs for the exact lookup order. The token needs
 * Stream:Edit + Cloudflare Images:Edit scopes on your account.
 *
 * Notes:
 *   - Stream basic upload caps at ~200 MiB. Larger files fail with a clear
 *     message; upload via dashboard or extend this script to use TUS.
 *   - We never delete from Cloudflare. Pruning is manual via dashboard so
 *     a typo here can't nuke uploaded media.
 */
import { readFile, writeFile, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, extname } from 'node:path'
import { getCredentials } from './cf-credentials.mjs'

const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov'])
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])
const AUDIO_EXTS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'])
const STREAM_MAX_BYTES = 200 * 1024 * 1024

const SRC = process.env.GALLERY_SRC || join(homedir(), 'Desktop', 'gallery')
const MANIFEST_PATH = new URL('../src/data/gallery.json', import.meta.url).pathname

function classify(filename) {
  const ext = extname(filename).toLowerCase()
  if (VIDEO_EXTS.has(ext)) return 'video'
  if (IMAGE_EXTS.has(ext)) return 'image'
  if (AUDIO_EXTS.has(ext)) return 'audio'
  return null
}

async function listMedia(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const results = []
  for (const e of entries) {
    if (e.name.startsWith('.')) continue
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      const inner = await readdir(full, { withFileTypes: true })
      for (const f of inner) {
        if (f.name.startsWith('.') || !f.isFile()) continue
        if (!classify(f.name)) continue
        results.push({
          absPath: join(full, f.name),
          sourceKey: `${e.name}/${f.name}`,
          subject: e.name.toLowerCase(),
          filename: f.name,
        })
      }
    } else if (e.isFile() && classify(e.name)) {
      results.push({
        absPath: full,
        sourceKey: e.name,
        subject: null,
        filename: e.name,
      })
    }
  }
  return results
}

function prettyName(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+[_-]+/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
}

async function uploadToStream({ accountId, token, file, filename }) {
  const buf = await readFile(file)
  const form = new FormData()
  form.append('file', new Blob([buf]), filename)
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    },
  )
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(`Stream upload failed: ${JSON.stringify(json.errors || json)}`)
  }
  return json.result
}

async function uploadToImages({ accountId, token, file, filename }) {
  const buf = await readFile(file)
  const form = new FormData()
  form.append('file', new Blob([buf]), filename)
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    },
  )
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(`Images upload failed: ${JSON.stringify(json.errors || json)}`)
  }
  return json.result
}

function buildStreamEntry(item, cfResult, kind) {
  // Stream's response gives us a customer-coded host like
  //   customer-{code}.cloudflarestream.com — use it for iframe + thumbnails
  //   so we don't depend on a separate account-hash env var.
  const hls = cfResult.playback?.hls || ''
  const hostMatch = hls.match(/https:\/\/([^/]+)/)
  const host = hostMatch ? hostMatch[1] : 'videodelivery.net'
  const uid = cfResult.uid
  const base = {
    sourceKey: item.sourceKey,
    kind,
    subject: item.subject,
    name: prettyName(item.filename),
    cfId: uid,
    displayUrl: `https://${host}/${uid}/iframe`,
  }
  if (kind === 'video') {
    base.previewUrl = `https://${host}/${uid}/thumbnails/thumbnail.gif?time=0s&duration=4s`
    base.posterUrl = `https://${host}/${uid}/thumbnails/thumbnail.jpg`
  }
  // Audio: no previewUrl/posterUrl — the gallery card renders a music-icon
  // placeholder instead of a thumbnail.
  return base
}

function buildImageEntry(item, cfResult) {
  const variants = cfResult.variants || []
  const url = variants[0]
  if (!url) throw new Error(`No variant URL returned for ${item.sourceKey}`)
  return {
    sourceKey: item.sourceKey,
    kind: 'image',
    subject: item.subject,
    name: prettyName(item.filename),
    cfId: cfResult.id,
    displayUrl: url,
    previewUrl: url,
  }
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

async function main() {
  if (!existsSync(SRC)) {
    console.log(`Source folder ${SRC} doesn't exist. Create it and drop media in.`)
    process.exit(0)
  }

  const { token, accountId } = getCredentials()

  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
  const haveKeys = new Set(manifest.map((e) => e.sourceKey))

  const items = await listMedia(SRC)
  if (items.length === 0) {
    console.log('No media found in', SRC)
    return
  }

  let uploaded = 0
  let skipped = 0
  for (const item of items) {
    if (haveKeys.has(item.sourceKey)) {
      skipped++
      continue
    }
    const kind = classify(item.filename)
    const size = (await stat(item.absPath)).size

    if ((kind === 'video' || kind === 'audio') && size > STREAM_MAX_BYTES) {
      console.error(
        `  ! ${item.sourceKey} is ${formatBytes(size)} — Stream basic upload max is 200 MiB. ` +
          `Upload via dashboard or use TUS protocol.`,
      )
      continue
    }

    process.stdout.write(`  → ${item.sourceKey} (${kind}, ${formatBytes(size)})... `)
    try {
      let entry
      if (kind === 'video' || kind === 'audio') {
        const r = await uploadToStream({ accountId, token, file: item.absPath, filename: item.filename })
        entry = buildStreamEntry(item, r, kind)
      } else {
        const r = await uploadToImages({ accountId, token, file: item.absPath, filename: item.filename })
        entry = buildImageEntry(item, r)
      }
      manifest.push(entry)
      haveKeys.add(entry.sourceKey)
      uploaded++
      process.stdout.write(`OK (${entry.cfId})\n`)
    } catch (err) {
      process.stdout.write(`FAILED\n`)
      console.error(`    ${err.message}`)
    }
  }

  manifest.sort((a, b) => {
    const sa = a.subject || ''
    const sb = b.subject || ''
    if (sa !== sb) return sa.localeCompare(sb)
    return a.name.localeCompare(b.name)
  })
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8')

  console.log(`\nDone. Uploaded ${uploaded}, skipped ${skipped} (already in manifest).`)
  console.log(`Manifest: ${MANIFEST_PATH}`)
}

main().catch((err) => {
  console.error('sync-cloudflare failed:', err.message)
  process.exit(1)
})
