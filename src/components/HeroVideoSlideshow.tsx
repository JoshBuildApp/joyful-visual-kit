'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Crossfading hero video slideshow.
 *
 * - Each clip plays muted/inline/looped while it's the active layer.
 * - When a clip reaches its end (or after `clipDurationMs` as fallback), the
 *   next clip's <video> layer fades up over the current one. CSS opacity
 *   transitions handle the crossfade; React state controls which index is
 *   "active" (fully visible).
 * - Adding more clips later just means appending to `sources` — no other
 *   changes needed.
 */
type Source = {
  src: string
  /** Optional poster / fallback image while the clip loads */
  poster?: string
  /** Optional human label for screen readers */
  label?: string
}

export function HeroVideoSlideshow({
  sources,
  muted = true,
  clipDurationMs = 8000,
  fadeMs = 1200,
  className = '',
  videoClassName = '',
}: {
  sources: Source[]
  muted?: boolean
  clipDurationMs?: number
  fadeMs?: number
  className?: string
  videoClassName?: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const advanceTimer = useRef<number | undefined>(undefined)

  // Reset the array length when sources change
  videoRefs.current = sources.map(
    (_, i) => videoRefs.current[i] ?? null,
  )

  // Advance to the next clip after clipDurationMs (fallback in case
  // `ended` doesn't fire on a looping video — we explicitly disable
  // `loop` for non-active layers, see below).
  useEffect(() => {
    if (sources.length <= 1) return
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current)
    advanceTimer.current = window.setTimeout(() => {
      setActiveIndex((i) => (i + 1) % sources.length)
    }, clipDurationMs)
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current)
    }
  }, [activeIndex, sources.length, clipDurationMs])

  // Sync play/pause + mute on every render so HMR + prop changes stay correct
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      v.muted = muted
      v.volume = muted ? 0 : 0.6
      if (i === activeIndex) {
        const p = v.play()
        if (p && typeof p.catch === 'function') p.catch(() => {})
      } else {
        // Reset non-active clips so they begin from the start next time
        try { v.pause() } catch {}
        try { v.currentTime = 0 } catch {}
      }
    })
  }, [activeIndex, muted, sources])

  return (
    <div
      className={`absolute inset-0 w-full h-full ${className}`}
      aria-hidden={muted}
      style={{ overflow: 'hidden', background: '#000' }}
    >
      {sources.map((s, i) => (
        <video
          key={s.src}
          ref={(el) => {
            videoRefs.current[i] = el
          }}
          className={`absolute inset-0 w-full h-full object-cover scale-110 ${videoClassName}`}
          autoPlay={i === activeIndex}
          muted
          playsInline
          preload={i === activeIndex ? 'auto' : 'metadata'}
          poster={s.poster}
          aria-label={s.label}
          style={{
            opacity: i === activeIndex ? 1 : 0,
            transition: `opacity ${fadeMs}ms ease-in-out`,
            willChange: 'opacity',
          }}
          onEnded={() => {
            // If a clip naturally ends first, advance early
            if (sources.length > 1) {
              setActiveIndex((cur) =>
                cur === i ? (i + 1) % sources.length : cur,
              )
            }
          }}
        >
          <source src={s.src} type="video/mp4" />
        </video>
      ))}
    </div>
  )
}

/**
 * Hero clips are auto-discovered from src/assets/hero/. Workflow:
 *
 *   1. Drop new .mp4 / .webm / .mov files into ~/Desktop/hero/
 *   2. Run `npm run sync-hero` (copies into src/assets/hero/)
 *   3. Vite picks them up via import.meta.glob — no code edits needed.
 *
 * File naming controls play order — they're sorted alphabetically, so
 * prefix with `01_`, `02_`, … to control sequence.
 */
const heroModules = import.meta.glob(
  '../assets/hero/*.{mp4,webm,mov,MP4,WEBM,MOV}',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>

export const heroClips: Source[] = Object.entries(heroModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src]) => {
    const file = path.split('/').pop() ?? path
    const name = file
      .replace(/\.[^.]+$/, '')
      .replace(/^\d+[_-]+/, '')
      .replace(/[-_]+/g, ' ')
      .trim()
    return { src, label: name }
  })
