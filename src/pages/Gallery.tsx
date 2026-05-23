'use client'

import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

/**
 * Gallery page — auto-indexes everything in src/assets/gallery/{subject}/.
 *
 * Workflow:
 *  1. Drop video / image files into ~/Desktop/gallery/{sports,landscape,
 *     people,community}/ (or any subfolder you like — it becomes a filter).
 *  2. Run `npm run sync-gallery` (mirrors the folder tree into
 *     src/assets/gallery/).
 *  3. Vite picks them up automatically via import.meta.glob — no code
 *     changes needed. Files at the root (no subfolder) become
 *     "uncategorized" and only appear under "All".
 *
 * Supported extensions: mp4, webm, mov, jpg, jpeg, png, webp, gif, avif
 */
type AssetKind = 'video' | 'image'

type AssetEntry = {
  src: string
  kind: AssetKind
  /** Filename without extension, used as a caption. */
  name: string
  /** Lowercased subfolder name; null when the file sits at the gallery root. */
  subject: string | null
}

// Match both root-level files and one level of subfolder (e.g. sports/x.jpg).
const videoModules = import.meta.glob(
  '../assets/gallery/**/*.{mp4,webm,mov,MP4,WEBM,MOV}',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>

const imageModules = import.meta.glob(
  '../assets/gallery/**/*.{jpg,jpeg,png,webp,gif,avif,JPG,JPEG,PNG,WEBP,GIF,AVIF}',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>

/**
 * Parse `../assets/gallery/sports/match.mp4` → {subject: "sports", file: "match.mp4"}.
 * Returns subject=null when the file is at the gallery root.
 */
function parsePath(path: string): { subject: string | null; file: string } {
  const rel = path.replace(/^.*\/assets\/gallery\//, '')
  const parts = rel.split('/')
  if (parts.length === 1) return { subject: null, file: parts[0] }
  return { subject: parts[0].toLowerCase(), file: parts.slice(1).join('/') }
}

function moduleToEntries(
  mods: Record<string, string>,
  kind: AssetKind,
): AssetEntry[] {
  return Object.entries(mods)
    .map(([path, src]) => {
      const { subject, file } = parsePath(path)
      const name = file
        .replace(/\.[^.]+$/, '')
        .replace(/^\d+[_-]+/, '')
        .replace(/[-_]+/g, ' ')
        .trim()
      return { src, kind, name, subject }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

const assets: AssetEntry[] = [
  ...moduleToEntries(videoModules, 'video'),
  ...moduleToEntries(imageModules, 'image'),
]

// The 4 subjects we always surface as filter pills (even when empty).
// Order is the order they render in.
const ALWAYS_ON_SUBJECTS = ['sports', 'landscape', 'people', 'community'] as const

// Any extra subfolder the user creates beyond the 4 above also gets a pill.
const discoveredExtras = Array.from(
  new Set(
    assets
      .map((a) => a.subject)
      .filter(
        (s): s is string => s !== null && !ALWAYS_ON_SUBJECTS.includes(s as (typeof ALWAYS_ON_SUBJECTS)[number]),
      ),
  ),
).sort()

const SUBJECTS: string[] = [...ALWAYS_ON_SUBJECTS, ...discoveredExtras]

type Filter = 'all' | (typeof SUBJECTS)[number] | string

export default function Gallery() {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  const filtered =
    filter === 'all'
      ? assets
      : assets.filter((a) => a.subject === filter)

  // Lightbox keyboard nav
  useEffect(() => {
    if (activeIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null)
      if (e.key === 'ArrowRight')
        setActiveIndex((i) =>
          i === null ? null : (i + 1) % filtered.length,
        )
      if (e.key === 'ArrowLeft')
        setActiveIndex((i) =>
          i === null ? null : (i - 1 + filtered.length) % filtered.length,
        )
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, filtered.length])

  // Counts per subject, used in the filter pills
  const subjectCounts: Record<string, number> = { all: assets.length }
  for (const s of SUBJECTS) {
    subjectCounts[s] = assets.filter((a) => a.subject === s).length
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Top nav — matches the Hero nav style on /production */}
      <header className="fixed top-0 left-0 right-0 w-full z-50">
        <div className="w-full px-6 sm:px-8 lg:px-12 py-4 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/production')}
              className="font-bagel text-white text-xl tracking-wider cursor-pointer hover:scale-105 transition-transform"
              aria-label="Back to portfolio"
            >
              GUY AVNAIM
            </button>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/production#portfolio"
                className="text-white hover:text-white/80 font-medium transition-all hover:scale-105"
              >
                Work
              </Link>
              <Link
                to="/production#about"
                className="text-white hover:text-white/80 font-medium transition-all hover:scale-105"
              >
                Process
              </Link>
              <Link
                to="/production#services"
                className="text-white hover:text-white/80 font-medium transition-all hover:scale-105"
              >
                Capabilities
              </Link>
              <Link
                to="/gallery"
                className="text-white font-medium border-b border-white pb-0.5"
                aria-current="page"
              >
                Gallery
              </Link>
              <Link
                to="/production#contact"
                className="text-white hover:text-white/80 font-medium transition-all hover:scale-105"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Section header — same pattern as Portfolio / Services / About / Contact */}
      <section className="pt-40 pb-20 bg-background">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-muted-foreground">
                Gallery
              </span>
              <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8">
              <span className="block mb-2">Videos, frames, fragments</span>
            </h1>

            <p className="text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              A growing archive of finished work and in-progress moments — Reels frames,
              cover art, AI video stills, UI explorations.
            </p>
          </div>

          {/* Subject filter pills — always visible so subjects with zero
              items still surface as planned categories (counts go to 0). */}
          <div
            role="tablist"
            aria-label="Filter gallery by subject"
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-16"
          >
            <FilterPill
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label="All"
              count={subjectCounts.all}
            />
            {SUBJECTS.map((s) => (
              <FilterPill
                key={s}
                active={filter === s}
                onClick={() => setFilter(s)}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
                count={subjectCounts[s] ?? 0}
                disabled={(subjectCounts[s] ?? 0) === 0}
              />
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <EmptyState subject={filter === 'all' ? undefined : filter} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {filtered.map((asset, i) => (
                <GalleryCard
                  key={asset.src}
                  asset={asset}
                  onOpen={() => setActiveIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {activeIndex !== null && filtered[activeIndex] && (
        <Lightbox
          asset={filtered[activeIndex]}
          onClose={() => setActiveIndex(null)}
          onPrev={() =>
            setActiveIndex(
              (i) => ((i ?? 0) - 1 + filtered.length) % filtered.length,
            )
          }
          onNext={() =>
            setActiveIndex((i) => ((i ?? 0) + 1) % filtered.length)
          }
        />
      )}

      {/* Footer — same minimal pattern */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-sm text-muted-foreground">
              © MMXXVI · GUY AVNAIM · TEL AVIV
            </span>
            <Link
              to="/production"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to portfolio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  label,
  count,
  disabled,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  disabled?: boolean
}) {
  const base = 'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300'
  const className = active
    ? `${base} bg-foreground text-background`
    : disabled
    ? `${base} bg-card clean-border text-muted-foreground/40 cursor-not-allowed`
    : `${base} bg-card clean-border text-muted-foreground hover:text-foreground`
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {label} <span className="opacity-50">({count})</span>
    </button>
  )
}

function GalleryCard({
  asset,
  onOpen,
}: {
  asset: AssetEntry
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${asset.name}`}
      className="group relative aspect-[4/5] bg-card clean-border rounded-3xl overflow-hidden elevated-shadow text-left transition-transform duration-500 hover:-translate-y-1 cursor-pointer"
    >
      {asset.kind === 'video' ? (
        <video
          src={asset.src}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={asset.src}
          alt={asset.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Type + subject chips */}
      <div className="absolute top-4 left-4 flex gap-2">
        <span className="glass-effect rounded-xl px-3 py-1 text-xs font-medium text-white backdrop-blur-md uppercase tracking-wider">
          {asset.kind}
        </span>
        {asset.subject && (
          <span className="glass-effect rounded-xl px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md uppercase tracking-wider">
            {asset.subject}
          </span>
        )}
      </div>

      {/* Caption — appears on hover */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-sm font-medium text-white capitalize">
          {asset.name}
        </p>
      </div>
    </button>
  )
}

function EmptyState({ subject }: { subject?: string }) {
  return (
    <div className="max-w-2xl mx-auto bg-card clean-border rounded-3xl p-12 text-center elevated-shadow">
      <div className="w-12 h-12 bg-accent-emerald/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="w-6 h-6 bg-accent-emerald rounded-full animate-pulse" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-3">
        {subject
          ? `Nothing in ${subject.charAt(0).toUpperCase() + subject.slice(1)} yet`
          : 'Nothing in the gallery yet'}
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Drop video or image files into{' '}
        <code className="bg-background px-2 py-1 rounded text-sm">
          ~/Desktop/gallery/{subject ?? '{sports,landscape,people,community}'}/
        </code>{' '}
        and run{' '}
        <code className="bg-background px-2 py-1 rounded text-sm">
          npm run sync-gallery
        </code>
        .
      </p>
      <p className="text-sm text-muted-foreground">
        Supported: <code>mp4 webm mov jpg jpeg png webp gif avif</code>
      </p>
    </div>
  )
}

function Lightbox({
  asset,
  onClose,
  onPrev,
  onNext,
}: {
  asset: AssetEntry
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gallery viewer"
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-6 sm:p-14"
      onClick={onClose}
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 w-12 h-12 rounded-full glass-effect text-white text-2xl hover:bg-white/20 transition-colors cursor-pointer"
      >
        ×
      </button>

      {/* Prev / Next */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
        aria-label="Previous"
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-effect text-white text-2xl hover:bg-white/20 transition-colors cursor-pointer hidden sm:block"
      >
        ←
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        aria-label="Next"
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-effect text-white text-2xl hover:bg-white/20 transition-colors cursor-pointer hidden sm:block"
      >
        →
      </button>

      {/* Media */}
      <div
        className="max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {asset.kind === 'video' ? (
          <video
            src={asset.src}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-[85vh] rounded-2xl"
          />
        ) : (
          <img
            src={asset.src}
            alt={asset.name}
            className="max-w-full max-h-[85vh] rounded-2xl object-contain"
          />
        )}
        <p className="text-white/70 text-sm capitalize font-medium tracking-wide">
          {asset.name}
        </p>
      </div>
    </div>
  )
}
