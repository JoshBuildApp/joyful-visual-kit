// What the Archive's rooms show. Numbers are read from the source on the date written beside them, so they stay true.
export type SiteWork = { id: string; name: string; url: string; what: string; kind: string; shot: string; w: number; h: number; slug?: string }

export const SITES: SiteWork[] = [
  { id: 'circlo', name: 'Circlo', url: 'https://circlo.co.il', what: 'The site of a Hebrew sports app and coach marketplace.', kind: 'Live product', shot: '/media/archive/circlo.webp', w: 1000, h: 4861, slug: 'circlo' },
  { id: 'offplan', name: 'Off Plan', url: 'https://off-plan.guyavnaim5.workers.dev', what: 'A pre-sale site for buildings that do not exist yet. The projects are fictional and every render is AI-generated.', kind: 'Demo', shot: '/media/archive/offplan.webp', w: 1000, h: 4861, slug: 'off-plan' },
  { id: 'plazas', name: 'Plazas', url: 'https://plazas.ai', what: 'The front door of Plazas, where a business hires AI employees.', kind: 'Live product', shot: '/media/archive/plazas.webp', w: 1000, h: 2389, slug: 'plazas' },
  { id: 'lantern', name: 'Lantern', url: 'https://meetlantern.pages.dev', what: 'Surveys that talk with you, run by an AI avatar.', kind: 'Live demo', shot: '/media/archive/lantern.webp', w: 1000, h: 2292, slug: 'lantern' },
  { id: 'circlo-plaza', name: 'Circlo on Plazas', url: 'https://plazas.ai/p/circlo', what: 'The public page Plazas gives a business, here the one for Circlo.', kind: 'Made by Plazas', shot: '/media/archive/circlo-plaza.webp', w: 1000, h: 1176 },
  // Ready-made websites for fictional businesses (2026-11-06). The same pages are the templates a Plazas owner can start from.
  { id: 'tpl-ochre', name: 'Ochre', url: 'https://guyavnaim.com/templates/ochre/en/', what: 'A café and tea bar. The name is set huge across the page with the cup standing in front of it.', kind: 'Template', shot: '/media/archive/tpl-ochre.webp', w: 1000, h: 2362 },
  { id: 'tpl-rally', name: 'Rally', url: 'https://guyavnaim.com/templates/rally/en/', what: 'A padel and tennis club. A photo in motion, tinted blue, with streaks of yellow light.', kind: 'Template', shot: '/media/archive/tpl-rally.webp', w: 1000, h: 2529 },
  { id: 'tpl-nami', name: 'Nami', url: 'https://guyavnaim.com/templates/nami/en/', what: 'A movement studio. A pale, quiet page with light type and one photo standing like an object.', kind: 'Template', shot: '/media/archive/tpl-nami.webp', w: 1000, h: 2356 },
  { id: 'tpl-linden', name: 'Linden', url: 'https://guyavnaim.com/templates/linden/en/', what: 'A small real-estate office. A magazine split beside a black-and-white photo crossed by one line of light.', kind: 'Template', shot: '/media/archive/tpl-linden.webp', w: 1000, h: 2314 },
]

