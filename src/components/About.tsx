'use client'

type ProcessStep = {
  number: string
  title: string
  description: string
  accent: 'emerald' | 'blue' | 'purple'
}

const steps: ProcessStep[] = [
  {
    number: '01',
    title: 'Concept & Script',
    description: 'Scene-by-scene draft with dialogue, timing, and references — written before a single asset is generated.',
    accent: 'blue',
  },
  {
    number: '02',
    title: 'Look & Storyboard',
    description: 'Engine selection, palette, and shot tests. Decide the visual grammar before scaling production.',
    accent: 'emerald',
  },
  {
    number: '03',
    title: 'AI Production',
    description: 'Multi-variant generation, motion tests, and the iteration loop that turns a treatment into footage.',
    accent: 'purple',
  },
  {
    number: '04',
    title: 'Post-production',
    description: 'Edit, color, sound design, and mix. The pass that makes generated material feel directed.',
    accent: 'blue',
  },
  {
    number: '05',
    title: 'Master & Deliver',
    description: 'Format export, captioning, and secure hand-off. Ready for release across every channel.',
    accent: 'purple',
  },
]

export function About() {
  return (
    <section id="about" className="relative py-32 bg-background">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header — matches Portfolio + Services */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              Process
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8">
            <span className="block mb-2">How a release gets made</span>
          </h2>

          <p className="text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            A five-step pipeline from script to master — repeatable, fast, end-to-end.
          </p>
        </div>

        {/* Process cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {steps.map((s) => (
            <ProcessCard key={s.number} step={s} />
          ))}
        </div>
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
