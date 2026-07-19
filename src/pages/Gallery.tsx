import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Music, Pencil, Plus, Upload, X } from 'lucide-react'
import manifest from '@/data/gallery.json'
import projectsData from '@/data/projects.json'

/**
 * Gallery page — reads src/data/gallery.json (media) and
 * src/data/projects.json (the named projects shown as filter pills).
 *
 * Two ways to manage content:
 *
 *  A. In the browser (recommended): run `npm run dev`, open /gallery?curate.
 *     You can upload photos/videos straight to Cloudflare ("Add media"),
 *     rename items, move them between projects, drag-reorder, remove them
 *     (optionally deleting from Cloudflare too), and add / rename / delete /
 *     reorder the projects themselves. Hitting Save rewrites both JSON
 *     files — commit + push to publish.
 *
 *  B. From the desktop: drop files into ~/Desktop/gallery/<project>/ and run
 *     `npm run sync-cloudflare`.
 *
 * Curate mode only exists on the dev server — none of it ships to production.
 */
type AssetKind = 'video' | 'image' | 'audio'

type ManifestEntry = {
  sourceKey: string
  kind: AssetKind
  subject: string | null
  name: string
  cfId: string
  displayUrl: string
  previewUrl?: string
  posterUrl?: string
}

type Project = { slug: string; label: string }

const assets = manifest as ManifestEntry[]
const initialProjects = projectsData as Project[]

const UPLOAD_ACCEPT =
  '.mp4,.webm,.mov,.jpg,.jpeg,.png,.webp,.gif,.avif,.mp3,.wav,.m4a,.aac,.ogg,.flac'

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// TEMPORARY: curate mode is ON for everyone while the gallery is being set
// up. When done, set CURATE_FOR_ALL back to false to restore the dev-only
// /gallery?curate gate. Note: saving/uploading only actually works against
// the dev server — the deployed site has no /__gallery endpoints.
const CURATE_FOR_ALL = true

const CURATE =
  typeof window !== 'undefined' &&
  (CURATE_FOR_ALL ||
    (import.meta.env.DEV && new URLSearchParams(window.location.search).has('curate')))

type UploadStatus = {
  id: string
  name: string
  state: 'uploading' | 'done' | 'error'
  error?: string
}

