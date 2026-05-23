#!/usr/bin/env node
/**
 * sync-hero — mirror ~/Desktop/hero/ into src/assets/hero/ so new clips
 * dropped on the Desktop appear in the Production hero carousel.
 *
 * Run with: npm run sync-hero
 *
 * Mirrors the sync-gallery pattern. Only video extensions are copied.
 * File order in the carousel is alphabetical — name files like `04_forest.mp4`
 * to control sequence.
 */
import { mkdir, readdir, copyFile, stat, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, extname, basename } from 'node:path'

const SUPPORTED = new Set(['.mp4', '.webm', '.mov'])

const SRC = process.env.HERO_SRC || join(homedir(), 'Desktop', 'hero')
const DEST = new URL('../src/assets/hero/', import.meta.url).pathname
const PRUNE = !process.argv.includes('--no-prune')

async function main() {
  if (!existsSync(SRC)) {
    console.log(`📁 Source folder doesn't exist yet: ${SRC}`)
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
    `\n✓ Synced hero. Copied ${copied}, skipped ${skipped}${
      PRUNE ? `, pruned ${pruned}` : ''
    }. Total clips: ${sourceFiles.length}.`,
  )
  if (sourceFiles.length === 0) {
    console.log(`  (Drop .mp4/.webm/.mov files into ${SRC} and re-run.)`)
  }
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

main().catch((err) => {
  console.error('sync-hero failed:', err)
  process.exit(1)
})
