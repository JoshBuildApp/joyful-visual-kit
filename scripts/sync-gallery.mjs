#!/usr/bin/env node
/**
 * sync-gallery — copy media files from ~/Desktop/gallery/ into the project's
 * src/assets/gallery/ folder so Vite picks them up in the /gallery page.
 *
 * Run with: npm run sync-gallery
 *
 * Behavior:
 *   - Mirrors the Desktop folder into the project folder (one-way copy).
 *   - Files removed from Desktop are also removed from the project folder
 *     (mirror semantics) unless --no-prune is passed.
 *   - Only files with supported extensions are copied (videos + images).
 *   - .gitkeep is always preserved in the project folder.
 */
import { mkdir, readdir, copyFile, stat, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, extname, basename } from 'node:path'

const SUPPORTED = new Set([
  '.mp4', '.webm', '.mov',
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif',
])

const SRC = process.env.GALLERY_SRC || join(homedir(), 'Desktop', 'gallery')
const DEST = new URL('../src/assets/gallery/', import.meta.url).pathname
const PRUNE = !process.argv.includes('--no-prune')

async function main() {
  if (!existsSync(SRC)) {
    console.log(`📁 Source folder doesn't exist yet: ${SRC}`)
    console.log('   Create it and drop your videos/images there.')
    await mkdir(SRC, { recursive: true })
    console.log('   ✓ Created empty source folder for you.')
    return
  }

  await mkdir(DEST, { recursive: true })

  const sourceFiles = (await readdir(SRC)).filter((f) =>
    SUPPORTED.has(extname(f).toLowerCase()),
  )
  const sourceSet = new Set(sourceFiles)

  let copied = 0
  let skipped = 0
  for (const file of sourceFiles) {
    const src = join(SRC, file)
    const dst = join(DEST, file)
    try {
      const [s, d] = await Promise.all([
        stat(src),
        existsSync(dst) ? stat(dst) : Promise.resolve(null),
      ])
      // Skip if dest exists and is newer-or-equal AND same size
      if (d && d.size === s.size && d.mtimeMs >= s.mtimeMs) {
        skipped++
        continue
      }
      await copyFile(src, dst)
      console.log(`  + ${file} (${formatBytes(s.size)})`)
      copied++
    } catch (err) {
      console.error(`  ! ${file}: ${err.message}`)
    }
  }

  let pruned = 0
  if (PRUNE) {
    const destFiles = (await readdir(DEST)).filter((f) =>
      SUPPORTED.has(extname(f).toLowerCase()),
    )
    for (const file of destFiles) {
      if (!sourceSet.has(file) && basename(file) !== '.gitkeep') {
        await unlink(join(DEST, file))
        console.log(`  - ${file}`)
        pruned++
      }
    }
  }

  console.log(
    `\n✓ Synced gallery. Copied ${copied}, skipped ${skipped}${
      PRUNE ? `, pruned ${pruned}` : ''
    }. Total in gallery: ${sourceFiles.length}.`,
  )
  if (sourceFiles.length === 0) {
    console.log(`  (Drop files into ${SRC} and re-run.)`)
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