// From the Plazas database, 5 November 2026. Every owner's plazas added up, with no customer's data.
export const AGENTS_AS_OF = '5 Nov 2026'
export const AGENT_TOTALS = { tasks: 737, plazas: 30, tokens: '32.6M', scheduled: 112 }
export const AGENT_WEEKS: { day: number; month: string; done: number }[] = [
  { day: 5, month: 'Oct', done: 7 },
  { day: 12, month: 'Oct', done: 474 },
  { day: 19, month: 'Oct', done: 46 },
  { day: 26, month: 'Oct', done: 136 },
  { day: 2, month: 'Nov', done: 74 },
]
export type Agent = { id: string; name: string; role: string; color: string; use: string; done: number; plazas: number; secs: number }
export const AGENTS: Agent[] = [
  { id: 'leo', name: 'Leo', role: 'Social', color: '#5BB830', use: 'Keeps your social alive: makes your posts, pictures and Reels in your voice and answers comments.', done: 255, plazas: 20, secs: 42 },
  { id: 'maya', name: 'Maya', role: 'Bookings', color: '#FF5A3C', use: 'Runs the front desk: confirms bookings, reminds clients and fills cancellations.', done: 78, plazas: 8, secs: 9 },
  { id: 'adi', name: 'Adi', role: 'New leads', color: '#F97316', use: 'Answers every new inquiry in minutes and turns it into a first session.', done: 69, plazas: 13, secs: 20 },
  { id: 'gali', name: 'Gali', role: 'Manager', color: '#101223', use: 'Your right hand: a morning brief of what happened and only the things that need you.', done: 66, plazas: 12, secs: 23 },
  { id: 'noa', name: 'Noa', role: 'Follow-ups', color: '#F2A900', use: 'Makes sure nobody is forgotten: follows up after a first visit and brings lapsed clients back.', done: 54, plazas: 8, secs: 7 },
  { id: 'omer', name: 'Omer', role: 'Invoices', color: '#0EA5A4', use: 'Sends invoices after each session or sale and chases the ones that are late.', done: 44, plazas: 11, secs: 10 },
  { id: 'tal', name: 'Tal', role: 'Scheduling', color: '#EC4899', use: 'Keeps everyone’s week full and finds a cover when someone cancels.', done: 37, plazas: 8, secs: 10 },
  { id: 'dana', name: 'Dana', role: 'Reviews', color: '#8B5CF6', use: 'Asks happy clients for a review and answers every new one.', done: 25, plazas: 7, secs: 13 },
  { id: 'yoav', name: 'Yoav', role: 'Research', color: '#A8327E', use: 'Reads the documents you saved and tells you what they say, with where each claim came from.', done: 22, plazas: 3, secs: 51 },
  { id: 'eli', name: 'Eli', role: 'Engineering', color: '#4F46E5', use: 'Reads your code on GitHub, answers questions about it, and proposes issues, comments and pull requests for you to approve.', done: 20, plazas: 6, secs: 83 },
  { id: 'noy', name: 'Noy', role: 'Designer', color: '#D9468F', use: 'Designs how your business looks: the logo, the colours, the fonts, the banners and the brand guide.', done: 20, plazas: 4, secs: 53 },
  { id: 'lia', name: 'Lia', role: 'Writing and editing', color: '#B4611F', use: 'Turns findings into text you can hand in: outlines, tighter drafts, abstracts and a check against your sources.', done: 18, plazas: 3, secs: 41 },
  { id: 'ben', name: 'Ben', role: 'Data analysis', color: '#1F8A5B', use: 'Reads the tables you connect and answers from them with the numbers shown.', done: 8, plazas: 1, secs: 61 },
  { id: 'sam', name: 'Sam', role: 'Stock', color: '#2F5BFF', use: 'Watches the stock room: counts, warns before you run out and compares supplier prices.', done: 8, plazas: 4, secs: 8 },
  { id: 'roni', name: 'Roni', role: 'Events', color: '#14B8A6', use: 'Runs your events: sign-ups, the line-up and the messages around them.', done: 4, plazas: 3, secs: 7 },
]
export const OTHER_AGENTS = [
  { name: 'Site chat', what: 'Answers visitors on this site and can book a call. It runs on Plazas.', tag: 'Live here' },
  { name: 'Lantern interviewer', what: 'Runs a survey as a conversation with an AI avatar, by voice or live video.', tag: 'Live demo', href: 'https://meetlantern.pages.dev' },
  { name: 'LaunchKit', what: 'Open-source Claude Code skills for building and launching a website.', tag: '8 skills', href: 'https://github.com/JoshBuildApp/launchkit' },
]

