'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * Big rotating hero headline.
 *
 * Each item is a list of strings — one per line — so each phrase keeps its
 * own deliberate line breaks. Transitions are slow (0.7s ease) and items
 * dwell for `dwellMs` (default 4s) to match the editorial pace of the page.
 *
 * Respects `prefers-reduced-motion`: when reduced, the carousel freezes on
 * the first item instead of cycling.
 */
type Phrase = string[]

const phrases: Phrase[] = [
  ['YOUR WORKFLOWS', 'OPTIMIZED', 'WITH AI'],
  ['AUTONOMOUS', 'AI AGENTS', 'TAILORED TO YOU'],
  ['MUSIC, FILM, AI', 'PRODUCED', 'END TO END'],
  ['WEBSITES', 'BUILT END', 'TO END'],
  ['WORKFLOW', '& AUTOMATION', 'TEMPLATES'],
  ['PROMPT', 'ENGINEERING', 'AT SCALE'],
  ['CUSTOM', 'DASHBOARDS', 'FOR ANY BUSINESS'],
  ['SOCIAL', 'MANAGED AS', 'A SYSTEM'],
  ['SEO', 'OPTIMISED', 'FOR GROWTH'],
  ['AND MUCH', 'MUCH', 'MORE'],
]

export function HeroTitleCarousel({
  dwellMs = 4000,
  className = '',
}: {
  dwellMs?: number
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || paused) return
    const t = window.setTimeout(() => {
      setIndex((i) => (i + 1) % phrases.length)
    }, dwellMs)
    return () => window.clearTimeout(t)
  }, [index, dwellMs, paused])

  const current = phrases[index]

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      // Surface the rotation count to assistive tech without spamming on every change
      aria-roledescription="carousel"
      aria-label="What Guy does"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.h1
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-white"
        >
          {current.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </motion.h1>
      </AnimatePresence>

      {/* Tiny progress indicator — subtle dots, one per phrase */}
      <div
        className="absolute -bottom-6 left-0 flex gap-1.5"
        role="tablist"
        aria-label="Headline rotation"
      >
        {phrases.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show headline ${i + 1} of ${phrases.length}`}
            onClick={() => setIndex(i)}
            className={`h-1 transition-all duration-500 ${
              i === index ? 'w-8 bg-white' : 'w-3 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
