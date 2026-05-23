import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

/**
 * Gallery page — auto-indexes everything in src/assets/gallery/.
 *
 * Workflow:
 *  1. Drop video / image files into ~/Desktop/gallery/
 *  2. Run `npm run sync-gallery` (copies them into src/assets/gallery/)
 *  3. Vite picks them up automatically — no code changes needed.
 *
 * Supported extensions: mp4, webm, mov, jpg, jpeg, png, webp, gif, avif
 */
type AssetEntry = {
  src: string
  /** "video" | "image" — inferred from extension */
  kind: 'video' | 'image'
  /** Filename without extension, used as a caption */
  name: string
}

const videoModules = import.meta.glob(
  '../assets/gallery/*.{mp4,webm,mov,MP4,WEBM,MOV}',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>

const imageModules = import.meta.glob(
  '../assets/gallery/*.{jpg,jpeg,png,webp,gif,avif,JPG,JPEG,PNG,WEBP,GIF,AVIF}',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>

function moduleToEntries(
  mods: Record<string, string>,
  kind: AssetEntry['kind'],
): AssetEntry[] {
  return Object.entries(mods)
    .map(([path, src]) => {
      const file = path.split('/').pop() ?? path
      const name = file.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
      return { src, kind, name }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

const assets: AssetEntry[] = [
  ...moduleToEntries(videoModules, 'video'),
  ...moduleToEntries(imageModules, 'image'),
]

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Close on Escape
  useEffect(() => {
    if (activeIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null)
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i === null ? null : (i + 1) % assets.length))
      if (e.key === 'ArrowLeft')
        setActiveIndex((i) =>
          i === null ? null : (i - 1 + assets.length) % assets.length,
        )
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex])

  return (
    <div className="home-paper gallery-page text-[--ink]">
      <div aria-hidden className="home-grain" />

      {/* Editorial header (matches Home) */}
      <header className="home-header">
        <div className="home-header-inner">
          <Link to="/" className="home-brand">
            <span className="home-brand-dot" aria-hidden />
            <span className="home-brand-name">Guy Avnaim</span>
          </Link>
          <nav className="home-nav" aria-label="Primary">
            <Link to="/">Home</Link>
            <Link to="/production">Production</Link>
            <Link to="/gallery">Gallery</Link>
          </nav>
        </div>
      </header>

      {/* Header */}
      <div className="gallery-header">
        <span className="home-mono">Gallery / Everything I&rsquo;ve made</span>
        <h1 className="gallery-title">
          Videos, frames, <em>and fragments.</em>
        </h1>
        <p className="gallery-sub">
          A growing archive of finished work and in-progress fragments — Reels frames, music
          cover art, AI video stills, UI explorations. Drop new files into{' '}
          <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>~/Desktop/gallery/</code>{' '}
          and run <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>npm run sync-gallery</code>{' '}
          to add them.
        </p>
      </div>

      {/* Grid */}
      {assets.length === 0 ? (
        <div className="gallery-grid">
          <div className="gallery-empty" style={{ gridColumn: '1 / -1' }}>
            <p style={{ marginBottom: 12 }}>
              Nothing in the gallery yet.
            </p>
            <p>
              Drop video or image files into{' '}
              <code>~/Desktop/gallery/</code> and run{' '}
              <code>npm run sync-gallery</code>.
            </p>
          </div>
        </div>
      ) : (
        <div className="gallery-grid">
          {assets.map((asset, i) => (
            <button
              type="button"
              key={asset.src}
              className="gallery-item"
              onClick={() => setActiveIndex(i)}
              aria-label={`Open ${asset.name}`}
              style={{ background: 'transparent', border: '1px solid var(--hairline)', padding: 0 }}
            >
              {asset.kind === 'video' ? (
                <video
                  src={asset.src}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                />
              ) : (
                <img src={asset.src} alt={asset.name} loading="lazy" />
              )}
              <span className="gallery-cap">{asset.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {activeIndex !== null && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery viewer"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            className="gallery-lightbox-close"
            onClick={() => setActiveIndex(null)}
            aria-label="Close"
          >
            ×
          </button>
          {assets[activeIndex].kind === 'video' ? (
            <video
              src={assets[activeIndex].src}
              controls
              autoPlay
              playsInline
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={assets[activeIndex].src}
              alt={assets[activeIndex].name}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="home-footer">
        <span>© MMXXVI · Guy Avnaim · Tel Aviv</span>
        <Link to="/">← Home</Link>
      </footer>
    </div>
  )
}
