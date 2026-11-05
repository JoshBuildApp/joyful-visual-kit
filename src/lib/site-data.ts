import { createServerFn } from '@tanstack/react-start'
import { readSiteData, saveMedia, signIn, signOut, writeContent, writeHidden, writeTexts } from './admin.server'
import type { Content } from './admin.server'

const line = (value: unknown, most: number) => String(value ?? '').slice(0, most)

export const getSiteData = createServerFn({ method: 'GET' }).handler(() => readSiteData())

export const adminSignIn = createServerFn({ method: 'POST' })
  .inputValidator((data: { password: string }) => ({ password: line(data?.password, 200) }))
  .handler(({ data }) => signIn(data.password))

export const adminSignOut = createServerFn({ method: 'POST' }).handler(() => signOut())

export const saveHidden = createServerFn({ method: 'POST' })
  .inputValidator((data: { hidden: string[] }) => ({ hidden: (Array.isArray(data?.hidden) ? data.hidden : []).slice(0, 2000).map((key) => line(key, 300)) }))
  .handler(({ data }) => writeHidden(data.hidden))

export const saveTexts = createServerFn({ method: 'POST' })
  .inputValidator((data: { lang: 'en' | 'he'; entries: [string, string | null][] }) => ({
    lang: data?.lang === 'he' ? ('he' as const) : ('en' as const),
    entries: (Array.isArray(data?.entries) ? data.entries : []).slice(0, 200).map(([key, value]): [string, string | null] => [line(key, 4000), value === null ? null : line(value, 4000)]),
  }))
  .handler(({ data }) => writeTexts(data.lang, data.entries))

export const saveContent = createServerFn({ method: 'POST' })
  .inputValidator((data: Content) => data)
  .handler(({ data }) => writeContent(data))

export const uploadMedia = createServerFn({ method: 'POST' })
  .inputValidator((data: FormData) => data)
  .handler(({ data }) => saveMedia(data))
