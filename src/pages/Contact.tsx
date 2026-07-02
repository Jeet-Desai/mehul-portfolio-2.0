import { useState } from 'react'
import { Mail, MapPin, Clock, Languages, Send } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { contact, professor } from '../data/site'
import { usePageTitle } from '../lib/usePageTitle'

const items = [
  { icon: Mail, label: 'E-mail', value: contact.email },
  { icon: MapPin, label: 'Office address', value: contact.address },
  { icon: Clock, label: 'Office hours', value: contact.hours },
  { icon: Languages, label: 'Languages', value: professor.languages.join(', ') },
]

export default function Contact() {
  usePageTitle('Contact')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  // Phase 0: open the user's mail client. Firestore wiring lands with the backend phase.
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body = `From: ${form.name} (${form.email})%0D%0A%0D%0A${encodeURIComponent(form.message)}`
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(
      form.subject || 'Message from AccrualSense',
    )}&body=${body}`
  }

  const field =
    'w-full rounded-[9px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100'

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in"
        titleAccent="touch."
        subtitle="Questions, feedback, or collaboration — reach out."
      />

      <Reveal>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
          <div>
            {/* hairline info rows */}
            <div className="cl-card divide-y divide-slate-200">
              {items.map((it) => (
                <div key={it.label} className="flex items-start gap-4 p-5">
                  <it.icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand-600" />
                  <div>
                    <p className="font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      {it.label}
                    </p>
                    <p className="mt-1 text-[15px] font-medium text-slate-900">{it.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="cl-card space-y-4 p-6 sm:p-7">
            <h2 className="text-2xl">Send a message</h2>
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
            <button type="submit" className="btn-accent w-full px-5 py-3 text-sm">
              <Send className="h-4 w-4" /> Send message
            </button>
          </form>
        </div>
      </Reveal>
    </>
  )
}
