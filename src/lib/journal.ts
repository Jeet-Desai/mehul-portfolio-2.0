/* ----------------------------------------------------------------------------
   Journal → Ledger → Trial Balance engine (pure, React-free).

   The teaching core of the flagship simulator: every transaction is entered
   through a TEMPLATE that knows its double entry AND the golden-rule reasoning
   for each side, entries post automatically into T-accounts (with the
   textbook "To <other account>" / "By <other account>" particulars), and the
   trial balance is extracted with Dr/Cr totals.

   Account classification follows the standard B.Com treatment:
     assets & expenses  → normal DEBIT balance
     liabilities, capital & incomes → normal CREDIT balance
   Double entry is enforced by construction (one Dr, one Cr, same amount), so
   the trial balance always tallies — which is itself the lesson.
---------------------------------------------------------------------------- */

export type AccountType = 'asset' | 'liability' | 'capital' | 'income' | 'expense'

export type JournalEntry = {
  id: number
  /** display order / voucher number */
  sno: number
  debit: string // account name
  credit: string // account name
  amount: number
  narration: string
  /** golden-rule teaching notes for each side */
  reasonDr: string
  reasonCr: string
}

/** Account name → type. Party accounts get registered dynamically. */
export type AccountTypes = Record<string, AccountType>

/* ------------------------------------------------------------ templates */

export type TemplateField = 'amount' | 'party' | 'label'

export type TxnTemplate = {
  id: string
  label: string
  /** which extra inputs this template needs (amount is always needed) */
  needs: TemplateField[]
  /** hint for the label field (e.g. "Rent / Salary / Wages") */
  labelHint?: string
  /** build the entry — party/label already validated non-empty when needed */
  build: (amount: number, party: string, label: string) => Omit<JournalEntry, 'id' | 'sno'>
  /** dynamic accounts this creates, so the ledger knows their type */
  accounts: (party: string, label: string) => AccountTypes
}

const rules = {
  real: (dir: 'in' | 'out') =>
    dir === 'in' ? 'Real a/c — debit what comes in' : 'Real a/c — credit what goes out',
  personalReceiver: 'Personal a/c — debit the receiver',
  personalGiver: 'Personal a/c — credit the giver',
  nominalExpense: 'Nominal a/c — debit all expenses & losses',
  nominalIncome: 'Nominal a/c — credit all incomes & gains',
}

