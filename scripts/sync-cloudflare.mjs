#!/usr/bin/env node
/**
 * sync-cloudflare — upload ~/Desktop/gallery/{subject}/* to Cloudflare and
 * append entries to src/data/gallery.json. Videos go to Stream, images go
 * to Images. Idempotent: files already in the manifest are skipped.
 *
 * Run with: npm run sync-cloudflare
 *
 * (You can also upload straight from the browser now — run `npm run dev`,
 * open /gallery?curate and use “Add media”. Same Cloudflare account, same
 * manifest.)
 *
 * Credentials come from macOS Keychain (or env / .env as fallback) — see
 * scripts/cf-credentials.mjs for the exact lookup order. The token needs
 * Stream:Edit + Cloudflare Images:Edit scopes on your account.
 *
 * Notes:
 *   - Stream basic upload caps at ~200 MiB. Larger files fail with a clear
 *     message; upload via dashboard or extend this script to use TUS.
 *   - This script never deletes from Cloudflare. Remote deletion only
 *     happens through the curate UI, where it's explicit and opt-in.
 *   - Existing manifest order is preserved (it may be hand-curated via the
 *     UI); new entries slot in after the last item of the same subject.
 */
import { readFile, writeFile, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { getCredentials } from './cf-credentials.mjs'
import {
  classify,
  STREAM_MAX_BYTES,
  uploadBufferToStream,
  uploadBufferToImages,
  buildStreamEntry,
  buildImageEntry,
} from './cf-lib.mjs'

const SRC = process.env.GALLERY_SRC || join(homedir(), 'Desktop', 'gallery')
const MANIFEST_PATH = new URL('../src/data/gallery.json', import.meta.url).pathname

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

function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

// Insert after the last manifest entry with the same subject, so groups stay
// together without re-sorting (and destroying) the curated order.
function insertEntry(manifest, entry) {
  let at = -1
  const subj = (entry.subject || '').toLowerCase()
  for (let i = 0; i < manifest.length; i++) {
    if ((manifest[i].subject || '').toLowerCase() === subj) at = i
  }
  if (at === -1) manifest.push(entry)
  else manifest.splice(at + 1, 0, entry)
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
      const buf = await readFile(item.absPath)
      let entry
      if (kind === 'video' || kind === 'audio') {
        const r = await uploadBufferToStream({ accountId, token, buf, filename: item.filename })
        entry = buildStreamEntry(item, r, kind)
      } else {
        const r = await uploadBufferToImages({ accountId, token, buf, filename: item.filename })
        entry = buildImageEntry(item, r)
      }
      insertEntry(manifest, entry)
      haveKeys.add(entry.sourceKey)
      uploaded++
      process.stdout.write(`OK (${entry.cfId})\n`)
    } catch (err) {
      process.stdout.write(`FAILED\n`)
      console.error(`    ${err.message}`)
    }
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8')

  console.log(`\nDone. Uploaded ${uploaded}, skipped ${skipped} (already in manifest).`)
  console.log(`Manifest: ${MANIFEST_PATH}`)
}

main().catch((err) => {
  console.error('sync-cloudflare failed:', err.message)
  process.exit(1)
})
