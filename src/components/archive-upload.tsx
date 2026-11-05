import { useRef, useState } from 'react'
import { COLLECTIONS } from '@/content/archive'
import type { SiteWork } from '@/content/archive'
import type { Piece } from '@/lib/admin.server'
import { useT } from '@/lib/lang'
import { uploadMedia } from '@/lib/site-data'
import { useSite } from '@/lib/site-state'

const MOST = 95 * 1024 * 1024
const PREVIEW = 1000

const toJpeg = (canvas: HTMLCanvasElement) => new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/jpeg', 0.82))

function draw(source: CanvasImageSource, w: number, h: number, most: number) {
  const scale = Math.min(1, most / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height)
  return toJpeg(canvas)
}

// A film's first real frame, since a film has no picture of its own to show in the grid.
function frame(file: File) {
  return new Promise<{ blob: Blob | null; w: number; h: number }>((done, fail) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.src = url
    video.onerror = () => {
      URL.revokeObjectURL(url)
      fail(new Error('video'))
    }
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.5, video.duration / 2)
    }
    video.onseeked = async () => {
      const blob = await draw(video, video.videoWidth, video.videoHeight, PREVIEW)
      URL.revokeObjectURL(url)
      done({ blob, w: video.videoWidth, h: video.videoHeight })
    }
  })
}

async function send(blob: Blob, name: string) {
  const form = new FormData()
  form.append('file', blob, name)
  const answer = await uploadMedia({ data: form })
  if (!answer.ok || !answer.url) throw new Error(answer.why ?? 'upload')
  return answer.url
}

const title = (file: File) => file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || file.name

async function toPiece(file: File, subject: string): Promise<Piece> {
  const sourceKey = `up/${crypto.randomUUID()}`
  const displayUrl = await send(file, file.name)
  if (file.type.startsWith('video/')) {
    const { blob, w, h } = await frame(file)
    const posterUrl = blob ? await send(blob, 'poster.jpg') : undefined
    return { sourceKey, kind: 'video', subject, name: title(file), displayUrl, posterUrl, w, h }
  }
  const bitmap = await createImageBitmap(file)
  const blob = await draw(bitmap, bitmap.width, bitmap.height, PREVIEW)
  const previewUrl = blob ? await send(blob, 'preview.jpg') : displayUrl
  const piece = { sourceKey, kind: 'image', subject, name: title(file), displayUrl, previewUrl, w: bitmap.width, h: bitmap.height }
  bitmap.close()
  return piece
}

// Drop pictures and films on a shelf. They go up one by one and land at the top of the room.
export function UploadPieces({ shelf }: { shelf: string | null }) {
  const t = useT()
  const { content, updateContent, setAdmin } = useSite()
  const [subject, setSubject] = useState(shelf ?? COLLECTIONS[0].slug)
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState('')
  const [problem, setProblem] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const take = async (list: FileList | null) => {
    const files = [...(list ?? [])]
    if (!files.length || busy) return
    setProblem('')
    const fits = files.filter((f) => f.size <= MOST && /^(image|video)\//.test(f.type))
    const made: Piece[] = []
    let failed = files.length - fits.length
    for (const [k, file] of fits.entries()) {
      setBusy(`${k + 1} / ${fits.length}`)
      const piece = await toPiece(file, subject).catch(() => null)
      if (piece) made.push(piece)
      else failed++
    }
    if (made.length) {
      const saved = await updateContent({ pieces: [...made, ...(content.pieces ?? [])], pins: [...made.map((p) => p.sourceKey), ...(content.pins ?? [])] })
      if (!saved) {
        setBusy('')
        return setAdmin(false)
      }
    }
    setBusy('')
    if (failed) setProblem(`${t('Not uploaded:')} ${failed}. ${t('A file can be a picture or a film of up to 95 MB.')}`)
    if (input.current) input.current.value = ''
  }
  return (
    <div
      className={`adminUi drop${over ? ' over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        void take(e.dataTransfer.files)
      }}
    >
      <b>{busy ? `${t('Uploading')} ${busy}` : t('Drop pictures or films here')}</b>
      <label>
        {t('Shelf')}
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          {COLLECTIONS.map((c) => <option key={c.slug} value={c.slug}>{t(c.label)}</option>)}
        </select>
      </label>
      <button type="button" className="main" disabled={!!busy} onClick={() => input.current?.click()}>{t('Choose files')}</button>
      <input ref={input} type="file" hidden multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime" onChange={(e) => void take(e.target.files)} />
      {problem && <p role="alert">{problem}</p>}
    </div>
  )
}

// A site goes on the wall with its name, its address and one long picture of the page.
export function AddSite({ sites }: { sites: SiteWork[] }) {
  const t = useT()
  const { updateContent, setAdmin } = useSite()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [what, setWhat] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const add = async () => {
    if (!file) return
    setBusy(true)
    setProblem('')
    const site = await (async () => {
      const bitmap = await createImageBitmap(file)
      const size = { w: bitmap.width, h: bitmap.height }
      bitmap.close()
      return { id: crypto.randomUUID(), name: name.trim(), url: /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`, what: what.trim(), kind: 'Live', shot: await send(file, file.name), ...size }
    })().catch(() => null)
    if (!site) {
      setBusy(false)
      return setProblem(t('That was not saved. Sign in again.'))
    }
    const saved = await updateContent({ sites: [site, ...sites] })
    setBusy(false)
    if (!saved) return setAdmin(false)
    setName('')
    setUrl('')
    setWhat('')
    setFile(null)
  }
  return (
    <form
      className="adminUi addSite"
      onSubmit={(e) => {
        e.preventDefault()
        void add()
      }}
    >
      <b>{t('Add a site')}</b>
      <input aria-label={t('Name')} placeholder={t('Name')} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
      <input aria-label={t('Address')} placeholder={t('Address')} dir="ltr" value={url} maxLength={300} onChange={(e) => setUrl(e.target.value)} />
      <input aria-label={t('One line on what it is')} placeholder={t('One line on what it is')} value={what} maxLength={200} onChange={(e) => setWhat(e.target.value)} />
      <label>
        {t('Long picture of the page')}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      <button type="submit" className="main" disabled={busy || !file || !name.trim() || !url.trim()}>{t(busy ? 'Uploading' : 'Add')}</button>
      {problem && <p role="alert">{problem}</p>}
    </form>
  )
}
