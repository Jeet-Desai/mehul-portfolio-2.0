import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Loader2,
  Users,
  MessagesSquare,
  Settings as SettingsIcon,
  Send,
  Trash2,
  Copy,
  Check,
  GraduationCap,
  LogOut,
  Archive,
  KeyRound,
  MessageCircle,
  ArrowLeft,
  ImagePlus,
  X,
} from 'lucide-react'
import Reveal from '../components/Reveal'
import { usePageTitle } from '../lib/usePageTitle'
import { useAuth } from '../lib/auth'
import { useMyRole } from '../lib/role'
import {
  getClassroom,
  listMembers,
  listPosts,
  listComments,
  createPost,
  deletePost,
  createComment,
  deleteComment,
  removeMember,
  updateClassroom,
  deleteClassroom,
  uploadDoubtImages,
  signedImageUrls,
  joinLink,
  type Classroom,
  type ClassMember,
  type ClassPost,
  type ClassComment,
} from '../lib/classrooms'
import { prepareImages, type PreparedImage } from '../lib/image'
import { displayName } from './Classrooms'

type Tab = 'stream' | 'people' | 'settings'

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function ClassroomDetail() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const { role } = useMyRole()

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('stream')

  usePageTitle(classroom?.name ?? 'Classroom')

  const load = useCallback(async () => {
    const { data } = await getClassroom(id)
    setClassroom(data)
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const amOwner = !!classroom && !!user && (classroom.owner_id === user.id || role === 'admin')

  if (loading)
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    )

  // RLS returns nothing for non-members → honest "not available" state.
  if (!classroom)
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <KeyRound className="mx-auto h-8 w-8 text-slate-300" />
        <h1 className="mt-4 text-[24px]">This classroom isn’t available</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Either it doesn’t exist, or you haven’t joined it yet. Ask your teacher for the class code or join link.
        </p>
        <Link to="/classrooms" className="btn-accent mt-6 inline-flex px-5 py-2.5 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Classrooms
        </Link>
      </div>
    )

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'stream', label: 'Stream', icon: MessagesSquare },
    { id: 'people', label: 'People', icon: Users },
    ...(amOwner ? [{ id: 'settings' as Tab, label: 'Settings', icon: SettingsIcon }] : []),
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
      <Link to="/classrooms" className="inline-flex items-center gap-1 text-[13px] font-bold text-brand-600 hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> All classrooms
      </Link>

      {/* class header */}
      <Reveal className="mt-4">
        <div className="ink-card ink-lines rounded-2xl p-6 sm:p-8">
          <p className="eyebrow">{classroom.subject || 'Classroom'}</p>
          <h1 className="mt-1 text-[28px] leading-tight text-slate-50 sm:text-[34px]">{classroom.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] opacity-70">
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" /> {classroom.owner_name || 'Teacher'}
            </span>
            {classroom.archived && (
              <span className="inline-flex items-center gap-1.5">
                <Archive className="h-4 w-4" /> Archived — read-only
              </span>
            )}
          </p>
          {classroom.description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed opacity-80">{classroom.description}</p>
          )}
        </div>
      </Reveal>

      {/* tabs */}
      <div className="mt-6 inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:bg-white">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
              tab === t.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'stream' && <StreamPanel classroom={classroom} amOwner={amOwner} />}
        {tab === 'people' && <PeoplePanel classroom={classroom} amOwner={amOwner} />}
        {tab === 'settings' && amOwner && <SettingsPanel classroom={classroom} onChanged={load} />}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- stream -- */

function StreamPanel({ classroom, amOwner }: { classroom: Classroom; amOwner: boolean }) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<ClassPost[]>([])
  const [comments, setComments] = useState<ClassComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([listPosts(classroom.id), listComments(classroom.id)])
    setPosts(p.data)
    setComments(c.data)
    setError(p.error || c.error)
    setLoading(false)
  }, [classroom.id])

  useEffect(() => {
    load()
  }, [load])

  const byPost = useMemo(() => {
    const map: Record<string, ClassComment[]> = {}
    for (const c of comments) (map[c.post_id] ??= []).push(c)
    return map
  }, [comments])

  const canPost = amOwner || (classroom.allow_student_posts && !classroom.archived)

  if (loading)
    return (
      <div className="grid min-h-[30vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    )

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-rose-500">Couldn’t load the stream — {error}</p>}

      {canPost && <Composer classroom={classroom} amOwner={amOwner} onPosted={load} />}
      {!canPost && !classroom.archived && (
        <p className="rounded-xl border border-slate-200 bg-slate-100 p-3.5 text-[13px] text-slate-500">
          Only {classroom.owner_name || 'the teacher'} posts to this stream — you can still comment and ask doubts under each post.
        </p>
      )}

      {posts.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-slate-200 py-14 text-center">
          <MessagesSquare className="h-7 w-7 text-slate-300" />
          <p className="mt-2 text-sm text-slate-400">
            Nothing on the stream yet{canPost ? ' — start the conversation above.' : '.'}
          </p>
        </div>
      ) : (
        posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            comments={byPost[p.id] ?? []}
            classroom={classroom}
            amOwner={amOwner}
            myId={user?.id ?? ''}
            onChanged={load}
          />
        ))
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  if (role !== 'teacher') return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10.5px] font-bold text-brand-600">
      <GraduationCap className="h-3 w-3" /> Teacher
    </span>
  )
}

