import { env } from 'cloudflare:workers'
import { deleteCookie, getCookie, getRequestHeader, setCookie } from '@tanstack/react-start/server'

import type { SiteWork } from '@/content/archive'
import type { Clip, LabItem, Project } from '@/content/projects'

export type Piece = { sourceKey: string; kind: string; subject: string | null; name: string; displayUrl: string; previewUrl?: string; posterUrl?: string; w?: number; h?: number }
export type Content = {
  projects?: Project[]
  lab?: LabItem[]
  clips?: Clip[]
  contact?: { mail: string; instagram: string }
  pieces?: Piece[]
  sites?: SiteWork[]
  edits?: Record<string, { name?: string; subject?: string }>
  labels?: Record<string, string>
  pins?: string[]
}
export type SiteData = { hidden: string[]; text: { en: Record<string, string>; he: Record<string, string> }; content: Content }

const DOC = 'site'
const COOKIE = 'site_admin'
const HOURS = 8
// A guessable password is only as good as how few guesses it gets.
const TRIES = 5
const TRIES_FOR = 15 * 60
const CONTENT_MOST = 1_500_000
const MEDIA_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' }
const LINK_KEYS = new Set(['href', 'src', 'poster', 'displayUrl', 'previewUrl', 'posterUrl', 'instagram', 'url', 'shot'])

// Whatever is saved, an address is a web address or one of the site's own, and a sentence has a sane length.
function clean(value: unknown, key = ''): unknown {
  if (typeof value === 'string') {
    if (LINK_KEYS.has(key) && value && !/^(https?:\/\/|mailto:|\/(?!\/))/i.test(value)) return ''
    return value.slice(0, 4000)
  }
  if (Array.isArray(value)) return value.slice(0, 2000).map((item) => clean(item, key))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([k]) => k !== '__proto__').map(([k, v]) => [k.slice(0, 300), clean(v, k)]))
  return typeof value === 'number' || typeof value === 'boolean' ? value : null
}

const hex = (data: ArrayBuffer) => [...new Uint8Array(data)].map((b) => b.toString(16).padStart(2, '0')).join('')
const digest = async (text: string) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))

async function signature(text: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text)))
}

function same(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function hasSession() {
  const cookie = getCookie(COOKIE)
  if (!cookie || !env.SESSION_SECRET) return false
  const [until, signed] = cookie.split('.')
  return Number(until) > Date.now() && same(signed ?? '', await signature(until))
}

async function readDoc(): Promise<SiteData> {
  const doc = (await env.SITE.get(DOC, 'json')) as Partial<SiteData> | null
  return { hidden: doc?.hidden ?? [], text: { en: doc?.text?.en ?? {}, he: doc?.text?.he ?? {} }, content: doc?.content ?? {} }
}

export async function readSiteData() {
  return { ...(await readDoc()), admin: await hasSession() }
}

export async function signIn(password: string): Promise<{ ok: boolean; why?: 'wrong' | 'wait' | 'off' }> {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return { ok: false, why: 'off' }
  const who = `tries:${await digest(getRequestHeader('cf-connecting-ip') ?? 'local')}`
  const tries = Number(await env.SITE.get(who, 'json')) || 0
  if (tries >= TRIES) return { ok: false, why: 'wait' }
  if (!same(await digest(password), await digest(env.ADMIN_PASSWORD))) {
    await env.SITE.put(who, String(tries + 1), { expirationTtl: TRIES_FOR })
    return { ok: false, why: 'wrong' }
  }
  await env.SITE.delete(who)
  const until = String(Date.now() + HOURS * 3600 * 1000)
  setCookie(COOKIE, `${until}.${await signature(until)}`, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: HOURS * 3600 })
  return { ok: true }
}

export function signOut() {
  deleteCookie(COOKIE, { path: '/' })
}

export async function writeHidden(hidden: string[]) {
  if (!(await hasSession())) return { ok: false }
  const doc = await readDoc()
  await env.SITE.put(DOC, JSON.stringify({ ...doc, hidden }))
  return { ok: true }
}

// Null puts the original sentence back.
export async function writeTexts(lang: 'en' | 'he', entries: [string, string | null][]) {
  if (!(await hasSession())) return { ok: false }
  const doc = await readDoc()
  const words = { ...doc.text[lang] }
  for (const [key, value] of entries) {
    if (value === null) delete words[key]
    else words[key] = value
  }
  await env.SITE.put(DOC, JSON.stringify({ ...doc, text: { ...doc.text, [lang]: words } }))
  return { ok: true }
}

export async function writeContent(patch: Content) {
  if (!(await hasSession())) return { ok: false }
  const doc = await readDoc()
  const content = { ...doc.content, ...(clean(patch) as Content) }
  if (JSON.stringify(content).length > CONTENT_MOST) return { ok: false }
  await env.SITE.put(DOC, JSON.stringify({ ...doc, content }))
  return { ok: true, content }
}

export async function saveMedia(form: FormData): Promise<{ ok: boolean; url?: string; why?: string }> {
  if (!(await hasSession())) return { ok: false, why: 'signed-out' }
  const file = form.get('file')
  if (!(file instanceof File)) return { ok: false, why: 'no-file' }
  const ext = MEDIA_TYPES[file.type]
  if (!ext) return { ok: false, why: 'type' }
  const key = `${crypto.randomUUID()}.${ext}`
  await env.MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } })
  return { ok: true, url: `/u/${key}` }
}

// Films need ranges, or Safari will not play them.
export async function serveMedia(request: Request, key: string) {
  const head = await env.MEDIA.head(key)
  if (!head) return new Response('Not found', { status: 404 })
  const headers: Record<string, string> = {
    'Content-Type': head.httpMetadata?.contentType ?? 'application/octet-stream',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes',
  }
  const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.get('range') ?? '')
  if (range) {
    const start = Number(range[1])
    const end = Math.min(range[2] ? Number(range[2]) : head.size - 1, head.size - 1)
    if (start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${head.size}` } })
    const part = await env.MEDIA.get(key, { range: { offset: start, length: end - start + 1 } })
    return new Response(part?.body, { status: 206, headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${head.size}`, 'Content-Length': String(end - start + 1) } })
  }
  const whole = await env.MEDIA.get(key)
  return new Response(whole?.body, { headers: { ...headers, 'Content-Length': String(head.size) } })
}
