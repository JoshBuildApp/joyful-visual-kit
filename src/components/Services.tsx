'use client'

type Capability = {
  id: string
  number: string
  title: string
  description: string
  tag: string
  /** Accent maps to the existing template tokens (accent-emerald/blue/purple). */
  accent: 'emerald' | 'blue' | 'purple'
}

const capabilities: Capability[] = [
  {
    id: 'ai-workflows',
    number: '01',
    title: 'AI Workflow Optimization',
    description:
      'I map how a company actually works and rebuild it with AI — agents, automations, and approval loops that cut hours of manual ops. My day job at Agilina, and the product I’m building at Stable.',
    tag: 'Map · Automate · Approve',
    accent: 'purple',
  },
  {
    id: 'ai-agents',
    number: '02',
    title: 'AI Agents & Automation',
    description:
      'Autonomous agents wired to real tools and real data — sourcing, screening, follow-ups, reporting. Designed so a human approves every move, and the system never stalls.',
    tag: 'Agents · Tools · Guardrails',
    accent: 'blue',
  },
  {
    id: 'ai-video',
    number: '03',
    title: 'AI Video Direction',
    description:
      'End-to-end AI video — concept, script, model selection, generation, edit. Built the full Coach of the Gods Reels season this way.',
    tag: 'Concept · Generate · Edit',
    accent: 'purple',
  },
  {
    id: 'ai-pipeline',
    number: '04',
    title: 'AI Toolkit & Pipeline',
    description:
      'Multi-model prompt engineering and pipeline design. I treat Runway, Veo, Suno, ElevenLabs and Claude as a serious production team.',
    tag: 'Multi-model · Prompts · Pipelines',
    accent: 'emerald',
  },
  {
    id: 'music',
    number: '05',
    title: 'Music Production',
    description:
      'Original soundtracks and composition at a professional level — written, produced, and arranged in-studio, then mixed and mastered ready for streaming, release, or broadcast.',
    tag: 'Compose · Mix · Master',
    accent: 'emerald',
  },
  {
    id: 'creative-direction',
    number: '06',
    title: 'Creative Direction',
    description:
      'Concept, treatment, casting, look-and-feel — plus the sound design layer. The decisions that turn a vague idea into a coherent, on-brand release.',
    tag: 'Concept · Treatment · Sound',
    accent: 'blue',
  },
]

export function Services() {
  return (
    <section id="services" className="relative py-32 bg-background">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header — matches Portfolio */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              Capabilities
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8">
            <span className="block mb-2">What I build &amp; produce</span>
          </h2>

          <p className="text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            From AI systems that run company workflows to studio-grade sound — six disciplines, one operator.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {capabilities.map((c) => (
            <CapabilityCard key={c.id} capability={c} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CapabilityCard({ capability: c }: { capability: Capability }) {
  // Same accent token mapping the Portfolio card uses
  const chipClass =
    c.accent === 'emerald'
      ? 'bg-accent-emerald/10 text-accent-emerald'
      : c.accent === 'blue'
      ? 'bg-accent-blue/10 text-accent-blue'
      : 'bg-accent-purple/10 text-accent-purple'

  const gradient =
    c.accent === 'emerald'
      ? 'from-accent-emerald/25 via-accent-emerald/8 to-transparent'
      : c.accent === 'blue'
      ? 'from-accent-blue/25 via-accent-blue/8 to-transparent'
      : 'from-accent-purple/25 via-accent-purple/8 to-transparent'

  const numberColor =
    c.accent === 'emerald'
      ? 'text-accent-emerald/40'
      : c.accent === 'blue'
      ? 'text-accent-blue/40'
      : 'text-accent-purple/40'

  return (
    <div className="group bg-card clean-border rounded-3xl overflow-hidden elevated-shadow transition-transform duration-500 hover:-translate-y-1">
      {/* Visual top area — gradient + giant capability number */}
      <div className={`relative aspect-[5/3] bg-gradient-to-br ${gradient} overflow-hidden`}>
        <span
          className={`absolute left-6 top-4 font-black text-[9rem] leading-none ${numberColor} select-none`}
          aria-hidden
        >
          {c.number}
        </span>
        {/* Subtle grain overlay for depth */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
            backgroundSize: '3px 3px',
          }}
        />
      </div>

      {/* Body */}
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-3">
          <span className={`${chipClass} px-3 py-1 rounded-full text-xs font-medium`}>
            {c.tag}
          </span>
        </div>

        <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
          {c.title}
        </h3>

        <p className="text-base text-muted-foreground leading-relaxed">
          {c.description}
        </p>
      </div>
    </div>
  )
}
