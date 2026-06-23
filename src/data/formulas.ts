/* ----------------------------------------------------------------------------
   Formula / cheat sheets — searchable, grouped by subject. Data-driven.

   CORRECTNESS RULE (this ships under Dr. Desai's name):
   - These are the standard, evergreen formulas as taught in B.Com / CA-CS-CMA.
   - Keep TAXATION entries STRUCTURAL — no specific slab rates / thresholds that
     change each Budget. Live rates belong in the calculators, not the cheat sheet.
   - Verify any new formula before adding it; this is a study reference.
---------------------------------------------------------------------------- */

export type FormulaSubject =
  | 'Costing'
  | 'Financial Management'
  | 'Accounting'
  | 'Taxation'
  | 'Investing & TVM'
  | 'Statistics'

export type Formula = {
  id: string
  name: string
  /** the expression — plain text with unicode operators (÷ × √ Σ ²) */
  expr: string
  subject: FormulaSubject
  /** when to use it / what the terms mean */
  note?: string
  /** extra search keywords */
  tags?: string[]
  /** slug of a related calculator on /learn/c/<slug>, if one exists */
  calc?: string
}

export const formulaSubjects: FormulaSubject[] = [
  'Costing',
  'Financial Management',
  'Accounting',
  'Taxation',
  'Investing & TVM',
  'Statistics',
]

