// The six main projects. Facts come from the repos and live sites as checked on 2026-11-04.
// Status lines stay honest: change one only when the facts change.
export type Project = {
  slug: string
  name: string
  blurb: string
  lead: [string, string]
  leadAccent?: boolean
  chips: string[]
  colors: { bg: string; fg: string; ac: string; dotfg?: string; chip: string; mbg?: string; nameColor?: string }
  film?: { src: string; poster: string; label: string; shape: 'land' | 'port' }
  still?: { src: string; alt: string; fit?: 'cover' | 'contain' }
  body: string[]
  facts: { label: string; value: string }[]
  links: { label: string; href: string }[]
  shots?: { src: string; alt: string }[]
}

export const PROJECTS: Project[] = [
  {
    slug: 'circlo',
    name: 'Circlo',
    blurb: 'Sports app and coach marketplace',
    lead: ['Live your sport.', 'A Hebrew-first sports app and coach marketplace.'],
    chips: ['Live on iOS and Android', 'Mar 2026 to now', '3,798 commits'],
    colors: { bg: '#FF5A1F', fg: '#FFFFFF', ac: '#101223', chip: 'rgba(255,255,255,.22)', mbg: '#FF5A1F' },
    film: { src: '/media/circlo-film.mp4', poster: '/media/circlo-film.jpg', label: 'Circlo launch film', shape: 'port' },
    body: [
      'Circlo brings a sporting life into one app. People discover games, tournaments, communities and coaches. Coaches run their clients, sessions and schedules from one phone, and get found by new people while they do it.',
      'I lead product, design, engineering and brand, and I direct AI agents across the build. Its support chat runs on Plazas, my other product.',
    ],
    facts: [
      { label: 'Status', value: 'Live on the App Store since August 2026, and on Google Play' },
      { label: 'Role', value: 'Founder. Product, design, engineering, brand' },
      { label: 'Built with', value: 'Expo and React Native, React, Supabase, Cloudflare, PayMe, Terra' },
    ],
    links: [
      { label: 'Open Circlo', href: 'https://circlo.co.il' },
      { label: 'App Store', href: 'https://apps.apple.com/app/id6798215270' },
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=club.circlo.app' },
    ],
    shots: [
      { src: '/media/work/circlo-01-home.jpg', alt: 'Circlo home screen' },
      { src: '/media/work/circlo-02-book.jpg', alt: 'Booking a coach in Circlo' },
      { src: '/media/work/circlo-03-player-card.jpg', alt: 'A player card in Circlo' },
      { src: '/media/work/circlo-04-leaderboard.jpg', alt: 'The Circlo leaderboard' },
      { src: '/media/work/circlo-05-communities.jpg', alt: 'Circlo communities' },
    ],
  },
  {
    slug: 'plazas',
    name: 'Plazas',
    blurb: 'Hire AI employees',
    lead: ['Build your workplace.', 'Hire AI employees.'],
    leadAccent: true,
    chips: ['Live, working prototype', 'Oct 2026 to now', '517 commits'],
    colors: { bg: '#FFFBF3', fg: '#101223', ac: '#FF5A3C', chip: 'rgba(16,18,35,.07)', mbg: '#FFFBF3' },
    film: { src: '/media/plazas-film.mp4', poster: '/media/plazas-film.jpg', label: 'Plazas film', shape: 'land' },
    body: [
      'Plazas is a visual workspace. You build your business as a place, hire AI workers into it, and give them real work in plain words. It should invite you in like a game and report to you like a business tool.',
      'The workers really run. Each task is charged in coins by what it actually cost. Circlo’s support chat already runs on it.',
    ],
    facts: [
      { label: 'Status', value: 'Live at plazas.ai as a working prototype' },
      { label: 'Role', value: 'Founder. Product, design, engineering' },
      { label: 'Built with', value: 'TanStack Start, Cloudflare Workers, Supabase, Three.js, Capacitor' },
    ],
    links: [{ label: 'Open Plazas', href: 'https://plazas.ai' }],
    shots: [
      { src: '/media/work/plazas-5.jpg', alt: 'Plazas film frame' },
      { src: '/media/work/plazas-10.jpg', alt: 'Giving work to a Plazas employee' },
      { src: '/media/work/plazas-15.jpg', alt: 'A plan in Plazas becoming a project' },
      { src: '/media/work/plazas-20.jpg', alt: 'Plazas meeting customers' },
    ],
  },
  {
    slug: 'dogo',
    name: 'Dogo',
    blurb: 'Family app for a shared dog',
    lead: ['Your dog’s home, for the whole family.', 'Health log, walk schedule, live walks.'],
    chips: ['In active build', 'Sep 2026 to now', '61 commits'],
    colors: { bg: '#FFC93C', fg: '#101223', ac: '#F0812F', chip: 'rgba(16,18,35,.1)' },
    still: { src: '/media/dogo.jpg', alt: 'Dogo sign-in screen with its dog mascot on an orange sunburst' },
    body: ['Everyone in a family shares one dog, and nobody remembers who walked it. Dogo keeps the dog’s profile, health log and walk schedule in one Hebrew-first app, and shows walks live.'],
    facts: [
      { label: 'Status', value: 'In active build. The name is a working title.' },
      { label: 'Role', value: 'Founder. Everything' },
      { label: 'Built with', value: 'Expo, React Native, Supabase' },
    ],
    links: [],
  },
  {
    slug: 'samuels',
    name: 'Samuels',
    blurb: 'Jewelry brand',
    lead: ['Jewelry, made with my father.', 'Shooting days, team and social presence.'],
    chips: ['Jewelry brand', 'Since 2024'],
    colors: { bg: '#0E4A3A', fg: '#F7F2E6', ac: '#E8C98A', dotfg: '#0E4A3A', chip: 'rgba(247,242,230,.14)' },
    still: { src: '/media/samuels.jpg', alt: 'A pearl necklace in natural light' },
    body: ['Samuels is the jewelry brand I co-founded with my father in 2024. I directed the shooting days, put the photography team together and built its social presence from nothing.'],
    facts: [
      { label: 'Status', value: 'Jewelry brand, since 2024' },
      { label: 'Role', value: 'Co-founder. Art direction, photography team, social' },
    ],
    links: [{ label: 'Open Instagram', href: 'https://instagram.com/samuels_jewelry_' }],
  },
  {
    slug: 'dira',
    name: 'Dira',
    blurb: 'Rent tracker',
    lead: ['Rent, without the spreadsheet.', 'Apartments, who has paid, reports.'],
    chips: ['Prototype', 'Apr 2026', '14 commits'],
    colors: { bg: '#CFE3BE', fg: '#16261B', ac: '#B4533A', chip: 'rgba(22,38,27,.1)', mbg: '#FBF6EC' },
    still: { src: '/media/dira.jpg', alt: 'Dira’s home screen in Hebrew, with rent summary cards', fit: 'contain' },
    body: ['Dira is a Hebrew rent tracker for people who own an apartment or two. It shows each apartment, who has paid this month and what the year looks like.'],
    facts: [
      { label: 'Status', value: 'Prototype' },
      { label: 'Role', value: 'Founder. Everything' },
      { label: 'Built with', value: 'TanStack Start, Supabase, Cloudflare Workers' },
    ],
    links: [],
  },
  {
    slug: 'lantern',
    name: 'Lantern',
    blurb: 'Surveys with an AI avatar',
    lead: ['Surveys that talk with you.', 'A conversation with an AI avatar, by voice or live video.'],
    chips: ['Live demo', 'Aug 2026 to now', '73 commits'],
    colors: { bg: '#3A30F2', fg: '#FFFFFF', ac: '#FFDE0A', dotfg: '#101223', chip: 'rgba(255,255,255,.18)', nameColor: '#FFDE0A' },
    film: { src: '/media/lantern-film.mp4', poster: '/media/lantern-film.jpg', label: 'Lantern’s AI interviewer speaking', shape: 'land' },
    body: [
      'Anyone can build a survey, choose an AI avatar to run it as a conversation, and share a code. People join with the code, talk to the avatar and approve a summary of what they said. The creator gets charts, quotes and themes.',
      'It began as an interview students took before a university course. That interview now lives on as one of its templates.',
    ],
    facts: [
      { label: 'Status', value: 'Live demo' },
      { label: 'Role', value: 'Product, design, engineering' },
      { label: 'Built with', value: 'React, Cloudflare Workers and D1, Anthropic, Tavus, OpenAI voice' },
    ],
    links: [{ label: 'Open Lantern', href: 'https://meetlantern.pages.dev' }],
    shots: [
      { src: '/media/work/lantern-4.jpg', alt: 'Lantern student guide frame' },
      { src: '/media/work/lantern-14.jpg', alt: 'Talking with Lantern’s avatar' },
      { src: '/media/work/lantern-28.jpg', alt: 'A Lantern survey in progress' },
    ],
  },
  {
    slug: 'off-plan',
    name: 'Off Plan',
    blurb: 'Websites, renders and film for real estate',
    lead: ['Sell the building before it exists.', 'A website, renders and film for upcoming projects.'],
    chips: ['Demo site', 'Nov 2026', 'Working name'],
    colors: { bg: '#14120F', fg: '#F4EFE6', ac: '#D9A566', chip: 'rgba(244,239,230,.14)', mbg: '#14120F' },
    film: { src: '/u/0abb2fd9-f561-4e88-9bbe-24ce6e83d57f.mp4', poster: '/media/offplan-film.jpg', label: 'Off Plan film', shape: 'land' },
    body: [
      'Off Plan builds the whole pre-sale presence of an upcoming project. Buyers pick a floor on the facade, fly through the window and walk through the home, on a fast site in Hebrew and English.',
      'The projects on the demo site are fictional and every render is AI-generated, so a developer can see the whole method before starting on a real building.',
    ],
    facts: [
      { label: 'Status', value: 'Demo site. The name is a working title.' },
      { label: 'Role', value: 'Founder. Everything' },
      { label: 'Built with', value: 'HTML, CSS, JavaScript, AI image and video models' },
    ],
    links: [{ label: 'Open Off Plan', href: 'https://off-plan.guyavnaim5.workers.dev' }],
    shots: [
      { src: '/media/work/offplan-aerial.jpg', alt: 'A fictional project from the air' },
      { src: '/media/work/offplan-living.jpg', alt: 'A fictional living room' },
      { src: '/media/work/offplan-kitchen.jpg', alt: 'A fictional kitchen' },
      { src: '/media/work/offplan-bedroom.jpg', alt: 'A fictional bedroom' },
      { src: '/media/work/offplan-balcony.jpg', alt: 'A fictional balcony' },
    ],
  },
]

