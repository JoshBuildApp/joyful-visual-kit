import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent, MouseEvent as ReactMouseEvent } from 'react'
import { useLang, shownText, useT } from '@/lib/lang'
import { adminSignIn, adminSignOut, saveTexts } from '@/lib/site-data'
import { useSite } from '@/lib/site-state'

const TAPS = 5
const WITHIN = 3000
const HOME_AFTER = 400

// Five taps on the mark, and the password box opens. One tap still goes home, a moment later.
export function useLogoTaps() {
  const { admin, setLoginOpen } = useSite()
  const navigate = useNavigate()
  const taps = useRef<number[]>([])
  const home = useRef(0)
  return (e: ReactMouseEvent) => {
    e.preventDefault()
    window.clearTimeout(home.current)
    const now = Date.now()
    taps.current = [...taps.current.filter((at) => now - at < WITHIN), now]
    if (taps.current.length === 1) home.current = window.setTimeout(() => void navigate({ to: '/' }), HOME_AFTER)
    if (taps.current.length < TAPS) return
    taps.current = []
    if (!admin) setLoginOpen(true)
  }
}

function Login() {
  const t = useT()
  const { setAdmin, setLoginOpen } = useSite()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setProblem('')
    const answer = await adminSignIn({ data: { password } }).catch(() => ({ ok: false, why: 'off' as const }))
    setBusy(false)
    setPassword('')
    if (answer.ok) {
      setAdmin(true)
      setLoginOpen(false)
    } else setProblem(t(answer.why === 'wait' ? 'Too many tries. Try again in 15 minutes.' : answer.why === 'off' ? 'Admin is not available right now.' : 'That is not the password.'))
  }
  return (
    <div className="adminUi adminBack" role="dialog" aria-modal="true" aria-label={t('Admin')} onClick={(e) => e.target === e.currentTarget && setLoginOpen(false)}>
      <form className="adminCard" onSubmit={submit}>
        <h2>{t('Admin')}</h2>
        <label>
          {t('Password')}
          <input type="password" autoFocus autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {problem && <p role="alert">{problem}</p>}
        <div>
          <button type="button" onClick={() => setLoginOpen(false)}>{t('Cancel')}</button>
          <button type="submit" className="main" disabled={busy || !password}>{t('Enter')}</button>
        </div>
      </form>
    </div>
  )
}

function Editor({ sentence, shown, onClose }: { sentence: string; shown: string; onClose: () => void }) {
  const t = useT()
  const lang = useLang()
  const { text, setText, setAdmin } = useSite()
  const [value, setValue] = useState(shown)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const save = async (next: string | null) => {
    setBusy(true)
    const answer = await saveTexts({ data: { lang, entries: [[sentence, next]] } }).catch(() => ({ ok: false }))
    setBusy(false)
    if (!answer.ok) {
      setProblem(t('That was not saved. Sign in again.'))
      setAdmin(false)
      return
    }
    const words = { ...text[lang] }
    if (next === null) delete words[sentence]
    else words[sentence] = next
    setText({ ...text, [lang]: words })
    onClose()
  }
  return (
    <div className="adminUi adminBack" role="dialog" aria-modal="true" aria-label={t('Edit text')} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="adminCard"
        onSubmit={(e) => {
          e.preventDefault()
          void save(value.trim())
        }}
      >
        <h2>{t('Edit text')}</h2>
        <textarea dir="auto" autoFocus rows={5} maxLength={2000} value={value} onChange={(e) => setValue(e.target.value)} />
        {problem && <p role="alert">{problem}</p>}
        <div>
          {text[lang][sentence] !== undefined && <button type="button" disabled={busy} onClick={() => void save(null)}>{t('Back to the original')}</button>}
          <button type="button" onClick={onClose}>{t('Cancel')}</button>
          <button type="submit" className="main" disabled={busy || !value.trim()}>{t('Save')}</button>
        </div>
      </form>
    </div>
  )
}

export function Admin() {
  const t = useT()
  const { admin, loginOpen, setAdmin } = useSite()
  const [editing, setEditing] = useState(false)
  const [open, setOpen] = useState<{ sentence: string; shown: string } | null>(null)

  useEffect(() => {
    if (!admin || !editing) return
    document.documentElement.toggleAttribute('data-admin-edit', true)
    // While editing, a click picks the sentence under it and nothing else happens.
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.closest('.adminUi')) return
      e.preventDefault()
      e.stopPropagation()
      for (let el: Element | null = target, up = 0; el && up < 3; el = el.parentElement, up++) {
        const own = Array.from(el.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent?.trim() ?? '').filter(Boolean)
        const found = own.find((words) => shownText.has(words))
        if (found) return setOpen({ sentence: shownText.get(found)!, shown: found })
      }
    }
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.documentElement.removeAttribute('data-admin-edit')
    }
  }, [admin, editing])

  return (
    <>
      {loginOpen && <Login />}
      {open && <Editor sentence={open.sentence} shown={open.shown} onClose={() => setOpen(null)} />}
      {admin && (
        <div className="adminUi adminBar" role="toolbar" aria-label={t('Admin')}>
          <b>{t('Admin')}</b>
          <button type="button" aria-pressed={editing} onClick={() => setEditing(!editing)}>{t(editing ? 'Done editing' : 'Edit text')}</button>
          <button
            type="button"
            onClick={() => {
              setEditing(false)
              void adminSignOut().then(() => setAdmin(false))
            }}
          >
            {t('Sign out')}
          </button>
        </div>
      )}
    </>
  )
}