export default function Gallery() {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<string>('all')

  // Curate-mode working copies — saved to disk only on "Save changes".
  const [items, setItems] = useState<ManifestEntry[]>(assets)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [removed, setRemoved] = useState<ManifestEntry[]>([])
  const [deleteRemote, setDeleteRemote] = useState(false)
  const [uploads, setUploads] = useState<UploadStatus[]>([])
  const [uploadTarget, setUploadTarget] = useState<string>('')
  const [editingPill, setEditingPill] = useState<string | null>(null) // slug or '__new__'
  const [pillDraft, setPillDraft] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const dragFrom = useRef<number | null>(null)
  const pillDragFrom = useRef<number | null>(null)

  const projectLabels = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.slug, p.label])),
    [projects],
  )
  const labelFor = (slug: string): string =>
    projectLabels[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1)

  // Any subject slug present in the manifest but not in projects.json still
  // gets a pill (slug shown as-is) so nothing silently disappears.
  const subjects = useMemo(() => {
    const known = projects.map((p) => p.slug)
    const extras = Array.from(
      new Set(
        items
          .map((a) => a.subject)
          .filter((s): s is string => s !== null && !known.includes(s)),
      ),
    ).sort()
    return [...known, ...extras]
  }, [projects, items])

  const filtered = filter === 'all' ? items : items.filter((a) => a.subject === filter)

  const markDirty = () => {
    setDirty(true)
    setSaveState('idle')
  }

  // ---- item operations -----------------------------------------------------

  const removeItem = (cfId: string) => {
    const entry = items.find((x) => x.cfId === cfId)
    if (!entry) return
    setActiveIndex(null) // indexes into filtered[] — stale after removal
    setItems((prev) => prev.filter((x) => x.cfId !== cfId))
    setRemoved((prev) => (prev.some((r) => r.cfId === cfId) ? prev : [...prev, entry]))
    markDirty()
  }

  const renameItem = (cfId: string, name: string) => {
    setItems((prev) => prev.map((x) => (x.cfId === cfId ? { ...x, name } : x)))
    markDirty()
  }

  const reassignItem = (cfId: string, subject: string | null) => {
    setItems((prev) => prev.map((x) => (x.cfId === cfId ? { ...x, subject } : x)))
    markDirty()
  }

  // Move within the current (possibly filtered) view; items outside the
  // filter keep their absolute positions in the manifest.
  const moveInFiltered = (from: number, to: number) => {
    if (from === to) return
    setItems((prev) => {
      const inView = (a: ManifestEntry) => filter === 'all' || a.subject === filter
      const view = prev.filter(inView)
      const next = [...view]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      let k = 0
      return prev.map((it) => (inView(it) ? next[k++] : it))
    })
    markDirty()
  }

  // ---- project operations ----------------------------------------------------

  const startPillEdit = (slug: string) => {
    setEditingPill(slug)
    setPillDraft(slug === '__new__' ? '' : labelFor(slug))
  }

  const commitPillEdit = () => {
    if (editingPill === null) return
    const label = pillDraft.trim()
    if (label) {
      if (editingPill === '__new__') {
        const slug = slugify(label)
        if (slug && slug !== 'all' && !subjects.includes(slug)) {
          setProjects((prev) => [...prev, { slug, label }])
          setFilter(slug)
          setUploadTarget(slug)
          markDirty()
        }
      } else {
        const slug = editingPill
        setProjects((prev) =>
          prev.some((p) => p.slug === slug)
            ? prev.map((p) => (p.slug === slug ? { ...p, label } : p))
            : [...prev, { slug, label }], // renaming a discovered extra promotes it
        )
        markDirty()
      }
    }
    setEditingPill(null)
    setPillDraft('')
  }

  const deleteProject = (slug: string) => {
    const count = items.filter((a) => a.subject === slug).length
    const label = labelFor(slug)
    const msg =
      count > 0
        ? `Delete project “${label}”? Its ${count} item${count === 1 ? '' : 's'} stay in the gallery without a project (visible under All).`
        : `Delete project “${label}”?`
    if (!window.confirm(msg)) return
    if (count > 0) {
      setItems((prev) => prev.map((it) => (it.subject === slug ? { ...it, subject: null } : it)))
    }
    setProjects((prev) => prev.filter((p) => p.slug !== slug))
    if (filter === slug) setFilter('all')
    if (uploadTarget === slug) setUploadTarget('')
    markDirty()
  }

  const movePill = (from: number, to: number) => {
    if (from === to) return
    setProjects((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
    markDirty()
  }

  // ---- upload ----------------------------------------------------------------

  const uniquifyFilename = (subject: string | null, filename: string, taken: Set<string>) => {
    const keyOf = (fn: string) => (subject ? `${subject}/${fn}` : fn)
    if (!taken.has(keyOf(filename))) return filename
    const dot = filename.lastIndexOf('.')
    const stem = dot === -1 ? filename : filename.slice(0, dot)
    const ext = dot === -1 ? '' : filename.slice(dot)
    for (let i = 2; ; i++) {
      const fn = `${stem}-${i}${ext}`
      if (!taken.has(keyOf(fn))) return fn
    }
  }

  const onFilesChosen = async (list: FileList | null) => {
    if (!list || list.length === 0) return
    const files = Array.from(list)
    const subject = uploadTarget || null
    const taken = new Set([...items, ...removed].map((i) => i.sourceKey))
    for (const file of files) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      setUploads((prev) => [...prev, { id, name: file.name, state: 'uploading' }])
      try {
        const filename = uniquifyFilename(subject, file.name, taken)
        const qs = new URLSearchParams({ subject: subject ?? '', filename })
        const res = await fetch(`/__gallery/upload?${qs}`, { method: 'POST', body: file })
        const json = await res.json()
        if (!json.ok) throw new Error(json.error || `HTTP ${res.status}`)
        taken.add(json.entry.sourceKey)
        setItems((prev) => [...prev, json.entry])
        markDirty()
        setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, state: 'done' } : u)))
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, state: 'error', error } : u)),
        )
      }
    }
  }

  // ---- save / discard ----------------------------------------------------------

  const saveCuration = async () => {
    setSaveState('saving')
    setSaveError(null)
    try {
      const res = await fetch('/__gallery/commit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          items,
          projects,
          remove: removed.map(({ cfId, kind }) => ({ cfId, kind })),
          deleteRemote,
          // What this page believes is on disk — lets the server refuse the
          // write if gallery.json changed underneath us (desktop sync /
          // another tab) instead of silently clobbering it.
          baseline: assets.map((a) => a.cfId),
        }),
      })
      const json = await res.json().catch(() => null)
      if (!json?.ok) throw new Error(json?.error || '')
      if (json.deleteErrors?.length) {
        window.alert(`Saved, but some Cloudflare deletions failed:\n${json.deleteErrors.join('\n')}`)
      }
      setRemoved([])
      setDirty(false)
      setSaveState('saved')
      // Vite will hot-reload the changed JSON imports right after this.
    } catch (err) {
      setSaveError(err instanceof Error && err.message ? err.message : null)
      setSaveState('error')
    }
  }

  const discardCuration = () => {
    // Files uploaded this session live on Cloudflare already — discarding
    // drops their manifest entries, leaving them orphaned there.
    const sessionUploads = items.filter((i) => !assets.some((a) => a.cfId === i.cfId))
    if (
      sessionUploads.length > 0 &&
      !window.confirm(
        `Discard ${sessionUploads.length} file${sessionUploads.length === 1 ? '' : 's'} uploaded in this session? ` +
          'They stay on Cloudflare but won’t appear in the gallery.',
      )
    ) {
      return
    }
    setItems(assets)
    setProjects(initialProjects)
    setRemoved([])
    setUploads([])
    setDirty(false)
    setSaveState('idle')
  }

  useEffect(() => {
    if (activeIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null)
      if (e.key === 'ArrowRight')
        setActiveIndex((i) =>
          i === null ? null : (i + 1) % filtered.length,
        )
      if (e.key === 'ArrowLeft')
        setActiveIndex((i) =>
          i === null ? null : (i - 1 + filtered.length) % filtered.length,
        )
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, filtered.length])

  const subjectCounts: Record<string, number> = { all: items.length }
  for (const s of subjects) {
    subjectCounts[s] = items.filter((a) => a.subject === s).length
  }

  const uploadsPending = uploads.some((u) => u.state === 'uploading')

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 w-full z-50">
        <div className="w-full px-6 sm:px-8 lg:px-12 py-4 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="font-bagel text-white text-xl tracking-wider cursor-pointer hover:scale-105 transition-transform"
              aria-label="Back to portfolio"
            >
              GUY AVNAIM
            </button>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/#portfolio"
                className="text-white hover:text-white/80 font-medium transition-all hover:scale-105"
              >
                Work
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-white/80 font-medium transition-all hover:scale-105"
              >
                About
              </Link>
              <Link
                to="/#about"
                className="text-white hover:text-white/80 font-medium transition-all hover:scale-105"
              >
                Process
              </Link>
              <Link
                to="/#services"
                className="text-white hover:text-white/80 font-medium transition-all hover:scale-105"
              >
                Capabilities
              </Link>
              <Link
                to="/gallery"
                className="text-white font-medium border-b border-white pb-0.5"
                aria-current="page"
              >
                Gallery
              </Link>
              <Link
                to="/#contact"
                className="text-white hover:text-white/80 font-medium transition-all hover:scale-105"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <section className={`pt-40 bg-background ${CURATE ? 'pb-48' : 'pb-20'}`}>
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-muted-foreground">
                Gallery
              </span>
              <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8">
              <span className="block mb-2">Videos, frames, fragments</span>
            </h1>

            <p className="text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              A growing archive of finished work and in-progress moments — Reels frames,
              cover art, AI video stills, UI explorations.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter gallery by subject"
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-16"
          >
            <FilterPill
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label="All"
              count={subjectCounts.all}
            />
            {(CURATE ? subjects : subjects.filter((s) => (subjectCounts[s] ?? 0) > 0)).map(
              (s) => {
                if (!CURATE) {
                  return (
                    <FilterPill
                      key={s}
                      active={filter === s}
                      onClick={() => setFilter(s)}
                      label={labelFor(s)}
                      count={subjectCounts[s] ?? 0}
                    />
                  )
                }
                const projectIndex = projects.findIndex((p) => p.slug === s)
                return (
                  <CuratePill
                    key={s}
                    label={labelFor(s)}
                    count={subjectCounts[s] ?? 0}
                    active={filter === s}
                    editing={editingPill === s}
                    draft={pillDraft}
                    isProject={projectIndex !== -1}
                    onSelect={() => {
                      setFilter(s)
                      setUploadTarget(s)
                    }}
                    onStartEdit={() => startPillEdit(s)}
                    onDraft={setPillDraft}
                    onCommit={commitPillEdit}
                    onCancel={() => {
                      setEditingPill(null)
                      setPillDraft('')
                    }}
                    onDelete={() => deleteProject(s)}
                    draggable={projectIndex !== -1}
                    onDragStart={() => {
                      pillDragFrom.current = projectIndex
                    }}
                    onDragEnter={() => {
                      const from = pillDragFrom.current
                      if (from === null || projectIndex === -1 || from === projectIndex) return
                      movePill(from, projectIndex)
                      pillDragFrom.current = projectIndex
                    }}
                    onDragEnd={() => {
                      pillDragFrom.current = null
                    }}
                  />
                )
              },
            )}
            {CURATE &&
              (editingPill === '__new__' ? (
                <span className="px-4 py-2 rounded-full bg-card clean-border flex items-center">
                  <input
                    autoFocus
                    value={pillDraft}
                    onChange={(e) => setPillDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitPillEdit()
                      if (e.key === 'Escape') {
                        setEditingPill(null)
                        setPillDraft('')
                      }
                    }}
                    onBlur={commitPillEdit}
                    placeholder="New project name"
                    className="bg-transparent text-sm text-foreground outline-none w-40"
                  />
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => startPillEdit('__new__')}
                  className="px-5 py-2.5 rounded-full text-sm font-medium border border-dashed border-muted-foreground/40 text-muted-foreground hover:text-foreground hover:border-foreground transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add project
                </button>
              ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState label={filter === 'all' ? undefined : labelFor(filter)} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {filtered.map((asset, i) =>
                CURATE ? (
                  <CurateCard
                    key={asset.cfId}
                    asset={asset}
                    subjects={subjects}
                    labelFor={labelFor}
                    onOpen={() => setActiveIndex(i)}
                    onRemove={() => removeItem(asset.cfId)}
                    onRename={(name) => renameItem(asset.cfId, name)}
                    onReassign={(subject) => reassignItem(asset.cfId, subject)}
                    onDragStart={() => {
                      dragFrom.current = i
                    }}
                    onDragEnter={() => {
                      const from = dragFrom.current
                      if (from === null || from === i) return
                      moveInFiltered(from, i)
                      dragFrom.current = i
                    }}
                    onDragEnd={() => {
                      dragFrom.current = null
                    }}
                  />
                ) : (
                  <GalleryCard
                    key={asset.cfId}
                    asset={asset}
                    subjectLabel={asset.subject ? labelFor(asset.subject) : null}
                    onOpen={() => setActiveIndex(i)}
                  />
                ),
              )}
            </div>
          )}
        </div>
      </section>

      {CURATE && (
        <div className="fixed bottom-0 inset-x-0 z-[150] bg-black/85 backdrop-blur-xl border-t border-white/15">
          <div className="container mx-auto px-6 py-3 space-y-2">
            {uploads.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {uploads.map((u) => (
                  <span
                    key={u.id}
                    title={u.error}
                    className={`px-3 py-1 rounded-full text-xs flex items-center gap-1.5 ${
                      u.state === 'uploading'
                        ? 'bg-white/10 text-white/80'
                        : u.state === 'done'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {u.state === 'uploading' && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                    {u.state === 'done' && '✓'}
                    {u.state === 'error' && '✕'}
                    {u.name}
                  </span>
                ))}
                {!uploadsPending && (
                  <button
                    type="button"
                    onClick={() => setUploads([])}
                    className="text-xs text-white/50 hover:text-white underline"
                  >
                    clear
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-white/80">
                <span className="font-semibold text-white">Curate mode</span> — drag to
                reorder, click names to edit, ✕ to remove. {items.length} items
                {removed.length > 0 && ` (${removed.length} removed)`}.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {saveState === 'saved' && (
                  <span className="text-sm text-emerald-400">Saved ✓</span>
                )}
                {saveState === 'error' && (
                  <span className="text-sm text-red-400 max-w-72">
                    {saveError || 'Save failed — is the dev server running?'}
                  </span>
                )}

                <label className="flex items-center gap-2 text-sm text-white/80">
                  <span>Upload to</span>
                  <select
                    value={subjects.includes(uploadTarget) ? uploadTarget : ''}
                    onChange={(e) => setUploadTarget(e.target.value)}
                    className="bg-white/10 rounded-lg px-2 py-1.5 text-sm text-white outline-none max-w-44"
                  >
                    <option value="">No project</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {labelFor(s)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-4 h-4" /> Add media
                  <input
                    type="file"
                    multiple
                    accept={UPLOAD_ACCEPT}
                    className="hidden"
                    onChange={(e) => {
                      onFilesChosen(e.target.files)
                      e.target.value = ''
                    }}
                  />
                </label>

                <label
                  className={`flex items-center gap-1.5 text-sm ${
                    removed.length > 0 ? 'text-white/80' : 'text-white/40'
                  }`}
                  title="When checked, Save also deletes the removed items from Cloudflare Stream/Images. Otherwise they only leave the site."
                >
                  <input
                    type="checkbox"
                    checked={deleteRemote}
                    onChange={(e) => setDeleteRemote(e.target.checked)}
                    className="accent-red-500"
                  />
                  also delete from Cloudflare ({removed.length})
                </label>

                <button
                  type="button"
                  onClick={discardCuration}
                  disabled={!dirty}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white disabled:opacity-40 hover:bg-white/20 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={saveCuration}
                  disabled={!dirty || saveState === 'saving' || uploadsPending}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-black disabled:opacity-40 hover:bg-white/90 transition-colors"
                >
                  {saveState === 'saving' ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeIndex !== null && filtered[activeIndex] && (
        <Lightbox
          asset={filtered[activeIndex]}
          onClose={() => setActiveIndex(null)}
          onPrev={() =>
            setActiveIndex(
              (i) => ((i ?? 0) - 1 + filtered.length) % filtered.length,
            )
          }
          onNext={() =>
            setActiveIndex((i) => ((i ?? 0) + 1) % filtered.length)
          }
        />
      )}

      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-sm text-muted-foreground">
              © MMXXVI · GUY AVNAIM · TEL AVIV
            </span>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to portfolio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  label,
  count,
  disabled,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  disabled?: boolean
}) {
  const base = 'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300'
  const className = active
    ? `${base} bg-foreground text-background`
    : disabled
    ? `${base} bg-card clean-border text-muted-foreground/40 cursor-not-allowed`
    : `${base} bg-card clean-border text-muted-foreground hover:text-foreground`
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {label} <span className="opacity-50">({count})</span>
    </button>
  )
}

function CuratePill({
  label,
  count,
  active,
  editing,
  draft,
  isProject,
  onSelect,
  onStartEdit,
  onDraft,
  onCommit,
  onCancel,
  onDelete,
  draggable,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: {
  label: string
  count: number
  active: boolean
  editing: boolean
  draft: string
  isProject: boolean
  onSelect: () => void
  onStartEdit: () => void
  onDraft: (v: string) => void
  onCommit: () => void
  onCancel: () => void
  onDelete: () => void
  draggable: boolean
  onDragStart: () => void
  onDragEnter: () => void
  onDragEnd: () => void
}) {
  if (editing) {
    return (
      <span className="px-4 py-2 rounded-full bg-card clean-border flex items-center">
        <input
          autoFocus
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommit()
            if (e.key === 'Escape') onCancel()
          }}
          onBlur={onCommit}
          className="bg-transparent text-sm text-foreground outline-none w-40"
          placeholder="Project name"
        />
      </span>
    )
  }
  const base =
    'pl-4 pr-2 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1'
  return (
    <span
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={
        active
          ? `${base} bg-foreground text-background`
          : `${base} bg-card clean-border text-muted-foreground`
      }
    >
      <button type="button" onClick={onSelect} className="hover:opacity-80">
        {label} <span className="opacity-50">({count})</span>
      </button>
      <button
        type="button"
        onClick={onStartEdit}
        aria-label={`Rename ${label}`}
        title="Rename project"
        className="p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity"
      >
        <Pencil className="w-3 h-3" />
      </button>
      {isProject && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${label}`}
          title="Delete project"
          className="p-1 rounded-full opacity-50 hover:opacity-100 hover:text-red-400 transition-all"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}

function Thumb({
  asset,
  draggable: canDrag,
}: {
  asset: ManifestEntry
  draggable?: boolean
}) {
  // Videos show their static poster; the multi-MB animated GIF preview only
  // loads while hovered. Loading every GIF at once locks up the page.
  const [animate, setAnimate] = useState(false)
  const isVideo = asset.kind === 'video' && Boolean(asset.posterUrl)
  return (
    <img
      src={isVideo && !animate ? asset.posterUrl : asset.previewUrl}
      alt={asset.name}
      loading="lazy"
      decoding="async"
      draggable={canDrag}
      onMouseEnter={isVideo ? () => setAnimate(true) : undefined}
      onMouseLeave={isVideo ? () => setAnimate(false) : undefined}
      className="absolute inset-0 w-full h-full object-cover"
    />
  )
}

function GalleryCard({
  asset,
  subjectLabel,
  onOpen,
}: {
  asset: ManifestEntry
  subjectLabel: string | null
  onOpen: () => void
}) {
  // Audio has no thumbnail — render a music-icon placeholder card.
  // The Stream player iframe only mounts in the lightbox.
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${asset.name}`}
      className="group relative aspect-[4/5] bg-card clean-border rounded-3xl overflow-hidden elevated-shadow text-left transition-transform duration-500 hover:-translate-y-1 cursor-pointer [content-visibility:auto] [contain-intrinsic-size:auto_480px]"
    >
      {asset.kind === 'audio' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent-emerald/30 via-accent-blue/20 to-background">
          <Music className="w-20 h-20 text-foreground/70" strokeWidth={1.5} />
        </div>
      ) : (
        <Thumb asset={asset} />
      )}

      <div className="absolute top-4 left-4 flex gap-2">
        <span className="glass-effect rounded-xl px-3 py-1 text-xs font-medium text-white backdrop-blur-md uppercase tracking-wider">
          {asset.kind}
        </span>
        {subjectLabel && (
          <span className="glass-effect rounded-xl px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md uppercase tracking-wider">
            {subjectLabel}
          </span>
        )}
      </div>

      {asset.kind === 'audio' && (
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-sm font-medium text-foreground capitalize">
            {asset.name}
          </p>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-sm font-medium text-white capitalize">
          {asset.name}
        </p>
      </div>
    </button>
  )
}

function CurateCard({
  asset,
  subjects,
  labelFor,
  onOpen,
  onRemove,
  onRename,
  onReassign,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: {
  asset: ManifestEntry
  subjects: string[]
  labelFor: (slug: string) => string
  onOpen: () => void
  onRemove: () => void
  onRename: (name: string) => void
  onReassign: (subject: string | null) => void
  onDragStart: () => void
  onDragEnter: () => void
  onDragEnd: () => void
}) {
  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      className="relative aspect-[4/5] bg-card clean-border rounded-3xl overflow-hidden elevated-shadow"
    >
      <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={onOpen}
        role="button"
        aria-label={`Open ${asset.name}`}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      >
        {asset.kind === 'audio' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent-emerald/30 via-accent-blue/20 to-background">
            <Music className="w-20 h-20 text-foreground/70" strokeWidth={1.5} />
          </div>
        ) : (
          <Thumb asset={asset} draggable={false} />
        )}
      </div>

      <div className="absolute top-3 left-3 pointer-events-none">
        <span className="glass-effect rounded-xl px-3 py-1 text-xs font-medium text-white backdrop-blur-md uppercase tracking-wider">
          {asset.kind}
        </span>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${asset.name}`}
        title="Remove from gallery"
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 bg-black/75 backdrop-blur-sm p-3 space-y-2">
        <input
          value={asset.name}
          onChange={(e) => onRename(e.target.value)}
          aria-label={`Name of ${asset.sourceKey}`}
          className="w-full bg-white/10 rounded-lg px-2 py-1 text-sm text-white outline-none focus:bg-white/20 transition-colors"
        />
        <select
          value={asset.subject ?? ''}
          onChange={(e) => onReassign(e.target.value || null)}
          aria-label={`Project of ${asset.sourceKey}`}
          className="w-full bg-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none"
        >
          <option value="">No project</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {labelFor(s)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function EmptyState({ label }: { label?: string }) {
  return (
    <div className="max-w-2xl mx-auto bg-card clean-border rounded-3xl p-12 text-center elevated-shadow">
      <div className="w-12 h-12 bg-accent-emerald/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="w-6 h-6 bg-accent-emerald rounded-full animate-pulse" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-3">
        {label ? `Nothing in ${label} yet` : 'Nothing in the gallery yet'}
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Upload right here — open{' '}
        <code className="bg-background px-2 py-1 rounded text-sm">/gallery?curate</code>{' '}
        on the dev server and hit “Add media”. Or drop files into{' '}
        <code className="bg-background px-2 py-1 rounded text-sm">
          ~/Desktop/gallery/&lt;project&gt;/
        </code>{' '}
        and run{' '}
        <code className="bg-background px-2 py-1 rounded text-sm">
          npm run sync-cloudflare
        </code>
        .
      </p>
      <p className="text-sm text-muted-foreground">
        Supported: <code>mp4 webm mov jpg jpeg png webp gif avif mp3 wav m4a</code>
      </p>
    </div>
  )
}

function Lightbox({
  asset,
  onClose,
  onPrev,
  onNext,
}: {
  asset: ManifestEntry
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gallery viewer"
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-6 sm:p-14"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 w-12 h-12 rounded-full glass-effect text-white text-2xl hover:bg-white/20 transition-colors cursor-pointer"
      >
        ×
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
        aria-label="Previous"
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-effect text-white text-2xl hover:bg-white/20 transition-colors cursor-pointer hidden sm:block"
      >
        ←
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        aria-label="Next"
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-effect text-white text-2xl hover:bg-white/20 transition-colors cursor-pointer hidden sm:block"
      >
        →
      </button>

      <div
        className="max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {asset.kind === 'video' ? (
          <iframe
            src={`${asset.displayUrl}?autoplay=true&muted=false`}
            title={asset.name}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
            className="w-[90vw] max-w-4xl aspect-video rounded-2xl border-0"
          />
        ) : asset.kind === 'audio' ? (
          <iframe
            src={`${asset.displayUrl}?autoplay=true`}
            title={asset.name}
            allow="autoplay; encrypted-media;"
            className="w-[90vw] max-w-2xl h-32 rounded-2xl border-0"
          />
        ) : (
          <img
            src={asset.displayUrl}
            alt={asset.name}
            className="max-w-full max-h-[85vh] rounded-2xl object-contain"
          />
        )}
        <p className="text-white/70 text-sm capitalize font-medium tracking-wide">
          {asset.name}
        </p>
      </div>
    </div>
  )
}