// The months run March to November 2026, numbered 0 to 8. Commit counts are from the repos, 4 to 5 November 2026.
export const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
export const SYSTEMS_TOTAL = '4,800+'
export type System = { id: string; name: string; what: string; status: string; from: number; to: number; count: string; color: string; stack?: string; slug?: string; href?: string }
export const SYSTEMS: System[] = [
  { id: 'circlo', name: 'Circlo', what: 'Sports app and coach marketplace', status: 'Live on iOS and Android', from: 0, to: 8, count: '3,798', color: '#FF5A1F', stack: 'Expo and React Native, React, Supabase, Cloudflare, PayMe, Terra', slug: 'circlo' },
  { id: 'dira', name: 'Dira', what: 'Rent tracker', status: 'Prototype', from: 1, to: 1, count: '14', color: '#7FB069', stack: 'TanStack Start, Supabase, Cloudflare Workers', slug: 'dira' },
  { id: 'nightshift', name: 'Night Shift', what: 'A compute marketplace where people share idle GPU and CPU for allowlisted AI jobs.', status: 'Paused prototype', from: 2, to: 2, count: '158', color: '#0E4A3A' },
  { id: 'launchkit', name: 'LaunchKit', what: 'Open-source Claude Code skills for building and launching a website.', status: 'On GitHub', from: 3, to: 3, count: '3', color: '#FF5A3C', href: 'https://github.com/JoshBuildApp/launchkit' },
  { id: 'liftoff', name: 'Liftoff', what: 'A social platform for discovering and joining early startups.', status: 'Demo on seeded data', from: 3, to: 3, count: '200', color: '#2F5BFF' },
  { id: 'lantern', name: 'Lantern', what: 'Surveys with an AI avatar', status: 'Live demo', from: 5, to: 8, count: '73', color: '#3A30F2', stack: 'React, Cloudflare Workers and D1, Anthropic, Tavus, OpenAI voice', slug: 'lantern' },
  { id: 'dogo', name: 'Dogo', what: 'Family app for a shared dog', status: 'In active build', from: 6, to: 8, count: '61', color: '#F2A900', stack: 'Expo, React Native, Supabase', slug: 'dogo' },
  { id: 'plazas', name: 'Plazas', what: 'Hire AI employees', status: 'Live, working prototype', from: 7, to: 8, count: '517', color: '#101223', stack: 'TanStack Start, Cloudflare Workers, Supabase, Three.js, Capacitor', slug: 'plazas' },
  { id: 'off-plan', name: 'Off Plan', what: 'Websites, renders and film for real estate', status: 'Demo site', from: 8, to: 8, count: '', color: '#B98A4E', stack: 'HTML, CSS, JavaScript, AI image and video models', slug: 'off-plan' },
]

// The shelves of the Images room. A new upload goes straight on a shelf by its slug.
export const COLLECTIONS: { slug: string; label: string; subjects: string[] }[] = [
  { slug: 'campaigns', label: 'Campaigns', subjects: ['circlo-campaign', 'circlo-wellness', 'circlo-pop-sport', 'coach-of-the-gods', 'nothing-to-lose', 'padel-israel', 'pro-kit', 'delivered', 'court-studies'] },
  { slug: 'landscapes', label: 'Landscapes', subjects: ['wild'] },
  { slug: 'real-estate', label: 'Real estate', subjects: [] },
  { slug: 'posters', label: 'Posters', subjects: ['tokyo', 'metropolis', 'valdez-gallery', 'style-studies'] },
  { slug: 'studio', label: 'Studio', subjects: ['atelier', 'still-life'] },
  { slug: 'concept', label: 'Concept brands', subjects: ['adidas-originals', 'lunar', 'forgeline', 'talentbridge', 'volea', 'nordhavn', 'solstice', 'aura', 'ember-oak', 'volt-runner', 'noir-vertige'] },
]
export const collectionOf = (subject: string | null) => COLLECTIONS.find((c) => c.slug === subject || c.subjects.includes(subject ?? ''))?.slug ?? null
