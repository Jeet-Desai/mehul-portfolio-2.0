import PageHeader from '../components/PageHeader'
import { site, contact, professor } from '../data/site'
import { usePageTitle } from '../lib/usePageTitle'

/* Honest terms of service for a free educational tool. */
export default function Terms() {
  usePageTitle('Terms of Service')
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        subtitle={`The terms for using ${site.brand}. Last updated June 2026.`}
      />
      <article className="mx-auto max-w-[800px] px-4 py-10 sm:px-6">
        <Section title="1. Acceptance">
          <p>
            By using {site.brand} ({site.byline}), you agree to these terms. If you do not agree, please do not use the
            site. The service is provided free of charge for educational use.
          </p>
        </Section>

        <Section title="2. What the service is">
          <p>
            {site.brand} is a free learning hub for commerce students — interactive calculators, practice quizzes,
            formula sheets, study notes and an optional AI doubt-tutor. It is an educational aid, not professional
            advice.
          </p>
        </Section>

        <Section title="3. Educational use only — not professional advice">
          <p>
            The calculators and content are for learning and self-study. While prepared carefully and grounded in
            standard texts, they may contain errors and statutory rates change over time. <strong>Do not rely on the
            outputs for filing taxes, making investment decisions, or any real financial or legal action.</strong> Always
            verify against official sources and consult a qualified professional. {site.brand} and {professor.name}{' '}
            accept no liability for decisions taken based on the site.
          </p>
        </Section>

        <Section title="4. Accounts">
          <p>
            Some features require you to sign in with an email and password or with Google. You are responsible for
            keeping your login credentials secure. Provide accurate information and do not impersonate others. We may
            suspend accounts that abuse the service.
          </p>
        </Section>

        <Section title="5. Acceptable use">
          <ul>
            <li>Use the site for personal, educational purposes.</li>
            <li>Do not attempt to disrupt, attack, scrape at scale, or reverse-engineer the service.</li>
            <li>Do not misuse the AI tutor to generate harmful, unlawful, or abusive content.</li>
          </ul>
        </Section>

        <Section title="6. Intellectual property">
          <p>
            The content and design are the work of {professor.name} and contributors, provided for your personal study.
            You may use and share links freely; please do not republish the material as your own.
          </p>
        </Section>

        <Section title="7. Availability & changes">
          <p>
            The service is provided “as is” and “as available”, without warranties of any kind. We may add, change or
            remove features, and may update these terms. Continued use after a change means you accept the updated
            terms.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            Questions about these terms? Email <a className="font-semibold text-brand-600 hover:underline" href={`mailto:${contact.email}`}>{contact.email}</a>.
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
      <div className="space-y-3 text-[15.5px] leading-[1.75] text-slate-600 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-slate-800 [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  )
}
