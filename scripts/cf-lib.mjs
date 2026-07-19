/**
 * cf-lib — shared Cloudflare Stream/Images helpers used by both the
 * sync-cloudflare CLI script and the dev-server gallery admin endpoints
 * (scripts/gallery-admin-plugin.mjs).
 *
 * All upload/delete calls take a raw Buffer + credentials, so callers decide
 * where bytes come from (disk for the CLI, request body for the dev server).
 */

export const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov'])
export const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])
export const AUDIO_EXTS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'])
export const STREAM_MAX_BYTES = 200 * 1024 * 1024

function ext(filename) {
  const m = /\.[^.]+$/.exec(filename.toLowerCase())
  return m ? m[0] : ''
}

export function classify(filename) {
  const e = ext(filename)
  if (VIDEO_EXTS.has(e)) return 'video'
  if (IMAGE_EXTS.has(e)) return 'image'
  if (AUDIO_EXTS.has(e)) return 'audio'
  return null
}

export function prettyName(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+[_-]+/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
}

export async function uploadBufferToStream({ accountId, token, buf, filename }) {
  const form = new FormData()
  form.append('file', new Blob([buf]), filename)
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form },
  )
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(`Stream upload failed: ${JSON.stringify(json.errors || json)}`)
  }
  return json.result
}

export async function uploadBufferToImages({ accountId, token, buf, filename }) {
  const form = new FormData()
  form.append('file', new Blob([buf]), filename)
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form },
  )
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(`Images upload failed: ${JSON.stringify(json.errors || json)}`)
  }
  return json.result
}

export async function deleteFromStream({ accountId, token, uid }) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${uid}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  )
  // Stream returns 200 with empty body on success; 404 means already gone.
  if (!res.ok && res.status !== 404) {
    const text = await res.text()
    throw new Error(`Stream delete failed (${res.status}): ${text.slice(0, 200)}`)
  }
}

export async function deleteFromImages({ accountId, token, id }) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${id}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok && res.status !== 404) {
    const text = await res.text()
    throw new Error(`Images delete failed (${res.status}): ${text.slice(0, 200)}`)
  }
}

export function buildStreamEntry(item, cfResult, kind) {
  // Stream's response gives us a customer-coded host like
  //   customer-{code}.cloudflarestream.com — use it for iframe + thumbnails
  //   so we don't depend on a separate account-hash env var.
  const hls = cfResult.playback?.hls || ''
  const hostMatch = hls.match(/https:\/\/([^/]+)/)
  const host = hostMatch ? hostMatch[1] : 'videodelivery.net'
  const uid = cfResult.uid
  if (!uid) throw new Error(`Stream response missing uid for ${item.sourceKey}`)
  const base = {
    sourceKey: item.sourceKey,
    kind,
    subject: item.subject,
    name: prettyName(item.filename),
    cfId: uid,
    displayUrl: `https://${host}/${uid}/iframe`,
  }
  if (kind === 'video') {
    base.previewUrl = `https://${host}/${uid}/thumbnails/thumbnail.gif?time=0s&duration=4s`
    base.posterUrl = `https://${host}/${uid}/thumbnails/thumbnail.jpg`
  }
  // Audio: no previewUrl/posterUrl — the gallery card renders a music-icon
  // placeholder instead of a thumbnail.
  return base
}

export function buildImageEntry(item, cfResult) {
  const variants = cfResult.variants || []
  const url = variants[0]
  if (!url) throw new Error(`No variant URL returned for ${item.sourceKey}`)
  return {
    sourceKey: item.sourceKey,
    kind: 'image',
    subject: item.subject,
    name: prettyName(item.filename),
    cfId: cfResult.id,
    displayUrl: url,
    previewUrl: url,
  }
}
