import { round } from './format'

/* ----------------------------------------------------------------------------
   GST — Input Tax Credit (ITC) set-off / utilisation order.
   For learning only.

   Rules (CGST Act s.49(5), 49A, 49B + Rule 88A), verified June 2026:
   1. IGST credit must be utilised FIRST — against IGST liability, then against
      CGST and SGST/UTGST liability in any order/proportion. No CGST or SGST
      credit may be used until the IGST credit is fully exhausted.
   2. CGST credit → CGST liability, then any residual IGST liability.
      CGST credit can NEVER be used against SGST/UTGST liability.
   3. SGST/UTGST credit → SGST liability, then any residual IGST liability.
      SGST credit can NEVER be used against CGST liability.

   This engine splits the remaining IGST credit across CGST/SGST so as to cover
   the shortfall left after each head's own credit first — the cash-minimising
   ("optimal") allocation that Rule 88A's "any proportion" freedom permits.
---------------------------------------------------------------------------- */

export type GstHeads = { igst: number; cgst: number; sgst: number }
export type Head = 'IGST' | 'CGST' | 'SGST'

export type SetOffMove = { from: Head; to: Head; amount: number }

export type LiabilityRow = {
  head: Head
  liability: number
  fromIgst: number
  fromCgst: number
  fromSgst: number
  cash: number
}

export type GstItcResult = {
  moves: SetOffMove[]
  rows: LiabilityRow[]
  cash: GstHeads
  totalCash: number
  carryForward: GstHeads
  /** total credit consumed per head */
  creditUsed: GstHeads
  totalLiability: number
  totalCredit: number
}

const nn = (n: number) => Math.max(0, Number.isFinite(n) ? n : 0)

export function computeItcSetOff(liability: GstHeads, credit: GstHeads): GstItcResult {
  let il = nn(liability.igst)
  let cl = nn(liability.cgst)
  let sl = nn(liability.sgst)
  let ic = nn(credit.igst)
  let cc = nn(credit.cgst)
  let sc = nn(credit.sgst)

  const L: GstHeads = { igst: il, cgst: cl, sgst: sl }
  const C0: GstHeads = { igst: ic, cgst: cc, sgst: sc }

  // 1. IGST credit → IGST liability
  const igstToIgst = Math.min(ic, il)
  ic -= igstToIgst
  il -= igstToIgst

  // 2. Remaining IGST credit → CGST / SGST liability.
  //    Cover each head's shortfall (liability − own credit) first, then the rest.
  let igstToCgst = 0
  let igstToSgst = 0
  {
    let rem = ic
    const shortC = Math.max(0, cl - cc)
    const shortS = Math.max(0, sl - sc)
    const dC = Math.min(rem, shortC)
    igstToCgst += dC
    rem -= dC
    const dS = Math.min(rem, shortS)
    igstToSgst += dS
    rem -= dS
    // leftover IGST to the own-credit-coverable remainder (IGST must be used fully first)
    const eC = Math.min(rem, cl - igstToCgst)
    igstToCgst += eC
    rem -= eC
    const eS = Math.min(rem, sl - igstToSgst)
    igstToSgst += eS
    rem -= eS
    ic = rem
  }
  cl -= igstToCgst
  sl -= igstToSgst

  // 3. Own CGST → CGST, own SGST → SGST
  const cgstToCgst = Math.min(cc, cl)
  cc -= cgstToCgst
  cl -= cgstToCgst
  const sgstToSgst = Math.min(sc, sl)
  sc -= sgstToSgst
  sl -= sgstToSgst

  // 4. Leftover CGST / SGST credit → residual IGST liability (only if IGST credit ran out)
  const cgstToIgst = Math.min(cc, il)
  cc -= cgstToIgst
  il -= cgstToIgst
  const sgstToIgst = Math.min(sc, il)
  sc -= sgstToIgst
  il -= sgstToIgst

  const moves: SetOffMove[] = (
    [
      { from: 'IGST', to: 'IGST', amount: igstToIgst },
      { from: 'IGST', to: 'CGST', amount: igstToCgst },
      { from: 'IGST', to: 'SGST', amount: igstToSgst },
      { from: 'CGST', to: 'CGST', amount: cgstToCgst },
      { from: 'SGST', to: 'SGST', amount: sgstToSgst },
      { from: 'CGST', to: 'IGST', amount: cgstToIgst },
      { from: 'SGST', to: 'IGST', amount: sgstToIgst },
    ] as SetOffMove[]
  )
    .filter((m) => m.amount > 1e-6)
    .map((m) => ({ ...m, amount: round(m.amount) }))

  const rows: LiabilityRow[] = (
    [
      { head: 'IGST', liability: L.igst, fromIgst: igstToIgst, fromCgst: cgstToIgst, fromSgst: sgstToIgst, cash: il },
      { head: 'CGST', liability: L.cgst, fromIgst: igstToCgst, fromCgst: cgstToCgst, fromSgst: 0, cash: cl },
      { head: 'SGST', liability: L.sgst, fromIgst: igstToSgst, fromCgst: 0, fromSgst: sgstToSgst, cash: sl },
    ] as LiabilityRow[]
  ).map((r) => ({
    ...r,
    liability: round(r.liability),
    fromIgst: round(r.fromIgst),
    fromCgst: round(r.fromCgst),
    fromSgst: round(r.fromSgst),
    cash: round(r.cash),
  }))

  return {
    moves,
    rows,
    cash: { igst: round(il), cgst: round(cl), sgst: round(sl) },
    totalCash: round(il + cl + sl),
    carryForward: { igst: round(ic), cgst: round(cc), sgst: round(sc) },
    creditUsed: {
      igst: round(igstToIgst + igstToCgst + igstToSgst),
      cgst: round(cgstToCgst + cgstToIgst),
      sgst: round(sgstToSgst + sgstToIgst),
    },
    totalLiability: round(L.igst + L.cgst + L.sgst),
    totalCredit: round(C0.igst + C0.cgst + C0.sgst),
  }
}
