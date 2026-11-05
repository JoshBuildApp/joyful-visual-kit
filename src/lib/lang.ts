import { useRouterState } from '@tanstack/react-router'
import { HE } from '@/content/he'
import { useSite } from '@/lib/site-state'

// English at its own address, Hebrew under /he. The router takes the prefix off and puts it back (src/router.tsx).
export const isHebrew = (path: string) => path === '/he' || path.startsWith('/he/')

function usePublicPath() {
  return useRouterState({ select: (s) => s.location.publicHref })
}

export function useLang(): 'en' | 'he' {
  return isHebrew(usePublicPath().split(/[?#]/)[0]) ? 'he' : 'en'
}

// What is on screen and which sentence it came from, so the admin can click a sentence to edit it.
export const shownText = new Map<string, string>()

export function useT() {
  const lang = useLang()
  const { text: edited } = useSite()
  return (text: string) => {
    const out = edited[lang][text] ?? (lang === 'he' ? HE[text] ?? text : text)
    if (typeof window !== 'undefined') shownText.set(out.trim(), text)
    return out
  }
}

// The same page in the other language.
export function useOtherLang() {
  const href = usePublicPath()
  if (isHebrew(href.split(/[?#]/)[0])) return href.replace(/^\/he/, '') || '/'
  return href === '/' ? '/he' : `/he${href}`
}
