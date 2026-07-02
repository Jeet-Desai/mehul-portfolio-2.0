import { useMemo } from 'react'
import { AlertTriangle, ArrowRight, Wallet } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, toNum } from '../lib/format'
import { useCalcState } from '../lib/urlState'
import { computeItcSetOff, type Head } from '../lib/gstItc'
import type { Step } from './types'

const HEADS: { key: Head; label: string }[] = [
  { key: 'IGST', label: 'IGST' },
  { key: 'CGST', label: 'CGST' },
  { key: 'SGST', label: 'SGST / UTGST' },
]

export default function GstItc() {
  // output tax liability
  const [li, setLi] = useCalcState('li', '30000')
  const [lc, setLc] = useCalcState('lc', '20000')
  const [ls, setLs] = useCalcState('ls', '20000')
  // input tax credit available
  const [ci, setCi] = useCalcState('ci', '40000')
  const [cc, setCc] = useCalcState('cc', '8000')
  const [cs, setCs] = useCalcState('cs', '8000')

  const r = useMemo(
    () =>
      computeItcSetOff(
        { igst: toNum(li), cgst: toNum(lc), sgst: toNum(ls) },
        { igst: toNum(ci), cgst: toNum(cc), sgst: toNum(cs) },
      ),
    [li, lc, ls, ci, cc, cs],
  )

  const fullySetOff = r.totalCash === 0 && r.totalLiability > 0

  const steps: Step[] = useMemo(() => {
    const s: Step[] = [
      {
        label: 'Rule: use IGST credit first, fully, before any CGST / SGST credit',
        formula: 'IGST credit → IGST liability, then → CGST and SGST (any order)',
        result: 'Section 49A + Rule 88A',
        note: 'CGST credit can never pay SGST, and SGST credit can never pay CGST.',
      },
    ]
    for (const m of r.moves) {
      s.push({
        label: `${m.from} credit → ${m.to} liability`,
        formula: `Set off ${formatINR(m.amount)} of ${m.from} credit against ${m.to} output tax`,
        result: formatINR(m.amount),
        note:
          m.from === 'IGST' && m.to !== 'IGST'
            ? 'Remaining IGST credit is the flexible credit — applied where own-head credit fell short.'
            : undefined,
      })
    }
    s.push({
      label: 'Balance liability is paid in cash; unused credit carries forward',
      formula: `Cash = ${formatINR(r.cash.igst)} IGST + ${formatINR(r.cash.cgst)} CGST + ${formatINR(r.cash.sgst)} SGST`,
      result: `Total cash payable = ${formatINR(r.totalCash)}`,
      note:
        r.carryForward.igst + r.carryForward.cgst + r.carryForward.sgst > 0
          ? `Carried forward: ${formatINR(r.carryForward.igst)} IGST · ${formatINR(r.carryForward.cgst)} CGST · ${formatINR(r.carryForward.sgst)} SGST.`
          : 'No credit left to carry forward.',
    })
    return s
  }, [r])

  const Num = ({ v }: { v: number }) =>
    v > 0 ? <span className="text-slate-700">{formatINR(v)}</span> : <span className="text-slate-300">—</span>

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Output tax liability">
          <div className="space-y-3">
            <CalcField label="IGST payable" prefix="₹" value={li} onChange={setLi} />
            <CalcField label="CGST payable" prefix="₹" value={lc} onChange={setLc} />
            <CalcField label="SGST / UTGST payable" prefix="₹" value={ls} onChange={setLs} />
          </div>
        </ResultPanel>

        <div className="mt-4">
          <ResultPanel title="Input tax credit available">
            <div className="space-y-3">
              <CalcField label="IGST credit" prefix="₹" value={ci} onChange={setCi} />
              <CalcField label="CGST credit" prefix="₹" value={cc} onChange={setCc} />
              <CalcField label="SGST / UTGST credit" prefix="₹" value={cs} onChange={setCs} />
            </div>
          </ResultPanel>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Simplified for learning under the set-off rules (s.49A / Rule 88A). Remaining IGST credit may be
            apportioned to CGST/SGST in any proportion — this tool picks the cash-minimising split. GST cess,
            blocked credits (s.17(5)) and the reverse-charge ledger are not modelled.
          </span>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <div className="grid gap-4 sm:grid-cols-2">
          <HeroResult
            label="Total cash payable"
            value={formatINR(r.totalCash)}
            sub={fullySetOff ? 'fully set off by credit' : `of ${formatINR(r.totalLiability)} liability`}
          />
          <HeroResult
            label="Credit carried forward"
            value={formatINR(r.carryForward.igst + r.carryForward.cgst + r.carryForward.sgst)}
            sub="unused ITC → next period"
            tone="mint"
          />
        </div>

        <ResultPanel title="How each liability is discharged">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-left uppercase tracking-wide text-slate-400">
                  <th className="py-1.5 pr-2 font-semibold">Liability</th>
                  <th className="py-1.5 px-2 text-right font-semibold">Amount</th>
                  <th className="py-1.5 px-2 text-right font-semibold">IGST cr</th>
                  <th className="py-1.5 px-2 text-right font-semibold">CGST cr</th>
                  <th className="py-1.5 px-2 text-right font-semibold">SGST cr</th>
                  <th className="py-1.5 pl-2 text-right font-semibold">Cash</th>
                </tr>
              </thead>
              <tbody>
                {r.rows.map((row) => (
                  <tr key={row.head} className="border-b border-slate-50">
                    <td className="py-2 pr-2 font-semibold text-slate-700">{row.head}</td>
                    <td className="py-2 px-2 text-right text-slate-700">
                      <Num v={row.liability} />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <Num v={row.fromIgst} />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <Num v={row.fromCgst} />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <Num v={row.fromSgst} />
                    </td>
                    <td className="py-2 pl-2 text-right font-semibold">
                      {row.cash > 0 ? (
                        <span className="text-rose-500">{formatINR(row.cash)}</span>
                      ) : (
                        <span className="text-mint-600">₹0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 font-semibold text-slate-600">
                  <td className="py-2 pr-2">Credit used</td>
                  <td className="py-2 px-2 text-right text-slate-400">—</td>
                  <td className="py-2 px-2 text-right">
                    <Num v={r.creditUsed.igst} />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <Num v={r.creditUsed.cgst} />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <Num v={r.creditUsed.sgst} />
                  </td>
                  <td className="py-2 pl-2 text-right text-rose-500">{formatINR(r.totalCash)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <ArrowRight className="h-3.5 w-3.5" />
            IGST credit is spread across heads first; each head's own credit then covers its shortfall.
          </p>
        </ResultPanel>

        <ResultPanel title="Cash & carry-forward summary">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Wallet className="h-3.5 w-3.5" /> Cash payable
              </p>
              {HEADS.map((h) => (
                <ResultRow
                  key={h.key}
                  label={h.label}
                  value={formatINR(r.cash[h.key.toLowerCase() as 'igst' | 'cgst' | 'sgst'])}
                />
              ))}
              <div className="my-1 border-t border-slate-100" />
              <ResultRow label="Total cash" value={formatINR(r.totalCash)} strong />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Credit carried forward
              </p>
              {HEADS.map((h) => (
                <ResultRow
                  key={h.key}
                  label={h.label}
                  value={formatINR(r.carryForward[h.key.toLowerCase() as 'igst' | 'cgst' | 'sgst'])}
                />
              ))}
              <div className="my-1 border-t border-slate-100" />
              <ResultRow
                label="Total carried forward"
                value={formatINR(
                  r.carryForward.igst + r.carryForward.cgst + r.carryForward.sgst,
                )}
                strong
              />
            </div>
          </div>
        </ResultPanel>

        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
