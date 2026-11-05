import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CLIPS, LAB, PROJECTS } from '@/content/projects'
import type { Content } from '@/lib/admin.server'
import { saveContent } from '@/lib/site-data'

type Text = { en: Record<string, string>; he: Record<string, string> }
export type Panel = { kind: 'project'; slug: string } | { kind: 'new-project' } | { kind: 'lab' } | { kind: 'contact' } | { kind: 'hero' }
export const CONTACT = { mail: 'guyavnaim5@gmail.com', instagram: 'https://instagram.com/guy.avnaim' }

export type SiteState = {
  hidden: Set<string>
  text: Text
  content: Content
  admin: boolean
  editing: boolean
  panel: Panel | null
  loginOpen: boolean
  setHidden: (hidden: string[]) => void
  setText: (text: Text) => void
  setAdmin: (admin: boolean) => void
  setEditing: (editing: boolean) => void
  setPanel: (panel: Panel | null) => void
  setLoginOpen: (open: boolean) => void
  updateContent: (patch: Content) => Promise<boolean>
}

const Site = createContext<SiteState>({ hidden: new Set(), text: { en: {}, he: {} }, content: {}, admin: false, editing: false, panel: null, loginOpen: false, setHidden() {}, setText() {}, setAdmin() {}, setEditing() {}, setPanel() {}, setLoginOpen() {}, updateContent: async () => false })

export const useSite = () => useContext(Site)

// What the site shows: what the admin saved, else what ships with it.
export function useContent() {
  const { content } = useSite()
  return { projects: content.projects ?? PROJECTS, lab: content.lab ?? LAB, clips: content.clips?.length ? content.clips : CLIPS, contact: content.contact ?? CONTACT, pieces: content.pieces ?? [], edits: content.edits ?? {} }
}

export function SiteProvider({ initial, children }: { initial: { hidden: string[]; text: Text; content: Content; admin: boolean }; children: ReactNode }) {
  const [hidden, setHidden] = useState(initial.hidden)
  const [text, setText] = useState(initial.text)
  const [content, setContent] = useState(initial.content)
  const [admin, setAdmin] = useState(initial.admin)
  const [editing, setEditing] = useState(false)
  const [panel, setPanel] = useState<Panel | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const updateContent = useCallback(async (patch: Content) => {
    const answer = await saveContent({ data: patch }).catch(() => ({ ok: false as const, content: undefined }))
    if (!answer.ok || !answer.content) return false
    setContent(answer.content)
    return true
  }, [])
  const value = useMemo(
    () => ({ hidden: new Set(hidden), text, content, admin, editing, panel, loginOpen, setHidden, setText, setAdmin, setEditing, setPanel, setLoginOpen, updateContent }),
    [hidden, text, content, admin, editing, panel, loginOpen, updateContent],
  )
  return <Site.Provider value={value}>{children}</Site.Provider>
}
