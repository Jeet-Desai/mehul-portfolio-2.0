import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel } from '../components/calc/CalcResult'
import { formatINR, formatNum, toNum } from '../lib/format'
import { computeProcess, type ProcessInputs } from '../lib/process'

/* Seeded with M.N. Arora, Unit 9 (Process A): input 10,000 units @ ₹1 + materials
   ₹1,000 + labour ₹5,000 + expenses ₹1,050 = ₹17,050; 3% normal loss @ ₹0.25
   scrap → cost ₹1.75/unit; actual 9,500 → abnormal loss 200 units = ₹350. */
const SEED = {
  inputUnits: '10000',
  inputCost: '10000',
  addedMaterial: '1000',
  labour: '5000',
  overheads: '1050',
  normalLossPct: '3',
  scrapPerUnit: '0.25',
  actualOutput: '9500',
}

export default function Process() {
  const [f, setF] = useState(SEED)
  const set = (k: keyof typeof SEED, v: string) => setF((s) => ({ ...s, [k]: v }))

  const res = useMemo(() => {
    const inp: ProcessInputs = {
      inputUnits: toNum(f.inputUnits),
      inputCost: toNum(f.inputCost),
      addedMaterial: toNum(f.addedMaterial),
      labour: toNum(f.labour),
      overheads: toNum(f.overheads),
      normalLossPct: toNum(f.normalLossPct),
      scrapPerUnit: toNum(f.scrapPerUnit),
      actualOutput: toNum(f.actualOutput),
    }
    return computeProcess(inp)
  }, [f])

  const dr: [string, number, number][] = [
    ['To Units introduced', toNum(f.inputUnits), toNum(f.inputCost)],
    ['To Materials', 0, toNum(f.addedMaterial)],
    ['To Labour', 0, toNum(f.labour)],
    ['To Overheads', 0, toNum(f.overheads)],
    ...(res.isGain ? [['To Abnormal gain', Math.abs(res.abnormalLossUnits), res.abnormalLossValue] as [string, number, number]] : []),
  ]
  const cr: [string, number, number][] = [
    ['By Normal loss (scrap)', res.normalLossUnits, res.scrapValue],
    ...(!res.isGain && res.abnormalLossUnits > 0 ? [['By Abnormal loss', res.abnormalLossUnits, res.abnormalLossValue] as [string, number, number]] : []),
    ['By Output transferred', toNum(f.actualOutput), res.goodOutputValue],
  ]
  const drUnits = dr.reduce((a, r) => a + r[1], 0)
  const drValue = dr.reduce((a, r) => a + r[2], 0)
  const crUnits = cr.reduce((a, r) => a + r[1], 0)
  const crValue = cr.reduce((a, r) => a + r[2], 0)

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Process input & costs">
          <div className="space-y-3">
            <CalcField label="Units introduced" value={f.inputUnits} onChange={(v) => set('inputUnits', v)} />
            <CalcField label="Cost of units introduced" prefix="₹" value={f.inputCost} onChange={(v) => set('inputCost', v)} />
            <CalcField label="Materials added" prefix="₹" value={f.addedMaterial} onChange={(v) => set('addedMaterial', v)} />
            <CalcField label="Labour" prefix="₹" value={f.labour} onChange={(v) => set('labour', v)} />
            <CalcField label="Overheads / direct expenses" prefix="₹" value={f.overheads} onChange={(v) => set('overheads', v)} hint={`Total cost = ${formatINR(res.totalCost)}`} />
          </div>
        </ResultPanel>
        <ResultPanel title="Loss & output">
          <div className="space-y-3">
            <CalcField label="Normal loss (% of input)" suffix="%" value={f.normalLossPct} onChange={(v) => set('normalLossPct', v)} hint={`= ${formatNum(res.normalLossUnits)} units`} />
            <CalcField label="Scrap value per unit of loss" prefix="₹" value={f.scrapPerUnit} onChange={(v) => set('scrapPerUnit', v)} />
            <CalcField label="Actual output" value={f.actualOutput} onChange={(v) => set('actualOutput', v)} hint={`Expected (normal) output = ${formatNum(res.expectedOutput)} units`} />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label="Cost per unit (good output)"
          value={formatINR(res.costPerUnit)}
          sub={`${res.isGain ? 'Abnormal gain' : 'Abnormal loss'} ${formatNum(Math.abs(res.abnormalLossUnits))} units = ${formatINR(res.abnormalLossValue)} · output ${formatINR(res.goodOutputValue)}`}
          tone={res.isGain ? 'mint' : 'brand'}
        />

        <ResultPanel title="Process Account">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] text-sm">
              <tbody>
                <tr className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  <td className="py-1">Particulars</td><td className="py-1 text-right">Units</td><td className="py-1 text-right">Amount</td>
                  <td className="py-1 pl-4">Particulars</td><td className="py-1 text-right">Units</td><td className="py-1 text-right">Amount</td>
                </tr>
                {Array.from({ length: Math.max(dr.length, cr.length) }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <Cell text={dr[i]?.[0]} /><Num n={dr[i]?.[1]} /><Amt n={dr[i]?.[2]} />
                    <Cell text={cr[i]?.[0]} pad /><Num n={cr[i]?.[1]} /><Amt n={cr[i]?.[2]} />
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-200 font-bold">
                  <td className="py-1.5">Total</td><td className="py-1.5 text-right tabular-nums">{formatNum(drUnits)}</td><td className="py-1.5 text-right tabular-nums">{formatINR(drValue)}</td>
                  <td className="py-1.5 pl-4">Total</td><td className="py-1.5 text-right tabular-nums">{formatNum(crUnits)}</td><td className="py-1.5 text-right tabular-nums">{formatINR(crValue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ResultPanel>

        <CalcSteps steps={res.steps} />

        <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Normal loss is unavoidable, so its cost is spread over good output (only its scrap value is credited).
            Abnormal loss/gain is valued at the same cost per unit and taken to the costing P&L, keeping the cost of
            good production stable. Abnormal <strong>gain</strong> appears on the debit side of the process account.
          </span>
        </div>
      </div>
    </div>
  )
}

function Cell({ text, pad }: { text?: string; pad?: boolean }) {
  return <td className={`py-1.5 ${pad ? 'pl-4' : ''} ${text ? 'text-slate-700' : ''}`}>{text ?? ''}</td>
}
function Num({ n }: { n?: number }) {
  return <td className="py-1.5 text-right tabular-nums text-slate-500">{n ? formatNum(n) : ''}</td>
}
function Amt({ n }: { n?: number }) {
  return <td className="py-1.5 text-right tabular-nums font-semibold text-slate-700">{n ? formatINR(n) : ''}</td>
}
