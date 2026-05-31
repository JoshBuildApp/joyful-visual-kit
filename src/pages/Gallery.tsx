'use client'

import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Music } from 'lucide-react'
import manifest from '@/data/gallery.json'

/**
 * Gallery page — reads src/data/gallery.json, which is populated by
 * `npm run sync-cloudflare`.
 *
 * Workflow:
 *  1. Drop video / image files into ~/Desktop/gallery/{sports,landscape,
 *     people,community}/ (or any subfolder you like — it becomes a filter).
 *  2. Run `npm run sync-cloudflare` (uploads to Cloudflare Stream/Images
 *     and appends entries to src/data/gallery.json).
 *  3. Vite picks up the manifest change automatically — no code edits.
 */
type AssetKind = 'video' | 'image' | 'audio'

type ManifestEntry = {
  sourceKey: string
  kind: AssetKind
  subject: string | null
  name: string
  cfId: string
  displayUrl: string
  previewUrl?: string
  posterUrl?: string
}

const assets = manifest as ManifestEntry[]

// Projects, in display order. The gallery is organized as named bodies of
// work — each `subject` slug in the manifest maps to one project here.
// `label` is what shows on the filter pill.
const PROJECTS: { slug: string; label: string }[] = [
  { slug: 'circlo-pop-sport', label: 'Circlo — Pop Sport' },
  { slug: 'nothing-to-lose', label: 'Nothing to Lose' },
  { slug: 'coach-of-the-gods', label: 'Coach of the Gods' },
  { slug: 'atelier', label: 'Atelier' },
  { slug: 'still-life', label: 'Still Life' },
  { slug: 'valdez-gallery', label: 'Valdez Gallery' },
  { slug: 'tokyo', label: 'Tokyo' },
  { slug: 'metropolis', label: 'Metropolis' },
  { slug: 'pro-kit', label: 'Pro Kit' },
  { slug: 'wild', label: 'Wild' },
  { slug: 'delivered', label: 'Delivered' },
]

const PROJECT_LABELS: Record<string, string> = Object.fromEntries(
  PROJECTS.map((p) => [p.slug, p.label]),
)

// Any subject slug present in the manifest but not in PROJECTS above still
// gets a pill (slug shown as-is) so nothing silently disappears.
const discoveredExtras = Array.from(
  new Set(
    assets
      .map((a) => a.subject)
      .filter((s): s is string => s !== null && !PROJECT_LABELS[s]),
  ),
).sort()

const SUBJECTS: string[] = [...PROJECTS.map((p) => p.slug), ...discoveredExtras]

function labelFor(slug: string): string {
  return PROJECT_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1)
}

type Filter = 'all' | (typeof SUBJECTS)[number] | string

export default function Gallery() {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  const filtered =
    filter === 'all'
      ? assets
      : assets.filter((a) => a.subject === filter)

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

  const subjectCounts: Record<string, number> = { all: assets.length }
  for (const s of SUBJECTS) {
    subjectCounts[s] = assets.filter((a) => a.subject === s).length
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 w-full z-50">
        <div className="w-full px-6 sm:px-8 lg:px-12 py-4 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="font-bagel text-white text-xl tracking-wider cursor-pointer hover:scale-105 transition-transform"
              aria-label="Back to portfolio"
            >
              GUY AVNAIM
            </button>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/#portfolio"
                className="text-white hover:text-white/80 font-medium transition-all hover:scale-105"
              >
                Work
              </Link>
              <Link
                to="/#about"
                className="text-white hover:text-white/80 font-medium transition-all hover:scale-105"
              >
                Process
              </Link>
              <Link
                to="/#services"
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
                to="/#contact"
                className="text-white hover:text-white/80 font-medium transition-all hover:scale-105"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

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
            {SUBJECTS.filter((s) => (subjectCounts[s] ?? 0) > 0).map((s) => (
              <FilterPill
                key={s}
                active={filter === s}
                onClick={() => setFilter(s)}
                label={labelFor(s)}
                count={subjectCounts[s] ?? 0}
              />
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState subject={filter === 'all' ? undefined : filter} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {filtered.map((asset, i) => (
                <GalleryCard
                  key={asset.cfId}
                  asset={asset}
                  onOpen={() => setActiveIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

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

      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-sm text-muted-foreground">
              © MMXXVI · GUY AVNAIM · TEL AVIV
            </span>
            <Link
              to="/"
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
  asset: ManifestEntry
  onOpen: () => void
}) {
  // Card previews use the (lightweight) animated GIF / image thumbnail.
  // Audio has no thumbnail — render a music-icon placeholder card.
  // The Stream player iframe only mounts in the lightbox.
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${asset.name}`}
      className="group relative aspect-[4/5] bg-card clean-border rounded-3xl overflow-hidden elevated-shadow text-left transition-transform duration-500 hover:-translate-y-1 cursor-pointer"
    >
      {asset.kind === 'audio' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent-emerald/30 via-accent-blue/20 to-background">
          <Music className="w-20 h-20 text-foreground/70" strokeWidth={1.5} />
        </div>
      ) : (
        <img
          src={asset.previewUrl}
          alt={asset.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      <div className="absolute top-4 left-4 flex gap-2">
        <span className="glass-effect rounded-xl px-3 py-1 text-xs font-medium text-white backdrop-blur-md uppercase tracking-wider">
          {asset.kind}
        </span>
        {asset.subject && (
          <span className="glass-effect rounded-xl px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md uppercase tracking-wider">
            {labelFor(asset.subject)}
          </span>
        )}
      </div>

      {asset.kind === 'audio' && (
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-sm font-medium text-foreground capitalize">
            {asset.name}
          </p>
        </div>
      )}

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
          ? `Nothing in ${labelFor(subject)} yet`
          : 'Nothing in the gallery yet'}
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Drop video or image files into{' '}
        <code className="bg-background px-2 py-1 rounded text-sm">
          ~/Desktop/gallery/{subject ?? '<project>'}/
        </code>{' '}
        and run{' '}
        <code className="bg-background px-2 py-1 rounded text-sm">
          npm run sync-cloudflare
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
  asset: ManifestEntry
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
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 w-12 h-12 rounded-full glass-effect text-white text-2xl hover:bg-white/20 transition-colors cursor-pointer"
      >
        ×
      </button>

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

      <div
        className="max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {asset.kind === 'video' ? (
          <iframe
            src={`${asset.displayUrl}?autoplay=true&muted=false`}
            title={asset.name}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
            className="w-[90vw] max-w-4xl aspect-video rounded-2xl border-0"
          />
        ) : asset.kind === 'audio' ? (
          <iframe
            src={`${asset.displayUrl}?autoplay=true`}
            title={asset.name}
            allow="autoplay; encrypted-media;"
            className="w-[90vw] max-w-2xl h-32 rounded-2xl border-0"
          />
        ) : (
          <img
            src={asset.displayUrl}
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