export const formulas: Formula[] = [
  /* ---------------------------------------------------------------- Costing */
  {
    id: 'contribution',
    name: 'Contribution',
    expr: 'Contribution = Sales − Variable Cost = Fixed Cost + Profit',
    subject: 'Costing',
    note: 'Per unit: Selling Price − Variable Cost per unit.',
    tags: ['marginal costing', 'cvp'],
    calc: 'break-even',
  },
  {
    id: 'pv-ratio',
    name: 'P/V Ratio',
    expr: 'P/V Ratio = (Contribution ÷ Sales) × 100 = (Change in Profit ÷ Change in Sales) × 100',
    subject: 'Costing',
    note: 'Profit-volume ratio — the share of every rupee of sales that becomes contribution.',
    tags: ['profit volume', 'cvp'],
    calc: 'break-even',
  },
  {
    id: 'bep-units',
    name: 'Break-even Point (units)',
    expr: 'BEP (units) = Fixed Cost ÷ Contribution per unit',
    subject: 'Costing',
    calc: 'break-even',
  },
  {
    id: 'bep-value',
    name: 'Break-even Point (₹)',
    expr: 'BEP (₹) = Fixed Cost ÷ P/V Ratio',
    subject: 'Costing',
    calc: 'break-even',
  },
  {
    id: 'required-sales',
    name: 'Sales for a target profit',
    expr: 'Required Sales = (Fixed Cost + Target Profit) ÷ P/V Ratio',
    subject: 'Costing',
    calc: 'break-even',
  },
  {
    id: 'mos',
    name: 'Margin of Safety',
    expr: 'MoS = Actual Sales − Break-even Sales = Profit ÷ P/V Ratio',
    subject: 'Costing',
    note: 'MoS Ratio = (Margin of Safety ÷ Actual Sales) × 100.',
    tags: ['margin of safety'],
    calc: 'break-even',
  },
  {
    id: 'eoq',
    name: 'Economic Order Quantity',
    expr: 'EOQ = √( (2 × Annual Demand × Ordering Cost) ÷ Carrying Cost per unit )',
    subject: 'Costing',
    tags: ['inventory', 'stock', 'order quantity'],
  },
  {
    id: 'cost-sheet',
    name: 'Cost sheet build-up',
    expr: 'Prime Cost → + Factory OH = Works Cost → + Admin OH = Cost of Production → + S&D OH = Cost of Sales',
    subject: 'Costing',
    note: 'Prime Cost = Direct Material + Direct Labour + Direct Expenses.',
    tags: ['cost sheet', 'overheads'],
  },
  {
    id: 'material-variance',
    name: 'Material variances',
    expr: 'Price Var = AQ × (SP − AP);  Usage Var = SP × (SQ − AQ);  Cost Var = (SQ×SP) − (AQ×AP)',
    subject: 'Costing',
    note: 'SQ/SP = standard qty/price, AQ/AP = actual. Favourable when actual cost is lower.',
    tags: ['standard costing', 'variance analysis'],
  },
  {
    id: 'labour-variance',
    name: 'Labour variances',
    expr: 'Rate Var = AH × (SR − AR);  Efficiency Var = SR × (SH − AH);  Cost Var = (SH×SR) − (AH×AR)',
    subject: 'Costing',
    note: 'SH/SR = standard hours/rate, AH/AR = actual.',
    tags: ['standard costing', 'variance analysis'],
  },

  /* ------------------------------------------------ Financial Management */
  {
    id: 'current-ratio',
    name: 'Current Ratio',
    expr: 'Current Ratio = Current Assets ÷ Current Liabilities',
    subject: 'Financial Management',
    note: 'A rule-of-thumb healthy level is around 2:1.',
    tags: ['liquidity', 'ratios'],
    calc: 'ratio-analysis',
  },
  {
    id: 'quick-ratio',
    name: 'Quick (Acid-test) Ratio',
    expr: 'Quick Ratio = (Current Assets − Inventory − Prepaid Expenses) ÷ Current Liabilities',
    subject: 'Financial Management',
    note: 'Rule-of-thumb healthy level around 1:1.',
    tags: ['liquidity', 'ratios', 'acid test'],
    calc: 'ratio-analysis',
  },
  {
    id: 'debt-equity',
    name: 'Debt-Equity Ratio',
    expr: 'Debt-Equity = Total Debt ÷ Shareholders’ Equity',
    subject: 'Financial Management',
    tags: ['solvency', 'leverage', 'ratios'],
    calc: 'ratio-analysis',
  },
  {
    id: 'roce',
    name: 'Return on Capital Employed',
    expr: 'ROCE = (EBIT ÷ Capital Employed) × 100',
    subject: 'Financial Management',
    note: 'Capital Employed = Total Assets − Current Liabilities (or Equity + Long-term Debt).',
    tags: ['profitability', 'ratios', 'roi'],
    calc: 'ratio-analysis',
  },
  {
    id: 'roe',
    name: 'Return on Equity',
    expr: 'ROE = [(Net Profit after Tax − Preference Dividend) ÷ Shareholders’ Equity] × 100',
    subject: 'Financial Management',
    tags: ['profitability', 'ratios'],
    calc: 'ratio-analysis',
  },
  {
    id: 'inventory-turnover',
    name: 'Inventory Turnover',
    expr: 'Inventory Turnover = Cost of Goods Sold ÷ Average Inventory',
    subject: 'Financial Management',
    note: 'Average Inventory = (Opening + Closing) ÷ 2.',
    tags: ['turnover', 'activity', 'ratios'],
    calc: 'ratio-analysis',
  },
  {
    id: 'npv',
    name: 'Net Present Value',
    expr: 'NPV = Σ [ Cash Flowₜ ÷ (1 + r)ᵗ ] − Initial Investment',
    subject: 'Financial Management',
    note: 'Accept the project when NPV > 0.',
    tags: ['capital budgeting', 'dcf', 'discounting'],
    calc: 'capital-budgeting',
  },
  {
    id: 'pi',
    name: 'Profitability Index',
    expr: 'PI = Present Value of Cash Inflows ÷ Initial Investment',
    subject: 'Financial Management',
    note: 'Accept when PI > 1.',
    tags: ['capital budgeting', 'benefit cost'],
    calc: 'capital-budgeting',
  },
  {
    id: 'payback',
    name: 'Payback Period',
    expr: 'Payback = Initial Investment ÷ Annual Cash Inflow  (for even cash flows)',
    subject: 'Financial Management',
    note: 'For uneven flows, count years until cumulative inflow recovers the outlay.',
    tags: ['capital budgeting'],
    calc: 'capital-budgeting',
  },
  {
    id: 'wacc',
    name: 'Weighted Average Cost of Capital',
    expr: 'WACC = (E/V × Kₑ) + (D/V × K_d × (1 − t)) + (P/V × K_p)',
    subject: 'Financial Management',
    note: 'E, D, P = market value of equity, debt, preference; V = E + D + P; t = tax rate.',
    tags: ['cost of capital'],
    calc: 'wacc',
  },
  {
    id: 'cost-equity-capm',
    name: 'Cost of Equity (CAPM)',
    expr: 'Kₑ = R_f + β × (R_m − R_f)',
    subject: 'Financial Management',
    note: 'Rf = risk-free rate, Rm = market return, β = beta.',
    tags: ['cost of equity', 'capm'],
    calc: 'wacc',
  },
  {
    id: 'cost-equity-gordon',
    name: 'Cost of Equity (Dividend Growth)',
    expr: 'Kₑ = (D₁ ÷ P₀) + g',
    subject: 'Financial Management',
    note: 'D₁ = next dividend, P₀ = current price, g = growth rate (Gordon model).',
    tags: ['cost of equity', 'gordon', 'dividend'],
    calc: 'wacc',
  },
  {
    id: 'cost-debt',
    name: 'Cost of Debt (after tax)',
    expr: 'K_d = [ I × (1 − t) ] ÷ Net Proceeds',
    subject: 'Financial Management',
    note: 'I = annual interest, t = tax rate.',
    tags: ['cost of debt'],
    calc: 'wacc',
  },
  {
    id: 'leverage',
    name: 'Leverage',
    expr: 'DOL = Contribution ÷ EBIT;  DFL = EBIT ÷ EBT;  DCL = DOL × DFL = Contribution ÷ EBT',
    subject: 'Financial Management',
    note: 'Operating, financial and combined leverage. EBT = profit before tax.',
    tags: ['operating leverage', 'financial leverage'],
  },
  {
    id: 'eps',
    name: 'Earnings Per Share',
    expr: 'EPS = (Net Profit after Tax − Preference Dividend) ÷ No. of Equity Shares',
    subject: 'Financial Management',
    tags: ['valuation', 'per share'],
  },

  /* ----------------------------------------------------------- Accounting */
  {
    id: 'accounting-equation',
    name: 'Accounting Equation',
    expr: 'Assets = Liabilities + Capital',
    subject: 'Accounting',
    note: 'The basis of double-entry — every transaction keeps both sides equal.',
    tags: ['double entry', 'balance sheet'],
  },
  {
    id: 'cogs',
    name: 'Cost of Goods Sold',
    expr: 'COGS = Opening Stock + Purchases + Direct Expenses − Closing Stock',
    subject: 'Accounting',
    tags: ['trading account', 'gross profit'],
  },
  {
    id: 'gross-profit',
    name: 'Gross & Net Profit',
    expr: 'Gross Profit = Net Sales − COGS;  Net Profit = Gross Profit + Other Income − Indirect Expenses',
    subject: 'Accounting',
    tags: ['profit and loss'],
  },
  {
    id: 'working-capital',
    name: 'Working Capital',
    expr: 'Working Capital = Current Assets − Current Liabilities',
    subject: 'Accounting',
    tags: ['liquidity'],
  },
  {
    id: 'slm-dep',
    name: 'Depreciation — Straight Line',
    expr: 'Annual Depreciation = (Cost − Scrap Value) ÷ Useful Life',
    subject: 'Accounting',
    tags: ['slm', 'fixed asset'],
    calc: 'depreciation',
  },
  {
    id: 'wdv-dep',
    name: 'Depreciation — Written Down Value',
    expr: 'Depreciation = Opening Book Value × Rate%',
    subject: 'Accounting',
    note: 'Charged on the reducing balance each year.',
    tags: ['wdv', 'reducing balance', 'fixed asset'],
    calc: 'depreciation',
  },

  /* ------------------------------------------------------------- Taxation */
  {
    id: 'hra',
    name: 'HRA Exemption — least of three',
    expr: 'Exempt = least of: (i) Actual HRA; (ii) Rent paid − 10% of Salary; (iii) 50% of Salary (metro) / 40% (non-metro)',
    subject: 'Taxation',
    note: 'Salary here = Basic + DA (+ commission as a fixed % of turnover). Section 10(13A).',
    tags: ['house rent allowance', '10(13a)'],
    calc: 'hra',
  },
  {
    id: 'gst-split',
    name: 'GST split',
    expr: 'Intra-state: CGST = SGST = (Value × Rate) ÷ 2.  Inter-state: IGST = Value × Rate',
    subject: 'Taxation',
    tags: ['cgst', 'sgst', 'igst'],
    calc: 'gst',
  },
  {
    id: 'gst-inclusive',
    name: 'GST from an inclusive price',
    expr: 'GST = Amount − [ Amount × 100 ÷ (100 + Rate) ]',
    subject: 'Taxation',
    note: 'Backs the tax out of a tax-inclusive (gross) amount.',
    tags: ['reverse gst', 'inclusive'],
    calc: 'gst',
  },
  {
    id: 'capital-gain',
    name: 'Capital Gain',
    expr: 'Capital Gain = Sale Consideration − (Cost of Acquisition + Cost of Improvement + Transfer Expenses)',
    subject: 'Taxation',
    note: 'Use indexed costs for long-term gains where indexation applies.',
    tags: ['ltcg', 'stcg'],
    calc: 'capital-gains',
  },
  {
    id: 'indexed-cost',
    name: 'Indexed Cost of Acquisition',
    expr: 'Indexed Cost = Cost × (CII of year of sale ÷ CII of year of purchase)',
    subject: 'Taxation',
    note: 'CII = Cost Inflation Index, notified each year. Structural formula — rates change.',
    tags: ['indexation', 'cii'],
    calc: 'capital-gains',
  },

  /* ----------------------------------------------------- Investing & TVM */
  {
    id: 'simple-interest',
    name: 'Simple Interest',
    expr: 'SI = (P × R × T) ÷ 100',
    subject: 'Investing & TVM',
    note: 'P = principal, R = rate % p.a., T = time in years.',
    tags: ['interest'],
    calc: 'compound-interest',
  },
  {
    id: 'compound-interest',
    name: 'Compound Interest',
    expr: 'Amount = P × (1 + R/100)ⁿ ;  CI = Amount − P',
    subject: 'Investing & TVM',
    note: 'For m compoundings a year, use (1 + R/(100m))^(m·n).',
    tags: ['compounding'],
    calc: 'compound-interest',
  },
  {
    id: 'fv-pv',
    name: 'Future & Present Value',
    expr: 'FV = PV × (1 + r)ⁿ ;  PV = FV ÷ (1 + r)ⁿ',
    subject: 'Investing & TVM',
    tags: ['time value of money', 'discounting'],
    calc: 'tvm',
  },
  {
    id: 'annuity',
    name: 'Annuity (ordinary)',
    expr: 'FV = PMT × [ ((1+r)ⁿ − 1) ÷ r ] ;  PV = PMT × [ (1 − (1+r)⁻ⁿ) ÷ r ]',
    subject: 'Investing & TVM',
    note: 'Level payment PMT each period at rate r for n periods.',
    tags: ['annuity', 'pmt'],
    calc: 'tvm',
  },
  {
    id: 'sip-fv',
    name: 'SIP Future Value',
    expr: 'FV = P × [ ((1+i)ⁿ − 1) ÷ i ] × (1 + i)',
    subject: 'Investing & TVM',
    note: 'Monthly investment P, i = monthly rate, n = months (contributions at month start).',
    tags: ['sip', 'mutual fund'],
    calc: 'sip',
  },
  {
    id: 'cagr',
    name: 'CAGR',
    expr: 'CAGR = (Ending Value ÷ Beginning Value)^(1 ÷ n) − 1',
    subject: 'Investing & TVM',
    note: 'n = number of years.',
    tags: ['compound annual growth rate', 'returns'],
    calc: 'cagr',
  },
  {
    id: 'bond-price',
    name: 'Bond Price',
    expr: 'Price = Σ [ Coupon ÷ (1+r)ᵗ ] + Face Value ÷ (1+r)ⁿ',
    subject: 'Investing & TVM',
    note: 'r = required yield per period; n = periods to maturity. YTM is the r that makes price = market price.',
    tags: ['ytm', 'coupon', 'valuation'],
    calc: 'bond-valuation',
  },
  {
    id: 'rule-72',
    name: 'Rule of 72',
    expr: 'Years to double ≈ 72 ÷ Annual Rate (%)',
    subject: 'Investing & TVM',
    note: 'A quick mental estimate of doubling time.',
    tags: ['doubling', 'shortcut'],
  },

  /* ---------------------------------------------------------- Statistics */
  {
    id: 'mean',
    name: 'Arithmetic Mean',
    expr: 'Mean (X̄) = ΣX ÷ N',
    subject: 'Statistics',
    tags: ['average', 'central tendency'],
  },
  {
    id: 'sd',
    name: 'Standard Deviation',
    expr: 'σ = √( Σ(X − X̄)² ÷ N )',
    subject: 'Statistics',
    note: 'Spread of values around the mean.',
    tags: ['dispersion', 'variance'],
  },
  {
    id: 'cv',
    name: 'Coefficient of Variation',
    expr: 'CV = (σ ÷ X̄) × 100',
    subject: 'Statistics',
    note: 'Compares relative variability between two data sets.',
    tags: ['dispersion', 'relative'],
  },
  {
    id: 'correlation',
    name: 'Karl Pearson Correlation',
    expr: 'r = Σxy ÷ √( Σx² × Σy² )',
    subject: 'Statistics',
    note: 'Where x = X − X̄ and y = Y − Ȳ. Ranges from −1 to +1.',
    tags: ['correlation coefficient'],
  },
  {
    id: 'regression-coeff',
    name: 'Regression Coefficient',
    expr: 'b_yx = r × (σy ÷ σx)',
    subject: 'Statistics',
    note: 'Slope of Y on X. Similarly b_xy = r × (σx ÷ σy).',
    tags: ['regression', 'line of best fit'],
  },
]
