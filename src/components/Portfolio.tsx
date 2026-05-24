'use client'

import { ExternalLink } from 'lucide-react'
import diraPreview from '@/assets/projects/dira.webp'
import nightshiftPreview from '@/assets/projects/nightshift.webp'

type Project = {
  id: string
  name: string
  tagline: string
  description: string
  tag: string
  year: string
  status: string
  url?: string
  /** When set, the card embeds a live iframe of the URL above as the preview. */
  embedLive?: boolean
  /** When set, the card uses this video URL as the preview (autoplay/mute/loop). */
  previewVideo?: string
  /** When set, the card uses this image URL as the preview. */
  previewImage?: string
  /** Optional accent for the small color stripe. */
  accent?: 'emerald' | 'blue' | 'purple' | 'red'
}

const projects: Project[] = [
  {
    id: 'circlo',
    name: 'Circlo',
    tagline: 'Coaching platform — product, design, code, brand',
    description:
      'A full coaching platform for clubs and independent coaches. React + Supabase, end-to-end from product design and brand to backend and DevOps. Live and growing.',
    tag: 'Product · Live',
    year: '2026',
    status: 'Live',
    url: 'https://circloclub.com',
    embedLive: true,
    accent: 'emerald',
  },
  {
    id: 'dira',
    name: 'Dira',
    tagline: 'Real-estate holdings & portfolio app',
    description:
      'An end-to-end app for managing real-estate holdings — units, tenants, cashflow, documents. Hebrew-first UX, designed for owners running multiple properties as one operation.',
    tag: 'Product · Shipping',
    year: '2026',
    status: 'Shipping',
    accent: 'blue',
    previewImage: diraPreview,
  },
  {
    id: 'nightshift',
    name: 'Night Shift',
    tagline: 'Distributed compute marketplace for AI workloads',
    description:
      'A distributed compute marketplace where contributors share idle GPU/CPU time and buyers pay for safe, allowlisted AI workloads — embeddings, image gen, transcription, chat — at a fraction of mainstream cloud cost. Israel-first.',
    tag: 'Platform · In development',
    year: '2026',
    status: 'In development',
    accent: 'purple',
    previewImage: nightshiftPreview,
  },
  {
    id: 'coach-of-the-gods',
    name: 'Coach of the Gods',
    tagline: 'Creative direction & AI video — full Reels season',
    description:
      'A Reels season treating the twelve Olympian gods as fitness coaches. End-to-end creative direction: concept, scripts, AI generation, edit, sound — produced from a one-person studio across a full release schedule.',
    tag: 'Creative · Released',
    year: '2026',
    status: 'Released',
    accent: 'red',
  },
  {
    id: 'samuels',
    name: 'Samuels',
    tagline: 'Jewelry brand — co-founded, art-directed, social',
    description:
      'A jewelry brand I co-founded with my father in 2024. Directed the shooting days, assembled the photography team, and built the social presence from the ground up. @samuels_jewelry_',
    tag: 'Brand · Live',
    year: '2024',
    status: 'Live',
    url: 'https://instagram.com/samuels_jewelry_',
    accent: 'emerald',
  },
]

export function Portfolio() {
  return (
    <section id="portfolio" className="relative py-32 bg-background">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              Selected Projects
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8">
            <span className="block mb-2">Things I&rsquo;ve built &amp; shipped</span>
          </h2>

          <p className="text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Products, platforms, and creative releases — designed end-to-end from one studio.
          </p>
        </div>

        {/* Project preview cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ project: p }: { project: Project }) {
  const accentClass =
    p.accent === 'emerald'
      ? 'bg-accent-emerald/10 text-accent-emerald'
      : p.accent === 'blue'
      ? 'bg-accent-blue/10 text-accent-blue'
      : p.accent === 'red'
      ? 'bg-red-500/10 text-red-400'
      : 'bg-accent-purple/10 text-accent-purple'

  const Wrapper: React.ElementType = p.url ? 'a' : 'div'
  const wrapperProps = p.url
    ? { href: p.url, target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <Wrapper
      {...wrapperProps}
      className="group block bg-card clean-border rounded-3xl overflow-hidden elevated-shadow transition-transform duration-500 hover:-translate-y-1"
    >
      {/* Preview */}
      <div className="relative aspect-video bg-black overflow-hidden">
        {p.embedLive && p.url ? (
          <iframe
            src={p.url}
            title={`${p.name} — live preview`}
            loading="lazy"
            className="absolute inset-0 w-full h-full border-0 pointer-events-none"
            // Scale a desktop layout down to fit the card without horizontal scroll
            style={{
              transform: 'scale(0.5)',
              transformOrigin: 'top left',
              width: '200%',
              height: '200%',
            }}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : p.previewVideo ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={p.previewVideo}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : p.previewImage ? (
          <img
            src={p.previewImage}
            alt={`${p.name} preview`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          // Editorial placeholder when no asset is supplied yet
          <PlaceholderPreview name={p.name} accent={p.accent} />
        )}

        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <span className="glass-effect rounded-xl px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            {p.year} — {p.status}
          </span>
        </div>

        {/* Open arrow on hover */}
        {p.url && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="glass-effect rounded-full p-2 backdrop-blur-md">
              <ExternalLink className="w-4 h-4 text-white" />
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-3">
          <span className={`${accentClass} px-3 py-1 rounded-full text-xs font-medium`}>
            {p.tag}
          </span>
        </div>

        <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          {p.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {p.tagline}
        </p>

        <p className="text-base text-muted-foreground leading-relaxed">
          {p.description}
        </p>
      </div>
    </Wrapper>
  )
}

function PlaceholderPreview({
  name,
  accent,
}: {
  name: string
  accent?: Project['accent']
}) {
  const gradient =
    accent === 'blue'
      ? 'from-accent-blue/30 via-accent-blue/10 to-transparent'
      : accent === 'purple'
      ? 'from-accent-purple/30 via-accent-purple/10 to-transparent'
      : accent === 'red'
      ? 'from-red-500/25 via-red-500/10 to-transparent'
      : 'from-accent-emerald/30 via-accent-emerald/10 to-transparent'

  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <div className="text-center px-6">
        <div className="text-xs uppercase tracking-[0.25em] text-white/60 mb-3">
          Preview · TBD
        </div>
        <div className="font-bagel text-3xl lg:text-4xl text-white tracking-wider">
          {name}
        </div>
      </div>
    </div>
  )
}