export type LabItem = { name: string; what: string; status: string; href?: string }
export type Clip = { f: string; t: string; b: string; fg: string; co: number; n: string; src?: string; poster?: string }

export const LAB: LabItem[] = [
  { name: 'Liftoff', what: 'A social platform for discovering and joining early startups.', status: 'Demo on seeded data' },
  { name: 'Night Shift', what: 'A compute marketplace where people share idle GPU and CPU for allowlisted AI jobs.', status: 'Paused prototype' },
  { name: 'LaunchKit', what: 'Open-source Claude Code skills for building and launching a website.', status: 'On GitHub', href: 'https://github.com/JoshBuildApp/launchkit' },
]

export const CLIPS: Clip[] = [
  { f: '05_villa', t: '#8FA8CC', b: '#E3BCA8', fg: '#101223', co: 0.85, n: 'Villa' },
  { f: '04_aerial_forest', t: '#BFD6DE', b: '#DDE0D2', fg: '#101223', co: 0.9, n: 'Forest' },
  { f: '06_stone_arches', t: '#26100B', b: '#A5541A', fg: '#FFF4E6', co: 0.08, n: 'Stone arches' },
  { f: '07_leaf_and_drop', t: '#9DB88C', b: '#55663F', fg: '#101223', co: 0.3, n: 'Leaf and drop' },
  { f: '08_space', t: '#060A1C', b: '#1C2F55', fg: '#FFFFFF', co: 0, n: 'Orbit' },
  { f: '02_studio_at_rest', t: '#E8D2AE', b: '#B99B78', fg: '#101223', co: 0.55, n: 'Studio' },
  { f: '01_ink_on_paper', t: '#EFE7D6', b: '#D9CFBC', fg: '#101223', co: 0.6, n: 'Ink on paper' },
  { f: '03_tel_aviv_dawn', t: '#9FC4E8', b: '#F2CDB2', fg: '#101223', co: 0.95, n: 'Tel Aviv, dawn' },
]
