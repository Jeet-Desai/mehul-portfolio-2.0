import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Loader2, GraduationCap, Users, KeyRound, ArrowLeft, Check } from 'lucide-react'
import { usePageTitle } from '../lib/usePageTitle'
import { lookupClassroom, joinClassroom, type ClassPreview } from '../lib/classrooms'

/** /classrooms/join/:code — the landing page for a shared join link.
    RequireAuth wraps the route, so by the time this renders the user is signed
    in (the login round-trip preserves the full path, including the code). */
export default function JoinClassroom() {
  usePageTitle('Join classroom')
  const { code = '' } = useParams()
  const navigate = useNavigate()

  const [preview, setPreview] = useState<ClassPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data, error } = await lookupClassroom(code)
      if (!active) return
      setPreview(data)
      setError(error)
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [code])

  const join = async () => {
    setBusy(true)
    setError(null)
    const { data: classId, error } = await joinClassroom(code)
    setBusy(false)
    if (error) setError(error)
    else if (classId) navigate(`/classrooms/${classId}`, { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="cl-card p-8 text-center">
        {loading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-600" />
        ) : !preview ? (
          <>
            <KeyRound className="mx-auto h-8 w-8 text-slate-300" />
            <h1 className="mt-4 text-[22px]">That code didn’t match a class</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              <span className="font-mono font-bold tracking-[0.2em]">{code.toUpperCase()}</span> isn’t a valid class
              code{error ? ` (${error})` : ''}. Double-check it with your teacher — codes are 6 characters.
            </p>
            <Link to="/classrooms" className="btn-outline mt-6 inline-flex px-5 py-2.5 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Classrooms
            </Link>
          </>
        ) : preview.archived && !preview.already_joined ? (
          <>
            <KeyRound className="mx-auto h-8 w-8 text-slate-300" />
            <h1 className="mt-4 text-[22px]">This classroom is archived</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              <strong>{preview.name}</strong> is no longer accepting new members.
            </p>
            <Link to="/classrooms" className="btn-outline mt-6 inline-flex px-5 py-2.5 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Classrooms
            </Link>
          </>
        ) : (
          <>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <GraduationCap className="h-7 w-7" />
            </span>
            <p className="eyebrow mt-5">{preview.already_joined ? 'You’re already in' : 'You’re invited to join'}</p>
            <h1 className="mt-1 text-[24px] leading-snug">{preview.name}</h1>
            <p className="mt-2 text-sm text-slate-600">
              {preview.subject ? `${preview.subject} · ` : ''}by <strong>{preview.owner_name || 'your teacher'}</strong>
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Users className="h-3.5 w-3.5" /> {preview.member_count} {preview.member_count === 1 ? 'member' : 'members'}
            </p>
            {preview.description && (
              <p className="mt-3 text-[13px] leading-relaxed text-slate-500">{preview.description}</p>
            )}
            {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
            {preview.already_joined ? (
              <Link to={`/classrooms/${preview.id}`} className="btn-accent mt-6 inline-flex px-6 py-3 text-sm">
                <Check className="h-4 w-4" /> Open classroom
              </Link>
            ) : (
              <button onClick={join} disabled={busy} className="btn-accent mt-6 inline-flex px-6 py-3 text-sm disabled:opacity-40">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />} Join this class
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
