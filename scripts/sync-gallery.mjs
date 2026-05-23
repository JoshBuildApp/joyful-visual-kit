#!/usr/bin/env node
/**
 * sync-gallery — mirror ~/Desktop/gallery/ into src/assets/gallery/ so the
 * /gallery page picks up new media via Vite's import.meta.glob.
 *
 * Run with: npm run sync-gallery
 *
 * Behavior:
 *   - Mirrors top-level files (uncategorized).
 *   - Mirrors one level of subdirectories — each subdir is treated as a
 *     subject category (e.g. sports / landscape / people / community).
 *   - Files removed from Desktop are pruned from the project folder
 *     unless --no-prune is passed. .gitkeep is always preserved.
 *   - Only files with supported extensions are copied.
 */
import { mkdir, readdir, copyFile, stat, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, extname, basename, relative } from 'node:path'

const SUPPORTED = new Set([
  '.mp4', '.webm', '.mov',
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif',
])

const SRC = process.env.GALLERY_SRC || join(homedir(), 'Desktop', 'gallery')
const DEST = new URL('../src/assets/gallery/', import.meta.url).pathname
const PRUNE = !process.argv.includes('--no-prune')

/**
 * Recursively walk a directory one level deep. Returns objects with the
 * relative path inside SRC, so "sports/match.mp4" stays "sports/match.mp4".
 */
async function listMedia(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const results = []
  for (const e of entries) {
    if (e.name.startsWith('.')) continue
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      // One level deep — subjects directly under gallery/
      const inner = await readdir(full, { withFileTypes: true })
      for (const f of inner) {
        if (f.name.startsWith('.')) continue
        if (!f.isFile()) continue
        if (!SUPPORTED.has(extname(f.name).toLowerCase())) continue
        results.push({
          rel: join(e.name, f.name),
          subject: e.name,
        })
      }
    } else if (e.isFile()) {
      if (SUPPORTED.has(extname(e.name).toLowerCase())) {
        results.push({ rel: e.name, subject: null })
      }
    }
  }
  return results
}

async function main() {
  if (!existsSync(SRC)) {
    console.log(`📁 Source folder doesn't exist yet: ${SRC}`)
    await mkdir(SRC, { recursive: true })
    console.log('   ✓ Created empty source folder for you.')
    return
  }

  await mkdir(DEST, { recursive: true })

  const sourceItems = await listMedia(SRC)
  const sourceSet = new Set(sourceItems.map((i) => i.rel))

  let copied = 0
  let skipped = 0
  for (const item of sourceItems) {
    const src = join(SRC, item.rel)
    const dst = join(DEST, item.rel)
    await mkdir(join(DEST, item.subject ?? ''), { recursive: true })
    try {
      const [s, d] = await Promise.all([
        stat(src),
        existsSync(dst) ? stat(dst) : Promise.resolve(null),
      ])
      if (d && d.size === s.size && d.mtimeMs >= s.mtimeMs) {
        skipped++
        continue
      }
      await copyFile(src, dst)
      console.log(`  + ${item.rel} (${formatBytes(s.size)})`)
      copied++
    } catch (err) {
      console.error(`  ! ${item.rel}: ${err.message}`)
    }
  }

  // Prune: any media file in DEST not in source set gets removed.
  let pruned = 0
  if (PRUNE) {
    const destItems = await listMedia(DEST)
    for (const item of destItems) {
      if (!sourceSet.has(item.rel)) {
        await unlink(join(DEST, item.rel))
        console.log(`  - ${item.rel}`)
        pruned++
      }
    }
  }

  // Summary, grouped by subject for clarity
  const bySubject = sourceItems.reduce((acc, i) => {
    const k = i.subject ?? '(uncategorized)'
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {})
  console.log(
    `\n✓ Synced gallery. Copied ${copied}, skipped ${skipped}${
      PRUNE ? `, pruned ${pruned}` : ''
    }. Total: ${sourceItems.length}.`,
  )
  if (Object.keys(bySubject).length > 0) {
    for (const [k, v] of Object.entries(bySubject).sort()) {
      console.log(`    ${k}: ${v}`)
    }
  }
  if (sourceItems.length === 0) {
    console.log(`  (Drop files into ${SRC}/{sports,landscape,people,community}/ and re-run.)`)
  }
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

main().catch((err) => {
  console.error('sync-gallery failed:', err)
  process.exit(1)
})
