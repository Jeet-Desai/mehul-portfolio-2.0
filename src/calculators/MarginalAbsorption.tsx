import { useMemo } from 'react'
import { Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel } from '../components/calc/CalcResult'
import { formatINR, formatNum, toNum } from '../lib/format'
import { computeMarginalAbsorption, type MaStatement } from '../lib/marginalAbsorption'
import { useCalcState } from '../lib/urlState'

/* Income statements under both methods, side by side, with the textbook
   profit reconciliation: difference = stock change × fixed OH rate. */

function Statement({ title, s }: { title: string; s: MaStatement }) {
  return (
    <ResultPanel title={title}>
      <div className="divide-y divide-slate-100">
        {s.lines.map((l, i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-2">
            <span className={`text-[13px] ${l.op === '=' ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
              {l.op && l.op !== '=' && <span className="mr-1.5 text-slate-400">{l.op}</span>}
              {l.label}
            </span>
            <span
              className={`shrink-0 tabular-nums ${
                l.op === '=' ? 'font-display text-[15px] font-semibold text-brand-600' : 'text-[13px] font-semibold text-slate-800'
              }`}
            >
              {formatINR(l.amount)}
            </span>
          </div>
        ))}
      </div>
    </ResultPanel>
  )
}

export default function MarginalAbsorption() {
  const [produced, setProduced] = useCalcState('up', '10000')
  const [sold, setSold] = useCalcState('us', '8000')
  const [opening, setOpening] = useCalcState('os', '0')
  const [sp, setSp] = useCalcState('sp', '100')
  const [vc, setVc] = useCalcState('vc', '40')
  const [foh, setFoh] = useCalcState('fo', '200000')
  const [normal, setNormal] = useCalcState('nc', '10000')
  const [vsell, setVsell] = useCalcState('vs', '5')
  const [fsell, setFsell] = useCalcState('fs', '50000')

  const res = useMemo(
    () =>
      computeMarginalAbsorption({
        unitsProduced: toNum(produced),
        unitsSold: toNum(sold),
        openingStock: toNum(opening),
        sellingPrice: toNum(sp),
        variableCostPerUnit: toNum(vc),
        fixedMfgOverhead: toNum(foh),
        normalCapacity: toNum(normal) || toNum(produced),
        varSellingPerUnit: toNum(vsell),
        fixedSelling: toNum(fsell),
      }),
    [produced, sold, opening, sp, vc, foh, normal, vsell, fsell],
  )

  const diff = res.profitDifference

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Production & sales">
          <div className="space-y-3">
            <CalcField label="Units produced" value={produced} onChange={setProduced} />
            <CalcField label="Units sold" value={sold} onChange={setSold} hint={`Closing stock = ${formatNum(res.closingStock, 0)} units`} />
            <CalcField label="Opening stock (units)" value={opening} onChange={setOpening} hint="Valued at the same cost rates as current production" />
            <CalcField label="Selling price per unit" prefix="₹" value={sp} onChange={setSp} />
          </div>
        </ResultPanel>
        <ResultPanel title="Costs">
          <div className="space-y-3">
            <CalcField label="Variable manufacturing cost per unit" prefix="₹" value={vc} onChange={setVc} hint="Direct material + direct labour + variable overhead" />
            <CalcField label="Fixed manufacturing overhead" prefix="₹" value={foh} onChange={setFoh} />
            <CalcField
              label="Normal capacity (units)"
              value={normal}
              onChange={setNormal}
              hint={`Absorption rate = ${formatINR(res.fohRate)} per unit · sets under/over-absorption`}
            />
            <CalcField label="Variable selling & admin per unit sold" prefix="₹" value={vsell} onChange={setVsell} />
            <CalcField label="Fixed selling & admin" prefix="₹" value={fsell} onChange={setFsell} />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label="Profit difference (absorption − marginal)"
          value={formatINR(diff)}
          sub={
            diff > 0
              ? `Absorption reports more — ${formatNum(res.closingStock - toNum(opening), 0)} units of stock growth carry ${formatINR(res.fohRate)} of fixed OH each into next period`
              : diff < 0
                ? 'Marginal reports more — falling stock released fixed overhead absorbed in earlier periods'
                : 'Production equals sales, so both methods agree'
          }
          tone="brand"
        />

        <div className="grid gap-4 xl:grid-cols-2">
          <Statement title="Marginal (variable) costing statement" s={res.marginal} />
          <Statement title="Absorption (full) costing statement" s={res.absorption} />
        </div>

        <CalcSteps steps={[...res.steps, ...res.reconciliation]} />

        <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            The whole exam question in one line: <strong>absorption profit moves with production, marginal profit moves
            with sales.</strong> When stock rises, absorption looks more profitable (fixed overhead hides in closing
            stock); when stock falls, the deferred overhead comes home. AS 2 / Ind AS 2 require absorption costing for
            external reporting — marginal costing is for internal decisions.
          </span>
        </div>
      </div>
    </div>
  )
}
