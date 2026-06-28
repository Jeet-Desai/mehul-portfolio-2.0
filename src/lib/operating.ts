/* Operating (service) costing — cost per service unit for a transport
   undertaking: cost per km and the composite cost per tonne-km / passenger-km.
   Pure & React-free.

   Grounded in M.N. Arora, *Cost Accounting* (Unit 11 — Operating Costing). */
import type { Step } from '../calculators/types'
import { formatINR, formatNum } from './format'

export type CompositeUnit = 'tonneKm' | 'passengerKm'

export type OperatingInputs = {
  /** fixed / standing charges for the period (insurance, tax, garage, salaries) */
  standingCharges: number
  /** running / variable charges (fuel, oil, tyres) */
  runningCharges: number
  /** maintenance charges (semi-variable) */
  maintenanceCharges: number
  /** total distance run in the period (km) */
  distanceKm: number
  /** average load carried — tonnes (goods) or passengers */
  averageLoad: number
  /** which composite unit to report */
  compositeUnit: CompositeUnit
  /** desired profit as a % of cost (for the rate to charge) */
  profitPct: number
}

export type OperatingResult = {
  totalCost: number
  costPerKm: number
  compositeUnits: number
  costPerComposite: number
  ratePerComposite: number
  unitLabel: string
  steps: Step[]
}

export function computeOperating(inp: OperatingInputs): OperatingResult {
  const totalCost = inp.standingCharges + inp.runningCharges + inp.maintenanceCharges
  const costPerKm = inp.distanceKm > 0 ? totalCost / inp.distanceKm : 0
  // Composite units = distance × average load (tonne-km or passenger-km).
  const compositeUnits = inp.distanceKm * inp.averageLoad
  const costPerComposite = compositeUnits > 0 ? totalCost / compositeUnits : 0
  const ratePerComposite = costPerComposite * (1 + inp.profitPct / 100)
  const unitLabel = inp.compositeUnit === 'tonneKm' ? 'tonne-km' : 'passenger-km'

  const steps: Step[] = [
    {
      label: 'Total operating cost = standing + running + maintenance',
      formula: `${formatINR(inp.standingCharges)} + ${formatINR(inp.runningCharges)} + ${formatINR(inp.maintenanceCharges)}`,
      result: formatINR(totalCost),
    },
    {
      label: 'Cost per km = total cost ÷ distance run',
      formula: `${formatINR(totalCost)} ÷ ${formatNum(inp.distanceKm)} km`,
      result: `${formatINR(costPerKm)} per km`,
    },
    {
      label: `Composite units = distance × average load (${unitLabel})`,
      formula: `${formatNum(inp.distanceKm)} km × ${formatNum(inp.averageLoad)} ${inp.compositeUnit === 'tonneKm' ? 'tonnes' : 'passengers'}`,
      result: `${formatNum(compositeUnits)} ${unitLabel}`,
    },
    {
      label: `Cost per ${unitLabel} = total cost ÷ composite units`,
      formula: `${formatINR(totalCost)} ÷ ${formatNum(compositeUnits)}`,
      result: `${formatINR(costPerComposite)} per ${unitLabel}`,
    },
    {
      label: `Rate to charge = cost per ${unitLabel} + ${formatNum(inp.profitPct)}% profit`,
      formula: `${formatINR(costPerComposite)} × (1 + ${formatNum(inp.profitPct)}%)`,
      result: `${formatINR(ratePerComposite)} per ${unitLabel}`,
      note: 'Standing charges are fixed (independent of km); running charges vary with distance.',
    },
  ]

  return { totalCost, costPerKm, compositeUnits, costPerComposite, ratePerComposite, unitLabel, steps }
}