/* ------------------------------------------------------------ image attach -- */

const MAX_IMAGES = 6

/** Manages a batch of to-be-uploaded images (compressed on add). */
function useImagePicker() {
  const [images, setImages] = useState<PreparedImage[]>([])
  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const room = MAX_IMAGES - images.length
    const prepared = await prepareImages(Array.from(files).slice(0, room))
    setImages((prev) => [...prev, ...prepared])
  }
  const removeAt = (i: number) =>
    setImages((prev) => {
      URL.revokeObjectURL(prev[i].previewUrl)
      return prev.filter((_, idx) => idx !== i)
    })
  const clear = () =>
    setImages((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl))
      return []
    })
  return { images, addFiles, removeAt, clear }
}

/** The paperclip button + hidden file input (multiple images). */
function AttachButton({ count, onFiles, small = false }: { count: number; onFiles: (f: FileList | null) => void; small?: boolean }) {
  const full = count >= MAX_IMAGES
  return (
    <label
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 font-semibold text-slate-600 transition hover:border-brand-600 hover:text-brand-600 ${
        small ? 'px-2.5 py-2 text-xs' : 'px-3 py-2 text-[13px]'
      } ${full ? 'pointer-events-none opacity-40' : ''}`}
      title={full ? `Up to ${MAX_IMAGES} images` : 'Attach photos of your working'}
    >
      <ImagePlus className={small ? 'h-4 w-4' : 'h-4 w-4'} />
      {!small && 'Add photo'}
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onFiles(e.target.files)
          e.target.value = '' // allow re-selecting the same file
        }}
      />
    </label>
  )
}

/** Thumbnails of the images queued for upload, each removable. */
function Previews({ images, removeAt }: { images: PreparedImage[]; removeAt: (i: number) => void }) {
  if (images.length === 0) return null
  return (
    <div className="mt-2.5 flex flex-wrap gap-2">
      {images.map((img, i) => (
        <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200">
          <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
          <button
            onClick={() => removeAt(i)}
            className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-slate-900/70 text-white"
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )
}

/** Renders already-uploaded images from their storage paths (signed URLs). */
function ImageStrip({ paths }: { paths: string[] }) {
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [zoom, setZoom] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (paths.length === 0) return
    signedImageUrls(paths).then((m) => {
      if (active) setUrls(m)
    })
    return () => {
      active = false
    }
  }, [paths])

  if (paths.length === 0) return null
  return (
    <>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {paths.map((p) =>
          urls[p] ? (
            <button
              key={p}
              onClick={() => setZoom(urls[p])}
              className="h-20 w-20 overflow-hidden rounded-lg border border-slate-200 transition hover:border-brand-600"
              aria-label="View image full size"
            >
              <img src={urls[p]} alt="Attached working" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ) : (
            <div key={p} className="grid h-20 w-20 place-items-center rounded-lg border border-slate-200 bg-slate-50">
              <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
            </div>
          ),
        )}
      </div>
      {zoom &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/80 p-4"
            onClick={() => setZoom(null)}
            role="dialog"
            aria-modal="true"
          >
            <img src={zoom} alt="Attached working" className="max-h-[90vh] max-w-[92vw] rounded-lg object-contain" />
            <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>,
          document.body,
        )}
    </>
  )
}

function Composer({ classroom, amOwner, onPosted }: { classroom: Classroom; amOwner: boolean; onPosted: () => void }) {
  const { user } = useAuth()
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const { images, addFiles, removeAt, clear } = useImagePicker()

  const submit = async () => {
    if (!user || (!body.trim() && images.length === 0)) return
    setBusy(true)
    setErr(null)
    let imagePaths: string[] = []
    if (images.length > 0) {
      const up = await uploadDoubtImages(classroom.id, images.map((i) => i.blob))
      if (up.error && up.paths.length === 0) {
        setBusy(false)
        setErr(`Couldn’t upload images — ${up.error}`)
        return
      }
      imagePaths = up.paths
    }
    const { error } = await createPost({
      classroomId: classroom.id,
      authorId: user.id,
      authorName: displayName(user),
      authorRole: amOwner ? 'teacher' : 'student',
      body,
      imagePaths,
    })
    setBusy(false)
    if (error) setErr(error)
    else {
      setBody('')
      clear()
      onPosted()
    }
  }

  return (
    <div className="cl-card p-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        placeholder={amOwner ? 'Share an announcement with the class…' : 'Post to the class — a doubt, a resource, anything useful…'}
        className="w-full rounded-[9px] border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm leading-relaxed outline-none transition focus:border-brand-600"
      />
      <Previews images={images} removeAt={removeAt} />
      {err && <p className="mt-1.5 text-xs text-rose-500">{err}</p>}
      <div className="mt-2 flex items-center justify-between gap-2">
        <AttachButton count={images.length} onFiles={addFiles} />
        <button onClick={submit} disabled={busy || (!body.trim() && images.length === 0)} className="btn-accent px-4 py-2 text-sm disabled:opacity-40">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Post
        </button>
      </div>
    </div>
  )
}

function PostCard({
  post,
  comments,
  classroom,
  amOwner,
  myId,
  onChanged,
}: {
  post: ClassPost
  comments: ClassComment[]
  classroom: Classroom
  amOwner: boolean
  myId: string
  onChanged: () => void
}) {
  const { user } = useAuth()
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const { images, addFiles, removeAt, clear } = useImagePicker()
  const canDeletePost = amOwner || post.author_id === myId

  const sendReply = async () => {
    if (!user || (!reply.trim() && images.length === 0)) return
    setBusy(true)
    let imagePaths: string[] = []
    if (images.length > 0) {
      const up = await uploadDoubtImages(classroom.id, images.map((i) => i.blob))
      imagePaths = up.paths
    }
    const { error } = await createComment({
      postId: post.id,
      classroomId: classroom.id,
      authorId: user.id,
      authorName: displayName(user),
      authorRole: amOwner ? 'teacher' : 'student',
      body: reply,
      imagePaths,
    })
    setBusy(false)
    if (!error) {
      setReply('')
      clear()
      onChanged()
    }
  }

  return (
    <div className="cl-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13.5px] font-bold text-slate-900">{post.author_name || 'A member'}</span>
            <RoleBadge role={post.author_role} />
            <span className="text-[11px] text-slate-400">{fmtDateTime(post.created_at)}</span>
          </div>
          {post.body && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{post.body}</p>}
          <ImageStrip paths={post.image_paths ?? []} />
        </div>
        {canDeletePost && (
          <button
            onClick={async () => {
              await deletePost(post.id)
              onChanged()
            }}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            aria-label="Delete post"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* comments */}
      <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
        {comments.map((c) => (
          <div key={c.id} className="flex items-start justify-between gap-2 rounded-[10px] bg-slate-50 px-3.5 py-2.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12.5px] font-bold text-slate-800">{c.author_name || 'A member'}</span>
                <RoleBadge role={c.author_role} />
                <span className="text-[10.5px] text-slate-400">{fmtDateTime(c.created_at)}</span>
              </div>
              {c.body && <p className="mt-0.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-600">{c.body}</p>}
              <ImageStrip paths={c.image_paths ?? []} />
            </div>
            {(amOwner || c.author_id === myId) && (
              <button
                onClick={async () => {
                  await deleteComment(c.id)
                  onChanged()
                }}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                aria-label="Delete comment"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}

        {!classroom.archived && (
          <div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 shrink-0 text-slate-300" />
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendReply()
                  }
                }}
                placeholder="Reply or ask a doubt…"
                className="w-full rounded-[9px] border border-slate-200 bg-slate-50 px-3.5 py-2 text-[13.5px] outline-none transition focus:border-brand-600"
              />
              <AttachButton count={images.length} onFiles={addFiles} small />
              <button onClick={sendReply} disabled={busy || (!reply.trim() && images.length === 0)} className="btn-outline px-3 py-2 text-sm disabled:opacity-40" aria-label="Send reply">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <Previews images={images} removeAt={removeAt} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- people -- */

function PeoplePanel({ classroom, amOwner }: { classroom: Classroom; amOwner: boolean }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [members, setMembers] = useState<ClassMember[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    const { data } = await listMembers(classroom.id)
    setMembers(data)
    setLoading(false)
  }, [classroom.id])

  useEffect(() => {
    load()
  }, [load])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinLink(classroom.join_code))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable — the code is visible to copy by hand */
    }
  }

  const leave = async () => {
    if (!user) return
    if (!window.confirm('Leave this classroom? You can rejoin any time with the class code.')) return
    await removeMember(classroom.id, user.id)
    navigate('/classrooms')
  }

  if (loading)
    return (
      <div className="grid min-h-[30vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    )

  return (
    <div className="space-y-5">
      {/* invite card — teacher only (students never see the join code) */}
      {amOwner && !classroom.archived && (
        <div className="cl-card flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="text-[15px] font-bold text-slate-900">Invite students</p>
            <p className="mt-0.5 text-xs text-slate-400">
              Share the link on WhatsApp, or the code for students to type in on the Classrooms page.
            </p>
            <p className="mt-2 font-mono text-[22px] font-bold tracking-[0.25em] text-brand-600">{classroom.join_code}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={copyLink} className="btn-accent px-4 py-2 text-sm">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied!' : 'Copy join link'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Join my class "${classroom.name}" on AccrualSense: ${joinLink(classroom.join_code)}`)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline px-4 py-2 text-sm"
            >
              Share on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* teacher */}
      <div>
        <h2 className="h2-marker text-[20px]">Teacher</h2>
        <div className="cl-card mt-3 flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">{classroom.owner_name || 'Teacher'}</p>
            <p className="text-xs text-slate-400">Class owner</p>
          </div>
        </div>
      </div>

      {/* members */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="h2-marker text-[20px]">
            Classmates <span className="text-sm font-semibold text-slate-400">({members.length})</span>
          </h2>
          {!amOwner && user && (
            <button onClick={leave} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-rose-500 transition hover:bg-rose-50">
              <LogOut className="h-3.5 w-3.5" /> Leave class
            </button>
          )}
        </div>
        {members.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No students have joined yet.</p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {members.map((m, i) => (
              <div key={m.user_id} className={`flex items-center justify-between gap-3 px-4 py-3 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {m.member_name || m.member_email || 'A student'}
                    {m.user_id === user?.id && <span className="ml-2 text-[11px] font-bold text-brand-600">you</span>}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {amOwner && m.member_email ? `${m.member_email} · ` : ''}joined {fmtDateTime(m.joined_at)}
                  </p>
                </div>
                {amOwner && m.user_id !== user?.id && (
                  <button
                    onClick={async () => {
                      if (!window.confirm(`Remove ${m.member_name || m.member_email || 'this student'} from the class?`)) return
                      await removeMember(classroom.id, m.user_id)
                      load()
                    }}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                    aria-label="Remove from class"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- settings -- */

function SettingsPanel({ classroom, onChanged }: { classroom: Classroom; onChanged: () => void }) {
  const navigate = useNavigate()
  const [name, setName] = useState(classroom.name)
  const [subject, setSubject] = useState(classroom.subject ?? '')
  const [description, setDescription] = useState(classroom.description ?? '')
  const [allowPosts, setAllowPosts] = useState(classroom.allow_student_posts)
  const [archived, setArchived] = useState(classroom.archived)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    const { error } = await updateClassroom(classroom.id, {
      name: name.trim(),
      subject: subject.trim() || null,
      description: description.trim() || null,
      allow_student_posts: allowPosts,
      archived,
    })
    setBusy(false)
    if (error) setErr(error)
    else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onChanged()
    }
  }

  const destroy = async () => {
    if (!window.confirm(`Delete "${classroom.name}" permanently? All posts, comments and the roster are removed for everyone. This cannot be undone.`)) return
    setBusy(true)
    const { error } = await deleteClassroom(classroom.id)
    setBusy(false)
    if (error) setErr(error)
    else navigate('/classrooms')
  }

  const field =
    'mt-1.5 w-full rounded-[9px] border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-600'

  return (
    <div className="space-y-5">
      <form onSubmit={save} className="cl-card space-y-3 p-5">
        <label className="block">
          <span className="text-[12.5px] font-semibold text-slate-600">Class name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={field} />
        </label>
        <label className="block">
          <span className="text-[12.5px] font-semibold text-slate-600">Subject</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-[12.5px] font-semibold text-slate-600">Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={field} />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={allowPosts} onChange={(e) => setAllowPosts(e.target.checked)} className="h-4 w-4 accent-brand-600" />
          <span className="text-[13px] font-semibold text-slate-700">Students can post to the stream</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} className="h-4 w-4 accent-brand-600" />
          <span className="text-[13px] font-semibold text-slate-700">
            Archive this class <span className="font-normal text-slate-400">(read-only; no new joins or posts)</span>
          </span>
        </label>
        {err && <p className="text-sm text-rose-500">{err}</p>}
        <button type="submit" disabled={busy || !name.trim()} className="btn-accent px-4 py-2 text-sm disabled:opacity-40">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
          {saved ? 'Saved' : 'Save changes'}
        </button>
      </form>

      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
        <p className="text-sm font-bold text-rose-600">Danger zone</p>
        <p className="mt-1 text-[13px] leading-relaxed text-rose-500">
          Deleting removes the class, its stream and its roster for everyone — permanently.
        </p>
        <button onClick={destroy} disabled={busy} className="mt-3 inline-flex items-center gap-1.5 rounded-[10px] border border-rose-300 px-4 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-40">
          <Trash2 className="h-4 w-4" /> Delete classroom
        </button>
      </div>
    </div>
  )
}
