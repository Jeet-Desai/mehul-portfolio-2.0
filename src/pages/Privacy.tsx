import PageHeader from '../components/PageHeader'
import { site, contact } from '../data/site'
import { usePageTitle } from '../lib/usePageTitle'

/* Honest privacy policy — describes exactly what the app does today: a free,
   client-side learning hub with optional login. Keep this truthful; it ships
   under Dr. Desai's name and is referenced by the Google OAuth consent screen. */
export default function Privacy() {
  usePageTitle('Privacy Policy')
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle={`How ${site.brand} handles your data. Last updated June 2026.`}
      />
      <article className="mx-auto max-w-[800px] px-4 py-10 sm:px-6">
        <Section title="The short version">
          <p>
            {site.brand} is a free learning hub for commerce students. The calculators, quizzes and formula
            sheets run <strong>entirely in your browser</strong> — anything you type into them stays on your device and
            is never sent to us. The only personal data we hold is the minimum needed to let you log in. We do not sell
            your data, and we do not run advertising trackers.
          </p>
        </Section>

        <Section title="What we collect">
          <ul>
            <li>
              <strong>If you create an account or sign in with Google:</strong> your email address, and (for Google)
              your name and profile picture. This is provided by you or by Google’s sign-in, and is stored by our
              authentication provider, Supabase, solely to identify your account.
            </li>
            <li>
              <strong>A login session</strong> is stored in your browser’s local storage so you stay signed in. You can
              clear it any time by signing out.
            </li>
            <li>
              <strong>Calculator and quiz inputs:</strong> not collected. They are processed locally in your browser and
              never transmitted to a server.
            </li>
          </ul>
        </Section>

        <Section title="What we do NOT collect">
          <ul>
            <li>We do not collect your financial figures, calculations, or quiz answers.</li>
            <li>We do not sell, rent or share your personal data with third parties for marketing.</li>
            <li>We do not use advertising or cross-site tracking cookies.</li>
          </ul>
        </Section>

        <Section title="Service providers we use">
          <ul>
            <li><strong>Supabase</strong> — authentication and session management (stores your account email/name).</li>
            <li><strong>Google</strong> — only if you choose “Sign in with Google”, to verify your identity.</li>
            <li><strong>Vercel</strong> — hosting of the website.</li>
          </ul>
          <p>Each provider processes data only to deliver its part of the service, under its own privacy terms.</p>
        </Section>

        <Section title="How we use your data">
          <p>
            Your email/name is used only to create and recognise your account and to keep you signed in. We do not use
            it to email you marketing. If we ever add features that store your work (e.g. saved calculations), this
            policy will be updated first and such storage will be clearly opt-in.
          </p>
        </Section>

        <Section title="Your choices & rights">
          <ul>
            <li>You can sign out at any time to remove the session from your device.</li>
            <li>
              You can request deletion of your account and associated data by emailing{' '}
              <a href={`mailto:${contact.email}`}>{contact.email}</a>. We will action it within a reasonable period.
            </li>
            <li>You can revoke Google access from your Google Account’s “Third-party apps” settings.</li>
          </ul>
        </Section>

        <Section title="Children & students">
          <p>
            {site.brand} is an educational resource intended for commerce students. We collect no more than the email
            and name needed to log in, and no sensitive personal information.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy? Email <a href={`mailto:${contact.email}`}>{contact.email}</a> — {site.byline}.
          </p>
        </Section>
      </article>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-slate-200 py-8 first:pt-0 last:border-b-0 last:pb-0">
      <h2 className="h2-marker mb-3 text-[22px]">{title}</h2>
      <div className="space-y-3 text-[15.5px] leading-[1.75] text-slate-600 [&_a]:font-semibold [&_a]:text-brand-600 hover:[&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-slate-800 [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  )
}