export const templates: TxnTemplate[] = [
  {
    id: 'start-capital',
    label: 'Started business with cash',
    needs: ['amount'],
    build: (amt) => ({
      debit: 'Cash',
      credit: 'Capital',
      amount: amt,
      narration: 'Being business started with cash',
      reasonDr: rules.real('in'),
      reasonCr: rules.personalGiver + ' (the owner)',
    }),
    accounts: () => ({ Cash: 'asset', Capital: 'capital' }),
  },
  {
    id: 'purchase-cash',
    label: 'Purchased goods for cash',
    needs: ['amount'],
    build: (amt) => ({
      debit: 'Purchases',
      credit: 'Cash',
      amount: amt,
      narration: 'Being goods purchased for cash',
      reasonDr: rules.nominalExpense,
      reasonCr: rules.real('out'),
    }),
    accounts: () => ({ Purchases: 'expense', Cash: 'asset' }),
  },
  {
    id: 'purchase-credit',
    label: 'Purchased goods on credit',
    needs: ['amount', 'party'],
    build: (amt, party) => ({
      debit: 'Purchases',
      credit: party,
      amount: amt,
      narration: `Being goods purchased on credit from ${party}`,
      reasonDr: rules.nominalExpense,
      reasonCr: rules.personalGiver,
    }),
    accounts: (party) => ({ Purchases: 'expense', [party]: 'liability' }),
  },
  {
    id: 'sale-cash',
    label: 'Sold goods for cash',
    needs: ['amount'],
    build: (amt) => ({
      debit: 'Cash',
      credit: 'Sales',
      amount: amt,
      narration: 'Being goods sold for cash',
      reasonDr: rules.real('in'),
      reasonCr: rules.nominalIncome,
    }),
    accounts: () => ({ Cash: 'asset', Sales: 'income' }),
  },
  {
    id: 'sale-credit',
    label: 'Sold goods on credit',
    needs: ['amount', 'party'],
    build: (amt, party) => ({
      debit: party,
      credit: 'Sales',
      amount: amt,
      narration: `Being goods sold on credit to ${party}`,
      reasonDr: rules.personalReceiver,
      reasonCr: rules.nominalIncome,
    }),
    accounts: (party) => ({ [party]: 'asset', Sales: 'income' }),
  },
  {
    id: 'pay-creditor',
    label: 'Paid cash to a creditor',
    needs: ['amount', 'party'],
    build: (amt, party) => ({
      debit: party,
      credit: 'Cash',
      amount: amt,
      narration: `Being cash paid to ${party}`,
      reasonDr: rules.personalReceiver,
      reasonCr: rules.real('out'),
    }),
    accounts: (party) => ({ [party]: 'liability', Cash: 'asset' }),
  },
  {
    id: 'receive-debtor',
    label: 'Received cash from a debtor',
    needs: ['amount', 'party'],
    build: (amt, party) => ({
      debit: 'Cash',
      credit: party,
      amount: amt,
      narration: `Being cash received from ${party}`,
      reasonDr: rules.real('in'),
      reasonCr: rules.personalGiver,
    }),
    accounts: (party) => ({ Cash: 'asset', [party]: 'asset' }),
  },
  {
    id: 'pay-expense',
    label: 'Paid an expense in cash',
    needs: ['amount', 'label'],
    labelHint: 'Rent / Salaries / Wages / Carriage…',
    build: (amt, _p, label) => ({
      debit: label,
      credit: 'Cash',
      amount: amt,
      narration: `Being ${label.toLowerCase()} paid in cash`,
      reasonDr: rules.nominalExpense,
      reasonCr: rules.real('out'),
    }),
    accounts: (_p, label) => ({ [label]: 'expense', Cash: 'asset' }),
  },
  {
    id: 'receive-income',
    label: 'Received an income in cash',
    needs: ['amount', 'label'],
    labelHint: 'Commission / Interest / Rent received…',
    build: (amt, _p, label) => ({
      debit: 'Cash',
      credit: label,
      amount: amt,
      narration: `Being ${label.toLowerCase()} received in cash`,
      reasonDr: rules.real('in'),
      reasonCr: rules.nominalIncome,
    }),
    accounts: (_p, label) => ({ Cash: 'asset', [label]: 'income' }),
  },
  {
    id: 'buy-asset',
    label: 'Purchased an asset for cash',
    needs: ['amount', 'label'],
    labelHint: 'Furniture / Machinery / Computer…',
    build: (amt, _p, label) => ({
      debit: label,
      credit: 'Cash',
      amount: amt,
      narration: `Being ${label.toLowerCase()} purchased for cash`,
      reasonDr: rules.real('in'),
      reasonCr: rules.real('out'),
    }),
    accounts: (_p, label) => ({ [label]: 'asset', Cash: 'asset' }),
  },
  {
    id: 'drawings',
    label: 'Withdrew cash for personal use',
    needs: ['amount'],
    build: (amt) => ({
      debit: 'Drawings',
      credit: 'Cash',
      amount: amt,
      narration: 'Being cash withdrawn for personal use',
      reasonDr: rules.personalReceiver + ' (the owner)',
      reasonCr: rules.real('out'),
    }),
    // Drawings reduce capital — a debit-balance "contra-capital"; classified
    // under capital and its debit balance shows on the Dr side of the TB.
    accounts: () => ({ Drawings: 'capital', Cash: 'asset' }),
  },
  {
    id: 'cash-to-bank',
    label: 'Deposited cash into bank',
    needs: ['amount'],
    build: (amt) => ({
      debit: 'Bank',
      credit: 'Cash',
      amount: amt,
      narration: 'Being cash deposited into bank',
      reasonDr: rules.real('in'),
      reasonCr: rules.real('out'),
    }),
    accounts: () => ({ Bank: 'asset', Cash: 'asset' }),
  },
]

