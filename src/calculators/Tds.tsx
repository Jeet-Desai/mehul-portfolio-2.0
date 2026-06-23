import { useMemo, useState } from 'react'
import { AlertTriangle, Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatPct, toNum } from '../lib/format'
import { TDS_SECTIONS, computeTds, noPanRateFor, type TdsSection } from '../lib/tds'
import type { Step } from './types'

const fmtPctRate = (r: number) => formatPct(r, r % 1 === 0 ? 0 : 1)

export default function Tds() {
  const [code, setCode] = useState(TDS_SECTIONS.find((s) => s.code === '194J')!.code)
  const [amount, setAmount] = useState('80000')
  const [rateIdx, setRateIdx] = useState(0)
  const [hasPan, setHasPan] = useState(true)
  const [senior, setSenior] = useState(false)
  const [aggregate, setAggregate] = useState('')

  const section = useMemo<TdsSection>(
    () => TDS_SECTIONS.find((s) => s.code === code) ?? TDS_SECTIONS[0],
    [code],
  )

  const onSection = (newCode: string) => {
    setCode(newCode)
    setRateIdx(0) // reset payee-type choice for the new section
  }

  const rate = section.rates[Math.min(rateIdx, section.rates.length - 1)]

  const r = useMemo(
    () =>
      computeTds({
        section,
        amount: toNum(amount),
        rateValue: rate.value,
        hasPan,
        seniorCitizen: senior,
        aggregateAmount: toNum(aggregate),
      }),
    [section, amount, rate.value, hasPan, senior, aggregate],
  )

  const amt = toNum(amount)
  const noPanRate = noPanRateFor(section, rate.value)

  const steps: Step[] = [
    {
      label: `Identify the section → ${section.code}`,
      formula: section.nature,
      result: `${section.title.split('—')[1]?.trim() ?? section.title}`,
    },
    {
      label: 'Check the threshold',
      formula: `Payment ${formatINR(amt)} vs threshold ${formatINR(r.threshold)} (${section.basis})${
        section.aggregateThreshold
          ? ` · aggregate ${formatINR(toNum(aggregate))} vs ${formatINR(section.aggregateThreshold)}`
          : ''
      }`,
      result: r.applies ? 'Threshold crossed → deduct TDS' : 'Within threshold → no TDS',
      note: r.applies
        ? section.aggregateThreshold
          ? r.crossedBy === 'aggregate'
            ? 'The single payment is within ₹30,000, but the yearly aggregate crosses ₹1,00,000.'
            : 'The single payment exceeds ₹30,000.'
          : section.taxableOn === 'excess'
            ? 'TDS is charged only on the amount above the threshold.'
            : 'Once the threshold is crossed, TDS applies to the entire amount (not just the excess).'
        : 'No tax need be deducted at source for this payment.',
    },
    ...(r.applies
      ? [
          {
            label: 'Apply the rate',
            formula: `${formatINR(r.taxableAmount)} × ${fmtPctRate(r.effectiveRate)}${
              r.noPan ? ' (no-PAN rate, §206AA)' : ''
            }`,
            result: `TDS = ${formatINR(r.tds)}`,
            note: r.noPan
              ? `PAN not furnished → §206AA applies the higher of the section rate or ${fmtPctRate(noPanRate)}.`
              : `${rate.label} rate for section ${section.code}.`,
          } as Step,
          {
            label: 'Net amount paid to the payee = Gross − TDS',
            formula: `${formatINR(amt)} − ${formatINR(r.tds)}`,
            result: formatINR(r.net),
          } as Step,
        ]
      : []),
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">TDS section</span>
              <select
                value={code}
                onChange={(e) => onSection(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                {TDS_SECTIONS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>

            <CalcField
              label="Payment amount"
              prefix="₹"
              value={amount}
              onChange={setAmount}
              hint={`Threshold for this section: ${formatINR(r.threshold)} (${section.basis})`}
            />

            {section.rates.length > 1 && (
              <div>
                <span className="text-sm font-semibold text-slate-700">Payee / payment type</span>
                <div className="mt-1.5 flex flex-col gap-1.5">
                  {section.rates.map((o, i) => (
                    <button
                      key={o.label}
                      onClick={() => setRateIdx(i)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                        i === rateIdx
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{o.label}</span>
                      <span className={i === rateIdx ? 'text-white/90' : 'text-slate-400'}>
                        {fmtPctRate(o.value)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {section.aggregateThreshold != null && (
              <CalcField
                label="Aggregate payments this year (optional)"
                prefix="₹"
                value={aggregate}
                onChange={setAggregate}
                hint="Total paid to this contractor during the FY — TDS also triggers if this crosses ₹1,00,000."
              />
            )}

            {section.seniorThreshold != null && (
              <label className="flex items-center gap-2 rounded-xl bg-mint-50 p-3 text-sm font-medium text-mint-700">
                <input
                  type="checkbox"
                  checked={senior}
                  onChange={(e) => setSenior(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                />
                Payee is a senior citizen (threshold ₹1,00,000)
              </label>
            )}

            <label className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={hasPan}
                onChange={(e) => setHasPan(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
              />
              PAN of the payee is available
            </label>
          </div>
        </ResultPanel>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <b>FY 2025-26 (AY 2026-27)</b> rates for <b>resident</b> payees, simplified for learning. Surcharge,
            cess, lower/nil-deduction certificates and section-specific exemptions are not modelled. Verify with
            the latest Finance Act or a CA before deducting.
          </span>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <div className="grid gap-4 sm:grid-cols-2">
          <HeroResult
            label="TDS to deduct"
            value={formatINR(r.tds)}
            sub={r.applies ? `${fmtPctRate(r.effectiveRate)} of ${formatINR(r.taxableAmount)}` : 'below threshold'}
          />
          <HeroResult
            label="Net paid to payee"
            value={formatINR(r.net)}
            sub={r.applies ? `after ${formatINR(r.tds)} TDS` : 'no deduction'}
            tone="mint"
          />
        </div>

        <ResultPanel title="Working">
          <ResultRow label="Gross payment" value={formatINR(amt)} />
          <ResultRow label={`Threshold (${section.basis})`} value={formatINR(r.threshold)} />
          <ResultRow label="TDS applicable?" value={r.applies ? 'Yes' : 'No'} />
          {r.applies && (
            <>
              <ResultRow label="Amount liable to TDS" value={formatINR(r.taxableAmount)} />
              <ResultRow
                label={`TDS rate${r.noPan ? ' (no PAN, §206AA)' : ''}`}
                value={fmtPctRate(r.effectiveRate)}
              />
              <ResultRow label="TDS" value={formatINR(r.tds)} />
            </>
          )}
          <div className="my-1 border-t border-slate-100" />
          <ResultRow label="Net amount payable" value={formatINR(r.net)} strong />
        </ResultPanel>

        <div className="cl-card p-6 hover:translate-y-0">
          <h3 className="flex items-center gap-2 text-base font-bold">
            <Info className="h-5 w-5 text-brand-600" />
            Section {section.code} at a glance
          </h3>
          <p className="mt-2 text-sm text-slate-600">{section.nature}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {section.rates.map((o) => (
              <span key={o.label} className="cl-pill bg-brand-50 text-brand-700">
                {o.label}: {fmtPctRate(o.value)}
              </span>
            ))}
            <span className="cl-pill bg-slate-100 text-slate-600">Threshold {formatINR(section.threshold)}</span>
            {section.seniorThreshold && (
              <span className="cl-pill bg-slate-100 text-slate-600">
                Senior {formatINR(section.seniorThreshold)}
              </span>
            )}
            <span className="cl-pill bg-rose-50 text-rose-600">No PAN: {fmtPctRate(noPanRate)}</span>
          </div>
          {section.notes && section.notes.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {section.notes.map((n, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-500">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                  {n}
                </li>
              ))}
            </ul>
          )}
        </div>

        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
