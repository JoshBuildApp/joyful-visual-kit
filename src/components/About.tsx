'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

type Accent = 'emerald' | 'blue' | 'purple'

type ProcessStep = {
  number: string
  title: string
  description: string
  accent: Accent
}

type ServiceProcess = {
  id: string
  label: string
  /** Headline subtitle when this service is active */
  subtitle: string
  steps: ProcessStep[]
}

/**
 * The Process section toggles between distinct pipelines per service kind.
 * Add a new service by appending a `ServiceProcess` entry — the tabs row
 * picks it up automatically.
 */
const services: ServiceProcess[] = [
  {
    id: 'ai-video',
    label: 'AI Video',
    subtitle: 'A five-step pipeline from script to master — repeatable, fast, end-to-end.',
    steps: [
      { number: '01', title: 'Concept & Script', description: 'Scene-by-scene draft with dialogue, timing, and references — written before a single asset is generated.', accent: 'blue' },
      { number: '02', title: 'Look & Storyboard', description: 'Engine selection, palette, and shot tests. Decide the visual grammar before scaling production.', accent: 'emerald' },
      { number: '03', title: 'AI Production', description: 'Multi-variant generation, motion tests, and the iteration loop that turns a treatment into footage.', accent: 'purple' },
      { number: '04', title: 'Post-production', description: 'Edit, color, sound design, and mix. The pass that makes generated material feel directed.', accent: 'blue' },
      { number: '05', title: 'Master & Deliver', description: 'Format export, captioning, and secure hand-off. Ready for release across every channel.', accent: 'purple' },
    ],
  },
  {
    id: 'music',
    label: 'Music',
    subtitle: 'From mood reference to mastered release — five stages, studio-grade output.',
    steps: [
      { number: '01', title: 'Brief & Reference', description: 'Mood, genre, tempo, references. Lock the destination before laying down a single note.', accent: 'emerald' },
      { number: '02', title: 'Sketch & Compose', description: 'Chords, melody, structure. The core musical idea, drafted and refined until it works.', accent: 'blue' },
      { number: '03', title: 'Production', description: 'Arrangement, instrument selection, performance, sound design — fully tracked.', accent: 'purple' },
      { number: '04', title: 'Mix', description: 'EQ, compression, automation, depth. The pass that makes every element sit right.', accent: 'emerald' },
      { number: '05', title: 'Master', description: 'Loudness, format export, broadcast-ready. Delivered tuned for streaming or scoring.', accent: 'blue' },
    ],
  },
  {
    id: 'website',
    label: 'Website / App',
    subtitle: 'Discovery to launch — design, code, and ship the whole product end-to-end.',
    steps: [
      { number: '01', title: 'Discovery & Strategy', description: 'Problem framing, target users, scope, success metrics. The decisions that govern everything downstream.', accent: 'blue' },
      { number: '02', title: 'UI / UX Design', description: 'Wireframes, design system, prototypes. The kind of detail work that makes an app feel right.', accent: 'purple' },
      { number: '03', title: 'Build', description: 'Frontend, backend, database, auth — real production code, not prototypes. React + Supabase by default.', accent: 'emerald' },
      { number: '04', title: 'QA & Performance', description: 'Testing, accessibility, Core Web Vitals. Performance and a11y tuned before launch, not after.', accent: 'blue' },
      { number: '05', title: 'Launch & Iterate', description: 'Deploy, monitor, analytics, refine. Day-one shipping with a roadmap for the next iteration.', accent: 'purple' },
    ],
  },
  {
    id: 'ai-agent',
    label: 'AI Agent',
    subtitle: 'Map the workflow, architect the agent, ship it safely into production.',
    steps: [
      { number: '01', title: 'Map the Workflow', description: 'Current process, pain points, automation candidates. Find the moves only a human still has to make.', accent: 'purple' },
      { number: '02', title: 'Architect the Agent', description: 'Tools, models, prompts, safety boundaries. Pick the multi-model stack that fits the task.', accent: 'emerald' },
      { number: '03', title: 'Build & Wire', description: 'LLM chains, tool calls, error handling, retries. The infrastructure between idea and reliable behaviour.', accent: 'blue' },
      { number: '04', title: 'Test on Real Data', description: 'Edge cases, hallucination guards, cost limits. Stress-tested on production-shaped inputs.', accent: 'purple' },
      { number: '05', title: 'Deploy & Monitor', description: 'Production hand-off with observability, alerts, and a feedback loop for continuous improvement.', accent: 'emerald' },
    ],
  },
  {
    id: 'dashboard',
    label: 'Custom Dashboard',
    subtitle: 'From the decisions you need to make to the dashboard that makes them obvious.',
    steps: [
      { number: '01', title: 'Define the Decisions', description: 'What does the user actually need to decide? Build backwards from the question, not the data.', accent: 'emerald' },
      { number: '02', title: 'Map the Data', description: 'Sources, joins, refresh cadence, ownership. The plumbing that makes the surface possible.', accent: 'blue' },
      { number: '03', title: 'Design the Surface', description: 'Charts, filters, drill-downs, hierarchy. A surface that a non-analyst can read in seconds.', accent: 'purple' },
      { number: '04', title: 'Build & Connect', description: 'Queries, API layer, real-time updates where they matter. Frontend tied to live data, not screenshots.', accent: 'emerald' },
      { number: '05', title: 'Train & Hand-off', description: 'Docs, training session, ongoing tweaks. The dashboard is only useful once the team trusts it.', accent: 'blue' },
    ],
  },
]