export const getTemplate = (id: string) => templates.find((t) => t.id === id)

/* --------------------------------------------------------------- ledger */

export type LedgerLine = { other: string; amount: number; sno: number }
export type TAccount = {
  name: string
  type: AccountType
  debits: LedgerLine[] // "To <other>" lines
  credits: LedgerLine[] // "By <other>" lines
  totalDr: number
  totalCr: number
  /** positive = debit balance, negative = credit balance */
  balance: number
}

export function postToLedger(entries: JournalEntry[], types: AccountTypes): TAccount[] {
  const accounts = new Map<string, TAccount>()
  const get = (name: string): TAccount => {
    let a = accounts.get(name)
    if (!a) {
      a = { name, type: types[name] ?? 'asset', debits: [], credits: [], totalDr: 0, totalCr: 0, balance: 0 }
      accounts.set(name, a)
    }
    return a
  }
  for (const e of entries) {
    get(e.debit).debits.push({ other: e.credit, amount: e.amount, sno: e.sno })
    get(e.credit).credits.push({ other: e.debit, amount: e.amount, sno: e.sno })
  }
  for (const a of accounts.values()) {
    a.totalDr = a.debits.reduce((s, l) => s + l.amount, 0)
    a.totalCr = a.credits.reduce((s, l) => s + l.amount, 0)
    a.balance = a.totalDr - a.totalCr
  }
  // stable, teachable order: assets, expenses, then liabilities, capital, incomes
  const order: AccountType[] = ['asset', 'expense', 'liability', 'capital', 'income']
  return [...accounts.values()].sort(
    (x, y) => order.indexOf(x.type) - order.indexOf(y.type) || x.name.localeCompare(y.name),
  )
}

/* --------------------------------------------------------- trial balance */

export type TrialBalanceRow = { account: string; type: AccountType; dr: number; cr: number }

export function trialBalance(ledger: TAccount[]): {
  rows: TrialBalanceRow[]
  totalDr: number
  totalCr: number
  tallied: boolean
} {
  const rows: TrialBalanceRow[] = ledger
    .filter((a) => a.balance !== 0)
    .map((a) => ({
      account: a.name,
      type: a.type,
      dr: a.balance > 0 ? a.balance : 0,
      cr: a.balance < 0 ? -a.balance : 0,
    }))
  const totalDr = rows.reduce((s, r) => s + r.dr, 0)
  const totalCr = rows.reduce((s, r) => s + r.cr, 0)
  return { rows, totalDr, totalCr, tallied: totalDr === totalCr }
}

/* ------------------------------------------------------------ seed data */

/** Classic first-year worked scenario — verified: TB tallies at ₹1,48,000. */
export const seedTransactions: { templateId: string; amount: number; party?: string; label?: string }[] = [
  { templateId: 'start-capital', amount: 100000 },
  { templateId: 'purchase-cash', amount: 20000 },
  { templateId: 'purchase-credit', amount: 15000, party: 'Ram' },
  { templateId: 'sale-cash', amount: 25000 },
  { templateId: 'sale-credit', amount: 18000, party: 'Shyam' },
  { templateId: 'pay-expense', amount: 2000, label: 'Rent' },
  { templateId: 'pay-creditor', amount: 10000, party: 'Ram' },
  { templateId: 'receive-debtor', amount: 12000, party: 'Shyam' },
]

export function buildEntries(
  txns: typeof seedTransactions,
): { entries: JournalEntry[]; types: AccountTypes } {
  const entries: JournalEntry[] = []
  let types: AccountTypes = {}
  txns.forEach((t, i) => {
    const tpl = getTemplate(t.templateId)
    if (!tpl) return
    const party = t.party ?? ''
    const label = t.label ?? ''
    entries.push({ id: i + 1, sno: i + 1, ...tpl.build(t.amount, party, label) })
    types = { ...types, ...tpl.accounts(party, label) }
  })
  return { entries, types }
}
