import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

// Destination inbox. Centralised so it's easy to swap or move to env var later.
const CONTACT_EMAIL = 'guyavnaim5@gmail.com'

// RFC-2822 lite — accepts common cases without false-rejecting valid addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Contact() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const name = formData.name.trim()
    const email = formData.email.trim()
    const message = formData.message.trim()

    if (!name || !email || !message) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' })
      return
    }
    if (!EMAIL_RE.test(email)) {
      toast({ title: 'That email doesn’t look right', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)

    // Build a mailto: with the form contents pre-populated.
    // The visitor's mail client opens; they confirm send. Mail arrives in
    // CONTACT_EMAIL with the form fields formatted as the body.
    const subject = `Portfolio inquiry — ${name}`
    const body = [
      `Name:    ${name}`,
      `Email:   ${email}`,
      '',
      message,
      '',
      '—',
      'Sent from the contact form on Guy Avnaim’s portfolio',
    ].join('\n')

    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`

    // Open the user's mail client. Use location.href so it works in every
    // browser without popup-blocker quirks.
    window.location.href = href

    // Confirm + reset. We can't actually know if they sent it, but the form
    // has done its job by handing off to their mail client.
    toast({
      title: 'Your mail client is opening',
      description: `Pre-filled to ${CONTACT_EMAIL}. Click Send in your mail app to finish.`,
    })
    setFormData({ name: '', email: '', message: '' })
    setIsSubmitting(false)
  }

  return (
    <section id="contact" className="relative py-32 bg-card/30">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              Let's Create Together
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>
          
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8">
            <span className="block mb-2">Let's build something.</span>
          </h2>

          <p className="text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Tell me about your project — music, AI video, creative direction. I take it from blank page to release.
          </p>
        </div>

        {/* Contact Form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-background clean-border rounded-3xl overflow-hidden elevated-shadow">
            <div className="bg-card/50 px-8 py-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-foreground mb-1">
                    Get In Touch
                  </h3>
                  <p className="text-muted-foreground">
                    Fill out the form and I'll respond within 24 hours
                  </p>
                </div>
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-3 h-3 bg-accent-emerald rounded-full" />
                  <span className="text-sm text-muted-foreground font-medium">Available now</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">Name</label>
                  <input
                    id="name"
                    type="text"
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">Email</label>
                  <input
                    id="email"
                    type="email"
                    maxLength={255}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  maxLength={1000}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-foreground text-background font-black text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Opening mail…' : 'Send Message'}
              </button>

              {/* Direct-email fallback for visitors with no configured mail client */}
              <p className="text-center text-sm text-muted-foreground pt-2">
                Or email me directly at{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-foreground font-medium border-b border-border hover:border-foreground transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </form>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-background clean-border rounded-2xl p-6 subtle-shadow">
              <div className="w-12 h-12 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-accent-blue rounded-full" />
              </div>
              <h4 className="font-black text-foreground mb-2">Project Discussion</h4>
              <p className="text-muted-foreground text-sm">
                Share your vision and requirements directly with me — no account managers in between.
              </p>
            </div>
            
            <div className="bg-background clean-border rounded-2xl p-6 subtle-shadow">
              <div className="w-12 h-12 bg-accent-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-accent-emerald rounded-full" />
              </div>
              <h4 className="font-black text-foreground mb-2">Custom Strategy</h4>
              <p className="text-muted-foreground text-sm">
                Get a tailored approach for your unique project
              </p>
            </div>
            
            <div className="bg-background clean-border rounded-2xl p-6 subtle-shadow">
              <div className="w-12 h-12 bg-accent-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-accent-purple rounded-full" />
              </div>
              <h4 className="font-black text-foreground mb-2">Next Steps</h4>
              <p className="text-muted-foreground text-sm">
                Clear timeline and roadmap to bring your idea to life
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}