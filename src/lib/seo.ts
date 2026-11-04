const SITE = 'https://guyavnaim.com'

export function seo(path: string, title: string, description: string) {
  const url = SITE + path
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: url },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: `${SITE}/og.jpg` },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}

export const PERSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Guy Avnaim',
  alternateName: 'גיא אבנעים',
  url: SITE,
  jobTitle: 'Founder',
  description: 'Founder who designs and builds products with AI as his crew: Circlo, Plazas, Dogo, Dira, Lantern and Samuels.',
  address: { '@type': 'PostalAddress', addressLocality: 'Tel Aviv', addressCountry: 'IL' },
  sameAs: ['https://instagram.com/guy.avnaim'],
}
