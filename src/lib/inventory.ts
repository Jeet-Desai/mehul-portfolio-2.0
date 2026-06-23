import { round } from './format'

/* ----------------------------------------------------------------------------
   Inventory valuation — store-ledger card under FIFO, LIFO and perpetual
   weighted-average cost. Pure, perpetual (recomputed on every transaction).
   For learning. LIFO is not permitted under AS-2 / Ind AS 2 for financial
   reporting in India, but is taught for comparison.
---------------------------------------------------------------------------- */

export type Method = 'fifo' | 'lifo' | 'wavg'

export type Txn = {
  id: string
  label: string
  kind: 'in' | 'out'
  qty: number
  /** unit rate — used for receipts ('in'); ignored for issues */
  rate: number
}

export type Layer = { qty: number; rate: number }

export type LedgerRow = {
  label: string
  kind: 'in' | 'out'
  inQty: number
  inRate: number
  inValue: number
  outQty: number
  outRate: number
  outValue: number
  balQty: number
  balRate: number
  balValue: number
  /** balance composition (FIFO/LIFO layers); empty for weighted-average */
  balLayers: Layer[]
}

export type MethodResult = {
  method: Method
  rows: LedgerRow[]
  closingQty: number
  closingValue: number
  /** cost of goods issued / sold = total value of all issues */
  cogs: number
  totalReceiptsQty: number
  totalReceiptsValue: number
  valid: boolean
  error?: string
}

const sumQty = (ls: Layer[]) => ls.reduce((a, l) => a + l.qty, 0)
const sumValue = (ls: Layer[]) => ls.reduce((a, l) => a + l.qty * l.rate, 0)

function runLayered(txns: Txn[], method: 'fifo' | 'lifo'): MethodResult {
  const layers: Layer[] = []
  const rows: LedgerRow[] = []
  let cogs = 0
  let totalReceiptsQty = 0
  let totalReceiptsValue = 0
  let error: string | undefined

  for (const t of txns) {
    if (t.kind === 'in') {
      layers.push({ qty: t.qty, rate: t.rate })
      const inValue = t.qty * t.rate
      totalReceiptsQty += t.qty
      totalReceiptsValue += inValue
      rows.push(makeRow(t.label, 'in', { inQty: t.qty, inRate: t.rate, inValue }, layers))
    } else {
      let remaining = t.qty
      let outValue = 0
      while (remaining > 1e-9 && layers.length) {
        const idx = method === 'fifo' ? 0 : layers.length - 1
        const layer = layers[idx]
        const take = Math.min(remaining, layer.qty)
        outValue += take * layer.rate
        layer.qty -= take
        remaining -= take
        if (layer.qty <= 1e-9) layers.splice(idx, 1)
      }
      if (remaining > 1e-9 && !error) {
        error = `Issue of ${t.qty} in "${t.label}" exceeds the available stock.`
      }
      const issued = t.qty - remaining
      cogs += outValue
      rows.push(
        makeRow(t.label, 'out', { outQty: issued, outRate: issued > 0 ? outValue / issued : 0, outValue }, layers),
      )
    }
  }

  return {
    method,
    rows,
    closingQty: round(sumQty(layers)),
    closingValue: round(sumValue(layers)),
    cogs: round(cogs),
    totalReceiptsQty: round(totalReceiptsQty),
    totalReceiptsValue: round(totalReceiptsValue),
    valid: !error,
    error,
  }
}

function runWeightedAvg(txns: Txn[]): MethodResult {
  const rows: LedgerRow[] = []
  let balQty = 0
  let balValue = 0
  let cogs = 0
  let totalReceiptsQty = 0
  let totalReceiptsValue = 0
  let error: string | undefined

  for (const t of txns) {
    if (t.kind === 'in') {
      const inValue = t.qty * t.rate
      balQty += t.qty
      balValue += inValue
      totalReceiptsQty += t.qty
      totalReceiptsValue += inValue
      const avg = balQty > 0 ? balValue / balQty : 0
      rows.push({
        label: t.label,
        kind: 'in',
        inQty: t.qty,
        inRate: t.rate,
        inValue: round(inValue),
        outQty: 0,
        outRate: 0,
        outValue: 0,
        balQty: round(balQty),
        balRate: round(avg),
        balValue: round(balValue),
        balLayers: [],
      })
    } else {
      const avg = balQty > 0 ? balValue / balQty : 0
      let issued = t.qty
      if (t.qty > balQty + 1e-9) {
        if (!error) error = `Issue of ${t.qty} in "${t.label}" exceeds the available stock.`
        issued = balQty
      }
      const outValue = issued * avg
      balQty -= issued
      balValue -= outValue
      cogs += outValue
      rows.push({
        label: t.label,
        kind: 'out',
        inQty: 0,
        inRate: 0,
        inValue: 0,
        outQty: issued,
        outRate: round(avg),
        outValue: round(outValue),
        balQty: round(balQty),
        balRate: round(balQty > 0 ? balValue / balQty : 0),
        balValue: round(balValue),
        balLayers: [],
      })
    }
  }

  return {
    method: 'wavg',
    rows,
    closingQty: round(balQty),
    closingValue: round(balValue),
    cogs: round(cogs),
    totalReceiptsQty: round(totalReceiptsQty),
    totalReceiptsValue: round(totalReceiptsValue),
    valid: !error,
    error,
  }
}

function makeRow(
  label: string,
  kind: 'in' | 'out',
  vals: Partial<Pick<LedgerRow, 'inQty' | 'inRate' | 'inValue' | 'outQty' | 'outRate' | 'outValue'>>,
  layers: Layer[],
): LedgerRow {
  return {
    label,
    kind,
    inQty: round(vals.inQty ?? 0),
    inRate: round(vals.inRate ?? 0),
    inValue: round(vals.inValue ?? 0),
    outQty: round(vals.outQty ?? 0),
    outRate: round(vals.outRate ?? 0),
    outValue: round(vals.outValue ?? 0),
    balQty: round(sumQty(layers)),
    balRate: sumQty(layers) > 0 ? round(sumValue(layers) / sumQty(layers)) : 0,
    balValue: round(sumValue(layers)),
    balLayers: layers.map((l) => ({ qty: round(l.qty), rate: round(l.rate) })),
  }
}

export function valuate(txns: Txn[], method: Method): MethodResult {
  return method === 'wavg' ? runWeightedAvg(txns) : runLayered(txns, method)
}

/** Run all three methods at once (for the comparison panel). */
export function valuateAll(txns: Txn[]): Record<Method, MethodResult> {
  return { fifo: valuate(txns, 'fifo'), lifo: valuate(txns, 'lifo'), wavg: valuate(txns, 'wavg') }
}
