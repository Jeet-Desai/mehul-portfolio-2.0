import { useMemo, useState } from 'react'
import { Info, CheckCircle2 } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel } from '../components/calc/CalcResult'
import { formatINR, formatPct, toNum } from '../lib/format'
import { computeContract, type ContractInputs } from '../lib/contract'

/* Seeded with M.N. Arora, Illustration 10.1 (Raja Construction Ltd, 2018):
   notional profit ₹60,000; work certified ₹4,00,000 (40% of ₹10,00,000) →
   ⅓ × 60,000 × 90% cash ratio = ₹18,000 to P&L. */
const SEED = {
  contractPrice: '1000000',
  materials: '50000',
  labour: '300000',
  plantIssued: '20000',
  expenses: '0',
  overheads: '0',
  materialsReturned: '5000',
  materialsAtSite: '0',
  plantAtSite: '15000',
  workUncertified: '10000',
  workCertified: '400000',
  cashReceived: '360000',
}

export default function Contract() {
  const [f, setF] = useState(SEED)
  const set = (k: keyof typeof SEED, v: string) => setF((s) => ({ ...s, [k]: v }))

  const res = useMemo(() => {
    const inp: ContractInputs = {
      contractPrice: toNum(f.contractPrice),
      materials: toNum(f.materials),
      labour: toNum(f.labour),
      plantIssued: toNum(f.plantIssued),
      expenses: toNum(f.expenses),
      overheads: toNum(f.overheads),
      materialsReturned: toNum(f.materialsReturned),
      materialsAtSite: toNum(f.materialsAtSite),
      plantAtSite: toNum(f.plantAtSite),
      workUncertified: toNum(f.workUncertified),
      workCertified: toNum(f.workCertified),
      cashReceived: toNum(f.cashReceived),
    }
    return computeContract(inp)
  }, [f])

  const np = res.notionalProfit
  const dr: [string, number][] = [
    ['To Materials', toNum(f.materials)],
    ['To Labour', toNum(f.labour)],
    ['To Plant issued', toNum(f.plantIssued)],
    ['To Direct expenses', toNum(f.expenses)],
    ['To Overheads', toNum(f.overheads)],
    ...(np >= 0 ? [['To Notional profit c/d', np] as [string, number]] : []),
  ]
  const cr: [string, number][] = [
    ['By Materials returned / damaged', toNum(f.materialsReturned)],
    ['By Materials at site c/d', toNum(f.materialsAtSite)],
    ['By Plant at site c/d', toNum(f.plantAtSite)],
    ['By WIP — Work certified', toNum(f.workCertified)],
    ['By WIP — Work uncertified', toNum(f.workUncertified)],
    ...(np < 0 ? [['By Notional loss c/d', -np] as [string, number]] : []),
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Contract & costs to date">
          <div className="space-y-3">
            <CalcField label="Contract price" prefix="₹" value={f.contractPrice} onChange={(v) => set('contractPrice', v)} />
            <CalcField label="Materials issued" prefix="₹" value={f.materials} onChange={(v) => set('materials', v)} />
            <CalcField label="Labour" prefix="₹" value={f.labour} onChange={(v) => set('labour', v)} />
            <CalcField label="Plant issued" prefix="₹" value={f.plantIssued} onChange={(v) => set('plantIssued', v)} />
            <CalcField label="Direct expenses" prefix="₹" value={f.expenses} onChange={(v) => set('expenses', v)} />
            <CalcField label="Overheads" prefix="₹" value={f.overheads} onChange={(v) => set('overheads', v)} />
          </div>
        </ResultPanel>
        <ResultPanel title="Closing balances (credited)">
          <div className="space-y-3">
            <CalcField label="Materials returned / damaged" prefix="₹" value={f.materialsReturned} onChange={(v) => set('materialsReturned', v)} />
            <CalcField label="Materials at site (closing)" prefix="₹" value={f.materialsAtSite} onChange={(v) => set('materialsAtSite', v)} />
            <CalcField label="Plant at site (after depreciation)" prefix="₹" value={f.plantAtSite} onChange={(v) => set('plantAtSite', v)} />
            <CalcField label="Work uncertified (at cost)" prefix="₹" value={f.workUncertified} onChange={(v) => set('workUncertified', v)} />
          </div>
        </ResultPanel>
        <ResultPanel title="Work-in-progress">
          <div className="space-y-3">
            <CalcField label="Work certified (at contract price)" prefix="₹" value={f.workCertified} onChange={(v) => set('workCertified', v)} />
            <CalcField label="Cash received" prefix="₹" value={f.cashReceived} onChange={(v) => set('cashReceived', v)} hint={`Cash ratio = ${formatPct(res.cashRatio * 100)}`} />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label={res.isLoss ? 'Notional loss' : 'Profit credited to P&L A/c'}
          value={formatINR(res.isLoss ? res.notionalProfit : res.transfer)}
          sub={res.isLoss ? 'A notional loss goes to P&L in full' : `Notional profit ${formatINR(res.notionalProfit)} · reserve ${formatINR(res.reserve)} · stage ${formatPct(res.stage * 100)}`}
          tone={res.isLoss ? 'sun' : 'mint'}
        />

        <ResultPanel title="Contract Account">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Dr</p>
              <div className="divide-y divide-slate-100">
                {dr.map(([l, v]) => (
                  <Row key={l} label={l} value={v} accent={l.includes('Notional')} />
                ))}
                <Row label="Total" value={res.totalDebits} strong />
              </div>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Cr</p>
              <div className="divide-y divide-slate-100">
                {cr.map(([l, v]) => (
                  <Row key={l} label={l} value={v} accent={l.includes('Notional')} />
                ))}
                <Row label="Total" value={res.totalCredits} strong />
              </div>
            </div>
          </div>
        </ResultPanel>

        <ResultPanel title="Profit to transfer to P&L">
          <div className="flex items-start gap-2 rounded-xl bg-mint-50 p-3 text-sm text-mint-700 dark:bg-mint-500/10 dark:text-mint-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{res.rule}</span>
          </div>
        </ResultPanel>

        <CalcSteps steps={res.steps} />

        <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Notional profit is the contract account’s balancing figure. Prudence forbids taking it all to P&L while the
            contract is incomplete — the further it has progressed and the more cash collected, the larger the share
            recognised. Work certified is valued at contract price (with profit); work uncertified at cost only.
          </span>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, strong, accent }: { label: string; value: number; strong?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className={`${strong ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{label}</span>
      <span className={`shrink-0 tabular-nums ${accent ? 'font-extrabold text-brand-700' : strong ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
        {formatINR(value)}
      </span>
    </div>
  )
}