export function About() {
  const [activeId, setActiveId] = useState(services[0].id)
  const active = services.find((s) => s.id === activeId) ?? services[0]

  return (
    <section id="about" className="relative py-32 bg-background">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header — matches Portfolio + Services */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              Process
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8">
            <span className="block mb-2">How the work gets made</span>
          </h2>

          <AnimatePresence mode="wait">
            <motion.p
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
            >
              {active.subtitle}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Service tabs */}
        <div
          role="tablist"
          aria-label="Service kinds"
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-16"
        >
          {services.map((s) => {
            const isActive = s.id === activeId
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`process-panel-${s.id}`}
                id={`process-tab-${s.id}`}
                onClick={() => setActiveId(s.id)}
                className={
                  isActive
                    ? 'px-5 py-2.5 rounded-full text-sm font-medium bg-foreground text-background transition-all duration-300'
                    : 'px-5 py-2.5 rounded-full text-sm font-medium bg-card clean-border text-muted-foreground hover:text-foreground transition-all duration-300'
                }
              >
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Process cards (animated swap on tab change) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            id={`process-panel-${active.id}`}
            role="tabpanel"
            aria-labelledby={`process-tab-${active.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto"
          >
            {active.steps.map((s) => (
              <ProcessCard key={s.number} step={s} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

function ProcessCard({ step: s }: { step: ProcessStep }) {
  const accentText =
    s.accent === 'emerald'
      ? 'text-accent-emerald'
      : s.accent === 'blue'
      ? 'text-accent-blue'
      : 'text-accent-purple'
  const accentBg =
    s.accent === 'emerald'
      ? 'bg-accent-emerald'
      : s.accent === 'blue'
      ? 'bg-accent-blue'
      : 'bg-accent-purple'

  return (
    <div className="group bg-card clean-border rounded-3xl p-6 lg:p-8 elevated-shadow transition-transform duration-500 hover:-translate-y-1">
      <div className="flex items-baseline gap-3 mb-6">
        <span className={`${accentText} font-mono text-sm tracking-[0.2em]`}>
          {s.number}
        </span>
        <span className={`h-px flex-1 ${accentBg} opacity-30`} aria-hidden />
      </div>

      <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3">
        {s.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {s.description}
      </p>
    </div>
  )
}
