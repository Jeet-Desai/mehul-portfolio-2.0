import { useMemo, useState } from 'react'
import { Trophy, AlertTriangle } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatPct, toNum } from '../lib/format'
import { computeCapitalGains, type AssetType, type CGResult } from '../lib/capitalGains'
import { useCalcState } from '../lib/urlState'
import type { Step } from './types'

/** Parse a 'YYYY-MM-DD' input value as a LOCAL date (noon, to dodge DST/UTC edges)
    so the financial-year and holding-period logic is timezone-independent. */
function parseLocalDate(v: string): Date {
  const [y, m, d] = v.split('-').map(Number)
  if (!y || !m || !d) return new Date(NaN)
  return new Date(y, m - 1, d, 12, 0, 0)
}

function holdingLabel(p: Date, s: Date): string {
  let months = (s.getFullYear() - p.getFullYear()) * 12 + (s.getMonth() - p.getMonth())
  if (s.getDate() < p.getDate()) months -= 1
  if (months < 0) return '—'
  const y = Math.floor(months / 12)
  const mo = months % 12
  return [y ? `${y} yr` : '', mo ? `${mo} mo` : '', !y && !mo ? '< 1 mo' : ''].filter(Boolean).join(' ')
}

export default function CapitalGains() {
  const [assetTypeStr, setAssetTypeStr] = useCalcState('asset', 'equity')
  const assetType: AssetType = assetTypeStr === 'other' ? 'other' : 'equity'
  const setAssetType = (v: AssetType) => setAssetTypeStr(v)
  const [purchase, setPurchase] = useCalcState('buy', '200000')
  const [sale, setSale] = useCalcState('sell', '500000')
  const [expenses, setExpenses] = useCalcState('exp', '0')
  const [purchaseDate, setPurchaseDate] = useCalcState('bd', '2022-06-01')
  const [saleDate, setSaleDate] = useCalcState('sd', '2025-08-01')
  const [landBuildingStr, setLandBuildingStr] = useCalcState('lb', '0')
  const landBuilding = landBuildingStr === '1'
  const setLandBuilding = (v: boolean) => setLandBuildingStr(v ? '1' : '0')
  const [slabRate, setSlabRate] = useCalcState('slab', '30')

  const m = useMemo(() => {
    const pDate = parseLocalDate(purchaseDate)
    const sDate = parseLocalDate(saleDate)
    const datesValid = !Number.isNaN(pDate.getTime()) && !Number.isNaN(sDate.getTime()) && sDate > pDate
    if (!datesValid) return { valid: false } as { valid: false }
    const res = computeCapitalGains({
      assetType,
      purchase: toNum(purchase),
      sale: toNum(sale),
      expenses: toNum(expenses),
      purchaseDate: pDate,
      saleDate: sDate,
      landBuildingOption: assetType === 'other' && landBuilding,
      slabRatePct: toNum(slabRate),
    })
    return { ...res, pDate, sDate, hold: holdingLabel(pDate, sDate) }
  }, [assetType, purchase, sale, expenses, purchaseDate, saleDate, landBuilding, slabRate])

  const valid = m.valid
  const r = valid ? (m as CGResult & { pDate: Date; sDate: Date; hold: string }) : null

  const steps: Step[] = r
    ? [
        {
          label: `Holding period → ${r.term}`,
          formula: `${r.hold} held · threshold for this asset = ${r.thresholdMonths} months`,
          result: r.longTerm ? 'Long-term' : 'Short-term',
          note:
            assetType === 'equity'
              ? 'Listed equity / equity MF: more than 12 months = long-term.'
              : 'Other assets: more than 24 months = long-term.',
        },
        {
          label: 'Capital gain = Sale value − transfer expenses − cost of acquisition',
          formula: `${formatINR(toNum(sale))} − ${formatINR(toNum(expenses))} − ${formatINR(toNum(purchase))}`,
          result: r.isLoss ? `${formatINR(r.rawGain)} (capital loss)` : formatINR(r.rawGain),
        },
        ...(r.exemption > 0
          ? [
              {
                label: 'Less: equity LTCG exemption (§112A)',
                formula: `First ₹1,25,000 of equity LTCG in the year is exempt`,
                result: `Taxable gain = ${formatINR(Math.max(0, r.rawGain - r.exemption))}`,
              } as Step,
            ]
          : []),
        ...(r.indexation
          ? [
              {
                label: 'Indexed cost (20% option) = Cost × CII(sale) ÷ CII(purchase)',
                formula: `${formatINR(toNum(purchase))} × ${r.indexation.ciiSale} ÷ ${r.indexation.ciiPurchase}`,
                result: formatINR(r.indexation.indexedCost),
                note: `CII: ${r.indexation.fyPurchase} = ${r.indexation.ciiPurchase}, ${r.indexation.fySale} = ${r.indexation.ciiSale}.${r.indexation.clamped ? ' (Purchase before FY2001-02 clamped to base index — use FMV as on 1 Apr 2001.)' : ''}`,
              } as Step,
            ]
          : []),
        {
          label: r.methods.length > 1 ? 'Tax under each option — the lower is chosen' : 'Apply the tax rate',
          formula: r.methods
            .map((mm) => `${mm.label}: ${formatINR(mm.taxableGain)} × ${formatPct(mm.rate, mm.rate % 1 === 0 ? 0 : 1)} = ${formatINR(mm.tax)}`)
            .join('   ·   '),
          result: r.chosenMethod ? `Tax = ${formatINR(r.taxBeforeCess)}` : '—',
        },
        ...(r.totalTax > 0
          ? [
              {
                label: 'Add health & education cess @ 4%',
                formula: `${formatINR(r.taxBeforeCess)} + 4% cess (${formatINR(r.cess)})`,
                result: formatINR(r.totalTax),
              } as Step,
            ]
          : []),
      ]
    : []

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs">
          <div className="space-y-4">
            <div>
              <span className="text-sm font-semibold text-slate-700">Asset type</span>
              <div className="mt-1.5 flex flex-col gap-1.5">
                {(
                  [
                    { v: 'equity', label: 'Listed equity / equity MF (STT paid)' },
                    { v: 'other', label: 'Other assets (property, gold, unlisted, debt…)' },
                  ] as { v: AssetType; label: string }[]
                ).map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setAssetType(o.v)}
                    className={`rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                      assetType === o.v ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <CalcField label="Cost of acquisition (purchase)" prefix="₹" value={purchase} onChange={setPurchase} />
            <CalcField label="Sale value (full consideration)" prefix="₹" value={sale} onChange={setSale} />
            <CalcField label="Transfer expenses" prefix="₹" value={expenses} onChange={setExpenses} hint="Brokerage, stamp duty on sale, etc. (0 if none)" />

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Purchase date</span>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Sale date</span>
                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
            </div>

            {assetType === 'other' && valid && r!.longTerm && (
              <label className="flex items-start gap-2 rounded-xl bg-sun-50 p-3 text-xs font-medium text-sun-700">
                <input
                  type="checkbox"
                  checked={landBuilding}
                  onChange={(e) => setLandBuilding(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                />
                Land or building acquired before 23 Jul 2024 — compare the 20%-with-indexation option (resident
                individual / HUF only).
              </label>
            )}

            {assetType === 'other' && valid && !r!.longTerm && (
              <CalcField
                label="Your income-tax slab rate"
                suffix="%"
                value={slabRate}
                onChange={setSlabRate}
                hint="STCG on non-equity assets is taxed at your slab rate — enter it for an estimate"
              />
            )}
          </div>
        </ResultPanel>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <b>FY 2025-26 (AY 2026-27)</b> rules, simplified for learning. Surcharge (on high incomes) and the
            §87A rebate are excluded; equity bought before 31 Jan 2018 has grandfathering (use the FMV cost).
            Verify with the latest Finance Act or a CA before filing.
          </span>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {r ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <HeroResult
                label="Total tax payable"
                value={formatINR(r.totalTax)}
                sub={r.isLoss ? 'capital loss — nothing payable' : `${r.term} · incl. 4% cess`}
              />
              <HeroResult
                label={r.isLoss ? 'Capital loss' : 'Taxable capital gain'}
                value={formatINR(r.isLoss ? r.rawGain : r.taxableGain)}
                sub={r.longTerm ? 'long-term' : 'short-term'}
                tone={r.isLoss ? 'sun' : 'mint'}
              />
            </div>

            {r.methods.length > 1 && (
              <ResultPanel title="Which option is cheaper?">
                <div className="space-y-2">
                  {r.methods.map((mm, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                        mm.chosen ? 'border-mint-300 bg-mint-50 dark:border-mint-500/40 dark:bg-mint-500/15' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{mm.label}</p>
                        <p className="text-xs text-slate-500">Taxable gain {formatINR(mm.taxableGain)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{formatINR(mm.tax)}</p>
                        {mm.chosen && (
                          <span className="cl-pill bg-mint-100 text-mint-600">
                            <Trophy className="h-3 w-3" /> Lower
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ResultPanel>
            )}

            <ResultPanel title="Working">
              <ResultRow label="Sale value" value={formatINR(toNum(sale))} />
              <ResultRow label="Less: transfer expenses" value={formatINR(toNum(expenses))} />
              <ResultRow label="Less: cost of acquisition" value={formatINR(toNum(purchase))} />
              <div className="my-1 border-t border-slate-100" />
              <ResultRow label={r.isLoss ? 'Capital loss' : 'Capital gain'} value={formatINR(r.rawGain)} />
              {r.exemption > 0 && <ResultRow label="Less: §112A exemption" value={formatINR(r.exemption)} />}
              {r.chosenMethod && <ResultRow label={`Tax @ ${formatPct(r.chosenMethod.rate, r.chosenMethod.rate % 1 === 0 ? 0 : 1)}`} value={formatINR(r.taxBeforeCess)} />}
              {r.cess > 0 && <ResultRow label="Health & education cess (4%)" value={formatINR(r.cess)} />}
              <div className="my-1 border-t border-slate-100" />
              <ResultRow label="Total tax payable" value={formatINR(r.totalTax)} strong />
            </ResultPanel>
          </>
        ) : (
          <ResultPanel>
            <p className="text-sm text-slate-600">
              Enter the purchase and sale details with valid dates (the sale date must be after the purchase date).
            </p>
          </ResultPanel>
        )}
        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
