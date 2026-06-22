import { useState } from 'react'
import { Mail, MapPin, Clock, Languages, Send } from 'lucide-react'
import { Facebook, Instagram } from '../components/BrandIcons'
import PageHeader from '../components/PageHeader'
import { contact, professor } from '../data/site'

const items = [
  { icon: Mail, label: 'E-mail', value: contact.email },
  { icon: MapPin, label: 'Office address', value: contact.address },
  { icon: Clock, label: 'Office hours', value: contact.hours },
  { icon: Languages, label: 'Languages', value: professor.languages.join(', ') },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  // Phase 0: open the user's mail client. Firestore wiring lands with the backend phase.
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body = `From: ${form.name} (${form.email})%0D%0A%0D%0A${encodeURIComponent(form.message)}`
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(
      form.subject || 'Message from CommerceLab',
    )}&body=${body}`
  }

  const field =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

  return (
    <>
      <PageHeader eyebrow="Contact" title="Get in touch" subtitle="Questions, feedback, or collaboration — reach out." />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div>
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.label} className="cl-card flex items-start gap-4 p-5 hover:translate-y-0">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <it.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {it.label}
                  </p>
                  <p className="font-medium text-slate-700">{it.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            <a
              href={contact.socials.facebook}
              target="_blank"
              rel="noreferrer"
              className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href={contact.socials.instagram}
              target="_blank"
              rel="noreferrer"
              className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        <form onSubmit={onSubmit} className="cl-card space-y-4 p-6 hover:translate-y-0">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Name"
              className={field}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              required
              type="email"
              placeholder="E-mail"
              className={field}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <input
            required
            placeholder="Subject"
            className={field}
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <textarea
            required
            rows={6}
            placeholder="Message"
            className={field}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
          >
            <Send className="h-4 w-4" /> Send message
          </button>
        </form>
      </div>
    </>
  )
}
