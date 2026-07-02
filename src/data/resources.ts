/* ----------------------------------------------------------------------------
   Resource Library — structured study notes for each Learn-Hub topic.
   Data-driven (this file is the single source of truth); the pages just render it.

   CORRECTNESS RULE (everything here ships under Dr. Desai's name):
   - Content is grounded in standard B.Com / CA-CS-CMA texts (esp. M.N. Arora,
     *Cost Accounting*) and Dr. Desai's own class material, and cross-checked
     against authoritative sources (ICAI / ACCA / ClearTax) — see each topic's
     `references`. Never add a formula or claim you have not verified.
   - Keep statutory/rate-specific numbers OUT of here — they change. This is an
     evergreen study reference; live figures live in the calculators.
   - Each topic optionally links to a calculator (`calc`) and the formula sheet.
     The calculator link only renders if that calculator actually exists yet.
---------------------------------------------------------------------------- */

import type { LucideIcon } from 'lucide-react'
import {
  Gauge,
  ArrowRightLeft,
  Wallet,
  CalendarClock,
  SlidersHorizontal,
  FileSpreadsheet,
  PackageSearch,
  Users,
  Layers,
  ClipboardList,
  HardHat,
  GitBranch,
  Bus,
} from 'lucide-react'

export type ResourceSubject =
  | 'Financial Statement Analysis'
  | 'Budgetary Control'
  | 'Cost Accounting'

/** kind drives the little badge + icon on a reference link */
export type RefKind = 'official' | 'textbook' | 'article' | 'video'

export type ResourceRef = {
  label: string
  url: string
  kind: RefKind
  /** short attribution shown on the chip, e.g. "ICAI", "ACCA" */
  source?: string
}

export type KeyTerm = { term: string; def: string }
export type TopicFormula = { name: string; expr: string; note?: string }
export type ProcedureStep = { title: string; detail: string }

/** A fully-worked numerical example (shown step by step, like the calculators). */
export type WorkedExample = {
  title?: string
  problem: string
  steps: { label: string; formula?: string; result?: string }[]
  answer: string
  /** optional attribution, e.g. a past-exam paper */
  source?: string
}

/** A self-test question; the answer reveals on click behind a warning. */
export type PracticeQuestion = {
  q: string
  /** optional MCQ choices */
  options?: string[]
  /** the answer + a short why */
  answer: string
}

export type ResourceTopic = {
  id: string
  title: string
  subject: ResourceSubject
  icon: LucideIcon
  /** who studies this — shown as a small pill */
  level: string
  /** one-line summary for the index card + search */
  blurb: string
  readingMinutes: number
  /** intro paragraphs — the "what & why" */
  overview: string[]
  keyTerms: KeyTerm[]
  formulas?: TopicFormula[]
  /** the method, step by step */
  procedure?: { heading?: string; steps: ProcedureStep[] }
  examTips?: string[]
  pitfalls?: string[]
  /** where this topic is used in industry / the real world */
  applications?: string[]
  /** merits / advantages / benefits of the technique */
  advantages?: string[]
  /** limitations / drawbacks to be aware of */
  limitations?: string[]
  /** a fully-worked numerical example, where one helps */
  workedExample?: WorkedExample
  /** a few self-test questions with reveal-on-click answers */
  practice?: PracticeQuestion[]
  references: ResourceRef[]
  /** slug of the related calculator (link renders only if it exists in the registry) */
  calc?: string
  /** extra search keywords */
  tags?: string[]
  /** Gujarati (ગુજરાતી) translation — any field present overrides the English one
      when the language toggle is set to 'gu'; missing fields fall back to English.
      References, the calculator and numbers/₹/formula expressions stay as-is. */
  gu?: TopicTranslation
}

/** A topic's Gujarati translation. Mirror only the translatable text fields;
    anything omitted falls back to the English version. Follow the register in
    docs/i18n-gujarati-glossary.md (native coinages for પડતર/ગુણોત્તર/વિચલન; keep
    EOQ/FIFO and ₹ figures as-is). */
export type TopicTranslation = {
  title?: string
  blurb?: string
  level?: string
  overview?: string[]
  keyTerms?: KeyTerm[]
  formulas?: TopicFormula[]
  procedure?: { heading?: string; steps: ProcedureStep[] }
  examTips?: string[]
  pitfalls?: string[]
  applications?: string[]
  advantages?: string[]
  limitations?: string[]
  workedExample?: WorkedExample
  practice?: PracticeQuestion[]
}

/** Only subjects that currently have topics are listed (drives the filter chips). */
export const resourceSubjects: ResourceSubject[] = [
  'Financial Statement Analysis',
  'Budgetary Control',
  'Cost Accounting',
]

export const resourceTopics: ResourceTopic[] = [
  /* ============================================ Financial Statement Analysis */
  {
    id: 'ratio-analysis',
    title: 'Ratio Analysis',
    subject: 'Financial Statement Analysis',
    icon: Gauge,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Turn a P&L and balance sheet into liquidity, solvency, profitability and turnover ratios — and read what they mean.',
    readingMinutes: 9,
    tags: ['current ratio', 'quick ratio', 'debt equity', 'roce', 'roe', 'turnover', 'gearing'],
    overview: [
      'Ratio analysis is the most widely used tool of financial-statement analysis. A ratio simply expresses the relationship between two figures drawn from the financial statements — for example, current assets against current liabilities — so that performance can be judged far more meaningfully than from the absolute figures alone.',
      'Ratios are grouped by the question they answer: liquidity ratios test short-term solvency, solvency/gearing ratios test long-term financial structure, profitability ratios test earning power, and activity (turnover) ratios test how efficiently assets are used. A single ratio in isolation says little — its value comes from comparison: against the firm’s own past trend, against a budget, or against industry peers.',
      '“Ideal” figures such as a 2 : 1 current ratio or a 1 : 1 quick ratio are rules of thumb, not laws. A ratio well above the norm can be as much a warning (idle cash, slow-moving stock) as a ratio below it. Always interpret, don’t just compute.',
    ],
    keyTerms: [
      { term: 'Liquidity ratios', def: 'Measure the firm’s ability to meet short-term obligations as they fall due (current ratio, quick/acid-test ratio).' },
      { term: 'Solvency / gearing ratios', def: 'Measure reliance on borrowed funds and ability to service long-term debt (debt-equity, interest coverage, proprietary ratio).' },
      { term: 'Profitability ratios', def: 'Measure earnings relative to sales or capital (gross/net margin, ROCE, ROE).' },
      { term: 'Activity / turnover ratios', def: 'Measure how hard assets work to generate sales (inventory, asset and working-capital turnover).' },
      { term: 'Capital employed', def: 'Long-term funds in the business = Shareholders’ equity + Long-term debt (or Total assets − Current liabilities).' },
    ],
    formulas: [
      { name: 'Current Ratio', expr: 'Current Assets ÷ Current Liabilities', note: 'Rule-of-thumb ideal 2 : 1.' },
      { name: 'Quick (Acid-test) Ratio', expr: '(Current Assets − Inventory) ÷ Current Liabilities', note: 'Rule-of-thumb ideal 1 : 1.' },
      { name: 'Debt-Equity Ratio', expr: 'Long-term Debt ÷ Shareholders’ Equity' },
      { name: 'Interest Coverage', expr: 'EBIT ÷ Interest expense', note: 'Higher = more comfortable debt servicing.' },
      { name: 'Gross Profit Margin', expr: '(Sales − COGS) ÷ Sales × 100' },
      { name: 'Net Profit Margin', expr: 'Net Profit (PAT) ÷ Sales × 100' },
      { name: 'Return on Capital Employed', expr: 'EBIT ÷ Capital Employed × 100' },
      { name: 'Return on Equity', expr: 'Net Profit ÷ Shareholders’ Equity × 100' },
      { name: 'Inventory Turnover', expr: 'COGS ÷ Average Inventory (times)' },
    ],
    procedure: {
      heading: 'How to attempt a ratio question',
      steps: [
        { title: 'Pick the figures', detail: 'Identify the exact items the ratio needs from the P&L and balance sheet — be careful with “current” vs “non-current” classification.' },
        { title: 'Use the standard formula', detail: 'Apply the agreed formula. Where averages are available (e.g. average inventory, average debtors), prefer them over closing figures.' },
        { title: 'Express in the right form', detail: 'Liquidity/solvency ratios as “x : 1”, profitability as a %, turnover as “times” (and convert to days where asked = 365 ÷ turnover).' },
        { title: 'Interpret', detail: 'Compare against the ideal, the prior year and the industry. State what the number means for the firm — that is where the marks are.' },
      ],
    },
    examTips: [
      'Show the formula, the substitution and the answer with its unit — examiners award method marks even if the arithmetic slips.',
      'When asked to “comment”, always benchmark: ideal norm, trend, and peer comparison.',
      'Watch the denominator: ROCE uses capital employed, ROE uses equity only — mixing them is the most common error.',
    ],
    pitfalls: [
      'Treating an “ideal” ratio as a target — a very high current ratio can signal idle resources.',
      'Including prepaid expenses in “quick assets” — they are excluded along with inventory.',
      'Comparing ratios of firms using different accounting policies without adjusting.',
    ],
    references: [
      { label: 'Ratio analysis (technical article)', url: 'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f2/technical-articles/ratio-analysis.html', kind: 'official', source: 'ACCA' },
      { label: 'Complete list of financial ratios', url: 'https://corporatefinanceinstitute.com/resources/accounting/financial-ratios/', kind: 'article', source: 'CFI' },
      { label: 'Ratio analysis study note', url: 'https://oer.pressbooks.pub/utsaccounting1/chapter/ratio-analysis/', kind: 'article', source: 'UTS OER' },
    ],
    workedExample: {
      title: 'Computing the core liquidity & profitability ratios',
      problem:
        'A trader reports: Sales ₹10,00,000; Cost of goods sold ₹6,00,000; Current assets ₹4,00,000 (including inventory ₹1,50,000); Current liabilities ₹2,00,000. Find the current ratio, quick ratio and gross profit margin.',
      steps: [
        { label: 'Current ratio = Current Assets ÷ Current Liabilities', formula: '₹4,00,000 ÷ ₹2,00,000', result: '2 : 1' },
        { label: 'Quick ratio = (Current Assets − Inventory) ÷ Current Liabilities', formula: '(₹4,00,000 − ₹1,50,000) ÷ ₹2,00,000', result: '1.25 : 1' },
        { label: 'Gross profit = Sales − COGS', formula: '₹10,00,000 − ₹6,00,000', result: '₹4,00,000' },
        { label: 'Gross profit margin = Gross Profit ÷ Sales × 100', formula: '₹4,00,000 ÷ ₹10,00,000 × 100', result: '40%' },
      ],
      answer:
        'Current ratio 2 : 1 (meets the textbook norm), quick ratio 1.25 : 1 (the firm can cover current dues even without selling stock), and a healthy 40% gross margin.',
    },
    practice: [
      {
        q: 'A firm’s current ratio is 3 : 1 but its quick ratio is 0.8 : 1. What does the gap indicate?',
        answer:
          'A large part of current assets is inventory, which is less liquid. Despite a strong current ratio, immediate liquidity is weak — the firm depends on selling stock to pay its short-term dues.',
      },
      {
        q: 'Which ratio best measures long-term solvency?',
        options: ['Current ratio', 'Debt-equity ratio', 'Inventory turnover', 'Gross profit margin'],
        answer: 'Debt-equity ratio — it compares borrowed funds with owners’ funds, reflecting long-term financial risk.',
      },
      {
        q: 'Why can a very high current ratio actually be a warning sign?',
        answer:
          'It can signal idle cash, excessive or slow-moving inventory, or poor working-capital management — not necessarily financial strength.',
      },
    ],
    applications: [
      'Banks and lenders screen loan applications using liquidity and gearing ratios before sanctioning credit.',
      'Investors and analysts compare profitability and return ratios (ROCE, ROE, margins) across companies to pick stocks.',
      'Management uses turnover and efficiency ratios for internal control and to set targets and benchmarks.',
      'Credit-rating agencies and suppliers assess a firm’s solvency before extending terms.',
    ],
    advantages: [
      'Condenses bulky financial statements into a few decision-ready indicators.',
      'Enables meaningful comparison — across years (trend), against budgets, and between firms or industries.',
      'Pinpoints strengths and weaknesses in liquidity, solvency, profitability and efficiency for corrective action.',
      'Useful to a wide audience — owners, lenders, investors, employees and regulators.',
    ],
    limitations: [
      'Only as reliable as the financial statements behind them — window-dressing or differing accounting policies distort comparison.',
      'Ignores price-level (inflation) changes and qualitative factors such as management quality or brand.',
      'A single ratio in isolation can mislead; ratios reveal symptoms, not their causes.',
      'Historical in nature — they look backward and may not predict the future.',
    ],
    calc: 'ratio-analysis',
    gu: {
      title: 'ગુણોત્તર વિશ્લેષણ',
      blurb:
        'નફા-નુકસાન ખાતા અને સરવૈયાને પ્રવાહિતા, શોધનક્ષમતા, નફાકારકતા અને ઉથલા(turnover)ના ગુણોત્તરોમાં ફેરવો — અને તે શું દર્શાવે છે તે વાંચતાં શીખો.',
      overview: [
        'ગુણોત્તર વિશ્લેષણ એ નાણાકીય પત્રકોના વિશ્લેષણનું સૌથી વ્યાપક રીતે વપરાતું સાધન છે. ગુણોત્તર એટલે નાણાકીય પત્રકોમાંથી લીધેલા બે આંકડા વચ્ચેનો સંબંધ — દા.ત. ચાલુ મિલકતો સામે ચાલુ દેવાં — જેથી કેવળ સંપૂર્ણ આંકડાઓ કરતાં કામગીરીનું મૂલ્યાંકન વધુ અર્થપૂર્ણ રીતે થઈ શકે.',
        'ગુણોત્તરોને તેઓ જે પ્રશ્નનો જવાબ આપે છે તે મુજબ વર્ગીકૃત કરવામાં આવે છે: પ્રવાહિતા ગુણોત્તરો ટૂંકા ગાળાની શોધનક્ષમતા ચકાસે છે, શોધનક્ષમતા/ગિયરિંગ ગુણોત્તરો લાંબા ગાળાનું નાણાકીય માળખું ચકાસે છે, નફાકારકતા ગુણોત્તરો કમાણીશક્તિ ચકાસે છે, અને પ્રવૃત્તિ (ઉથલા) ગુણોત્તરો મિલકતો કેટલી કાર્યક્ષમતાથી વપરાય છે તે ચકાસે છે. એકલો એક ગુણોત્તર બહુ ઓછું કહે છે — તેનું મૂલ્ય સરખામણીમાં છે: પેઢીના પોતાના ભૂતકાળના વલણ સામે, અંદાજપત્ર સામે, કે ઉદ્યોગના સાથીઓ સામે.',
        '૨:૧ ચાલુ ગુણોત્તર કે ૧:૧ ઝડપી ગુણોત્તર જેવા “આદર્શ” આંકડા અંગૂઠાના નિયમો છે, કાયદા નહીં. ધોરણથી ઘણો ઊંચો ગુણોત્તર પણ એટલી જ ચેતવણી હોઈ શકે (નવરી રોકડ, ધીમે ફરતો માલ) જેટલો નીચો ગુણોત્તર. હંમેશાં અર્થઘટન કરો, કેવળ ગણતરી નહીં.',
      ],
      keyTerms: [
        { term: 'પ્રવાહિતા ગુણોત્તરો', def: 'પેઢી તેના ટૂંકા ગાળાનાં દેવાં સમયસર ચૂકવી શકે છે કે કેમ તે માપે છે (ચાલુ ગુણોત્તર, ઝડપી/એસિડ-ટેસ્ટ ગુણોત્તર).' },
        { term: 'શોધનક્ષમતા / ગિયરિંગ ગુણોત્તરો', def: 'ઉધાર ભંડોળ પરની નિર્ભરતા અને લાંબા ગાળાનું દેવું ચૂકવવાની ક્ષમતા માપે છે (દેવાં-માલિકી, વ્યાજ આવરણ, માલિકી ગુણોત્તર).' },
        { term: 'નફાકારકતા ગુણોત્તરો', def: 'વેચાણ કે મૂડી સામેની કમાણી માપે છે (કાચો/ચોખ્ખો નફો ગુણોત્તર, ROCE, ROE).' },
        { term: 'પ્રવૃત્તિ / ઉથલા ગુણોત્તરો', def: 'વેચાણ પેદા કરવા મિલકતો કેટલી સખત કામ કરે છે તે માપે છે (સ્ટૉક, મિલકત અને કાર્યશીલ મૂડી ઉથલા).' },
        { term: 'રોકાયેલી મૂડી', def: 'ધંધામાંનું લાંબા ગાળાનું ભંડોળ = માલિકીનું ભંડોળ + લાંબા ગાળાનું દેવું (અથવા કુલ મિલકતો − ચાલુ દેવાં).' },
      ],
      formulas: [
        { name: 'ચાલુ ગુણોત્તર', expr: 'Current Assets ÷ Current Liabilities', note: 'અંગૂઠાનો આદર્શ ૨ : ૧.' },
        { name: 'ઝડપી (એસિડ-ટેસ્ટ) ગુણોત્તર', expr: '(Current Assets − Inventory) ÷ Current Liabilities', note: 'અંગૂઠાનો આદર્શ ૧ : ૧.' },
        { name: 'દેવાં-માલિકી ગુણોત્તર', expr: 'Long-term Debt ÷ Shareholders’ Equity' },
        { name: 'વ્યાજ આવરણ', expr: 'EBIT ÷ Interest expense', note: 'ઊંચું = દેવું ચૂકવવામાં વધુ સરળતા.' },
        { name: 'કાચા નફાનો ગુણોત્તર', expr: '(Sales − COGS) ÷ Sales × 100' },
        { name: 'ચોખ્ખા નફાનો ગુણોત્તર', expr: 'Net Profit (PAT) ÷ Sales × 100' },
        { name: 'રોકાયેલી મૂડી પર વળતર (ROCE)', expr: 'EBIT ÷ Capital Employed × 100' },
        { name: 'માલિકી ભંડોળ પર વળતર (ROE)', expr: 'Net Profit ÷ Shareholders’ Equity × 100' },
        { name: 'સ્ટૉક ઉથલા', expr: 'COGS ÷ Average Inventory (વખત)' },
      ],
      procedure: {
        heading: 'ગુણોત્તરનો દાખલો કેવી રીતે ઉકેલવો',
        steps: [
          { title: 'આંકડા પસંદ કરો', detail: 'ગુણોત્તરને જરૂરી ચોક્કસ વસ્તુઓ નફા-નુકસાન ખાતા અને સરવૈયામાંથી ઓળખો — “ચાલુ” અને “બિન-ચાલુ” વર્ગીકરણ બાબતે સાવધ રહો.' },
          { title: 'પ્રમાણભૂત સૂત્ર વાપરો', detail: 'માન્ય સૂત્ર લાગુ કરો. જ્યાં સરેરાશ ઉપલબ્ધ હોય (દા.ત. સરેરાશ સ્ટૉક, સરેરાશ દેવાદાર) ત્યાં બંધ આંકડાને બદલે સરેરાશ વાપરો.' },
          { title: 'યોગ્ય સ્વરૂપમાં દર્શાવો', detail: 'પ્રવાહિતા/શોધનક્ષમતા ગુણોત્તરો “x : 1” તરીકે, નફાકારકતા % તરીકે, ઉથલા “વખત” તરીકે (અને જ્યાં પૂછ્યું હોય ત્યાં દિવસોમાં = 365 ÷ ઉથલા).' },
          { title: 'અર્થઘટન કરો', detail: 'આદર્શ, ગયા વર્ષ અને ઉદ્યોગ સામે સરખાવો. આંકડો પેઢી માટે શું દર્શાવે છે તે જણાવો — ગુણ ત્યાં જ છે.' },
        ],
      },
      examTips: [
        'સૂત્ર, મૂલ્ય મૂકવું અને એકમ સાથેનો જવાબ બતાવો — અંકગણિતમાં ભૂલ થાય તોપણ પરીક્ષક રીત માટે ગુણ આપે છે.',
        '“ટિપ્પણી કરો” પૂછે ત્યારે હંમેશાં તુલના કરો: આદર્શ ધોરણ, વલણ અને સાથીની સરખામણી.',
        'છેદ ધ્યાનમાં રાખો: ROCE રોકાયેલી મૂડી વાપરે, ROE કેવળ માલિકી ભંડોળ — બંને ભેળવવાં એ સૌથી સામાન્ય ભૂલ છે.',
      ],
      pitfalls: [
        '“આદર્શ” ગુણોત્તરને લક્ષ્ય ગણવું — ઘણો ઊંચો ચાલુ ગુણોત્તર નવરા સાધનો સૂચવી શકે.',
        '“ઝડપી મિલકતો”માં અગાઉથી ચૂકવેલ ખર્ચ સામેલ કરવો — તે સ્ટૉક સાથે બાકાત રખાય છે.',
        'જુદી હિસાબી નીતિ વાપરતી પેઢીઓના ગુણોત્તર સમાયોજન વિના સરખાવવા.',
      ],
      applications: [
        'બેંકો અને ધિરાણકર્તાઓ લોન મંજૂર કરતા પહેલાં પ્રવાહિતા અને ગિયરિંગ ગુણોત્તરથી અરજી ચકાસે છે.',
        'રોકાણકારો અને વિશ્લેષકો શૅર પસંદ કરવા કંપનીઓ વચ્ચે નફાકારકતા અને વળતર ગુણોત્તરો સરખાવે છે.',
        'સંચાલન આંતરિક નિયંત્રણ અને લક્ષ્યો/ધોરણો નક્કી કરવા ઉથલા અને કાર્યક્ષમતા ગુણોત્તરો વાપરે છે.',
        'ધિરાણ-રેટિંગ સંસ્થાઓ અને પુરવઠાકારો શરતો આપતા પહેલાં પેઢીની શોધનક્ષમતા ચકાસે છે.',
      ],
      advantages: [
        'વિશાળ નાણાકીય પત્રકોને થોડા નિર્ણય-તૈયાર સૂચકાંકોમાં સંકોચે છે.',
        'અર્થપૂર્ણ સરખામણી શક્ય બનાવે છે — વર્ષો વચ્ચે (વલણ), અંદાજપત્ર સામે, અને પેઢીઓ/ઉદ્યોગો વચ્ચે.',
        'પ્રવાહિતા, શોધનક્ષમતા, નફાકારકતા અને કાર્યક્ષમતામાંની તાકાત-નબળાઈ ઓળખે છે.',
        'માલિકો, ધિરાણકર્તાઓ, રોકાણકારો, કર્મચારીઓ અને નિયમનકારો — વ્યાપક પ્રેક્ષકો માટે ઉપયોગી.',
      ],
      limitations: [
        'પાછળનાં નાણાકીય પત્રકો જેટલા જ વિશ્વસનીય — ખોટો શણગાર કે જુદી નીતિ સરખામણી બગાડે.',
        'ભાવ-સ્તર (ફુગાવો) ફેરફાર અને ગુણાત્મક પરિબળો (સંચાલન ગુણવત્તા, બ્રાન્ડ) અવગણે છે.',
        'એકલો ગુણોત્તર ગેરમાર્ગે દોરી શકે; ગુણોત્તરો કારણ નહીં, લક્ષણ દર્શાવે છે.',
        'ઐતિહાસિક માહિતી — ભૂતકાળ તરફ જુએ છે અને ભવિષ્ય ભાખે એ જરૂરી નથી.',
      ],
      workedExample: {
        title: 'મુખ્ય પ્રવાહિતા અને નફાકારકતા ગુણોત્તર ગણવા',
        problem:
          'એક વેપારી દર્શાવે છે: વેચાણ ₹10,00,000; વેચાયેલા માલની પડતર ₹6,00,000; ચાલુ મિલકતો ₹4,00,000 (જેમાં સ્ટૉક ₹1,50,000); ચાલુ દેવાં ₹2,00,000. ચાલુ ગુણોત્તર, ઝડપી ગુણોત્તર અને કાચા નફાનો ગુણોત્તર શોધો.',
        steps: [
          { label: 'ચાલુ ગુણોત્તર = ચાલુ મિલકતો ÷ ચાલુ દેવાં', formula: '₹4,00,000 ÷ ₹2,00,000', result: '2 : 1' },
          { label: 'ઝડપી ગુણોત્તર = (ચાલુ મિલકતો − સ્ટૉક) ÷ ચાલુ દેવાં', formula: '(₹4,00,000 − ₹1,50,000) ÷ ₹2,00,000', result: '1.25 : 1' },
          { label: 'કાચો નફો = વેચાણ − વેચાયેલા માલની પડતર', formula: '₹10,00,000 − ₹6,00,000', result: '₹4,00,000' },
          { label: 'કાચા નફાનો ગુણોત્તર = કાચો નફો ÷ વેચાણ × 100', formula: '₹4,00,000 ÷ ₹10,00,000 × 100', result: '40%' },
        ],
        answer:
          'ચાલુ ગુણોત્તર 2 : 1 (પાઠ્યપુસ્તકના ધોરણને પૂરું કરે), ઝડપી ગુણોત્તર 1.25 : 1 (પેઢી સ્ટૉક વેચ્યા વિના પણ ચાલુ દેવાં આવરી શકે), અને તંદુરસ્ત 40% કાચો નફો.',
      },
      practice: [
        {
          q: 'પેઢીનો ચાલુ ગુણોત્તર 3 : 1 છે પણ ઝડપી ગુણોત્તર 0.8 : 1 છે. આ તફાવત શું સૂચવે છે?',
          answer:
            'ચાલુ મિલકતોનો મોટો ભાગ સ્ટૉક છે, જે ઓછો પ્રવાહી છે. મજબૂત ચાલુ ગુણોત્તર છતાં તાત્કાલિક પ્રવાહિતા નબળી છે — પેઢી ટૂંકાં દેવાં ચૂકવવા સ્ટૉક વેચવા પર આધાર રાખે છે.',
        },
        {
          q: 'લાંબા ગાળાની શોધનક્ષમતા કયો ગુણોત્તર શ્રેષ્ઠ માપે છે?',
          options: ['ચાલુ ગુણોત્તર', 'દેવાં-માલિકી ગુણોત્તર', 'સ્ટૉક ઉથલા', 'કાચા નફાનો ગુણોત્તર'],
          answer: 'દેવાં-માલિકી ગુણોત્તર — તે ઉધાર ભંડોળને માલિકના ભંડોળ સાથે સરખાવે છે, જે લાંબા ગાળાનું નાણાકીય જોખમ દર્શાવે છે.',
        },
        {
          q: 'ઘણો ઊંચો ચાલુ ગુણોત્તર ખરેખર ચેતવણીનું ચિહ્ન કેમ હોઈ શકે?',
          answer:
            'તે નવરી રોકડ, વધારે પડતો કે ધીમે ફરતો સ્ટૉક, કે નબળું કાર્યશીલ-મૂડી સંચાલન સૂચવી શકે — જરૂરી નથી કે નાણાકીય તાકાત.',
        },
      ],
    },
  },
  {
    id: 'fund-flow',
    title: 'Fund Flow Statement',
    subject: 'Financial Statement Analysis',
    icon: ArrowRightLeft,
    level: 'B.Com Sem 6 · CMA Inter',
    blurb:
      'Track the movement of working capital between two balance-sheet dates — sources, applications and the change in working capital.',
    readingMinutes: 11,
    tags: ['working capital', 'sources and applications', 'funds from operations', 'where got where gone'],
    overview: [
      'A fund flow statement explains the financial changes that occurred between two balance-sheet dates. Here the word “fund” means working capital — the excess of current assets over current liabilities — so the statement answers a single question: why did working capital change over the year?',
      'A “flow of funds” happens only when a transaction touches one current and one non-current account. A transaction wholly within current accounts (collecting from a debtor), or wholly within non-current accounts (converting shares into debentures), changes the form but not the total of working capital — so there is no flow.',
      'Fund flow analysis is built from three linked statements: the Schedule of Changes in Working Capital, the calculation of Funds from Operations (an adjusted profit & loss account), and the Fund Flow Statement itself (sources and applications). It is also called the “Statement of Sources and Application of Funds” or, memorably, the “Where Got, Where Gone” statement.',
    ],
    keyTerms: [
      { term: 'Fund', def: 'In this context, working capital = Current Assets − Current Liabilities.' },
      { term: 'Flow of funds', def: 'Any increase or decrease in working capital caused by a transaction between a current and a non-current account.' },
      { term: 'No flow', def: 'A transaction between two current accounts, or two non-current accounts — it does not change total working capital.' },
      { term: 'Funds from operations', def: 'Trading profit adjusted back for non-fund and non-operating items (e.g. depreciation added back).' },
      { term: 'Sources of funds', def: 'Funds from operations, issue of shares/debentures, long-term loans raised, sale of fixed assets/investments.' },
      { term: 'Applications of funds', def: 'Purchase of fixed assets/investments, repayment of loans, redemption of capital, dividends and tax paid.' },
    ],
    formulas: [
      { name: 'Working Capital', expr: 'Working Capital = Current Assets − Current Liabilities' },
      { name: 'Change in Working Capital', expr: 'Increase in WC = application of funds; Decrease in WC = source of funds' },
      {
        name: 'Funds from Operations',
        expr: 'Net Profit + Non-fund/non-operating debits − Non-operating credits',
        note: 'Add back: depreciation, goodwill/preliminary expenses written off, loss on sale of assets, transfer to reserves, proposed dividend & provision for tax (when treated as appropriations). Deduct: profit on sale of assets, dividend/interest income.',
      },
    ],
    procedure: {
      heading: 'The three-statement method',
      steps: [
        { title: '1 · Schedule of Changes in Working Capital', detail: 'List every current asset and current liability at both dates. An increase in a current asset (or a decrease in a current liability) increases working capital; the opposite decreases it. The net figure is the increase/decrease in working capital.' },
        { title: '2 · Funds from Operations', detail: 'Open an Adjusted P&L Account. Start from the year’s net profit and add back all non-fund and non-operating charges (depreciation, write-offs, loss on sale, proposed dividend, provision for tax); deduct non-operating incomes. The balancing figure is funds from operations.' },
        { title: '3 · Prepare ledger accounts for non-current items', detail: 'Where adjustments are involved (fixed assets, provision for tax, provision for depreciation), open ledger accounts to find the hidden source/application — e.g. fixed assets purchased or sold, tax actually paid.' },
        { title: '4 · Fund Flow Statement', detail: 'List all sources and all applications. The difference between the two equals the increase or decrease in working capital found in step 1 — that cross-check must tie.' },
      ],
    },
    examTips: [
      'Always cross-check: (Total Sources − Total Applications) must equal the change in working capital from the schedule. If it doesn’t, an item is mis-classified.',
      'Decide your treatment of provision for tax and proposed dividend (as a current liability vs an appropriation) and stay consistent — state your assumption.',
      'Depreciation is not a source of funds by itself; it is added back only because it was deducted in arriving at profit.',
    ],
    pitfalls: [
      'Recording a transaction between two current accounts as a “flow” — it is not.',
      'Forgetting to add back proposed dividend / provision for tax when computing funds from operations, then double-counting them as applications.',
      'Confusing fund flow (working-capital basis) with cash flow (cash basis) — they answer different questions.',
    ],
    references: [
      { label: 'Funds flow statement — working capital & FFO (illustrated)', url: 'https://www.futureaccountant.com/funds-flow-cash-flow/study-notes/funds-flow-statement-changes-working-capital-funds-from-operations-adjustments-illustration/f180/', kind: 'article', source: 'FutureAccountant' },
      { label: 'Fund flow statement format & example', url: 'https://www.wallstreetmojo.com/fund-flow-statement-format/', kind: 'article', source: 'WallStreetMojo' },
      { label: 'Fund flow statement & objectives', url: 'https://tallysolutions.com/accounting/fund-flow-statement/', kind: 'article', source: 'Tally' },
    ],
    workedExample: {
      title: 'Schedule of changes in working capital',
      problem:
        'From the current items below, find the change in working capital. Stock ₹50,000 → ₹70,000; Debtors ₹40,000 → ₹50,000; Cash ₹10,000 → ₹5,000; Creditors ₹30,000 → ₹45,000.',
      steps: [
        { label: 'Working capital (Year 1) = Current Assets − Current Liabilities', formula: '(50,000 + 40,000 + 10,000) − 30,000', result: '₹70,000' },
        { label: 'Working capital (Year 2)', formula: '(70,000 + 50,000 + 5,000) − 45,000', result: '₹80,000' },
        { label: 'Change in working capital = WC(Y2) − WC(Y1)', formula: '₹80,000 − ₹70,000', result: 'Increase ₹10,000' },
      ],
      answer:
        'Working capital rose by ₹10,000. An increase in working capital is shown as an application of funds in the fund flow statement — and ties back as the cross-check on the sources vs applications.',
    },
    practice: [
      {
        q: 'Is “cash collected from a debtor” a flow of funds? Why?',
        answer:
          'No. It is a transaction between two current accounts (cash ↑, debtors ↓), so total working capital is unchanged — there is no flow of funds.',
      },
      {
        q: 'An increase in working capital is treated in the fund flow statement as a:',
        options: ['Source of funds', 'Application of funds', 'Non-fund item'],
        answer: 'Application of funds — funds have been tied up in higher working capital.',
      },
      {
        q: 'How is depreciation treated when computing funds from operations, and why?',
        answer:
          'It is added back to net profit. Depreciation is a non-fund (non-cash) charge that reduced profit but did not reduce working capital.',
      },
    ],
    applications: [
      'Management uses it to see how long-term funds were raised and where they were applied during the year.',
      'Lenders check whether a term loan was actually used for the capital purpose it was sanctioned for.',
      'Helps plan the financing of expansion, dividends and repayments by revealing working-capital movements.',
      'Used to appraise the soundness of a firm’s financing policy — long-term funds for long-term uses.',
    ],
    advantages: [
      'Explains the change in working capital that the balance sheet alone does not reveal.',
      'Shows whether long-term funds financed long-term assets (sound) or merely working capital and dividends (unsound).',
      'Aids credit analysis and the managerial planning of funds.',
    ],
    limitations: [
      'Based on working capital, not cash — it can hide a cash crunch within a healthy working-capital position.',
      'Historical; it is prepared after the year-end from two balance sheets.',
      'Not a substitute for the income statement or the cash flow statement, and it ignores non-fund transactions.',
    ],
    calc: 'fund-flow',
    gu: {
      title: 'ભંડોળ પ્રવાહ પત્રક',
      blurb:
        'બે સરવૈયા-તારીખો વચ્ચે કાર્યશીલ મૂડીની હિલચાલ શોધો — ભંડોળના સ્રોત, વિનિયોગ અને કાર્યશીલ મૂડીમાં ફેરફાર.',
      overview: [
        'ભંડોળ પ્રવાહ પત્રક બે સરવૈયા-તારીખો વચ્ચે થયેલા નાણાકીય ફેરફારોને સમજાવે છે. અહીં “ભંડોળ (fund)” એટલે કાર્યશીલ મૂડી — ચાલુ મિલકતોનો ચાલુ દેવાં કરતાં વધારો — તેથી આ પત્રક એક જ પ્રશ્નનો જવાબ આપે છે: વર્ષ દરમિયાન કાર્યશીલ મૂડી શા માટે બદલાઈ?',
        '“ભંડોળનો પ્રવાહ” ત્યારે જ થાય જ્યારે કોઈ વ્યવહાર એક ચાલુ અને એક બિન-ચાલુ ખાતાને સ્પર્શે. કેવળ ચાલુ ખાતાંઓ વચ્ચેનો વ્યવહાર (દેવાદાર પાસેથી વસૂલાત), કે કેવળ બિન-ચાલુ ખાતાંઓ વચ્ચેનો વ્યવહાર (શૅરને ડિબેન્ચરમાં ફેરવવા), કાર્યશીલ મૂડીનું સ્વરૂપ બદલે છે પણ કુલ રકમ નહીં — તેથી કોઈ પ્રવાહ થતો નથી.',
        'ભંડોળ પ્રવાહ વિશ્લેષણ ત્રણ સંકળાયેલાં પત્રકોથી બને છે: કાર્યશીલ મૂડીમાં ફેરફારનું પત્રક, સંચાલનમાંથી ભંડોળ (Funds from Operations — એક સમાયોજિત નફા-નુકસાન ખાતું) ની ગણતરી, અને ભંડોળ પ્રવાહ પત્રક પોતે (સ્રોત અને વિનિયોગ). તેને “ભંડોળના સ્રોત અને વિનિયોગનું પત્રક” અથવા યાદગાર રીતે “ક્યાંથી મળ્યું, ક્યાં ગયું (Where Got, Where Gone)” પત્રક પણ કહે છે.',
      ],
      keyTerms: [
        { term: 'ભંડોળ (Fund)', def: 'આ સંદર્ભમાં, કાર્યશીલ મૂડી = ચાલુ મિલકતો − ચાલુ દેવાં.' },
        { term: 'ભંડોળનો પ્રવાહ', def: 'ચાલુ અને બિન-ચાલુ ખાતા વચ્ચેના વ્યવહારથી કાર્યશીલ મૂડીમાં થતો કોઈ પણ વધારો કે ઘટાડો.' },
        { term: 'કોઈ પ્રવાહ નહીં (No flow)', def: 'બે ચાલુ ખાતાં વચ્ચેનો, કે બે બિન-ચાલુ ખાતાં વચ્ચેનો વ્યવહાર — તે કુલ કાર્યશીલ મૂડી બદલતો નથી.' },
        { term: 'સંચાલનમાંથી ભંડોળ', def: 'વેપાર નફાને બિન-ભંડોળ અને બિન-સંચાલન બાબતો માટે સમાયોજિત કરીને (દા.ત. ઘસારો પાછો ઉમેરીને) મેળવેલ ભંડોળ.' },
        { term: 'ભંડોળના સ્રોત', def: 'સંચાલનમાંથી ભંડોળ, શૅર/ડિબેન્ચરની જાવક, ઊભા કરેલા લાંબા ગાળાના ધિરાણ, સ્થાયી મિલકતો/રોકાણોનું વેચાણ.' },
        { term: 'ભંડોળનો વિનિયોગ', def: 'સ્થાયી મિલકતો/રોકાણોની ખરીદી, ધિરાણની પરત ચૂકવણી, મૂડીનું વિમોચન, ડિવિડન્ડ અને ચૂકવેલ વેરો.' },
      ],
      formulas: [
        { name: 'કાર્યશીલ મૂડી', expr: 'Working Capital = Current Assets − Current Liabilities' },
        { name: 'કાર્યશીલ મૂડીમાં ફેરફાર', expr: 'Increase in WC = application of funds; Decrease in WC = source of funds' },
        {
          name: 'સંચાલનમાંથી ભંડોળ',
          expr: 'Net Profit + Non-fund/non-operating debits − Non-operating credits',
          note: 'પાછું ઉમેરો: ઘસારો, પાઘડી/પ્રારંભિક ખર્ચ માંડી વાળ્યા, મિલકત વેચાણ પરની ખોટ, અનામતમાં તબદીલી, સૂચિત ડિવિડન્ડ અને વેરા જોગવાઈ (જ્યારે વિનિયોગ તરીકે ગણાય). બાદ કરો: મિલકત વેચાણ પરનો નફો, ડિવિડન્ડ/વ્યાજ આવક.',
        },
      ],
      procedure: {
        heading: 'ત્રણ-પત્રક રીત',
        steps: [
          { title: '૧ · કાર્યશીલ મૂડીમાં ફેરફારનું પત્રક', detail: 'બંને તારીખે દરેક ચાલુ મિલકત અને ચાલુ દેવું યાદી કરો. ચાલુ મિલકતમાં વધારો (કે ચાલુ દેવાંમાં ઘટાડો) કાર્યશીલ મૂડી વધારે છે; ઊલટું તેને ઘટાડે છે. ચોખ્ખો આંકડો એ કાર્યશીલ મૂડીમાં વધારો/ઘટાડો છે.' },
          { title: '૨ · સંચાલનમાંથી ભંડોળ', detail: 'એક સમાયોજિત નફા-નુકસાન ખાતું ખોલો. વર્ષના ચોખ્ખા નફાથી શરૂ કરી બધી બિન-ભંડોળ અને બિન-સંચાલન બાબતો (ઘસારો, માંડી વાળેલ ખર્ચ, વેચાણ પરની ખોટ, સૂચિત ડિવિડન્ડ, વેરા જોગવાઈ) પાછી ઉમેરો; બિન-સંચાલન આવકો બાદ કરો. સરવાળાનો આંકડો સંચાલનમાંથી ભંડોળ છે.' },
          { title: '૩ · બિન-ચાલુ બાબતો માટે ખાતાવહી ખાતાં તૈયાર કરો', detail: 'જ્યાં સમાયોજન સંકળાયેલાં હોય (સ્થાયી મિલકતો, વેરા જોગવાઈ, ઘસારા જોગવાઈ) ત્યાં છુપાયેલ સ્રોત/વિનિયોગ શોધવા ખાતાવહી ખાતાં ખોલો — દા.ત. ખરીદેલી કે વેચેલી સ્થાયી મિલકતો, ખરેખર ચૂકવેલ વેરો.' },
          { title: '૪ · ભંડોળ પ્રવાહ પત્રક', detail: 'બધા સ્રોત અને બધા વિનિયોગ યાદી કરો. બંને વચ્ચેનો તફાવત પગલું ૧માં મળેલ કાર્યશીલ મૂડીમાં વધારા કે ઘટાડા જેટલો જ થાય — એ ચકાસણી મળવી જ જોઈએ.' },
        ],
      },
      examTips: [
        'હંમેશાં ચકાસો: (કુલ સ્રોત − કુલ વિનિયોગ) એ પત્રકમાંના કાર્યશીલ મૂડીના ફેરફાર જેટલો જ હોવો જોઈએ. ન મળે તો કોઈ બાબત ખોટી રીતે વર્ગીકૃત છે.',
        'વેરા જોગવાઈ અને સૂચિત ડિવિડન્ડનો વ્યવહાર (ચાલુ દેવું ગણવા કે વિનિયોગ) નક્કી કરો અને સતત રાખો — તમારી ધારણા જણાવો.',
        'ઘસારો જાતે ભંડોળનો સ્રોત નથી; નફો કાઢવામાં તે બાદ થયો હતો માટે જ પાછો ઉમેરાય છે.',
      ],
      pitfalls: [
        'બે ચાલુ ખાતાં વચ્ચેના વ્યવહારને “પ્રવાહ” તરીકે નોંધવો — તે પ્રવાહ નથી.',
        'સંચાલનમાંથી ભંડોળ ગણતી વખતે સૂચિત ડિવિડન્ડ / વેરા જોગવાઈ પાછી ઉમેરવાનું ભૂલવું, અને પછી તેને વિનિયોગ તરીકે બેવડી ગણવી.',
        'ભંડોળ પ્રવાહ (કાર્યશીલ-મૂડી આધાર) ને રોકડ પ્રવાહ (રોકડ આધાર) સાથે ગૂંચવવો — તેઓ જુદા પ્રશ્નોના જવાબ આપે છે.',
      ],
      workedExample: {
        title: 'કાર્યશીલ મૂડીમાં ફેરફારનું પત્રક',
        problem:
          'નીચેની ચાલુ બાબતોમાંથી કાર્યશીલ મૂડીમાં ફેરફાર શોધો. સ્ટૉક ₹50,000 → ₹70,000; દેવાદાર ₹40,000 → ₹50,000; રોકડ ₹10,000 → ₹5,000; લેણદાર ₹30,000 → ₹45,000.',
        steps: [
          { label: 'કાર્યશીલ મૂડી (વર્ષ ૧) = ચાલુ મિલકતો − ચાલુ દેવાં', formula: '(50,000 + 40,000 + 10,000) − 30,000', result: '₹70,000' },
          { label: 'કાર્યશીલ મૂડી (વર્ષ ૨)', formula: '(70,000 + 50,000 + 5,000) − 45,000', result: '₹80,000' },
          { label: 'કાર્યશીલ મૂડીમાં ફેરફાર = કા.મૂડી(વ૨) − કા.મૂડી(વ૧)', formula: '₹80,000 − ₹70,000', result: 'વધારો ₹10,000' },
        ],
        answer:
          'કાર્યશીલ મૂડી ₹10,000 વધી. કાર્યશીલ મૂડીમાં વધારો ભંડોળ પ્રવાહ પત્રકમાં ભંડોળના વિનિયોગ તરીકે દર્શાવાય છે — અને સ્રોત સામે વિનિયોગની ચકાસણી તરીકે મેળ ખાય છે.',
      },
      practice: [
        {
          q: '“દેવાદાર પાસેથી વસૂલ થયેલ રોકડ” એ ભંડોળનો પ્રવાહ છે? કેમ?',
          answer:
            'ના. તે બે ચાલુ ખાતાં વચ્ચેનો વ્યવહાર છે (રોકડ ↑, દેવાદાર ↓), તેથી કુલ કાર્યશીલ મૂડી અપરિવર્તિત રહે છે — કોઈ ભંડોળનો પ્રવાહ નથી.',
        },
        {
          q: 'કાર્યશીલ મૂડીમાં વધારો ભંડોળ પ્રવાહ પત્રકમાં શા તરીકે ગણાય છે:',
          options: ['ભંડોળનો સ્રોત', 'ભંડોળનો વિનિયોગ', 'બિન-ભંડોળ બાબત'],
          answer: 'ભંડોળનો વિનિયોગ — વધેલી કાર્યશીલ મૂડીમાં ભંડોળ રોકાઈ ગયું છે.',
        },
        {
          q: 'સંચાલનમાંથી ભંડોળ ગણતી વખતે ઘસારાનો વ્યવહાર કેવી રીતે થાય, અને કેમ?',
          answer:
            'તેને ચોખ્ખા નફામાં પાછો ઉમેરાય છે. ઘસારો એ બિન-ભંડોળ (બિન-રોકડ) ખર્ચ છે જેણે નફો ઘટાડ્યો પણ કાર્યશીલ મૂડી ઘટાડી નહીં.',
        },
      ],
      applications: [
        'સંચાલન વર્ષ દરમિયાન લાંબા ગાળાનું ભંડોળ કેવી રીતે ઊભું થયું અને ક્યાં વપરાયું તે જોવા તેનો ઉપયોગ કરે છે.',
        'ધિરાણકર્તાઓ ચકાસે છે કે મુદત-ધિરાણ ખરેખર તે જે મૂડી-હેતુ માટે મંજૂર થયું હતું તે માટે જ વપરાયું કે નહીં.',
        'કાર્યશીલ-મૂડીની હિલચાલ ઉઘાડી પાડીને વિસ્તરણ, ડિવિડન્ડ અને પરત ચૂકવણીના નાણાકીય આયોજનમાં મદદ કરે છે.',
        'પેઢીની નાણાકીય નીતિની યોગ્યતા ચકાસવા વપરાય છે — લાંબા ગાળાના ઉપયોગ માટે લાંબા ગાળાનું ભંડોળ.',
      ],
      advantages: [
        'કાર્યશીલ મૂડીમાં ફેરફાર સમજાવે છે જે એકલું સરવૈયું દર્શાવતું નથી.',
        'દર્શાવે છે કે લાંબા ગાળાના ભંડોળે લાંબા ગાળાની મિલકતો વસાવી (યોગ્ય) કે કેવળ કાર્યશીલ મૂડી અને ડિવિડન્ડ (અયોગ્ય).',
        'ધિરાણ વિશ્લેષણ અને ભંડોળના સંચાલકીય આયોજનમાં મદદ કરે છે.',
      ],
      limitations: [
        'રોકડ નહીં, કાર્યશીલ મૂડી પર આધારિત — તંદુરસ્ત કાર્યશીલ-મૂડી સ્થિતિમાં પણ રોકડ ભીડ છુપાવી શકે છે.',
        'ઐતિહાસિક; બે સરવૈયાંમાંથી વર્ષાંત પછી તૈયાર થાય છે.',
        'આવક પત્રક કે રોકડ પ્રવાહ પત્રકનો વિકલ્પ નથી, અને બિન-ભંડોળ વ્યવહારોને અવગણે છે.',
      ],
    },
  },
  {
    id: 'cash-flow',
    title: 'Cash Flow Statement (AS 3)',
    subject: 'Financial Statement Analysis',
    icon: Wallet,
    level: 'B.Com · CA/CMA Inter',
    blurb:
      'Classify the year’s cash movements into operating, investing and financing activities under AS 3 — using the indirect method.',
    readingMinutes: 12,
    tags: ['as 3', 'ind as 7', 'operating investing financing', 'indirect method', 'cash equivalents'],
    overview: [
      'A cash flow statement shows what actually happened to a business’s cash and cash equivalents during the year. Under Accounting Standard 3 (AS 3) — and its Ind AS 7 counterpart — cash flows are classified into three activities: operating, investing and financing. This classification lets a reader see how cash was generated and where it went.',
      'Operating activities are the principal revenue-producing activities. Investing activities are the acquisition and disposal of long-term assets and investments. Financing activities change the size and composition of owners’ capital and borrowings. The same transaction is reported in exactly one activity.',
      'The operating section can be prepared two ways. The direct method lists actual cash receipts and payments. The indirect method — the one shown in most Indian B.Com problems — starts from net profit and “de-accrues” it: non-cash and non-operating items are added back or removed, then working-capital changes are adjusted, to arrive at cash from operations. Remember: cash flow is not the same as profit.',
    ],
    keyTerms: [
      { term: 'Cash & cash equivalents', def: 'Cash on hand, demand deposits, and short-term highly liquid investments readily convertible to known amounts of cash with insignificant risk of value change.' },
      { term: 'Operating activities', def: 'Principal revenue-producing activities and others that are not investing or financing — the core of the business.' },
      { term: 'Investing activities', def: 'Purchase and sale of fixed assets and investments; interest and dividend income received.' },
      { term: 'Financing activities', def: 'Issue/redemption of shares and debentures, raising/repaying loans, dividend and interest paid.' },
      { term: 'Indirect method', def: 'Operating cash flow derived by adjusting net profit for non-cash items and working-capital changes.' },
    ],
    formulas: [
      {
        name: 'Operating cash flow (indirect)',
        expr: 'Net profit + non-cash & non-operating charges − non-operating incomes ± working-capital changes − tax paid',
        note: 'Add back depreciation, interest expense, loss on sale, goodwill written off; deduct interest/dividend income and profit on sale. Then add decreases in current assets / increases in current liabilities (and vice-versa).',
      },
      { name: 'Net change in cash', expr: 'Operating CF + Investing CF + Financing CF' },
      { name: 'Closing cash', expr: 'Opening cash & equivalents + Net change in cash' },
    ],
    procedure: {
      heading: 'Indirect-method workflow',
      steps: [
        { title: '1 · Start from net profit', detail: 'Take the profit for the year (closing balance of P&L − opening balance), and add back provision for tax, proposed dividend and transfer to reserves to reach net profit before tax and extraordinary items.' },
        { title: '2 · Adjust non-cash & non-operating items', detail: 'Add back depreciation, interest on borrowings, loss on sale and amounts written off; deduct interest/dividend income and profit on sale of assets. This gives operating profit before working-capital changes.' },
        { title: '3 · Adjust working-capital changes', detail: 'Add a decrease in current assets and an increase in current liabilities; deduct an increase in current assets and a decrease in current liabilities. Then deduct tax paid to get net cash from operating activities.' },
        { title: '4 · Investing activities', detail: 'Inflows: sale of fixed assets/investments, interest & dividend received. Outflows: purchase of fixed assets/investments.' },
        { title: '5 · Financing activities', detail: 'Inflows: issue of shares/debentures, loans raised. Outflows: redemption, repayment of loans, interest paid, dividend paid.' },
        { title: '6 · Reconcile', detail: 'Sum the three activities; add opening cash & equivalents. The total must equal closing cash & equivalents per the balance sheet.' },
      ],
    },
    examTips: [
      'Lay the statement out in the standard three-activity format with sub-totals — presentation carries marks.',
      'Interest and dividend paid are usually financing; interest and dividend received are usually investing — be consistent and state it.',
      'A healthy firm’s cash from operations should normally exceed its net profit over time.',
    ],
    pitfalls: [
      'Adding depreciation as a “source of cash” conceptually — it is added back only to undo its earlier deduction from profit.',
      'Netting purchase and sale of fixed assets — show the gross figures separately under investing.',
      'Confusing the cash flow statement (AS 3, cash basis) with the fund flow statement (working-capital basis).',
    ],
    references: [
      { label: 'AS 3 — Cash Flow Statements', url: 'https://cleartax.in/s/as-3-cash-flow-statements', kind: 'article', source: 'ClearTax' },
      { label: 'AS 3 standard text', url: 'https://www.icai.org/post/accounting-standards', kind: 'official', source: 'ICAI' },
      { label: 'Cash flow statement explained', url: 'https://corporatefinanceinstitute.com/resources/accounting/cash-flow-statement/', kind: 'article', source: 'CFI' },
    ],
    workedExample: {
      title: 'Cash from operating activities (indirect method)',
      problem:
        'Net profit before tax ₹1,00,000. Depreciation ₹20,000; loss on sale of machinery ₹5,000; profit on sale of investments ₹10,000. During the year debtors rose ₹15,000, stock fell ₹12,000 and creditors rose ₹8,000. Tax paid ₹25,000. Find net cash from operating activities.',
      steps: [
        { label: 'Net profit before tax', result: '₹1,00,000' },
        { label: 'Add back non-cash / non-operating items: + Depreciation + Loss on sale − Profit on sale of investments', formula: '1,00,000 + 20,000 + 5,000 − 10,000', result: '₹1,15,000 (operating profit before working-capital changes)' },
        { label: 'Adjust working capital: − Increase in debtors + Decrease in stock + Increase in creditors', formula: '1,15,000 − 15,000 + 12,000 + 8,000', result: '₹1,20,000' },
        { label: 'Less: Tax paid', formula: '1,20,000 − 25,000', result: '₹95,000' },
      ],
      answer: 'Net cash from operating activities = ₹95,000.',
    },
    practice: [
      {
        q: 'Purchase of machinery is classified under which activity?',
        options: ['Operating', 'Investing', 'Financing'],
        answer: 'Investing — it is the acquisition of a long-term asset.',
      },
      {
        q: 'For a non-financial company under AS 3, under which activity is dividend paid shown?',
        answer: 'Financing activity — it is a return to the providers of capital.',
      },
      {
        q: 'Why is depreciation added back in the indirect method?',
        answer:
          'It is a non-cash expense that was deducted in computing profit; adding it back removes its effect to arrive at the cash actually generated.',
      },
    ],
    applications: [
      'A mandatory statement for listed and larger companies under AS 3 / Ind AS 7 — used by every external reader.',
      'Lenders and investors judge whether operations generate enough cash to service debt and pay dividends.',
      'Management uses it for short-term cash planning and to assess earnings quality (cash vs accrual profit).',
    ],
    advantages: [
      'Shows the true cash position and liquidity, which an accrual profit figure can mask.',
      'Classifies cash movements into operating, investing and financing — making it clear how cash was generated and used.',
      'Helps assess the firm’s ability to meet obligations, pay dividends and fund growth from internal cash.',
    ],
    limitations: [
      'Ignores significant non-cash transactions (e.g. shares issued to buy an asset).',
      'Historical; it does not by itself forecast future cash — a cash budget does that.',
      'Can be affected by the timing of receipts and payments around the year-end, so it is open to manipulation.',
    ],
    calc: 'cash-flow',
    gu: {
      title: 'રોકડ પ્રવાહ પત્રક (AS 3)',
      blurb:
        'વર્ષ દરમિયાનની રોકડ હિલચાલને AS 3 હેઠળ સંચાલન, રોકાણ અને નાણાકીય (financing) પ્રવૃત્તિઓમાં વર્ગીકૃત કરો — પરોક્ષ રીત વાપરીને.',
      overview: [
        'રોકડ પ્રવાહ પત્રક દર્શાવે છે કે વર્ષ દરમિયાન ધંધાની રોકડ અને રોકડ-સમકક્ષમાં ખરેખર શું થયું. હિસાબી ધોરણ ૩ (AS 3) — અને તેના સમકક્ષ Ind AS 7 — હેઠળ રોકડ પ્રવાહોને ત્રણ પ્રવૃત્તિઓમાં વર્ગીકૃત કરાય છે: સંચાલન, રોકાણ અને નાણાકીય. આ વર્ગીકરણ વાચકને દર્શાવે છે કે રોકડ કેવી રીતે પેદા થઈ અને ક્યાં ગઈ.',
        'સંચાલન પ્રવૃત્તિઓ એ મુખ્ય આવક પેદા કરતી પ્રવૃત્તિઓ છે. રોકાણ પ્રવૃત્તિઓ એટલે લાંબા ગાળાની મિલકતો અને રોકાણોની ખરીદી અને નિકાલ. નાણાકીય પ્રવૃત્તિઓ માલિકોની મૂડી અને ઉધારના કદ અને બંધારણને બદલે છે. એક જ વ્યવહાર ચોક્કસ એક જ પ્રવૃત્તિમાં દર્શાવાય છે.',
        'સંચાલન વિભાગ બે રીતે તૈયાર થઈ શકે. પ્રત્યક્ષ રીત ખરેખરની રોકડ આવક અને ચૂકવણીની યાદી કરે છે. પરોક્ષ રીત — મોટાભાગના ભારતીય B.Com દાખલાઓમાં દર્શાવાતી — ચોખ્ખા નફાથી શરૂ કરી તેને “de-accrue” કરે છે: બિન-રોકડ અને બિન-સંચાલન બાબતો પાછી ઉમેરાય કે કાઢી નખાય, પછી કાર્યશીલ-મૂડીના ફેરફારો સમાયોજિત કરી સંચાલનમાંથી રોકડ મેળવાય છે. યાદ રાખો: રોકડ પ્રવાહ એ નફા સમાન નથી.',
      ],
      keyTerms: [
        { term: 'રોકડ અને રોકડ-સમકક્ષ', def: 'હાથ પરની રોકડ, માગ-થાપણો, અને ટૂંકા ગાળાનાં અત્યંત પ્રવાહી રોકાણો જે જાણીતી રોકડ રકમમાં સહેલાઈથી ફેરવાય અને જેમાં મૂલ્ય બદલાવાનું જોખમ નહિવત્ હોય.' },
        { term: 'સંચાલન પ્રવૃત્તિઓ', def: 'મુખ્ય આવક પેદા કરતી અને રોકાણ કે નાણાકીય ન હોય તેવી અન્ય પ્રવૃત્તિઓ — ધંધાનો મુખ્ય ભાગ.' },
        { term: 'રોકાણ પ્રવૃત્તિઓ', def: 'સ્થાયી મિલકતો અને રોકાણોની ખરીદી અને વેચાણ; મળેલ વ્યાજ અને ડિવિડન્ડ આવક.' },
        { term: 'નાણાકીય પ્રવૃત્તિઓ', def: 'શૅર અને ડિબેન્ચરની જાવક/વિમોચન, ધિરાણ ઊભું કરવું/પરત કરવું, ચૂકવેલ ડિવિડન્ડ અને વ્યાજ.' },
        { term: 'પરોક્ષ રીત', def: 'ચોખ્ખા નફાને બિન-રોકડ બાબતો અને કાર્યશીલ-મૂડીના ફેરફારો માટે સમાયોજિત કરીને મેળવેલ સંચાલન રોકડ પ્રવાહ.' },
      ],
      formulas: [
        {
          name: 'સંચાલન રોકડ પ્રવાહ (પરોક્ષ)',
          expr: 'Net profit + non-cash & non-operating charges − non-operating incomes ± working-capital changes − tax paid',
          note: 'ઘસારો, વ્યાજ ખર્ચ, વેચાણ પરની ખોટ, માંડી વાળેલ પાઘડી પાછી ઉમેરો; વ્યાજ/ડિવિડન્ડ આવક અને વેચાણ પરનો નફો બાદ કરો. પછી ચાલુ મિલકતોમાં ઘટાડો / ચાલુ દેવાંમાં વધારો ઉમેરો (અને ઊલટું).',
        },
        { name: 'રોકડમાં ચોખ્ખો ફેરફાર', expr: 'Operating CF + Investing CF + Financing CF' },
        { name: 'આખર રોકડ', expr: 'Opening cash & equivalents + Net change in cash' },
      ],
      procedure: {
        heading: 'પરોક્ષ-રીતનો કાર્યક્રમ',
        steps: [
          { title: '૧ · ચોખ્ખા નફાથી શરૂ કરો', detail: 'વર્ષનો નફો લો (નફા-નુકસાન ખાતાની આખર બાકી − શરૂ બાકી), અને વેરા જોગવાઈ, સૂચિત ડિવિડન્ડ અને અનામતમાં તબદીલી પાછી ઉમેરી વેરા અને અસાધારણ બાબતો પૂર્વેનો ચોખ્ખો નફો મેળવો.' },
          { title: '૨ · બિન-રોકડ અને બિન-સંચાલન બાબતો સમાયોજિત કરો', detail: 'ઘસારો, ઉધાર પરનું વ્યાજ, વેચાણ પરની ખોટ અને માંડી વાળેલ રકમ પાછી ઉમેરો; વ્યાજ/ડિવિડન્ડ આવક અને મિલકત વેચાણ પરનો નફો બાદ કરો. આ કાર્યશીલ-મૂડીના ફેરફાર પૂર્વેનો સંચાલન નફો આપે છે.' },
          { title: '૩ · કાર્યશીલ-મૂડીના ફેરફારો સમાયોજિત કરો', detail: 'ચાલુ મિલકતમાં ઘટાડો અને ચાલુ દેવાંમાં વધારો ઉમેરો; ચાલુ મિલકતમાં વધારો અને ચાલુ દેવાંમાં ઘટાડો બાદ કરો. પછી ચૂકવેલ વેરો બાદ કરી સંચાલન પ્રવૃત્તિઓમાંથી ચોખ્ખી રોકડ મેળવો.' },
          { title: '૪ · રોકાણ પ્રવૃત્તિઓ', detail: 'આવક: સ્થાયી મિલકતો/રોકાણોનું વેચાણ, મળેલ વ્યાજ અને ડિવિડન્ડ. જાવક: સ્થાયી મિલકતો/રોકાણોની ખરીદી.' },
          { title: '૫ · નાણાકીય પ્રવૃત્તિઓ', detail: 'આવક: શૅર/ડિબેન્ચરની જાવક, ઊભું કરેલું ધિરાણ. જાવક: વિમોચન, ધિરાણની પરત ચૂકવણી, ચૂકવેલ વ્યાજ, ચૂકવેલ ડિવિડન્ડ.' },
          { title: '૬ · મેળ કરો', detail: 'ત્રણેય પ્રવૃત્તિઓનો સરવાળો કરો; શરૂની રોકડ અને રોકડ-સમકક્ષ ઉમેરો. કુલ આંકડો સરવૈયા મુજબ આખર રોકડ અને રોકડ-સમકક્ષ જેટલો જ થવો જોઈએ.' },
        ],
      },
      examTips: [
        'પત્રકને પ્રમાણભૂત ત્રણ-પ્રવૃત્તિ સ્વરૂપમાં પેટા-સરવાળા સાથે ગોઠવો — રજૂઆતના ગુણ મળે છે.',
        'ચૂકવેલ વ્યાજ અને ડિવિડન્ડ સામાન્ય રીતે નાણાકીય; મળેલ વ્યાજ અને ડિવિડન્ડ સામાન્ય રીતે રોકાણ — સતત રાખો અને જણાવો.',
        'તંદુરસ્ત પેઢીની સંચાલનમાંથી રોકડ સામાન્ય રીતે સમય જતાં તેના ચોખ્ખા નફા કરતાં વધારે હોવી જોઈએ.',
      ],
      pitfalls: [
        'ઘસારાને વિચારમાં “રોકડનો સ્રોત” ગણવો — તે કેવળ નફામાંથી તેની અગાઉની બાદબાકી રદ કરવા પાછો ઉમેરાય છે.',
        'સ્થાયી મિલકતોની ખરીદી અને વેચાણને ચોખ્ખા (net) કરવા — રોકાણ હેઠળ કુલ આંકડા અલગ દર્શાવો.',
        'રોકડ પ્રવાહ પત્રક (AS 3, રોકડ આધાર) ને ભંડોળ પ્રવાહ પત્રક (કાર્યશીલ-મૂડી આધાર) સાથે ગૂંચવવો.',
      ],
      workedExample: {
        title: 'સંચાલન પ્રવૃત્તિઓમાંથી રોકડ (પરોક્ષ રીત)',
        problem:
          'વેરા પૂર્વેનો ચોખ્ખો નફો ₹1,00,000. ઘસારો ₹20,000; યંત્ર વેચાણ પરની ખોટ ₹5,000; રોકાણ વેચાણ પરનો નફો ₹10,000. વર્ષ દરમિયાન દેવાદાર ₹15,000 વધ્યા, સ્ટૉક ₹12,000 ઘટ્યો અને લેણદાર ₹8,000 વધ્યા. ચૂકવેલ વેરો ₹25,000. સંચાલન પ્રવૃત્તિઓમાંથી ચોખ્ખી રોકડ શોધો.',
        steps: [
          { label: 'વેરા પૂર્વેનો ચોખ્ખો નફો', result: '₹1,00,000' },
          { label: 'બિન-રોકડ / બિન-સંચાલન બાબતો પાછી ઉમેરો: + ઘસારો + વેચાણ પરની ખોટ − રોકાણ વેચાણ પરનો નફો', formula: '1,00,000 + 20,000 + 5,000 − 10,000', result: '₹1,15,000 (કાર્યશીલ-મૂડીના ફેરફાર પૂર્વેનો સંચાલન નફો)' },
          { label: 'કાર્યશીલ મૂડી સમાયોજિત કરો: − દેવાદારમાં વધારો + સ્ટૉકમાં ઘટાડો + લેણદારમાં વધારો', formula: '1,15,000 − 15,000 + 12,000 + 8,000', result: '₹1,20,000' },
          { label: 'બાદ: ચૂકવેલ વેરો', formula: '1,20,000 − 25,000', result: '₹95,000' },
        ],
        answer: 'સંચાલન પ્રવૃત્તિઓમાંથી ચોખ્ખી રોકડ = ₹95,000.',
      },
      practice: [
        {
          q: 'યંત્રની ખરીદી કઈ પ્રવૃત્તિ હેઠળ વર્ગીકૃત થાય?',
          options: ['સંચાલન', 'રોકાણ', 'નાણાકીય'],
          answer: 'રોકાણ — તે લાંબા ગાળાની મિલકતની ખરીદી છે.',
        },
        {
          q: 'AS 3 હેઠળ બિન-નાણાકીય કંપની માટે ચૂકવેલ ડિવિડન્ડ કઈ પ્રવૃત્તિ હેઠળ દર્શાવાય?',
          answer: 'નાણાકીય પ્રવૃત્તિ — તે મૂડી પૂરી પાડનારાઓને વળતર છે.',
        },
        {
          q: 'પરોક્ષ રીતમાં ઘસારો કેમ પાછો ઉમેરાય છે?',
          answer:
            'તે બિન-રોકડ ખર્ચ છે જે નફો ગણવામાં બાદ થયો હતો; તેને પાછો ઉમેરતાં તેની અસર રદ થઈ ખરેખર પેદા થયેલી રોકડ મળે છે.',
        },
      ],
      applications: [
        'AS 3 / Ind AS 7 હેઠળ સૂચિબદ્ધ અને મોટી કંપનીઓ માટે ફરજિયાત પત્રક — દરેક બાહ્ય વાચક વાપરે છે.',
        'ધિરાણકર્તાઓ અને રોકાણકારો ચકાસે છે કે સંચાલન દેવું ચૂકવવા અને ડિવિડન્ડ આપવા પૂરતી રોકડ પેદા કરે છે કે નહીં.',
        'સંચાલન તેનો ઉપયોગ ટૂંકા ગાળાના રોકડ આયોજન અને કમાણીની ગુણવત્તા (રોકડ વિરુદ્ધ ઉપચય નફો) ચકાસવા કરે છે.',
      ],
      advantages: [
        'સાચી રોકડ સ્થિતિ અને પ્રવાહિતા દર્શાવે છે, જે ઉપચય નફાનો આંકડો છુપાવી શકે.',
        'રોકડ હિલચાલને સંચાલન, રોકાણ અને નાણાકીયમાં વર્ગીકૃત કરે છે — સ્પષ્ટ કરે છે કે રોકડ કેવી રીતે પેદા થઈ અને વપરાઈ.',
        'પેઢીની જવાબદારીઓ પૂરી કરવાની, ડિવિડન્ડ આપવાની અને આંતરિક રોકડથી વૃદ્ધિ ભંડોળ આપવાની ક્ષમતા ચકાસવામાં મદદ કરે છે.',
      ],
      limitations: [
        'મહત્ત્વના બિન-રોકડ વ્યવહારોને અવગણે છે (દા.ત. મિલકત ખરીદવા જારી કરેલ શૅર).',
        'ઐતિહાસિક; તે જાતે ભવિષ્યની રોકડ ભાખતું નથી — એ કામ રોકડ અંદાજપત્ર કરે છે.',
        'વર્ષાંત આસપાસ આવક અને ચૂકવણીના સમય પર આધાર રાખે છે, તેથી તેમાં ચાલાકી શક્ય છે.',
      ],
    },
  },

  /* =================================================== Budgetary Control */
  {
    id: 'cash-budget',
    gu: {
      title: 'રોકડ અંદાજપત્ર',
      blurb:
        'મહિને-મહિને રોકડ આવક અને ચૂકવણીનો અંદાજ બાંધો — જેથી વધારો, ઘટ અને લઘુતમ રોકડ બાકી જાળવવા જરૂરી ધિરાણ અગાઉથી દેખાય.',
      overview: [
        'રોકડ અંદાજપત્ર એ ભવિષ્યના ગાળા માટેની — સામાન્ય રીતે મહિને-મહિને — રોકડ આવક અને ચૂકવણીનો અંદાજ છે. ધંધો તૈયાર કરે છે તે અંદાજપત્રોમાં તે સૌથી વ્યવહારુ છે: રોકડ ક્યારે ખેંચ રહેશે અને ક્યારે વધારામાં હશે તે અગાઉથી દર્શાવે છે, જેથી પેઢી ઘટ આવે તે પહેલાં ધિરાણ ગોઠવી શકે કે નવરી રોકડ ઉત્પાદક રીતે રોકી શકે.',
        'સૌથી સામાન્ય રીત એ આવક-અને-ચૂકવણી (receipts-and-payments) રીત છે: શરૂઆતની બાકીમાં બધી અપેક્ષિત રોકડ આવક ઉમેરો, બધી અપેક્ષિત રોકડ ચૂકવણી બાદ કરો, અને બાકી રહે તે આખર બાકી — જે પછીના મહિનાની શરૂઆતની બાકી બને છે. અંદાજપત્રમાં કેવળ રોકડ બાબતો જ આવે છે; ઘસારા જેવા બિન-રોકડ ખર્ચ બાકાત રખાય છે.',
        'આવકને વસૂલાતની ઢબ (“lag”) મુજબ સમય આપવો જોઈએ: જો વેચાણના 60% વેચાણના મહિને જ વસૂલ થાય, 30% પછીના મહિને અને 10% ત્રીજા મહિને, તો દરેક મહિનાની વસૂલાત કેટલાક મહિનાના વેચાણમાંથી બંધાય છે. ચૂકવણીને પણ એ જ રીતે સમય અપાય છે. જ્યાં લઘુતમ રોકડ બાકી જાળવવાની હોય, ત્યાં અંદાજિત કોઈ પણ ઘટ આયોજનબદ્ધ ઉધારથી પૂરી કરાય છે.',
      ],
      keyTerms: [
        { term: 'રોકડ આવક', def: 'રોકડ વેચાણ, દેવાદારો પાસેથી વસૂલાત (lag મુજબ), મળેલ વ્યાજ/ડિવિડન્ડ, મિલકતોનું વેચાણ, ઊભા કરેલ ધિરાણ.' },
        { term: 'રોકડ ચૂકવણી', def: 'રોકડ ખરીદી, લેણદારોને ચૂકવણી, મજૂરી, ઓવરહેડ (ઘસારો બાદ), મૂડી ખર્ચ, વેરો, ડિવિડન્ડ, વ્યાજ.' },
        { term: 'વસૂલાત-વિલંબ (collection lag)', def: 'જે ઢબમાં ઉધાર વેચાણ પછીના મહિનાઓમાં વસૂલ થાય છે તે ઢબ.' },
        { term: 'લઘુતમ રોકડ બાકી', def: 'પેઢી જે તળિયું જાળવવા માગે છે તે; તેનાથી નીચે અંદાજિત ઘટ આયોજનબદ્ધ ધિરાણ ચાલુ કરે છે.' },
        { term: 'શરૂઆતની / આખર બાકી', def: 'આખર બાકી = શરૂઆતની + આવક − ચૂકવણી; આખર બાકી પછીના મહિનાની શરૂઆતની બાકી તરીકે આગળ વધે છે.' },
      ],
      formulas: [
        { name: 'આખર રોકડ બાકી', expr: 'Opening balance + Total receipts − Total payments' },
        { name: 'ઉધાર વેચાણમાંથી વસૂલાત', expr: 'Σ (sales of each prior month × that month’s collection %)', note: 'આપેલ lag ઢબ લાગુ કરો; યાદ રાખો કે રોકડ વેચાણ તરત જ વસૂલ થાય છે.' },
        { name: 'જરૂરી ધિરાણ', expr: 'Minimum balance − Projected closing balance (if positive, borrow)' },
      ],
      procedure: {
        heading: 'આવક-અને-ચૂકવણી રીત',
        steps: [
          { title: '૧ · આવકનું પત્રક બનાવો', detail: 'વેચાણને રોકડ અને ઉધારમાં વહેંચો. ઉધાર વસૂલાતને lag વાપરી મહિનાઓમાં ફેલાવો. અન્ય રોકડ આવક (વ્યાજ, મિલકત વેચાણ, ધિરાણ) ઉમેરો.' },
          { title: '૨ · ચૂકવણીનું પત્રક બનાવો', detail: 'લેણદારોને, મજૂરી અને ઓવરહેડની ચૂકવણીને તેમના પોતાના lag મુજબ સમય આપો. મૂડી ખર્ચ, વેરો, ડિવિડન્ડ અને વ્યાજ ઉમેરો. ઘસારો અને બીજી કોઈ પણ બિન-રોકડ બાબત બાકાત રાખો.' },
          { title: '૩ · મહિને-મહિને અંદાજપત્ર બાંધો', detail: 'દરેક મહિને: શરૂઆતની બાકી + આવક − ચૂકવણી = આખર બાકી. આખર બાકીને પછીના મહિનાની શરૂઆતની બાકીમાં લઈ જાઓ.' },
          { title: '૪ · લઘુતમ-બાકીનો નિયમ લાગુ કરો', detail: 'જ્યાં આખર બાકી જરૂરી લઘુતમથી નીચે જાય ત્યાં તેને પાછી લાવવા જરૂરી ઉધાર દર્શાવો (અને વધારો હોય ત્યારે પરત ચૂકવો/રોકાણ કરો).' },
        ],
      },
      examTips: [
        'વસૂલાત અને ચૂકવણીનાં પત્રકો પહેલાં અલગ કાચા કામ તરીકે તૈયાર કરો — પછી મુખ્ય અંદાજપત્ર સહજતાથી નીકળી આવે છે.',
        'રોકડ અંદાજપત્રમાં ઘસારો, જોગવાઈ કે બીજી બિન-રોકડ બાબતો ક્યારેય સામેલ ન કરો.',
        'lag ધ્યાનથી વાંચો: “વેચાણ પછીના મહિને વસૂલ” અને “વેચાણ પછી બીજા મહિને” એ દરેક આંકડો ખસેડી નાખે છે.',
      ],
      pitfalls: [
        'ઉધાર વેચાણને રોકડ ખરેખર વસૂલ થાય તેને બદલે વેચાણના મહિને જ ગણવું.',
        'દરેક મહિનાની શરૂઆતની બાકી એ આગલા મહિનાની આખર બાકી છે તે ભૂલવું.',
        'એક જ જવાબમાં આવક-અને-ચૂકવણી રીત અને સમાયોજિત નફા-નુકસાન રીત ભેળવી દેવી.',
      ],
      workedExample: {
        title: 'વસૂલાત (આવક)નું પત્રક બાંધવું',
        problem:
          'વેચાણ: જાન્યુ. ₹1,00,000; ફેબ્રુ. ₹1,20,000; માર્ચ ₹1,40,000. રોકડ વેચાણ વેચાણના 20% છે (તરત જ વસૂલ). બાકીના 80% ઉધાર વેચાણમાંથી 60% વેચાણ પછીના મહિને અને 40% પછીના બીજા મહિને વસૂલ થાય છે. માર્ચમાં વસૂલ થયેલ રોકડ શોધો.',
        steps: [
          { label: 'માર્ચનું રોકડ વેચાણ = 20% × માર્ચ વેચાણ', formula: '20% × ₹1,40,000', result: '₹28,000' },
          { label: 'ફેબ્રુઆરીના ઉધાર વેચાણમાંથી (1 મહિના પછી) = 60% × (80% × ફેબ્રુ. વેચાણ)', formula: '60% × ₹96,000', result: '₹57,600' },
          { label: 'જાન્યુઆરીના ઉધાર વેચાણમાંથી (2 મહિના પછી) = 40% × (80% × જાન્યુ. વેચાણ)', formula: '40% × ₹80,000', result: '₹32,000' },
          { label: 'માર્ચમાં વસૂલ થયેલ કુલ રોકડ', formula: '₹28,000 + ₹57,600 + ₹32,000', result: '₹1,17,600' },
        ],
        answer: 'માર્ચમાં વસૂલ થયેલ રોકડ = ₹1,17,600 (આ આંકડો પછી રોકડ અંદાજપત્રની આવક બાજુમાં જાય છે).',
      },
      practice: [
        {
          q: 'રોકડ અંદાજપત્રમાં ઘસારો દર્શાવવો જોઈએ? કેમ?',
          answer: 'ના — તે બિન-રોકડ બાબત છે. રોકડ અંદાજપત્ર કેવળ ખરેખરી રોકડ આવક અને ચૂકવણી જ નોંધે છે.',
        },
        {
          q: 'મહિનાની આખર રોકડ બાકી બરાબર:',
          options: ['શરૂઆતની + આવક − ચૂકવણી', 'આવક − ચૂકવણી', 'શરૂઆતની + ચૂકવણી − આવક'],
          answer: 'શરૂઆતની + આવક − ચૂકવણી. આખર બાકી પછીના મહિનાની શરૂઆતની બાકી તરીકે આગળ વધે છે.',
        },
        {
          q: 'ઉધાર વેચાણ 50% પછીના મહિને અને 50% તેના પછીના મહિને વસૂલ થાય છે. જાન્યુઆરીનું ઉધાર વેચાણ ક્યારે વસૂલ થાય?',
          answer: 'અડધું ફેબ્રુઆરીમાં અને અડધું માર્ચમાં.',
        },
      ],
      applications: [
        'ખજાનચી (treasury) ટીમો ઘટ ખરેખર આવી પડે તે પહેલાં ઓવરડ્રાફ્ટ કે ટૂંકા ગાળાનું ધિરાણ ગોઠવવા તેનો ઉપયોગ કરે છે.',
        'વધારાની રોકડ ક્યારે રોકાણ કે મૂડી ખરીદી માટે વાપરી શકાય તે નક્કી કરવામાં મદદ કરે છે.',
        'અંદાજિત ટોચ-ઉધાર દર્શાવી બેંકો સાથે ધિરાણ-મર્યાદાની વાટાઘાટનો આધાર બને છે.',
      ],
      advantages: [
        'રોકડ વધારા અને ઘટનો સમય તથા કદ ઘણા આગળથી ઉઘાડાં પાડે છે.',
        'આયોજનબદ્ધ ધિરાણ શક્ય બનાવે છે — ઘટ આવે તે પહેલાં ઉધાર લો, નવરી રોકડ ઉત્પાદક રીતે રોકો.',
        'નિયંત્રણ સાધન તરીકે કામ કરે છે — ખરેખરા રોકડ પ્રવાહને અંદાજપત્ર સામે સરખાવાય છે.',
      ],
      limitations: [
        'તેની પાછળના વેચાણ-અંદાજ અને વસૂલાત-ધારણાઓ જેટલું જ સારું છે.',
        'બિન-રોકડ બાબતો બાકાત રાખે છે, તેથી તે નફાનું માપ નથી.',
        'સંજોગો બદલાય તેમ વારંવાર સુધારો માગે છે; સ્થિર રોકડ અંદાજપત્ર ઝડપથી જૂનું થઈ જાય છે.',
      ],
    },
    title: 'Cash Budget',
    subject: 'Budgetary Control',
    icon: CalendarClock,
    level: 'B.Com · BBA · CMA Inter',
    blurb:
      'Forecast month-by-month cash receipts and payments to reveal surpluses, shortfalls and the financing needed to hold a minimum balance.',
    readingMinutes: 10,
    tags: ['receipts and payments', 'collection lag', 'minimum cash balance', 'budgetary control'],
    overview: [
      'A cash budget is an estimate of cash receipts and payments for a future period, usually month by month. It is one of the most practical budgets a business prepares: it shows in advance when cash will be tight and when it will be in surplus, so the firm can arrange a loan before a shortfall or invest idle cash productively.',
      'The most common approach is the receipts-and-payments method: add all expected cash receipts to the opening balance, deduct all expected cash payments, and the remainder is the closing balance — which becomes next month’s opening balance. Only cash items enter the budget; non-cash charges such as depreciation are excluded.',
      'Receipts must be timed using the collection pattern (the “lag”): if 60% of sales are collected in the month of sale, 30% in the next month and 10% in the third, each month’s collection is built from several months’ sales. Payments are timed the same way. Where a minimum cash balance must be maintained, any projected shortfall is met by planned borrowing.',
    ],
    keyTerms: [
      { term: 'Cash receipts', def: 'Cash sales, collections from debtors (per the lag), interest/dividend received, sale of assets, loans raised.' },
      { term: 'Cash payments', def: 'Cash purchases, payments to creditors, wages, overheads (excluding depreciation), capital expenditure, tax, dividend, interest.' },
      { term: 'Collection lag', def: 'The pattern in which credit sales are realised over subsequent months.' },
      { term: 'Minimum cash balance', def: 'The floor the firm wants to keep; a projected dip below it triggers planned financing.' },
      { term: 'Opening / closing balance', def: 'Closing balance = Opening + Receipts − Payments; the closing balance carries forward as next month’s opening.' },
    ],
    formulas: [
      { name: 'Closing cash balance', expr: 'Opening balance + Total receipts − Total payments' },
      { name: 'Collection from credit sales', expr: 'Σ (sales of each prior month × that month’s collection %)', note: 'Apply the given lag pattern; remember cash sales are collected immediately.' },
      { name: 'Financing required', expr: 'Minimum balance − Projected closing balance (if positive, borrow)' },
    ],
    procedure: {
      heading: 'Receipts-and-payments method',
      steps: [
        { title: '1 · Schedule the receipts', detail: 'Split sales into cash and credit. Spread credit collections across months using the lag. Add other cash inflows (interest, asset sales, loans).' },
        { title: '2 · Schedule the payments', detail: 'Time payments to creditors, wages and overheads per their own lags. Add capital expenditure, tax, dividend and interest. Exclude depreciation and any other non-cash item.' },
        { title: '3 · Build the budget month by month', detail: 'For each month: Opening balance + Receipts − Payments = Closing balance. Carry the closing balance to the next month’s opening.' },
        { title: '4 · Apply the minimum-balance rule', detail: 'Where the closing balance falls below the required minimum, show the borrowing needed to restore it (and repay/invest when in surplus).' },
      ],
    },
    examTips: [
      'Prepare the collection and payment schedules as separate workings first — then the main budget falls out neatly.',
      'Never include depreciation, provisions or other non-cash items in a cash budget.',
      'Read the lag carefully: “collected in the month following sale” vs “second month after sale” shifts every figure.',
    ],
    pitfalls: [
      'Including credit sales in the month of sale instead of when cash is actually collected.',
      'Forgetting that opening balance for each month is the previous month’s closing balance.',
      'Mixing the receipts-and-payments method with the adjusted profit & loss method in one answer.',
    ],
    references: [
      { label: 'Cash budget — format & how to prepare', url: 'https://www.wallstreetmojo.com/cash-budget/', kind: 'article', source: 'WallStreetMojo' },
      { label: 'Cash budget (managerial accounting)', url: 'https://courses.lumenlearning.com/wm-managerialaccounting/chapter/cash-budget/', kind: 'article', source: 'Lumen' },
      { label: 'Preparing a cash budget (open text)', url: 'https://oer.pressbooks.pub/utsaccounting1/chapter/prepare-a-cash-budget/', kind: 'article', source: 'UTS OER' },
    ],
    workedExample: {
      title: 'Building the collection (receipts) schedule',
      problem:
        'Sales: Jan ₹1,00,000; Feb ₹1,20,000; Mar ₹1,40,000. Cash sales are 20% of sales (collected at once). Of the 80% credit sales, 60% are collected in the month after sale and 40% in the second month after. Find the cash collected in March.',
      steps: [
        { label: 'Cash sales of March = 20% × March sales', formula: '20% × ₹1,40,000', result: '₹28,000' },
        { label: 'From February credit sales (1 month after) = 60% × (80% × Feb sales)', formula: '60% × ₹96,000', result: '₹57,600' },
        { label: 'From January credit sales (2 months after) = 40% × (80% × Jan sales)', formula: '40% × ₹80,000', result: '₹32,000' },
        { label: 'Total cash collected in March', formula: '₹28,000 + ₹57,600 + ₹32,000', result: '₹1,17,600' },
      ],
      answer: 'Cash collected in March = ₹1,17,600 (this figure then feeds the receipts side of the cash budget).',
    },
    practice: [
      {
        q: 'Should depreciation appear in a cash budget? Why?',
        answer: 'No — it is a non-cash item. A cash budget records only actual cash receipts and payments.',
      },
      {
        q: 'Closing cash balance for a month equals:',
        options: ['Opening + Receipts − Payments', 'Receipts − Payments', 'Opening + Payments − Receipts'],
        answer: 'Opening + Receipts − Payments. The closing balance carries forward as next month’s opening balance.',
      },
      {
        q: 'Credit sales are collected 50% in the next month and 50% the month after. When is January’s credit sale realised?',
        answer: 'Half in February and half in March.',
      },
    ],
    applications: [
      'Treasury teams use it to arrange overdrafts or short-term loans before a shortfall actually hits.',
      'Helps decide when surplus cash can be invested or used for capital purchases.',
      'Forms the basis for negotiating credit limits with banks by showing the projected peak borrowing.',
    ],
    advantages: [
      'Reveals the timing and size of cash surpluses and shortfalls well in advance.',
      'Enables planned financing — borrow before a shortfall, invest idle cash productively.',
      'Acts as a control tool — actual cash flows are compared against the budget.',
    ],
    limitations: [
      'Only as good as the sales forecast and collection assumptions behind it.',
      'Excludes non-cash items, so it is not a measure of profit.',
      'Needs frequent revision as conditions change; a static cash budget quickly goes stale.',
    ],
    calc: 'cash-budget',
  },
  {
    id: 'flexible-budget',
    gu: {
      title: 'સ્થિતિસ્થાપક અંદાજપત્ર',
      blurb:
        'પડતરને સ્થાયી, ચલિત અને અર્ધ-ચલિતમાં વહેંચીને — high-low method વાપરીને — અંદાજપત્રને જુદા જુદા પ્રવૃત્તિ સ્તરે ફરી માંડો.',
      overview: [
        'સ્થિર (fixed) અંદાજપત્ર પ્રવૃત્તિના એક જ સ્તર માટે તૈયાર થાય છે; જો વાસ્તવિક ઉત્પાદન જુદું પડે, તો સરખામણી અર્થહીન બની જાય છે. સ્થિતિસ્થાપક અંદાજપત્ર પડતરના વર્તનને ઓળખીને આ સમસ્યા ઉકેલે છે — તે પ્રવૃત્તિના કોઈ પણ સ્તર માટે તૈયાર થઈ શકે છે, કારણ કે તેને ખબર છે કે કઈ પડતર ઉત્પાદન સાથે બદલાય છે અને કઈ બદલાતી નથી.',
        'પડતરને ત્રણ પ્રકારમાં વર્ગીકૃત કરવામાં આવે છે. સ્થાયી પડતર (ભાડું, પગાર, ઘસારો) ઉત્પાદન ગમે તે હોય તોપણ કુલમાં અચળ રહે છે. ચલિત પડતર (માલસામગ્રી, મજૂરી) ઉત્પાદનના સીધા પ્રમાણમાં બદલાય છે. અર્ધ-ચલિત (મિશ્ર) પડતર (વીજળી, જાળવણી)માં સ્થાયી અને ચલિત — બંને ઘટકો હોય છે, અને અંદાજપત્ર સ્થિતિસ્થાપક બને તે પહેલાં તેને વહેંચવી પડે છે.',
        'અર્ધ-ચલિત પડતરને વહેંચવાનું પ્રમાણભૂત સાધન એ high-low method છે: પ્રવૃત્તિના સૌથી ઊંચા અને સૌથી નીચા સ્તર લો, અને કેમ કે તેમની વચ્ચે સ્થાયી પડતર અચળ રહે છે, કુલ પડતરમાંનો તફાવત આખેઆખો ચલિત જ હોવો જોઈએ. તેનાથી એકમ દીઠ ચલિત પડતર મળે છે; ત્યાર પછી પાછા-મૂકીને (back-substitution) સ્થાયી હિસ્સો શોધાય છે.',
      ],
      keyTerms: [
        { term: 'સ્થાયી પડતર (Fixed cost)', def: 'પ્રવૃત્તિના એક ગાળામાં કુલમાં અચળ; ઉત્પાદન વધતાં એકમ દીઠ સ્થાયી પડતર ઘટે છે.' },
        { term: 'ચલિત પડતર (Variable cost)', def: 'પ્રવૃત્તિના સીધા પ્રમાણમાં કુલમાં બદલાય છે; એકમ દીઠ ચલિત પડતર અચળ રહે છે.' },
        { term: 'અર્ધ-ચલિત (મિશ્ર) પડતર', def: 'એમાં સ્થાયી અને ચલિત — બંને ઘટકો હોય છે (દા.ત. એક ઠરાવેલ ચાર્જ ઉપરાંત વપરાશ-ચાર્જ).' },
        { term: 'પ્રવૃત્તિ સ્તર / ક્ષમતા', def: 'જે ઉત્પાદને અંદાજપત્ર માંડ્યું હોય તે — ઘણી વાર પૂર્ણ ક્ષમતાના % તરીકે કે એકમ/કલાકમાં દર્શાવાય છે.' },
        { term: 'High-low method', def: 'એક રીત જે પ્રવૃત્તિના સૌથી ઊંચા અને સૌથી નીચા અવલોકનો વાપરીને અર્ધ-ચલિત પડતરને તેના સ્થાયી અને ચલિત ભાગોમાં અલગ કરે છે.' },
      ],
      formulas: [
        {
          name: 'એકમ દીઠ ચલિત પડતર (high-low)',
          expr: '(Cost at high level − Cost at low level) ÷ (Units at high level − Units at low level)',
        },
        { name: 'સ્થાયી પડતર', expr: 'Total cost at a level − (Variable cost per unit × Units at that level)' },
        { name: 'કોઈ પણ સ્તરે અંદાજિત પડતર', expr: 'Fixed cost + (Variable cost per unit × Units at that level)' },
      ],
      procedure: {
        heading: 'સ્થિતિસ્થાપક અંદાજપત્ર તૈયાર કરવું',
        steps: [
          { title: '૧ · દરેક પડતરનું વર્ગીકરણ કરો', detail: 'દરેક પડતર ઉત્પાદન સાથે કેવી રીતે વર્તે છે તે પ્રમાણે તેને સ્થાયી, ચલિત કે અર્ધ-ચલિત તરીકે ચિહ્નિત કરો.' },
          { title: '૨ · અર્ધ-ચલિત પડતર વહેંચો', detail: 'દરેક મિશ્ર પડતરને તેના સ્થાયી અને ચલિત ભાગોમાં અલગ કરવા high-low method (કે આપેલ % ચલિતપણા) વાપરો.' },
          { title: '૩ · દરેક જરૂરી સ્તરે ફરી માંડો', detail: 'પૂછેલા દરેક પ્રવૃત્તિ સ્તર માટે: સ્થાયી પડતર અચળ રાખો, ચલિત પડતરને નવા ઉત્પાદન મુજબ ગુણો, અને દરેક અર્ધ-ચલિત પડતરના બંને ભાગ ઉમેરો.' },
          { title: '૪ · સરવાળો કરો અને (પૂછ્યું હોય તો) નફો શોધો', detail: 'દરેક સ્તરે પડતરનો સરવાળો કરો; જ્યાં વેચાણ આપ્યું હોય ત્યાં વેચાણમાંથી કુલ પડતર બાદ કરી તે સ્તરે નફો અંદાજો.' },
        ],
      },
      examTips: [
        'સ્તંભો બાંધતા પહેલાં એકમ દીઠ ચલિત પડતર અને કુલ સ્થાયી પડતર સ્પષ્ટ રીતે અલગ ગણતરી તરીકે દર્શાવો.',
        'એકમ દીઠ સ્થાયી પડતર જથ્થા સાથે બદલાય છે — એકમ દીઠ કુલ પડતર અચળ છે એમ કદી ધારી ન લો.',
        'જ્યારે પ્રશ્ન દરેક પડતર માટે “% ચલિત” આપે, ત્યારે તેને સીધી વહેંચો: ચલિત ભાગ = પડતર × %, સ્થાયી ભાગ = બાકીનો.',
      ],
      pitfalls: [
        'સ્થાયી પડતરને પ્રવૃત્તિ સાથે વધારવી-ઘટાડવી — સંબંધિત ગાળામાં તે કુલમાં અચળ રહે છે.',
        'અર્ધ-ચલિત પડતરનો ચલિત ભાગ ગણ્યા પછી તેનો સ્થાયી ઘટક પાછો ઉમેરવાનું ભૂલી જવું.',
        'high-low ના અંશ(numerator)માં પડતરના તફાવતને બદલે કુલ પડતર વાપરવી.',
      ],
      workedExample: {
        title: 'High-low method થી અર્ધ-ચલિત પડતર વહેંચવી',
        problem:
          '100% ક્ષમતાએ (1,000 એકમ) વેચાણ ખર્ચ ₹38,000 છે; 60% ક્ષમતાએ (600 એકમ) તે ₹30,000 છે. 80% ક્ષમતાએ (800 એકમ) અંદાજિત વેચાણ ખર્ચ શોધો.',
        source: 'Past exam — T.Y.B.Com (April 2014)',
        steps: [
          { label: 'એકમ દીઠ ચલિત પડતર = (ઊંચા સ્તરની પડતર − નીચા સ્તરની પડતર) ÷ (ઊંચા સ્તરના એકમ − નીચા સ્તરના એકમ)', formula: '(38,000 − 30,000) ÷ (1,000 − 600)', result: '₹20 per unit' },
          { label: 'સ્થાયી પડતર = કુલ પડતર − (એકમ દીઠ ચલિત × એકમ)', formula: '38,000 − (20 × 1,000)', result: '₹18,000' },
          { label: '800 એકમે વેચાણ ખર્ચ = સ્થાયી + (એકમ દીઠ ચલિત × એકમ)', formula: '18,000 + (20 × 800)', result: '₹34,000' },
        ],
        answer: '80% ક્ષમતાએ અંદાજિત વેચાણ ખર્ચ = ₹34,000 (સ્થાયી ₹18,000 + ચલિત ₹16,000).',
      },
      practice: [
        {
          q: 'ઉત્પાદન વધતાં, એકમ દીઠ સ્થાયી પડતર:',
          options: ['વધે છે', 'ઘટે છે', 'અચળ રહે છે'],
          answer: 'ઘટે છે — અચળ કુલ સ્થાયી પડતર વધુ એકમ પર ફેલાય છે.',
        },
        {
          q: 'વાસ્તવિક ઉત્પાદન યોજનાથી જુદું પડે ત્યારે કામગીરી ચકાસવા સ્થિર અંદાજપત્ર નબળું કેમ છે?',
          answer:
            'તે પ્રવૃત્તિના એક જ સ્તર માટે માંડેલું હોય છે; તેને જુદા સ્તરના વાસ્તવિક આંકડા સાથે સરખાવવું ગેરમાર્ગે દોરે છે. સ્થિતિસ્થાપક અંદાજપત્ર પહેલાં પડતરને વાસ્તવિક સ્તરે ફરી માંડે છે.',
        },
        {
          q: 'જાળવણી ખર્ચ 600 એકમે ₹5,000 અને 1,000 એકમે ₹5,600 છે. એકમ દીઠ ચલિત પડતર શોધો (high-low).',
          answer: '(5,600 − 5,000) ÷ (1,000 − 600) = ₹1.50 per unit.',
        },
      ],
      applications: [
        'વધઘટ થતા ઉત્પાદન કે મોસમી ધંધાવાળી પેઢીઓ વાસ્તવિક પ્રવૃત્તિ સ્તરે વાસ્તવિક પડતર લક્ષ્યો ઠરાવવા તેને વાપરે છે.',
        'કામગીરી મૂલ્યાંકનનો આધાર બને છે — વાસ્તવિક પડતરને વાસ્તવિક ઉત્પાદન મુજબ ફરી માંડેલા અંદાજપત્ર સાથે સરખાવાય છે.',
        'ક્ષમતા-ઉપયોગના જુદા જુદા સ્તરે ભાવ અને ટેન્ડર નિર્ણયોને ટેકો આપે છે.',
      ],
      advantages: [
        'અર્થપૂર્ણ માપદંડ આપે છે — પડતર સમાન પ્રવૃત્તિ સ્તરે સરખાવાય છે, જે સ્થિર અંદાજપત્ર કરી શકતું નથી.',
        'પડતરના વર્તન (સ્થાયી, ચલિત, અર્ધ-ચલિત)ને ઓળખે છે, તેથી વિચલન જથ્થાથી વિકૃત થતાં નથી.',
        'પ્રવૃત્તિના વિવિધ સ્તરો પર “શું થાય જો” (what-if) આયોજન માટે ઉપયોગી.',
      ],
      limitations: [
        'પડતરને સ્થાયી અને ચલિતમાં ચોકસાઈથી વહેંચવા પર આધારિત — ખોટું વર્ગીકરણ આખું અંદાજપત્ર બગાડે છે.',
        'સંબંધિત ગાળામાં પડતર રેખીય રીતે વર્તે છે એમ ધારે છે; પગથિયાં-પડતર (step costs) અને માપક્ષમતાના લાભ આ તોડે છે.',
        'સાદા સ્થિર અંદાજપત્ર કરતાં તૈયાર કરવા વધુ માહિતી અને મહેનત માગે છે.',
      ],
    },
    title: 'Flexible Budget',
    subject: 'Budgetary Control',
    icon: SlidersHorizontal,
    level: 'B.Com · BBA · CMA Inter',
    blurb:
      'Restate a budget at different activity levels by splitting costs into fixed, variable and semi-variable — using the high-low method.',
    readingMinutes: 9,
    tags: ['cost behaviour', 'high-low method', 'semi-variable', 'capacity', 'fixed variable cost'],
    overview: [
      'A fixed budget is drawn for a single level of activity; if actual output differs, comparison becomes meaningless. A flexible budget solves this by recognising cost behaviour — it can be prepared for any level of activity because it knows which costs change with output and which do not.',
      'Costs are classified into three types. Fixed costs (rent, salaries, depreciation) stay constant in total regardless of output. Variable costs (materials, wages) change in direct proportion to output. Semi-variable (mixed) costs (power, maintenance) have both a fixed and a variable element and must be split before the budget can flex.',
      'The standard tool for splitting a semi-variable cost is the high-low method: take the highest and lowest activity levels, and because fixed cost is unchanged between them, the difference in total cost must be entirely variable. That gives the variable cost per unit; the fixed portion is then found by back-substitution.',
    ],
    keyTerms: [
      { term: 'Fixed cost', def: 'Constant in total over a range of activity; per-unit fixed cost falls as output rises.' },
      { term: 'Variable cost', def: 'Changes in total in direct proportion to activity; per-unit variable cost is constant.' },
      { term: 'Semi-variable (mixed) cost', def: 'Contains both a fixed and a variable component (e.g. a standing charge plus a usage charge).' },
      { term: 'Activity level / capacity', def: 'The output, often expressed as a % of full capacity or in units/hours, at which the budget is drawn.' },
      { term: 'High-low method', def: 'A technique that uses the highest and lowest activity observations to separate a semi-variable cost into its fixed and variable parts.' },
    ],
    formulas: [
      {
        name: 'Variable cost per unit (high-low)',
        expr: '(Cost at high level − Cost at low level) ÷ (Units at high level − Units at low level)',
      },
      { name: 'Fixed cost', expr: 'Total cost at a level − (Variable cost per unit × Units at that level)' },
      { name: 'Budgeted cost at any level', expr: 'Fixed cost + (Variable cost per unit × Units at that level)' },
    ],
    procedure: {
      heading: 'Preparing a flexible budget',
      steps: [
        { title: '1 · Classify every cost', detail: 'Mark each cost as fixed, variable or semi-variable based on how it behaves with output.' },
        { title: '2 · Split the semi-variable costs', detail: 'Use the high-low method (or the given % of variability) to separate each mixed cost into its fixed and variable parts.' },
        { title: '3 · Restate at each required level', detail: 'For every activity level asked: keep fixed costs unchanged, scale variable costs by the new output, and add the two parts of each semi-variable cost.' },
        { title: '4 · Total and (if asked) find profit', detail: 'Sum the costs at each level; where sales are given, deduct total cost from sales to forecast profit at that level.' },
      ],
    },
    examTips: [
      'State per-unit variable cost and total fixed cost clearly as separate workings before building the columns.',
      'Per-unit fixed cost changes with volume — never assume the per-unit total cost is constant.',
      'When a question gives “% variable” for each cost, split it directly: variable part = cost × %, fixed part = the remainder.',
    ],
    pitfalls: [
      'Scaling fixed costs up or down with activity — they stay constant in total within the relevant range.',
      'Forgetting to add back the fixed element of a semi-variable cost after computing its variable part.',
      'Using total cost (instead of the change in cost) in the high-low numerator.',
    ],
    references: [
      { label: 'High-low method — definition & formula', url: 'https://corporatefinanceinstitute.com/resources/accounting/high-low-method/', kind: 'article', source: 'CFI' },
      { label: 'Flexible budgets (managerial accounting)', url: 'https://biz.libretexts.org/Bookshelves/Accounting/Managerial_Accounting_(OpenStax)/07%3A_Budgeting', kind: 'article', source: 'LibreTexts' },
    ],
    workedExample: {
      title: 'Splitting a semi-variable cost with the high-low method',
      problem:
        'At 100% capacity (1,000 units) sales expenses are ₹38,000; at 60% capacity (600 units) they are ₹30,000. Find the sales expenses budgeted at 80% capacity (800 units).',
      source: 'Past exam — T.Y.B.Com (April 2014)',
      steps: [
        { label: 'Variable cost per unit = (Cost at high − Cost at low) ÷ (Units at high − Units at low)', formula: '(38,000 − 30,000) ÷ (1,000 − 600)', result: '₹20 per unit' },
        { label: 'Fixed cost = Total cost − (Variable per unit × Units)', formula: '38,000 − (20 × 1,000)', result: '₹18,000' },
        { label: 'Sales expenses at 800 units = Fixed + (Variable per unit × Units)', formula: '18,000 + (20 × 800)', result: '₹34,000' },
      ],
      answer: 'Budgeted sales expenses at 80% capacity = ₹34,000 (fixed ₹18,000 + variable ₹16,000).',
    },
    practice: [
      {
        q: 'As output rises, the fixed cost per unit:',
        options: ['Rises', 'Falls', 'Stays constant'],
        answer: 'Falls — the constant total fixed cost is spread over more units.',
      },
      {
        q: 'Why is a fixed budget poor for judging performance when actual output differs from plan?',
        answer:
          'It is set for a single activity level; comparing it with actuals at a different level is misleading. A flexible budget first restates costs to the actual level.',
      },
      {
        q: 'Maintenance cost is ₹5,000 at 600 units and ₹5,600 at 1,000 units. Find the variable cost per unit (high-low).',
        answer: '(5,600 − 5,000) ÷ (1,000 − 600) = ₹1.50 per unit.',
      },
    ],
    applications: [
      'Firms with fluctuating output or seasonality use it to set realistic cost targets at the actual activity level.',
      'Forms the basis for performance evaluation — actual cost is compared with the budget restated to actual output.',
      'Supports pricing and tender decisions at different levels of capacity utilisation.',
    ],
    advantages: [
      'Provides a meaningful yardstick — costs are compared at the same activity level, which a fixed budget cannot do.',
      'Recognises cost behaviour (fixed, variable, semi-variable), so variances are not distorted by volume.',
      'Useful for “what-if” planning across a range of activity levels.',
    ],
    limitations: [
      'Relies on an accurate split of costs into fixed and variable — wrong classification distorts the whole budget.',
      'Assumes costs behave linearly within the relevant range; step costs and economies of scale break this.',
      'Needs more data and effort to prepare than a simple fixed budget.',
    ],
    calc: 'flexible-budget',
  },

  /* ============================================================ Cost Accounting */
  {
    id: 'unit-costing',
    gu: {
      title: 'પડતરપત્રક (એકમ પડતર)',
      blurb:
        'ઉત્પાદનની કુલ પડતરને તબક્કાવાર ગોઠવો — મુખ્ય ખર્ચ, કારખાના પડતર, ઉત્પાદન પડતર અને વેચાણ પડતર — અને એકમદીઠ પડતર વાંચી લો.',
      overview: [
        'પડતરપત્રક (કે પડતર પત્રક) એ સમયાંતરે તૈયાર કરાતું એક પત્રક છે જે કોઈ વસ્તુ કે સેવાની પડતરનાં વિવિધ ઘટકોને તાર્કિક ક્રમમાં દર્શાવે છે. તે કેવળ કુલ પડતર બતાવવા કરતાં વધુ કરે છે: તે પડતરને તબક્કાવાર બાંધે છે — મુખ્ય ખર્ચ, કારખાના પડતર, ઉત્પાદન પડતર અને વેચાણ પડતર — જેથી સંચાલન ચોક્કસ જોઈ શકે કે નાણાં ક્યાં ખર્ચાય છે અને દરેક ઘટકને નિયંત્રિત કરી શકે.',
        'પડતરનાં ઘટકોને સૌપ્રથમ પ્રત્યક્ષ કે પરોક્ષ તરીકે વર્ગીકૃત કરવામાં આવે છે. પ્રત્યક્ષ માલસામગ્રી, પ્રત્યક્ષ મજૂરી અને પ્રત્યક્ષ ખર્ચ વસ્તુ સાથે જોડી શકાય છે અને તે મળીને મુખ્ય ખર્ચ બનાવે છે. પરોક્ષ ખર્ચ — ઓવરહેડ — ને કાર્ય મુજબ કારખાના, વહીવટ, અને વેચાણ તથા વિતરણ ઓવરહેડમાં વર્ગીકૃત કરી, એ જ ક્રમમાં ઉમેરવામાં આવે છે.',
        'પડતરપત્રક એ વેચાણ કિંમત નક્કી કરવાનો અને ટેન્ડરના ભાવ આપવાનો આધાર છે. તે પડતરને તબક્કાવાર બાંધતું હોવાથી, પેઢીને કાચા માલ, અધૂરા કામ (WIP) અને તૈયાર માલના આખર સ્ટૉકનું સુસંગત મૂલ્યાંકન કરવા તથા સમયેસમયે એકમદીઠ પડતર સરખાવવા પણ દે છે.',
      ],
      keyTerms: [
        { term: 'પ્રત્યક્ષ પડતર (Direct cost)', def: 'એવી પડતર જે કોઈ ચોક્કસ વસ્તુ, કામ કે પ્રક્રિયા સાથે સહેલાઈથી ઓળખી શકાય (પ્રત્યક્ષ માલસામગ્રી, પ્રત્યક્ષ મજૂરી, પ્રત્યક્ષ/વસૂલપાત્ર ખર્ચ).' },
        { term: 'મુખ્ય ખર્ચ (Prime cost)', def: 'બધી પ્રત્યક્ષ પડતરનો સરવાળો = પ્રત્યક્ષ માલસામગ્રી + પ્રત્યક્ષ મજૂરી + પ્રત્યક્ષ ખર્ચ.' },
        { term: 'ઓવરહેડ (Overhead)', def: 'પરોક્ષ માલસામગ્રી, પરોક્ષ મજૂરી અને પરોક્ષ ખર્ચનો સરવાળો; કારખાના, કાર્યાલય/વહીવટ અને વેચાણ તથા વિતરણ ઓવરહેડ તરીકે વર્ગીકૃત.' },
        { term: 'કારખાના પડતર (Works/factory cost)', def: 'મુખ્ય ખર્ચ + કારખાના ઓવરહેડ, શરૂઆતના અને આખરના અધૂરા કામ (WIP)ને સમાયોજિત કર્યા પછી.' },
        { term: 'ઉત્પાદન પડતર (Cost of production)', def: 'કારખાના પડતર + કાર્યાલય તથા વહીવટ ઓવરહેડ.' },
        { term: 'વેચાણ પડતર (Cost of sales)', def: 'વેચાયેલા માલની પડતર + વેચાણ તથા વિતરણ ઓવરહેડ; વેચાણ − વેચાણ પડતર = નફો.' },
      ],
      formulas: [
        { name: 'વપરાયેલી માલસામગ્રી', expr: 'Opening stock + Purchases + Carriage inward − Returns − Closing stock' },
        { name: 'મુખ્ય ખર્ચ (Prime Cost)', expr: 'Direct material + Direct wages + Direct expenses' },
        { name: 'કારખાના પડતર (Works Cost)', expr: 'Prime cost + Factory overheads + Opening WIP − Closing WIP' },
        { name: 'ઉત્પાદન પડતર (Cost of Production)', expr: 'Works cost + Office & administration overheads' },
        { name: 'વેચાયેલા માલની પડતર (COGS)', expr: 'Cost of production + Opening finished goods − Closing finished goods' },
        { name: 'વેચાણ પડતર (Cost of Sales)', expr: 'Cost of goods sold + Selling & distribution overheads' },
        { name: 'નફો', expr: 'Sales − Cost of sales', note: 'ઋણ આંકડો એ ખોટ છે.' },
      ],
      procedure: {
        heading: 'પડતરપત્રક બાંધવું',
        steps: [
          { title: '૧ · વપરાયેલી પ્રત્યક્ષ માલસામગ્રી', detail: 'શરૂઆતનો કાચો માલ + ખરીદી + આવક વહન (carriage inward) − ખરીદ-પરત − આખરનો કાચો માલ. આવતા માલ પરનું વહન/ભાડું માલસામગ્રીની પડતરનો ભાગ છે.' },
          { title: '૨ · પ્રત્યક્ષ મજૂરી અને પ્રત્યક્ષ ખર્ચ ઉમેરો → મુખ્ય ખર્ચ', detail: 'પ્રત્યક્ષ મજૂરી એ માલને વસ્તુમાં ફેરવતા કામદારોને ચૂકવાય છે; પ્રત્યક્ષ ખર્ચ એ ખાસ યંત્રનું ભાડું કે ઉત્પાદન પરની રૉયલ્ટી જેવા વસૂલપાત્ર ખર્ચ છે.' },
          { title: '૩ · કારખાના ઓવરહેડ ઉમેરો, WIP સમાયોજિત કરો → કારખાના પડતર', detail: 'પરોક્ષ કારખાના ખર્ચ (કારખાનાનું ભાડું, વીજળી, યંત્રનો ઘસારો, કારખાના સંચાલકનો પગાર). શરૂઆતનું WIP ઉમેરો અને આખરનું WIP બાદ કરો, બંને કારખાના પડતરે મૂલ્યાંકિત.' },
          { title: '૪ · વહીવટ ઓવરહેડ ઉમેરો → ઉત્પાદન પડતર', detail: 'કાર્યાલયના પગાર, કાર્યાલયનું ભાડું, સંચાલકોનું મહેનતાણું, કાનૂની અને ઑડિટ ફી.' },
          { title: '૫ · તૈયાર માલ સમાયોજિત કરો, વેચાણ તથા વિતરણ ઓવરહેડ ઉમેરો → વેચાણ પડતર', detail: 'તૈયાર માલનો સ્ટૉક ઉત્પાદન પડતરે મૂલ્યાંકિત થાય છે. પછી જાહેરાત, વેચાણકર્તાઓના પગાર, શોરૂમનું ભાડું, જાવક વહન (carriage outward) ઉમેરો.' },
          { title: '૬ · વેચાણ સાથે સરખાવો → નફો', detail: 'વેચાણ − વેચાણ પડતર = નફો (કે ખોટ). એકમદીઠ આંકડા = તબક્કાનો સરવાળો ÷ ઉત્પાદિત એકમો.' },
        ],
      },
      examTips: [
        'કેવળ નાણાકીય બાબતો પડતરપત્રકની બહાર રાખો: વ્યાજ, આવકવેરો, ડિવિડન્ડ, દાન, મિલકત વેચાણ પરનો નફો/ખોટ, અને પાઘડી (goodwill) કે પ્રારંભિક ખર્ચ માંડી વાળવા.',
        'દરેક સ્ટૉકને જ્યાં તેનું મૂલ્યાંકન થાય તે તબક્કે સમાયોજિત કરો — કાચો માલ મુખ્ય ખર્ચ પહેલાં, WIP કારખાના પડતરે, તૈયાર માલ ઉત્પાદન પડતરે. એમને ભેળવવા એ જૂની જાણીતી ભૂલ છે.',
        'આવક વહન (carriage inward) એ કારખાના/માલસામગ્રીની પડતર છે; જાવક વહન (carriage outward) એ વેચાણ તથા વિતરણ પડતર છે — એમને કદી અદલબદલ ન કરો.',
      ],
      pitfalls: [
        'કાર્યાલય કે વેચાણ ઓવરહેડને કારખાના પડતરમાં (કે ઊલટું) મૂકવા — તે નીચેના દરેક પેટા-સરવાળાને બગાડે છે.',
        'સ્ટૉક સમાયોજન ભૂલી જવા, કે તૈયાર માલનું સમાયોજન મુખ્ય ખર્ચના તબક્કે લાગુ કરવું.',
        'બિન-પડતર નાણાકીય બાબતો સામેલ કરવી, જે પડતર ફુલાવે અને નફો ઓછો બતાવે છે.',
      ],
      applications: [
        'ઉત્પાદકો વેચાણ કિંમત નક્કી કરવા તથા cost-plus ધોરણે ટેન્ડર અને અંદાજ આપવા આનો ઉપયોગ કરે છે.',
        'કાચા માલ, WIP અને તૈયાર માલના આખર સ્ટૉકનું સુસંગત મૂલ્યાંકન કરવાનો આધાર પૂરો પાડે છે.',
        'સમયેસમયે પડતર નિયંત્રણ માટે પડતર ક્યાં વધી રહી છે (માલસામગ્રી, મજૂરી કે ઓવરહેડ) તે શોધવામાં મદદ કરે છે.',
      ],
      advantages: [
        'પડતરને તાર્કિક તબક્કાવાર બાંધે છે (મુખ્ય → કારખાના → ઉત્પાદન → વેચાણ), દરેક ઘટકને નિયંત્રણ માટે ઉઘાડું પાડે છે.',
        'કિંમત નક્કી કરવા, સરખામણી અને નિર્ણય માટે જરૂરી એકમદીઠ પડતર પૂરી પાડે છે.',
        'સમય-વચ્ચે અને પેઢી-વચ્ચે પડતર સરખામણી શક્ય બનાવે છે.',
      ],
      limitations: [
        'ઐતિહાસિક પડતરપત્રક પડતર કેટલી હતી તે બતાવે છે, કેટલી હોવી જોઈએ તે નહીં — પ્રમાણ-પડતર પદ્ધતિ એ ખાલીપો પૂરે છે.',
        'ઓવરહેડની વહેંચણીમાં અંદાજ અને નિર્ણયશક્તિ સામેલ હોય છે, જે ચોકસાઈ ઘટાડે છે.',
        'નાણાકીય બાબતો બાકાત રાખે છે, તેથી તે નફા-નુકસાન ખાતાનો વિકલ્પ નથી.',
      ],
      workedExample: {
        title: 'પડતરપત્રક તૈયાર કરવું (Arora, Illustration 2.2)',
        problem:
          'જાન્યુઆરી મહિના માટે: પ્રત્યક્ષ માલસામગ્રી ₹57,000; પ્રત્યક્ષ મજૂરી ₹28,500; કારખાનાનું ભાડું અને કર ₹2,500; યંત્ર સમારકામ ₹1,000; યંત્રનો ઘસારો ₹1,250; કારખાનાનું ગરમાવો અને રોશની ₹400; કારખાના સંચાલકનો પગાર ₹2,000; કાર્યાલયના પગાર ₹1,600; સંચાલકનું મહેનતાણું ₹1,500; ટેલિફોન અને ટપાલ ₹200; કાર્યાલયનું ભાડું અને કર ₹500; છાપકામ અને લેખનસામગ્રી ₹100; કાનૂની ખર્ચ ₹150; જાહેરાત ₹1,500; વેચાણકર્તાઓના પગાર ₹2,500; શોરૂમનું ભાડું ₹500; વેચાણ ₹1,16,000. પડતરપત્રક તૈયાર કરો.',
        steps: [
          { label: 'મુખ્ય ખર્ચ = પ્રત્યક્ષ માલસામગ્રી + પ્રત્યક્ષ મજૂરી', formula: '₹57,000 + ₹28,500', result: '₹85,500' },
          { label: 'કારખાના ઓવરહેડ', formula: '2,500 + 1,000 + 1,250 + 400 + 2,000', result: '₹7,150' },
          { label: 'કારખાના પડતર = મુખ્ય ખર્ચ + કારખાના OH', formula: '₹85,500 + ₹7,150', result: '₹92,650' },
          { label: 'વહીવટ ઓવરહેડ', formula: '1,600 + 1,500 + 200 + 500 + 100 + 150', result: '₹4,050' },
          { label: 'ઉત્પાદન પડતર = કારખાના પડતર + વહીવટ OH', formula: '₹92,650 + ₹4,050', result: '₹96,700' },
          { label: 'વેચાણ તથા વિતરણ ઓવરહેડ', formula: '1,500 + 2,500 + 500', result: '₹4,500' },
          { label: 'વેચાણ પડતર = ઉત્પાદન પડતર + વેચાણ-વિતરણ OH', formula: '₹96,700 + ₹4,500', result: '₹1,01,200' },
          { label: 'નફો = વેચાણ − વેચાણ પડતર', formula: '₹1,16,000 − ₹1,01,200', result: '₹14,800' },
        ],
        answer: 'મુખ્ય ખર્ચ ₹85,500 · કારખાના પડતર ₹92,650 · ઉત્પાદન પડતર ₹96,700 · વેચાણ પડતર ₹1,01,200 · નફો ₹14,800 (વેચાણના 12.76%).',
        source: 'M.N. Arora, Cost Accounting, Illustration 2.2',
      },
      practice: [
        {
          q: 'પડતરપત્રકમાં આવક વહન (carriage inward) ક્યાં બતાવાય છે, અને જાવક વહન (carriage outward) ક્યાં?',
          answer:
            'આવક વહન ખરીદેલી માલસામગ્રીની પડતરમાં (માલસામગ્રી પડતર) ઉમેરાય છે. જાવક વહન એ વેચાણ તથા વિતરણ ઓવરહેડ છે, જે ઉત્પાદન પડતર પછી ઉમેરાય છે.',
        },
        {
          q: 'આમાંથી કઈ બાબત પડતરપત્રકમાં સામેલ થતી નથી?',
          options: ['કારખાનાનું ભાડું', 'આવકવેરો', 'પ્રત્યક્ષ મજૂરી', 'જાહેરાત'],
          answer: 'આવકવેરો — તે નાણાકીય (વિનિયોગ) બાબત છે, પડતરમાંથી બાકાત. એ જ રીતે વ્યાજ, ડિવિડન્ડ અને દાન પણ.',
        },
        {
          q: 'તૈયાર માલના આખર સ્ટૉકનું મૂલ્યાંકન કયા આંકડે થાય છે?',
          answer:
            'એકમદીઠ ઉત્પાદન પડતરે — કેમ કે એ જ પડતરે માલ પૂરો થઈ તૈયાર-માલના ભંડારમાં તબદીલ થાય છે.',
        },
      ],
    },
    title: 'Cost Sheet (Unit Costing)',
    subject: 'Cost Accounting',
    icon: FileSpreadsheet,
    level: 'B.Com · BBA · CA/CMA Foundation',
    blurb:
      'Assemble the total cost of output stage by stage — prime cost, works cost, cost of production and cost of sales — and read off the cost per unit.',
    readingMinutes: 10,
    tags: ['cost sheet', 'cost statement', 'prime cost', 'works cost', 'cost of production', 'cost of sales', 'tender', 'output costing'],
    overview: [
      'A cost sheet (or cost statement) is a statement prepared periodically that sets out, in a logical sequence, the various elements of cost of a product or service. It does more than show the total cost: it builds the cost up in stages — prime cost, works cost, cost of production and cost of sales — so management can see exactly where money is being spent and control each element.',
      'The elements of cost are first classified as direct or indirect. Direct material, direct labour and direct expenses can be traced to the product and together form the prime cost. Indirect costs — overheads — are grouped by function into factory, administration, and selling & distribution overheads, and are added in that order.',
      'The cost sheet is the basis for fixing selling prices and quoting tenders. Because it builds cost in stages, it also lets a firm value closing stocks of raw material, work-in-progress and finished goods consistently, and compare cost per unit period to period.',
    ],
    keyTerms: [
      { term: 'Direct cost', def: 'A cost that can be conveniently identified with a particular product, job or process (direct material, direct wages, direct/chargeable expenses).' },
      { term: 'Prime cost', def: 'The total of all direct costs = direct material + direct wages + direct expenses.' },
      { term: 'Overhead', def: 'The total of indirect material, indirect labour and indirect expenses; grouped as factory, office/administration and selling & distribution overheads.' },
      { term: 'Works (factory) cost', def: 'Prime cost + factory overheads, after adjusting opening and closing work-in-progress.' },
      { term: 'Cost of production', def: 'Works cost + office & administration overheads.' },
      { term: 'Cost of sales', def: 'Cost of goods sold + selling & distribution overheads; Sales − Cost of sales = Profit.' },
    ],
    formulas: [
      { name: 'Materials consumed', expr: 'Opening stock + Purchases + Carriage inward − Returns − Closing stock' },
      { name: 'Prime Cost', expr: 'Direct material + Direct wages + Direct expenses' },
      { name: 'Works (Factory) Cost', expr: 'Prime cost + Factory overheads + Opening WIP − Closing WIP' },
      { name: 'Cost of Production', expr: 'Works cost + Office & administration overheads' },
      { name: 'Cost of Goods Sold', expr: 'Cost of production + Opening finished goods − Closing finished goods' },
      { name: 'Cost of Sales', expr: 'Cost of goods sold + Selling & distribution overheads' },
      { name: 'Profit', expr: 'Sales − Cost of sales', note: 'A negative figure is a loss.' },
    ],
    procedure: {
      heading: 'Building the cost sheet',
      steps: [
        { title: '1 · Direct material consumed', detail: 'Opening raw material + purchases + carriage inward − purchase returns − closing raw material. Carriage/freight on incoming material is part of material cost.' },
        { title: '2 · Add direct wages & direct expenses → Prime Cost', detail: 'Direct wages are paid to workers who convert material into product; direct expenses are chargeable expenses such as hire of special plant or royalty on output.' },
        { title: '3 · Add factory overheads, adjust WIP → Works Cost', detail: 'Indirect factory costs (factory rent, power, depreciation of plant, works manager’s salary). Add opening WIP and subtract closing WIP, both valued at works cost.' },
        { title: '4 · Add administration overheads → Cost of Production', detail: 'Office salaries, office rent, directors’ remuneration, legal and audit fees.' },
        { title: '5 · Adjust finished goods, add selling & distribution OH → Cost of Sales', detail: 'Finished-goods stock is valued at cost of production. Then add advertisement, salesmen’s salaries, showroom rent, carriage outward.' },
        { title: '6 · Compare with sales → Profit', detail: 'Sales − Cost of sales = profit (or loss). Per-unit figures = stage total ÷ units produced.' },
      ],
    },
    examTips: [
      'Keep purely financial items OUT of the cost sheet: interest, income tax, dividends, donations, profit/loss on sale of assets, and writing-off goodwill or preliminary expenses.',
      'Adjust each stock at the stage where it is valued — raw material before prime cost, WIP at works cost, finished goods at cost of production. Mixing them up is the classic error.',
      'Carriage inward is a factory/material cost; carriage outward is a selling & distribution cost — never interchange them.',
    ],
    pitfalls: [
      'Putting office or selling overheads into factory cost (or vice-versa) — it distorts every sub-total below it.',
      'Forgetting the stock adjustments, or applying a finished-goods adjustment at prime-cost stage.',
      'Including non-cost financial items, which inflates cost and understates profit.',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 2 (Cost Concepts & Cost Sheet)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Cost sheet — format, elements & examples', url: 'https://www.accountingnotes.net/cost-accounting/cost-sheet/cost-sheet-meaning-format-and-examples/16013', kind: 'article', source: 'Accounting Notes' },
      { label: 'Cost sheet format & components', url: 'https://cleartax.in/s/cost-sheet', kind: 'article', source: 'ClearTax' },
    ],
    workedExample: {
      title: 'Preparing a cost sheet (Arora, Illustration 2.2)',
      problem:
        'For the month of January: Direct material ₹57,000; Direct wages ₹28,500; Factory rent & rates ₹2,500; Plant repairs ₹1,000; Plant depreciation ₹1,250; Factory heating & lighting ₹400; Factory manager’s salary ₹2,000; Office salaries ₹1,600; Director’s remuneration ₹1,500; Telephone & postage ₹200; Office rent & rates ₹500; Printing & stationery ₹100; Legal charges ₹150; Advertisement ₹1,500; Salesmen’s salaries ₹2,500; Showroom rent ₹500; Sales ₹1,16,000. Prepare the cost sheet.',
      steps: [
        { label: 'Prime Cost = Direct material + Direct wages', formula: '₹57,000 + ₹28,500', result: '₹85,500' },
        { label: 'Factory overheads', formula: '2,500 + 1,000 + 1,250 + 400 + 2,000', result: '₹7,150' },
        { label: 'Works Cost = Prime cost + Factory OH', formula: '₹85,500 + ₹7,150', result: '₹92,650' },
        { label: 'Administration overheads', formula: '1,600 + 1,500 + 200 + 500 + 100 + 150', result: '₹4,050' },
        { label: 'Cost of Production = Works cost + Admin OH', formula: '₹92,650 + ₹4,050', result: '₹96,700' },
        { label: 'Selling & distribution overheads', formula: '1,500 + 2,500 + 500', result: '₹4,500' },
        { label: 'Cost of Sales = Cost of production + S&D OH', formula: '₹96,700 + ₹4,500', result: '₹1,01,200' },
        { label: 'Profit = Sales − Cost of sales', formula: '₹1,16,000 − ₹1,01,200', result: '₹14,800' },
      ],
      answer: 'Prime cost ₹85,500 · Works cost ₹92,650 · Cost of production ₹96,700 · Cost of sales ₹1,01,200 · Profit ₹14,800 (12.76% of sales).',
      source: 'M.N. Arora, Cost Accounting, Illustration 2.2',
    },
    practice: [
      {
        q: 'Where is carriage inward shown in a cost sheet, and where is carriage outward?',
        answer:
          'Carriage inward is added to the cost of materials purchased (material cost). Carriage outward is a selling & distribution overhead, added after cost of production.',
      },
      {
        q: 'Which of these is NOT included in a cost sheet?',
        options: ['Factory rent', 'Income tax', 'Direct wages', 'Advertisement'],
        answer: 'Income tax — it is a financial (appropriation) item, excluded from cost. So are interest, dividends and donations.',
      },
      {
        q: 'Closing stock of finished goods is valued at which figure?',
        answer:
          'At cost of production per unit — because that is the cost at which goods are completed and transferred to the finished-goods store.',
      },
    ],
    applications: [
      'Manufacturers use it to fix selling prices and to quote tenders and estimates on a cost-plus basis.',
      'Provides the basis for valuing closing stocks of raw material, WIP and finished goods consistently.',
      'Helps locate where cost is rising (material, labour or overhead) for period-to-period cost control.',
    ],
    advantages: [
      'Builds cost in logical stages (prime → works → production → sales), exposing each element for control.',
      'Provides the cost per unit needed for pricing, comparison and decision-making.',
      'Enables inter-period and inter-firm cost comparison.',
    ],
    limitations: [
      'A historical cost sheet shows what cost was, not what it should be — standard costing fills that gap.',
      'Apportionment of overheads involves estimates and judgement, which reduces accuracy.',
      'Excludes financial items, so it is not a substitute for the profit & loss account.',
    ],
    calc: 'cost-sheet',
  },
  {
    id: 'material-control',
    gu: {
      title: 'માલસામગ્રી નિયંત્રણ — EOQ અને સ્ટૉક સપાટીઓ',
      blurb:
        'સૌથી આર્થિક જથ્થો મંગાવો અને સ્ટૉક ખૂટવો તથા મૂડી રોકાઈ જવી — બંને ટાળવા વૈજ્ઞાનિક re-order, લઘુતમ, મહત્તમ અને danger સ્ટૉક સપાટીઓ નક્કી કરો.',
      overview: [
        'માલસામગ્રી ઘણી વાર પડતરનું સૌથી મોટું ઘટક હોય છે, તેથી તેનું નિયંત્રણ પડતર-નિયમનનું કેન્દ્રબિંદુ છે. બે વિરોધી જોખમો વચ્ચે સંતુલન જાળવવું પડે છે: વધારે પડતો સ્ટૉક રાખવાથી મૂડી રોકાઈ જાય છે અને માલ જૂનો-નકામો થવાનું જોખમ રહે છે, જ્યારે ઓછો સ્ટૉક રાખવાથી ઉત્પાદન અટકી પડવાનું જોખમ રહે છે. વૈજ્ઞાનિક સ્ટૉક નિયંત્રણ દરેક વસ્તુ માટે જથ્થાની સપાટીઓ નક્કી કરે છે, જેથી તે આપોઆપ વાજબી મર્યાદામાં જળવાઈ રહે.',
        // REVIEW: Dr. Desai confirmed (Jun 2026): order = વરદી → EOQ = આર્થિક વરદી જથ્થો, Ordering cost = વરદી ખર્ચ.
        // REVIEW: still unverified vs B.S. Shah Sem-4 / VNSGU lecturer — Carrying/holding cost = વહન ખર્ચ.
        'EOQ (આર્થિક વરદી જથ્થો) “એક વખતે કેટલો માલ મંગાવવો” એ પ્રશ્નનો જવાબ આપે છે. ઘણા નાના જથ્થા મંગાવવાથી વરદી ખર્ચ (ordering cost) વધે પણ વહન ખર્ચ (carrying cost) ઘટે; થોડા મોટા જથ્થા મંગાવવાથી ઊલટું થાય. EOQ એ એવો વરદી-જથ્થો છે જ્યાં વરદી ખર્ચ અને વહન ખર્ચનો સરવાળો સૌથી ઓછો હોય — અને એ બિંદુએ બંને ખર્ચ સમાન હોય છે.',
        // REVIEW: Dr. Desai confirmed (Jun 2026): Re-order level = પુનઃ વરદી સપાટી.
        // REVIEW: still unverified vs B.S. Shah Sem-4 / VNSGU lecturer — Minimum = લઘુતમ સપાટી, Maximum = મહત્તમ સપાટી, Danger = ભયસપાટી.
        'સ્ટૉક સપાટીઓ “ક્યારે વરદી આપવો” અને “કઈ મર્યાદાઓ વચ્ચે માલ રાખવો” એ પ્રશ્નોના જવાબ આપે છે. Re-order level (પુનઃ વરદી સપાટી) નવી ખરીદી શરૂ કરાવે છે; Minimum level (લઘુતમ સપાટી) એ સલામતીનું તળિયું છે; Maximum level (મહત્તમ સપાટી) એ વધારે પડતા રોકાણને રોકતી ટોચમર્યાદા છે; Danger level (ભયસપાટી) સૂચવે છે કે હવે ફક્ત તાત્કાલિક જરૂરિયાત માટે જ માલ આપવો.',
      ],
      keyTerms: [
        { term: 'Ordering cost (વરદી ખર્ચ)', def: 'વરદી આપવા અને તેની પ્રક્રિયા કરવાનો ખર્ચ — સ્ટેશનરી, માલ સ્વીકારવો, તપાસણી અને ખરીદ-વિભાગના કર્મચારીઓના પગાર.' },
        { term: 'Carrying (holding) cost (વહન / સંગ્રહ ખર્ચ)', def: 'સ્ટૉક રાખવાનો ખર્ચ — સંગ્રહ (વખાર), વીમો, રોકાયેલી મૂડી પરનું વ્યાજ, માલ બગડવો અને જૂનો-નકામો થવો.' },
        { term: 'EOQ — Economic Order Quantity (આર્થિક વરદી જથ્થો)', def: 'વરદી ખર્ચ અને વહન ખર્ચનો કુલ સરવાળો સૌથી ઓછો કરતો વરદી-જથ્થો.' },
        { term: 'લીડ ટાઇમ (માલ મળવાનો સમય)', def: 'વરદી આપવા અને માલ હાથમાં મળવા વચ્ચેનો સમય.' },
        { term: 'Re-order level (પુનઃ વરદી સપાટી)', def: 'જે સ્ટૉક સપાટીએ નવી ખરીદી માટેની માગણી (પરચેઝ રિક્વિઝિશન) મૂકવામાં આવે છે.' },
        { term: 'Danger level (ભયસપાટી)', def: 'લઘુતમ સપાટીની નીચેની એવી સપાટી જ્યાં સામાન્ય રીતે માલ આપવાનું બંધ થાય અને ફક્ત તાકીદનાં કામો માટે જ માલ અપાય.' },
        { term: 'સ્ટૉક ઉથલા ગુણોત્તર (Inventory/Stock Turnover Ratio)', def: 'સમયગાળામાં સરેરાશ સ્ટૉક કેટલી વખત વપરાય (કે વેચાય) છે = વપરાયેલી માલસામગ્રીની પડતર ÷ સરેરાશ સ્ટૉક. નીચો ગુણોત્તર ધીમે ફરતો, સ્થગિત કે જૂનો-નકામો સ્ટૉક દર્શાવે છે — માલની હેરફેર તપાસવાની મુખ્ય પદ્ધતિ.' },
      ],
      formulas: [
        { name: 'EOQ — આર્થિક વરદી જથ્થો', expr: 'EOQ = √(2 × A × O ÷ Cₕ)', note: 'A = વાર્ષિક વપરાશ, O = પ્રતિ વરદી વરદી ખર્ચ, Cₕ = પ્રતિ એકમ વાર્ષિક વહન ખર્ચ.' },
        { name: 'પ્રતિ એકમ વહન ખર્ચ', expr: 'Cₕ = Cost per unit × Carrying % (when given as a % of value)', note: 'Cₕ = પ્રતિ એકમ પડતર × વહન % (જ્યારે મૂલ્યના % તરીકે અપાયું હોય).' },
        { name: 'Re-order level (પુનઃ વરદી સપાટી)', expr: 'Maximum usage × Maximum lead time' },
        { name: 'Minimum level (લઘુતમ સપાટી)', expr: 'Re-order level − (Normal usage × Average lead time)' },
        { name: 'Maximum level (મહત્તમ સપાટી)', expr: 'Re-order level + Re-order quantity − (Minimum usage × Minimum lead time)' },
        { name: 'સરેરાશ સ્ટૉક સપાટી', expr: '½ (Minimum level + Maximum level)  —  or  Minimum level + ½ Re-order quantity' },
        { name: 'Danger level (ભયસપાટી)', expr: 'Normal usage × Emergency lead time' },
        { name: 'સ્ટૉક ઉથલા ગુણોત્તર', expr: 'Cost of materials consumed ÷ Average stock  (times)', note: 'હંમેશાં પડતર-પ્રવાહ વાપરો, વેચાણ નહીં. તૈયાર માલ માટે: વેચાયેલા માલની પડતર ÷ સરેરાશ સ્ટૉક.' },
        { name: 'સરેરાશ સ્ટૉક', expr: '(Opening stock + Closing stock) ÷ 2' },
        { name: 'સ્ટૉક રાખવાનો સમયગાળો', expr: '365 ÷ Inventory turnover ratio  (days)', note: '365ને બદલે મહિના માટે 12 કે અઠવાડિયા માટે 52 વાપરો.' },
      ],
      procedure: {
        heading: 'EOQ અને સ્ટૉક સપાટીઓ નક્કી કરવી',
        steps: [
          { title: '1 · માહિતી એકઠી કરો', detail: 'વાર્ષિક વપરાશ, પ્રતિ વરદી વરદી ખર્ચ અને વહન ખર્ચ (પ્રતિ એકમ, કે એકમ-મૂલ્યના % તરીકે). સપાટીઓ માટે: લઘુતમ/સામાન્ય/મહત્તમ વપરાશ અને લીડ ટાઇમ, તથા re-order (EOQ) જથ્થો.' },
          { title: '2 · EOQ ગણો', detail: 'EOQ = √(2AO ÷ Cₕ) લાગુ કરો. ચકાસો કે EOQ આગળ કુલ વરદી ખર્ચ ≈ કુલ વહન ખર્ચ થાય છે.' },
          { title: '3 · Re-order level (પુનઃ વરદી સપાટી)', detail: 'મહત્તમ વપરાશ × મહત્તમ લીડ ટાઇમ — સૌથી લાંબા વિલંબ દરમિયાનની સૌથી ખરાબ સ્થિતિની માગ, જેથી નવો પુરવઠો આવે તે પહેલાં સ્ટૉક ક્યારેય ખૂટે નહીં.' },
          { title: '4 · લઘુતમ અને મહત્તમ સપાટીઓ', detail: 'Minimum = ROL − (સામાન્ય વપરાશ × સરેરાશ લીડ ટાઇમ). Maximum = ROL + ROQ − (લઘુતમ વપરાશ × લઘુતમ લીડ ટાઇમ).' },
          { title: '5 · સરેરાશ અને ભય (danger) સપાટીઓ', detail: 'Average = ½(લઘુતમ + મહત્તમ). Danger = સામાન્ય વપરાશ × કટોકટી (સર્વોચ્ચ અગ્રતા) લીડ ટાઇમ.' },
        ],
      },
      examTips: [
        'ગુણાકાર કરતા પહેલાં વપરાશ અને લીડ ટાઇમ એક જ સમય-એકમમાં રાખો (બંને પ્રતિ અઠવાડિયું, કે બંને પ્રતિ મહિનો).',
        'EOQ આગળ વરદી ખર્ચ વહન ખર્ચ બરાબર થાય છે — જવાબ જાતે ચકાસવાની ઝડપી રીત.',
        'મહત્તમ સપાટી માટે લઘુતમ વપરાશ × લઘુતમ લીડ ટાઇમ વાપરો (શ્રેષ્ઠ સ્થિતિમાં સૌથી વધુ સ્ટૉક બચે); re-order level માટે મહત્તમ વપરાશ × મહત્તમ લીડ ટાઇમ વાપરો (સૌથી ખરાબ સ્થિતિ).',
      ],
      pitfalls: [
        'વહન ખર્ચને ટકાવારી તરીકે અને પ્રતિ એકમ વહન ખર્ચ તરીકે ભેળવી દેવો — પહેલાં તેને પ્રતિ એકમ ₹માં ફેરવો (એકમ પડતર × %).',
        'Re-order level માટે મહત્તમ આંકડાને બદલે સરેરાશ આંકડા વાપરવા (કે મહત્તમ સપાટી માટે ઊલટું).',
        'EOQ સ્થિર માગ, ભાવ અને વરદી ખર્ચ ધારે છે એ ભૂલવું — જથ્થા-છૂટ આર્થિક જથ્થાને બદલી શકે છે.',
      ],
      workedExample: {
        title: 'EOQ અને સ્ટૉક સપાટીઓ (Arora, Illustrations 3.1 અને 3.2)',
        problem:
          'EOQ: વાર્ષિક જરૂરિયાત 600 એકમ, પ્રતિ એકમ પડતર ₹20, પ્રતિ વરદી વરદી ખર્ચ ₹12, વહન ખર્ચ સરેરાશ સ્ટૉકના 20%. માલ A માટે સ્ટૉક સપાટીઓ: લઘુતમ વપરાશ 50, સામાન્ય વપરાશ 100, મહત્તમ વપરાશ 150 એકમ પ્રતિ અઠવાડિયું; re-order જથ્થો 600 એકમ; ડિલિવરી (લીડ) સમય 4 થી 6 અઠવાડિયાં. EOQ અને સ્ટૉક સપાટીઓ શોધો.',
        steps: [
          { label: 'પ્રતિ એકમ વહન ખર્ચ = 20% × ₹20', result: '₹4 per unit p.a.' },
          { label: 'EOQ = √(2 × A × O ÷ Cₕ)', formula: '√(2 × 600 × 12 ÷ 4) = √3,600', result: '60 units' },
          { label: 'Re-order level = મહત્તમ વપરાશ × મહત્તમ લીડ ટાઇમ', formula: '150 × 6', result: '900 units' },
          { label: 'Minimum level = ROL − (સામાન્ય વપરાશ × સરેરાશ લીડ ટાઇમ)', formula: '900 − (100 × 5)', result: '400 units' },
          { label: 'Maximum level = ROL + ROQ − (લઘુતમ વપરાશ × લઘુતમ લીડ ટાઇમ)', formula: '900 + 600 − (50 × 4)', result: '1,300 units' },
          { label: 'સરેરાશ સ્ટૉક સપાટી = ½ (લઘુતમ + મહત્તમ)', formula: '½ (400 + 1,300)', result: '850 units' },
        ],
        answer: 'EOQ 60 એકમ. માલ A: re-order level 900, લઘુતમ 400, મહત્તમ 1,300, સરેરાશ 850 એકમ.',
        source: 'M.N. Arora, Cost Accounting, Illustrations 3.1 & 3.2',
      },
      practice: [
        {
          q: 'આર્થિક વરદી જથ્થા (EOQ) આગળ વરદી ખર્ચ અને વહન ખર્ચ વચ્ચે શો સંબંધ હોય છે?',
          answer: 'તે સમાન હોય છે. EOQ એ બિંદુ છે જ્યાં તેમનો કુલ સરવાળો સૌથી ઓછો થાય છે, અને બંને ખર્ચ-વળાંકો એકબીજાને છેદે છે.',
        },
        {
          q: 'જો વાર્ષિક માગ ચાર ગણી (×4) થાય, તો EOQનું શું થાય?',
          answer:
            'EOQ માગના વર્ગમૂળ પ્રમાણે વધે છે, તેથી તે બમણો (√4 = 2) થાય, ચાર ગણો નહીં. એ જ તર્ક વરદી ખર્ચને પણ લાગુ પડે છે.',
        },
        {
          q: 'મહત્તમ સપાટી લઘુતમ વપરાશ અને લઘુતમ લીડ ટાઇમ વાપરીને કેમ ગણાય છે?',
          answer:
            'કારણ કે સૌથી વધુ સ્ટૉક શ્રેષ્ઠ સ્થિતિમાં થાય છે — સૌથી ટૂંકા વિલંબ દરમિયાન સૌથી ધીમો વપરાશ — જ્યારે નવો પુરવઠો આવે ત્યારે જૂનો સ્ટૉક સૌથી વધુ હાથમાં બાકી હોય.',
        },
        {
          q: 'શરૂનો સ્ટૉક ₹40,000, આખરનો સ્ટૉક ₹60,000, વપરાયેલી માલસામગ્રી ₹5,00,000. સ્ટૉક ઉથલા ગુણોત્તર અને રાખવાનો સમયગાળો શોધો.',
          answer:
            'સરેરાશ સ્ટૉક = (40,000 + 60,000) ÷ 2 = ₹50,000; ઉથલા = 5,00,000 ÷ 50,000 = 10 વખત; રાખવાનો સમયગાળો = 365 ÷ 10 ≈ 36.5 દિવસ.',
        },
      ],
      applications: [
        'સ્ટોર્સ અને ખરીદ-વિભાગો સ્ટૉક ખૂટવો અને મૂડી રોકાઈ જવી — બંને ટાળવા EOQ અને સ્ટૉક સપાટીઓ વાપરે છે.',
        'સ્ટૉક ઉથલા ગુણોત્તર ધીમે ફરતી, સ્થગિત અને જૂની-નકામી વસ્તુઓને નિકાલ માટે ઓળખે છે (ABC અને JIT પદ્ધતિઓ).',
        'Re-order અને danger સપાટીઓ ERP/ઇન્વેન્ટરી પ્રણાલીઓમાં ખરીદ-માગણીના સમયને આપોઆપ કરી દે છે.',
      ],
      advantages: [
        'આર્થિક વરદી જથ્થા આગળ કુલ સ્ટૉક પડતર (વરદી + વહન) સૌથી ઓછી કરે છે.',
        'વૈજ્ઞાનિક સ્ટૉક સપાટીઓ એકસાથે ઉત્પાદન અટકવા અને સ્ટૉકમાં વધારે પડતા રોકાણ — બંનેને અટકાવે છે.',
        'ઉથલા વિશ્લેષણ ધીમે ફરતા સ્ટૉકમાં બંધાયેલી કાર્યશીલ મૂડી મુક્ત કરે છે.',
      ],
      limitations: [
        'EOQ સ્થિર માગ, ભાવ અને લીડ ટાઇમ ધારે છે — જ્યાં આ બદલાતા રહે કે જથ્થા-છૂટ લાગુ પડે ત્યાં અવાસ્તવિક.',
        'વિશ્વસનીય માહિતી (વપરાશ, લીડ ટાઇમ, પડતર) જરૂરી; ખરાબ માહિતી ખરાબ સપાટીઓ આપે છે.',
        'નાશવંત માલ, જથ્થાબંધ છૂટ કે પુરવઠા-વિક્ષેપ તે જાતે સંભાળતું નથી.',
      ],
    },
    title: 'Material Control — EOQ & Stock Levels',
    subject: 'Cost Accounting',
    icon: PackageSearch,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Order the most economical quantity and set scientific re-order, minimum, maximum and danger stock levels to avoid both stock-outs and locked-up capital.',
    readingMinutes: 11,
    tags: ['eoq', 'economic order quantity', 'reorder level', 'minimum level', 'maximum level', 'danger level', 'stock control', 'inventory'],
    overview: [
      'Material is often the largest element of cost, so controlling it is central to cost control. Two opposing dangers must be balanced: over-stocking locks up capital and risks obsolescence, while under-stocking risks stoppage of production. Scientific stock control sets quantity levels for each item so it is automatically held within sensible limits.',
      'The Economic Order Quantity (EOQ) answers “how much to order at a time”. Ordering many small lots raises ordering cost but cuts carrying cost; ordering a few large lots does the reverse. The EOQ is the order size at which the total of ordering and carrying cost is the lowest — and at that point the two costs are equal.',
      'Stock levels answer “when to order” and “between what limits to hold”. The re-order level triggers a fresh purchase; the minimum level is a safety floor; the maximum level is a ceiling that prevents over-investment; the danger level signals that only urgent issues should be made.',
    ],
    keyTerms: [
      { term: 'Ordering cost', def: 'Cost of placing and processing an order — stationery, receiving, inspection, salaries of the buying staff.' },
      { term: 'Carrying (holding) cost', def: 'Cost of holding stock — storage, insurance, interest on capital locked up, deterioration and obsolescence.' },
      { term: 'Economic Order Quantity', def: 'The order size that minimises the total of ordering and carrying cost.' },
      { term: 'Lead time', def: 'The time between raising an order and receiving the material.' },
      { term: 'Re-order level', def: 'The stock level at which a fresh purchase requisition is raised.' },
      { term: 'Danger level', def: 'A level below the minimum at which normal issues stop and material is issued only for urgent jobs.' },
      { term: 'Inventory (stock) turnover ratio', def: 'How many times the average stock is consumed (or sold) in a period = cost of materials consumed ÷ average stock. A low ratio flags slow-moving, dormant or obsolete stock — a key technique for reviewing material movement.' },
    ],
    formulas: [
      { name: 'Economic Order Quantity', expr: 'EOQ = √(2 × A × O ÷ Cₕ)', note: 'A = annual consumption, O = ordering cost per order, Cₕ = carrying cost per unit per annum.' },
      { name: 'Carrying cost per unit', expr: 'Cₕ = Cost per unit × Carrying % (when given as a % of value)' },
      { name: 'Re-order level', expr: 'Maximum usage × Maximum lead time' },
      { name: 'Minimum level', expr: 'Re-order level − (Normal usage × Average lead time)' },
      { name: 'Maximum level', expr: 'Re-order level + Re-order quantity − (Minimum usage × Minimum lead time)' },
      { name: 'Average stock level', expr: '½ (Minimum level + Maximum level)  —  or  Minimum level + ½ Re-order quantity' },
      { name: 'Danger level', expr: 'Normal usage × Emergency lead time' },
      { name: 'Inventory (Stock) Turnover Ratio', expr: 'Cost of materials consumed ÷ Average stock  (times)', note: 'Use a COST flow, never sales. For finished goods: Cost of goods sold ÷ Average inventory.' },
      { name: 'Average stock', expr: '(Opening stock + Closing stock) ÷ 2' },
      { name: 'Inventory holding period', expr: '365 ÷ Inventory turnover ratio  (days)', note: 'Use 12 for months or 52 for weeks instead of 365.' },
    ],
    procedure: {
      heading: 'Setting EOQ and stock levels',
      steps: [
        { title: '1 · Gather the data', detail: 'Annual consumption, ordering cost per order and carrying cost (per unit, or as a % of unit value). For levels: minimum/normal/maximum usage and lead time, and the re-order (EOQ) quantity.' },
        { title: '2 · Compute EOQ', detail: 'Apply EOQ = √(2AO ÷ Cₕ). Verify by checking that at the EOQ, total ordering cost ≈ total carrying cost.' },
        { title: '3 · Re-order level', detail: 'Maximum usage × maximum lead time — the worst-case demand over the longest delay, so stock never runs out before fresh supply arrives.' },
        { title: '4 · Minimum & maximum levels', detail: 'Minimum = ROL − (normal usage × average lead time). Maximum = ROL + ROQ − (minimum usage × minimum lead time).' },
        { title: '5 · Average & danger levels', detail: 'Average = ½(min + max). Danger = normal usage × emergency (top-priority) lead time.' },
      ],
    },
    examTips: [
      'Keep usage and lead time in the SAME period units (both per week, or both per month) before multiplying.',
      'At the EOQ, ordering cost equals carrying cost — a quick way to self-check your answer.',
      'For maximum level use minimum usage × minimum lead time (the best case leaves the most stock); for re-order level use maximum usage × maximum lead time (the worst case).',
    ],
    pitfalls: [
      'Mixing the carrying cost as a percentage with the carrying cost per unit — convert to ₹ per unit first (unit cost × %).',
      'Using average rather than maximum figures for the re-order level (or vice-versa for the maximum level).',
      'Forgetting that EOQ assumes constant demand, price and ordering cost — quantity discounts can shift the economic size.',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 3 (Material Cost Control)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Economic order quantity (EOQ) — formula & meaning', url: 'https://corporatefinanceinstitute.com/resources/accounting/economic-order-quantity-eoq/', kind: 'article', source: 'CFI' },
      { label: 'Stock levels — re-order, minimum, maximum, danger', url: 'https://www.accountingnotes.net/cost-accounting/material-control/levels-of-stock/16125', kind: 'article', source: 'Accounting Notes' },
      { label: 'Inventory turnover ratio (material costing) — slow/dormant/obsolete stock', url: 'https://www.financestrategists.com/accounting/cost-accounting/material-costing/inventory-turnover-ratio/', kind: 'article', source: 'Finance Strategists' },
    ],
    workedExample: {
      title: 'EOQ and stock levels (Arora, Illustrations 3.1 & 3.2)',
      problem:
        'EOQ: annual requirement 600 units, cost per unit ₹20, ordering cost ₹12 per order, carrying cost 20% of average inventory. Stock levels for material A: minimum usage 50, normal usage 100, maximum usage 150 units per week; re-order quantity 600 units; delivery (lead) time 4 to 6 weeks. Find the EOQ and the stock levels.',
      steps: [
        { label: 'Carrying cost per unit = 20% × ₹20', result: '₹4 per unit p.a.' },
        { label: 'EOQ = √(2 × A × O ÷ Cₕ)', formula: '√(2 × 600 × 12 ÷ 4) = √3,600', result: '60 units' },
        { label: 'Re-order level = Max usage × Max lead time', formula: '150 × 6', result: '900 units' },
        { label: 'Minimum level = ROL − (Normal usage × Avg lead time)', formula: '900 − (100 × 5)', result: '400 units' },
        { label: 'Maximum level = ROL + ROQ − (Min usage × Min lead time)', formula: '900 + 600 − (50 × 4)', result: '1,300 units' },
        { label: 'Average stock level = ½ (Min + Max)', formula: '½ (400 + 1,300)', result: '850 units' },
      ],
      answer: 'EOQ 60 units. Material A: re-order level 900, minimum 400, maximum 1,300, average 850 units.',
      source: 'M.N. Arora, Cost Accounting, Illustrations 3.1 & 3.2',
    },
    practice: [
      {
        q: 'At the economic order quantity, what is the relationship between ordering cost and carrying cost?',
        answer: 'They are equal. The EOQ is the point at which their total is minimised, and the two cost curves cross.',
      },
      {
        q: 'If annual demand quadruples (×4), what happens to the EOQ?',
        answer:
          'EOQ rises with the square root of demand, so it doubles (√4 = 2), not quadruples. The same logic applies to ordering cost.',
      },
      {
        q: 'Why is the maximum level computed using minimum usage and minimum lead time?',
        answer:
          'Because the highest stock occurs in the best case — slowest consumption during the shortest delay — when fresh supply arrives with the most old stock still on hand.',
      },
      {
        q: 'Opening stock ₹40,000, closing stock ₹60,000, materials consumed ₹5,00,000. Find the inventory turnover ratio and the holding period.',
        answer:
          'Average stock = (40,000 + 60,000) ÷ 2 = ₹50,000; turnover = 5,00,000 ÷ 50,000 = 10 times; holding period = 365 ÷ 10 ≈ 36.5 days.',
      },
    ],
    applications: [
      'Stores and purchase departments use EOQ and stock levels to avoid both stock-outs and locked-up capital.',
      'The inventory turnover ratio flags slow-moving, dormant and obsolete items for disposal (ABC and JIT systems).',
      'Re-order and danger levels automate the timing of purchase requisitions in ERP/inventory systems.',
    ],
    advantages: [
      'Minimises the total inventory cost (ordering + carrying) at the economic order quantity.',
      'Scientific stock levels prevent production stoppage and over-investment in stock at the same time.',
      'Turnover analysis releases working capital tied up in slow-moving stock.',
    ],
    limitations: [
      'EOQ assumes constant demand, price and lead time — unrealistic where these fluctuate or quantity discounts apply.',
      'Requires reliable data (usage, lead time, costs); poor data produces poor levels.',
      'Does not by itself handle perishability, bulk discounts or supply disruptions.',
    ],
    calc: 'eoq-stock-levels',
  },
  {
    id: 'labour-costing',
    gu: {
      title: 'મજૂરી પડતર — વેતન પદ્ધતિઓ અને મજૂર બદલી',
      blurb:
        'સમય-દર, નંગ-દર તથા Halsey અને Rowan પ્રીમિયમ-બોનસ યોજનાઓ હેઠળ કમાણી ગણો, અને છૂટા થવાની, બદલીની તથા કુલ બદલી (flux) રીતે મજૂર બદલીનો દર (labour turnover) માપો.',
      overview: [
        'મજૂરી એ પડતરનું બીજું મુખ્ય ઘટક છે. તેના નિયમનની બે બાજુ છે: કાર્યક્ષમતાને પુરસ્કાર આપે એ રીતે કામદારોને વેતન ચૂકવવું (વેતન ચૂકવણીની પદ્ધતિ), અને કામદારોની સંખ્યા સ્થિર રાખવી (મજૂર બદલીનું નિયમન).',
        'બે પાયાની પદ્ધતિઓ છે: સમય-દર (time rate — કામ કરેલા કલાક પ્રમાણે ચૂકવણી; સલામત પણ ઝડપી થવાનું કોઈ પ્રોત્સાહન નહીં) અને નંગ-દર (piece rate — પેદા કરેલા એકમ દીઠ ચૂકવણી; પ્રબળ પ્રોત્સાહન પણ સલામતી નહીં અને ગુણવત્તાનું જોખમ). પ્રીમિયમ-બોનસ યોજનાઓ બંનેને ભેળવે છે: તે સમય-મજૂરીની ખાતરી આપે છે અને બચેલા સમય માટે બોનસ ઉમેરે છે, જેથી લાભ કામદાર અને માલિક વચ્ચે વહેંચાય. સૌથી જાણીતી છે Halsey યોજના (બોનસ = બચેલા સમયના 50%) અને Rowan યોજના (બોનસ બચેલા સમયના પ્રમાણમાં).',
        'મજૂર બદલી (labour turnover) એટલે કામદારો જે દરે છૂટા થાય અને તેમની જગ્યાએ નવા ભરાય તેનો દર. થોડી બદલી સામાન્ય છે, પણ ઊંચો દર ખર્ચાળ છે — ભરતી, તાલીમ, નવા કામદારોની ઓછી ઉત્પાદકતા અને બગાડ. તેને છૂટા થવાની (separation), બદલીની (replacement) કે કુલ બદલી (flux) રીતે માપાય છે, અને સરખામણી માટે એક જ રીત સતત વાપરવી જોઈએ.',
      ],
      keyTerms: [
        { term: 'સમય-દર પદ્ધતિ (time rate)', def: 'મજૂરી = કામ કરેલા કલાક × કલાક દીઠ દર. વેતનની ખાતરી આપે છે પણ વધુ ઉત્પાદન કરવાનું સીધું પ્રોત્સાહન આપતી નથી.' },
        { term: 'નંગ-દર પદ્ધતિ (piece rate)', def: 'મજૂરી = પેદા કરેલા એકમ × એકમ દીઠ દર. ઉત્પાદનને પુરસ્કાર આપે છે પણ સલામતી આપતી નથી અને ગુણવત્તાને નુકસાન કરી શકે.' },
        { term: 'બચેલો સમય (time saved)', def: 'પ્રમાણ (મંજૂર) સમય − ખરેખર લાગેલો સમય. પ્રીમિયમ-બોનસ યોજનાઓ સમય બચે ત્યારે જ બોનસ ચૂકવે છે.' },
        { term: 'Halsey યોજના', def: 'ખાતરીબદ્ધ સમય-મજૂરી + (બચેલો સમય × દર)ના 50%. બચતના બાકીના 50% માલિક પાસે રહે છે.' },
        { term: 'Rowan યોજના', def: 'ખાતરીબદ્ધ સમય-મજૂરી + (બચેલો સમય ÷ પ્રમાણ સમય) × સમય-મજૂરી. બોનસ ક્યારેય સમય-મજૂરી કરતાં વધી શકતો નથી.' },
        { term: 'મજૂર બદલી (labour turnover)', def: 'એક ગાળામાં કામદારોની રચનામાં થતા ફેરફારનો દર, ટકાવારીમાં દર્શાવાય.' },
      ],
      formulas: [
        { name: 'સમય-મજૂરી', expr: 'Actual time × Rate per hour' },
        { name: 'Halsey બોનસ', expr: '50% × (Time saved × Rate)', note: 'Halsey–Weir 50%ને બદલે 30% વાપરે છે.' },
        { name: 'Halsey કમાણી', expr: 'Time wages + Halsey bonus' },
        { name: 'Rowan બોનસ', expr: '(Time saved ÷ Standard time) × Time wages' },
        { name: 'Rowan કમાણી', expr: 'Time wages + Rowan bonus' },
        { name: 'છૂટા થવાનો દર (separation)', expr: 'Separations ÷ Average workers × 100' },
        { name: 'બદલીનો દર (replacement)', expr: 'Replacements ÷ Average workers × 100' },
        { name: 'કુલ બદલીનો દર (flux)', expr: '(Separations + Replacements) ÷ Average workers × 100' },
      ],
      procedure: {
        heading: 'પ્રોત્સાહક કમાણી અને મજૂર બદલી',
        steps: [
          { title: '૧ · બચેલો સમય શોધો', detail: 'બચેલો સમય = પ્રમાણ (મંજૂર) સમય − ખરેખર લાગેલો સમય. જો કશું ન બચે, તો માત્ર ખાતરીબદ્ધ સમય-મજૂરી જ ચૂકવાય.' },
          { title: '૨ · સમય-મજૂરી', detail: 'ખરેખર લાગેલો સમય × કલાક દીઠ દર — Halsey અને Rowan બંને હેઠળ ખાતરીબદ્ધ લઘુતમ.' },
          { title: '૩ · Halsey બોનસ અને કમાણી', detail: 'બોનસ = (બચેલો સમય × દર)ના 50%. કમાણી = સમય-મજૂરી + બોનસ.' },
          { title: '૪ · Rowan બોનસ અને કમાણી', detail: 'બોનસ = (બચેલો સમય ÷ પ્રમાણ સમય) × સમય-મજૂરી. કમાણી = સમય-મજૂરી + બોનસ.' },
          { title: '૫ · મજૂર બદલી', detail: 'સરેરાશ કામદારો = (પ્રારંભિક + અંતિમ) ÷ 2. પછી છૂટા થવાની, બદલીની અને કુલ બદલીની સૂત્રો લાગુ કરો. વિસ્તરણ માટેની ભરતી આ દરોમાંથી બાકાત રાખો.' },
        ],
      },
      examTips: [
        'બોનસ માત્ર બચેલા સમય પર જ મળે છે. જો કામદાર પ્રમાણ સમય જેટલો કે વધુ સમય લે, તો બંને યોજનાઓ ફક્ત ખાતરીબદ્ધ સમય-મજૂરી જ ચૂકવે છે.',
        'અડધાથી વધુ સમય બચે ત્યારે Halsey મોટો બોનસ આપે છે; અડધાથી ઓછો સમય બચે ત્યારે Rowan મોટો બોનસ આપે છે (અને બોનસને સમય-મજૂરીના 100% પર સીમિત રાખે છે).',
        'મજૂર બદલીમાં, વિસ્તરણ કાર્યક્રમ માટે ભરતી થયેલા કામદારો બદલી (replacement) નથી — તેમને છૂટા થવાની, બદલીની અને કુલ બદલીની દરોમાંથી બાકાત રાખો; તેમને કેવળ આવક (accession)માં ગણો.',
      ],
      pitfalls: [
        'બોનસ બચેલા સમયને બદલે ખરેખર લાગેલા સમય પર કે પ્રમાણ સમય પર ગણવો.',
        'Rowan બોનસ માટે ખોટો આધાર વાપરવો — તે સમય-મજૂરી (ખરેખર સમય × દર)ના પ્રમાણમાં છે, પ્રમાણ-મજૂરીના નહીં.',
        'વિસ્તરણ માટેની ભરતીને બદલીની કે કુલ બદલીની દરમાં સામેલ કરવી, જે મજૂર બદલીને વધારે પડતી દર્શાવે છે.',
      ],
      applications: [
        'પેઢીઓ કામદારની સલામતી, ઉત્પાદન અને ગુણવત્તા વચ્ચે સંતુલન સાધવા સમય, નંગ કે પ્રોત્સાહક પદ્ધતિ પસંદ કરે છે.',
        'જ્યાં ઉત્પાદન માપી શકાય અને સંચાલન કાર્યક્ષમતાનો લાભ વહેંચવા માગે ત્યાં Halsey અને Rowan યોજનાઓ વપરાય છે.',
        'મજૂર બદલીનું વિશ્લેષણ છૂટા થનારાઓની પડતર માપીને HR નીતિ (જાળવણી, તાલીમ) ઘડે છે.',
      ],
      advantages: [
        'પ્રીમિયમ-બોનસ યોજનાઓ લઘુતમ વેતનની ખાતરી આપતાં કાર્યક્ષમતાને પુરસ્કાર આપે છે — સલામતી અને પ્રોત્સાહન બંને સાથે.',
        'મજૂર બદલીનું માપન એક છુપાયેલી પડતરને આંકડામાં મૂકે છે અને જાળવણીના પગલાં પ્રેરે છે.',
        'એકમ દીઠ મજૂરી પડતરનું નિયમન અને ઉત્પાદકતા સુધારવામાં મદદ કરે છે.',
      ],
      limitations: [
        'નંગ અને પ્રોત્સાહક પદ્ધતિઓ ગુણવત્તા અને સલામતીના ભોગે ઝડપને ઉત્તેજન આપી શકે છે.',
        'પ્રમાણ સમય નક્કી કરવો વ્યક્તિલક્ષી છે; ઢીલા ધોરણ બોનસ ફુલાવે, કડક ધોરણ ઉત્સાહ તોડે.',
        'મજૂર બદલીના ગુણોત્તરો ફેરફારનો દર દર્શાવે છે, તેનાં મૂળ કારણો નહીં, જેની અલગ તપાસ જરૂરી છે.',
      ],
      workedExample: {
        title: 'Halsey અને Rowan કમાણી; મજૂર બદલી (Arora, Unit 5)',
        problem:
          'મજૂરી: પ્રમાણ સમય 50 કલાક, ખરેખર લાગેલો સમય 42 કલાક, દર ₹3 પ્રતિ કલાક. Halsey અને Rowan યોજનાઓ હેઠળ કમાણી ગણો. મજૂર બદલી: શરૂઆતમાં કામદારો 900, અંતે 1,100; મહિના દરમિયાન 50 કામદારો છૂટા થયા અને 150 ભરતી થયા, જેમાંથી 25એ ખાલી જગ્યાઓ ભરી અને 125 વિસ્તરણ માટે હતા. છૂટા થવાની, બદલીની અને કુલ બદલીની દર ગણો.',
        steps: [
          { label: 'બચેલો સમય (time saved) = 50 − 42', result: '8 hours' },
          { label: 'સમય-મજૂરી = 42 × ₹3', result: '₹126' },
          { label: 'Halsey: બોનસ = 50% × (8 × ₹3)', formula: '₹126 + ₹12', result: '₹138' },
          { label: 'Rowan: બોનસ = (8 ÷ 50) × ₹126', formula: '₹126 + ₹20.16', result: '₹146.16' },
          { label: 'સરેરાશ કામદારો = (900 + 1,100) ÷ 2', result: '1,000' },
          { label: 'છૂટા થવાનો દર (separation) = 50 ÷ 1,000 × 100', result: '5%' },
          { label: 'બદલીનો દર (replacement) = 25 ÷ 1,000 × 100', result: '2.5%' },
          { label: 'કુલ બદલીનો દર (flux) = (50 + 25) ÷ 1,000 × 100', result: '7.5%' },
        ],
        answer: 'Halsey કમાણી ₹138, Rowan કમાણી ₹146.16. મજૂર બદલી — છૂટા થવાનો 5%, બદલીનો 2.5%, કુલ બદલી 7.5%.',
        source: 'M.N. Arora, Cost Accounting, Unit 5 (Illustration 5.1 & wage examples)',
      },
      practice: [
        {
          q: 'એક કામદાર પ્રમાણ સમયનો 60% બચાવે છે. Halsey કે Rowan — કયો વધુ બોનસ આપશે?',
          answer:
            'Halsey. જ્યારે 50%થી વધુ સમય બચે, ત્યારે Halseyનો બચતના 50% બોનસ Rowanના પ્રમાણસર બોનસ કરતાં વધી જાય છે. 50%થી ઓછો સમય બચે ત્યારે Rowan વધુ ચૂકવે છે.',
        },
        {
          q: 'પ્રમાણ સમય 10 કલાક, ખરેખર 8 કલાક, દર ₹5. Rowan બોનસ શોધો.',
          answer: 'બચેલો સમય 2 કલાક; સમય-મજૂરી = 8 × 5 = ₹40; બોનસ = (2 ÷ 10) × 40 = ₹8. કમાણી ₹48.',
        },
        {
          q: 'વિસ્તરણ કાર્યક્રમ માટે ભરતી થયેલા કામદારોને મજૂર બદલીના દરમાંથી કેમ બાકાત રખાય છે?',
          answer:
            'તેઓ છૂટા થયેલા કોઈની જગ્યાએ ભરાતા નથી — તેઓ કામદારોમાં વધારો છે, છૂટા થવાથી રચનામાં થયેલો ફેરફાર નહીં. તેઓ માત્ર આવક (accession)ના આંકડામાં દેખાય છે.',
        },
      ],
    },
    title: 'Labour Cost — Wage Systems & Turnover',
    subject: 'Cost Accounting',
    icon: Users,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Compute earnings under time, piece and the Halsey & Rowan premium-bonus plans, and measure labour turnover by the separation, replacement and flux methods.',
    readingMinutes: 11,
    tags: ['labour cost', 'halsey', 'rowan', 'incentive', 'premium bonus', 'time rate', 'piece rate', 'labour turnover', 'separation', 'flux'],
    overview: [
      'Labour is the second major element of cost. Its control has two sides: paying workers in a way that rewards efficiency (the method of remuneration), and keeping the workforce stable (controlling labour turnover).',
      'The two basic methods are time rate (pay for hours worked — secure but no incentive to be quick) and piece rate (pay per unit produced — strong incentive but no security and a risk to quality). Premium-bonus plans blend the two: they guarantee time wages and add a bonus for time saved, sharing the gain between worker and employer. The best-known are the Halsey plan (bonus = 50% of time saved) and the Rowan plan (bonus proportionate to the time saved).',
      'Labour turnover is the rate at which workers leave and are replaced. Some turnover is normal, but a high rate is costly — recruitment, training, lower productivity of new hires and spoilage. It is measured by the separation, replacement or flux method, and one method should be used consistently for comparison.',
    ],
    keyTerms: [
      { term: 'Time rate system', def: 'Wages = hours worked × rate per hour. Guarantees pay but gives no direct incentive to produce more.' },
      { term: 'Piece rate system', def: 'Wages = units produced × rate per unit. Rewards output but offers no security and may hurt quality.' },
      { term: 'Time saved', def: 'Standard (allowed) time − actual time taken. Premium-bonus plans pay a bonus only when time is saved.' },
      { term: 'Halsey plan', def: 'Guaranteed time wages + 50% of (time saved × rate). The other 50% of the saving stays with the employer.' },
      { term: 'Rowan plan', def: 'Guaranteed time wages + (time saved ÷ standard time) × time wages. The bonus can never exceed the time wages.' },
      { term: 'Labour turnover', def: 'The rate of change in the composition of the workforce over a period, expressed as a percentage.' },
    ],
    formulas: [
      { name: 'Time wages', expr: 'Actual time × Rate per hour' },
      { name: 'Halsey bonus', expr: '50% × (Time saved × Rate)', note: 'Halsey–Weir uses 30% instead of 50%.' },
      { name: 'Halsey earnings', expr: 'Time wages + Halsey bonus' },
      { name: 'Rowan bonus', expr: '(Time saved ÷ Standard time) × Time wages' },
      { name: 'Rowan earnings', expr: 'Time wages + Rowan bonus' },
      { name: 'Separation rate', expr: 'Separations ÷ Average workers × 100' },
      { name: 'Replacement rate', expr: 'Replacements ÷ Average workers × 100' },
      { name: 'Flux rate', expr: '(Separations + Replacements) ÷ Average workers × 100' },
    ],
    procedure: {
      heading: 'Incentive earnings & turnover',
      steps: [
        { title: '1 · Find the time saved', detail: 'Time saved = standard (allowed) time − actual time. If none is saved, only the guaranteed time wages are paid.' },
        { title: '2 · Time wages', detail: 'Actual time × rate per hour — the guaranteed floor under both Halsey and Rowan.' },
        { title: '3 · Halsey bonus & earnings', detail: 'Bonus = 50% of (time saved × rate). Earnings = time wages + bonus.' },
        { title: '4 · Rowan bonus & earnings', detail: 'Bonus = (time saved ÷ standard time) × time wages. Earnings = time wages + bonus.' },
        { title: '5 · Labour turnover', detail: 'Average workers = (opening + closing) ÷ 2. Then apply the separation, replacement and flux formulas. Exclude expansion hires from these rates.' },
      ],
    },
    examTips: [
      'Bonus accrues only on time SAVED. If the worker takes the standard time or longer, both plans simply pay the guaranteed time wages.',
      'Halsey gives the bigger bonus when more than half the time is saved; Rowan gives the bigger bonus when less than half is saved (and caps the bonus at 100% of time wages).',
      'In turnover, workers hired for an expansion programme are NOT replacements — exclude them from the separation, replacement and flux rates; count them only in accessions.',
    ],
    pitfalls: [
      'Calculating bonus on actual time or on standard time instead of on time saved.',
      'Using the wrong base for the Rowan bonus — it is a proportion of the time wages (actual time × rate), not of the standard wages.',
      'Including expansion recruitment in the replacement or flux rate, which overstates turnover.',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 5 (Labour Cost Control)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Halsey & Rowan premium bonus plans (illustrated)', url: 'https://www.accountingnotes.net/cost-accounting/labour-cost/incentive-plans/incentive-plans-of-wage-payment/16290', kind: 'article', source: 'Accounting Notes' },
      { label: 'Labour turnover — meaning, methods & cost', url: 'https://www.yourarticlelibrary.com/cost-accounting/labour-turnover/labour-turnover-meaning-causes-and-effects/53129', kind: 'article', source: 'Article Library' },
    ],
    workedExample: {
      title: 'Halsey & Rowan earnings; labour turnover (Arora, Unit 5)',
      problem:
        'Wages: standard time 50 hours, actual time taken 42 hours, rate ₹3 per hour. Compute earnings under the Halsey and Rowan plans. Turnover: workers at the beginning 900, at the end 1,100; during the month 50 workers left and 150 were recruited, of whom 25 filled vacancies and 125 were for expansion. Compute the separation, replacement and flux rates.',
      steps: [
        { label: 'Time saved = 50 − 42', result: '8 hours' },
        { label: 'Time wages = 42 × ₹3', result: '₹126' },
        { label: 'Halsey: bonus = 50% × (8 × ₹3)', formula: '₹126 + ₹12', result: '₹138' },
        { label: 'Rowan: bonus = (8 ÷ 50) × ₹126', formula: '₹126 + ₹20.16', result: '₹146.16' },
        { label: 'Average workers = (900 + 1,100) ÷ 2', result: '1,000' },
        { label: 'Separation rate = 50 ÷ 1,000 × 100', result: '5%' },
        { label: 'Replacement rate = 25 ÷ 1,000 × 100', result: '2.5%' },
        { label: 'Flux rate = (50 + 25) ÷ 1,000 × 100', result: '7.5%' },
      ],
      answer: 'Halsey earnings ₹138, Rowan earnings ₹146.16. Turnover — separation 5%, replacement 2.5%, flux 7.5%.',
      source: 'M.N. Arora, Cost Accounting, Unit 5 (Illustration 5.1 & wage examples)',
    },
    practice: [
      {
        q: 'A worker saves 60% of the standard time. Will Halsey or Rowan give the higher bonus?',
        answer:
          'Halsey. When more than 50% of the time is saved, the Halsey 50%-of-saving bonus exceeds the Rowan proportionate bonus. Below 50% saved, Rowan pays more.',
      },
      {
        q: 'Standard time 10 h, actual 8 h, rate ₹5. Find the Rowan bonus.',
        answer: 'Time saved 2 h; time wages = 8 × 5 = ₹40; bonus = (2 ÷ 10) × 40 = ₹8. Earnings ₹48.',
      },
      {
        q: 'Why are workers recruited for an expansion programme excluded from the labour-turnover rate?',
        answer:
          'They do not replace anyone who left — they are additions to the workforce, not a change in its composition due to separation. They appear only in the accession figures.',
      },
    ],
    applications: [
      'Firms choose time, piece or incentive systems to balance worker security, output and quality.',
      'Halsey and Rowan plans are used where output is measurable and management wants to share efficiency gains.',
      'Labour-turnover analysis drives HR policy (retention, training) by quantifying the cost of leavers.',
    ],
    advantages: [
      'Premium-bonus plans reward efficiency while guaranteeing a minimum wage — security and incentive together.',
      'Turnover measurement quantifies a hidden cost and prompts retention action.',
      'Helps control labour cost per unit and improve productivity.',
    ],
    limitations: [
      'Piece and incentive systems can encourage speed at the expense of quality and safety.',
      'Setting standard times is subjective; loose standards inflate bonuses, tight ones demotivate.',
      'Turnover ratios show the rate of change, not the underlying causes, which need separate investigation.',
    ],
    calc: 'wage-systems',
  },
  {
    id: 'overhead-costing',
    gu: {
      title: 'પરોક્ષ ખર્ચનો સમાવેશ (Overhead Absorption)',
      blurb:
        'પરોક્ષ ખર્ચને ઉત્પાદનો પર પાથરો — ફાળવણી, વહેંચણી, સમાવેશની છ પદ્ધતિઓ (યંત્ર-કલાક દર સહિત), અને ઓછો/વધુ સમાવેશ.',
      overview: [
        'પરોક્ષ ખર્ચ (ઓવરહેડ) એટલે એવા ખર્ચ — પરોક્ષ માલસામગ્રી, પરોક્ષ મજૂરી અને પરોક્ષ ખર્ચાઓ — જે કોઈ એક જ ઉત્પાદન સાથે સીધા જોડી શકાતા નથી. તેઓ સહિયારા હોવાથી, તેમને પડતર એકમો પર ન્યાયી રીતે ત્રણ તબક્કામાં પાથરવા પડે છે: ફાળવણી, વહેંચણી અને સમાવેશ.',
        'ફાળવણી (Allocation) આખા ખર્ચ-ઘટકને એક જ વિભાગ પર નાખે છે (દા.ત. વિભાગના પોતાના નિરીક્ષકનો પગાર). વહેંચણી (Apportionment) સહિયારા ખર્ચને વિભાગો વચ્ચે ન્યાયી ધોરણે વહેંચે છે (ભાડું ભોંયતળિયાના ક્ષેત્રફળ પર, વીજળી યંત્રના kW-કલાક પર). પછી સેવા-વિભાગના ખર્ચ ઉત્પાદન-વિભાગોમાં ફરી વહેંચાય છે (ગૌણ વિતરણ).',
        'છેવટે, દરેક ઉત્પાદન-વિભાગનો પરોક્ષ ખર્ચ પૂર્વનિર્ધારિત દર વાપરીને તેમાંથી પસાર થતા પડતર એકમોમાં સમાવી લેવાય છે. છ દર સામાન્ય છે; યંત્ર-કલાક દર યંત્ર-પ્રધાન કામને બંધબેસે, મજૂરી-કલાક દર મજૂરી-પ્રધાન કામને બંધબેસે. દર અગાઉથી નક્કી થયેલો હોવાથી, સમાવેલી રકમ વાસ્તવિક પરોક્ષ ખર્ચ સાથે ભાગ્યે જ બરાબર થાય છે — આ તફાવત એટલે ઓછો કે વધુ સમાવેશ.',
      ],
      keyTerms: [
        { term: 'ફાળવણી (Allocation)', def: 'જે પડતરકેન્દ્રે આખો પરોક્ષ ખર્ચ વેઠ્યો હોય તેને જ તે આખો ઘટક નાખવો.' },
        { term: 'વહેંચણી (Apportionment)', def: 'સહિયારા પરોક્ષ ખર્ચને પડતરકેન્દ્રો વચ્ચે ન્યાયી ધોરણે (ક્ષેત્રફળ, મૂલ્ય, માણસ-સંખ્યા) વહેંચવો.' },
        { term: 'સમાવેશ (Absorption)', def: 'વિભાગના પરોક્ષ ખર્ચને પૂર્વનિર્ધારિત દર દ્વારા તેમાંથી પસાર થતા પડતર એકમો પર નાખવો.' },
        { term: 'યંત્ર-કલાક દર', def: 'પરોક્ષ ખર્ચ ÷ યંત્ર-કલાક; જ્યાં કામ યંત્રની ગતિ પ્રમાણે ચાલે ત્યાં વપરાય.' },
        { term: 'ઓછો સમાવેશ (Under-absorption)', def: 'વાસ્તવિક પરોક્ષ ખર્ચ સમાવેલી રકમ કરતાં વધુ — ખર્ચ ઓછો વસૂલ થયો.' },
        { term: 'વધુ સમાવેશ (Over-absorption)', def: 'સમાવેલો પરોક્ષ ખર્ચ વાસ્તવિક કરતાં વધુ — ખર્ચ વધારે વસૂલ થયો.' },
      ],
      formulas: [
        { name: 'પ્રત્યક્ષ માલસામગ્રીના %', expr: 'Overheads ÷ Direct material cost × 100' },
        { name: 'પ્રત્યક્ષ મજૂરીના %', expr: 'Overheads ÷ Direct labour cost × 100' },
        { name: 'મુખ્ય ખર્ચના %', expr: 'Overheads ÷ Prime cost × 100' },
        { name: 'મજૂરી-કલાક દર', expr: 'Overheads ÷ Direct labour hours' },
        { name: 'યંત્ર-કલાક દર', expr: 'Overheads ÷ Machine hours' },
        { name: 'એકમ દીઠ દર', expr: 'Overheads ÷ Units produced' },
        { name: 'ઓછો/વધુ સમાવેશ', expr: 'Actual overhead − Absorbed overhead', note: 'સમાવેલ = પૂર્વનિર્ધારિત દર × વાસ્તવિક આધાર. ધન રકમ = ઓછો સમાવેશ.' },
      ],
      procedure: {
        heading: 'પરોક્ષ ખર્ચનું વિતરણ અને સમાવેશ',
        steps: [
          { title: '1 · પ્રાથમિક વિતરણ', detail: 'બધા પરોક્ષ ખર્ચને ઉત્પાદન અને સેવા વિભાગો પર ન્યાયી ધોરણે ફાળવો અને વહેંચો.' },
          { title: '2 · ગૌણ વિતરણ', detail: 'સેવા-વિભાગના ખર્ચ ઉત્પાદન-વિભાગોમાં ફરી વહેંચો (પગથિયા-પદ્ધતિ, અથવા પરસ્પર સેવાઓ માટે યુગપત્-સમીકરણ/પુનરાવર્તિત-વિતરણ).' },
          { title: '3 · સમાવેશ દર ગણો', detail: 'દરેક ઉત્પાદન-વિભાગ માટે, દર = વિભાગનો પરોક્ષ ખર્ચ ÷ પસંદ કરેલ આધાર (યંત્ર-કલાક, મજૂરી-કલાક વગેરે). જે આધાર પરોક્ષ ખર્ચને ચલાવે તે પસંદ કરો.' },
          { title: '4 · પડતર એકમોમાં સમાવો', detail: 'સમાવેલ પરોક્ષ ખર્ચ = દર × કામ/એકમમાં વપરાયેલ આધારના વાસ્તવિક એકમ.' },
          { title: '5 · ઓછો/વધુ સમાવેશ', detail: 'વાસ્તવિક પરોક્ષ ખર્ચને સમાવેલ સાથે સરખાવો. તફાવત પડતર નફા-નુકસાન ખાતે લઈ જાઓ, અથવા જો મોટો અને સામાન્ય કારણોસર હોય તો પૂરક દર વાપરો.' },
        ],
      },
      examTips: [
        'પૂર્વનિર્ધારિત (અંદાજિત ÷ અંદાજિત) દર વાપરો — એ જ કારણે ઓછો/વધુ સમાવેશ ઊભો થાય છે.',
        'આધારને ખર્ચ-ચાલક સાથે મેળવો: યંત્ર-વિભાગ → યંત્ર-કલાક દર; જોડાણ-લાઇન → મજૂરી-કલાક દર. % પદ્ધતિઓ સમયને અવગણે છે અને ગેરમાર્ગે દોરી શકે.',
        'અસામાન્ય નવરી ક્ષમતાને કારણે થયેલ ઓછો સમાવેશ નફા-નુકસાન ખાતે માંડી વાળાય છે; સામાન્ય વધઘટને કારણે હોય તો પડતર સમાયોજિત કરવા પૂરક દર વાપરી શકાય.',
      ],
      pitfalls: [
        'ફાળવણી (આખો ઘટક, એક વિભાગ) અને વહેંચણી (ધોરણ પર વિભાજન) વચ્ચે ગૂંચવાડો કરવો.',
        'સમાવેશ દર કાઢતા પહેલાં સેવા-વિભાગના ખર્ચ ફરી વહેંચવાનું ભૂલી જવું.',
        'વધુ સમાવેશને નફો ગણવો — તે માત્ર ખર્ચની વસૂલાત છે જે સમાયોજિત કરવી પડે.',
      ],
      applications: [
        'ઉત્પાદકો ભાવ નક્કી કરવા કારખાના પરોક્ષ ખર્ચને યંત્ર-કલાક કે મજૂરી-કલાક દરથી ઉત્પાદન પડતરમાં સમાવે છે.',
        'સેવા પેઢીઓ પડતર નિયંત્રણ માટે સહિયારા ખર્ચ (ભાડું, વહીવટ) વિભાગો વચ્ચે વહેંચે છે.',
        'ઓછા/વધુ સમાવેશનું વિશ્લેષણ સંચાલનને જણાવે છે કે પરોક્ષ ખર્ચ વસૂલાત દર સુધારવાની જરૂર છે કે કેમ.',
      ],
      advantages: [
        'પરોક્ષ ખર્ચને ઉત્પાદનો પર ન્યાયી રીતે પાથરે છે, જેથી કુલ પડતર અને ભાવ સાધનોના વપરાશને પ્રતિબિંબિત કરે.',
        'પૂર્વનિર્ધારિત દર વાસ્તવિક ખર્ચ જાણ્યા પહેલાં ઝડપી પડતર-ગણતરી અને ભાવ-પત્રક શક્ય બનાવે છે.',
        'ઓછા/વધુ સમાવેશ દ્વારા નવરી ક્ષમતા અને વસૂલાતની સમસ્યાઓ ઉજાગર કરે છે.',
      ],
      limitations: [
        'સમાવેશમાં અંદાજ અને આધારની મનસ્વી પસંદગી સામેલ છે — જુદા આધાર જુદી ઉત્પાદન પડતર આપે છે.',
        'પૂર્વનિર્ધારિત દર ઓછો કે વધુ સમાવેશ સર્જે છે જે પાછળથી સમાયોજિત કરવો પડે.',
        'સ્થાયી પરોક્ષ ખર્ચને ઉત્પાદન પડતર ગણે છે, જે ટૂંકા ગાળાના નિર્ણયોને ગેરમાર્ગે દોરી શકે (સીમાન્ત પડતર આ ટાળે છે).',
      ],
      workedExample: {
        title: 'સમાવેશ દર અને ઓછો સમાવેશ (Arora §6.4 / §6.6)',
        problem:
          'અંદાજિત ઉત્પાદન પરોક્ષ ખર્ચ ₹40,000; પ્રત્યક્ષ માલસામગ્રી ₹2,00,000; પ્રત્યક્ષ મજૂરી ₹1,00,000 (મુખ્ય ખર્ચ ₹3,00,000); પ્રત્યક્ષ મજૂરી-કલાક 2,500; યંત્ર-કલાક 2,000; એકમ 1,000. વાસ્તવિક પરોક્ષ ખર્ચ ₹42,000 સામે 2,000 વાસ્તવિક યંત્ર-કલાક. સમાવેશ દર અને યંત્ર-કલાક આધારે ઓછો/વધુ સમાવેશ શોધો.',
        steps: [
          { label: 'પ્રત્યક્ષ માલસામગ્રીના %', formula: '₹40,000 ÷ ₹2,00,000 × 100', result: '20%' },
          { label: 'પ્રત્યક્ષ મજૂરીના %', formula: '₹40,000 ÷ ₹1,00,000 × 100', result: '40%' },
          { label: 'યંત્ર-કલાક દર', formula: '₹40,000 ÷ 2,000', result: '₹20 per hour' },
          { label: 'સમાવેલ પરોક્ષ ખર્ચ', formula: '₹20 × 2,000 actual hours', result: '₹40,000' },
          { label: 'ઓછો સમાવેશ', formula: '₹42,000 actual − ₹40,000 absorbed', result: '₹2,000 under-absorbed' },
        ],
        answer: 'દર: માલસામગ્રીના 20%, મજૂરીના 40%, ₹20 યંત્ર-કલાક. સમાવેલ ₹40,000 સામે વાસ્તવિક ₹42,000 → ₹2,000 ઓછો સમાવેશ, જે પડતર નફા-નુકસાન ખાતે નખાય.',
      },
      practice: [
        {
          q: 'ઓછો/વધુ સમાવેશ ઊભો જ કેમ થાય છે?',
          answer: 'કારણ કે પરોક્ષ ખર્ચ પૂર્વનિર્ધારિત દર (અંદાજિત ÷ અંદાજિત) પર સમાવાય છે. વાસ્તવિક પરોક્ષ ખર્ચ અને વાસ્તવિક પ્રવૃત્તિ અંદાજથી જુદાં પડે છે, તેથી સમાવેલી રકમ વાસ્તવિક સાથે ભાગ્યે જ બરાબર થાય છે.',
        },
        {
          q: 'ઓછી પ્રત્યક્ષ મજૂરીવાળા યંત્ર-વિભાગે કયો સમાવેશ આધાર વાપરવો જોઈએ?',
          options: ['પ્રત્યક્ષ મજૂરીના %', 'યંત્ર-કલાક દર', 'પ્રત્યક્ષ માલસામગ્રીના %', 'એકમ દીઠ દર'],
          answer: 'યંત્ર-કલાક દર — પરોક્ષ ખર્ચ યંત્રના ચાલવાના સમયથી ચાલે છે, મજૂરીથી નહીં.',
        },
        {
          q: 'સમાવેલ પરોક્ષ ખર્ચ ₹50,000; વાસ્તવિક ₹46,000. ઓછો કે વધુ સમાવેશ, અને કેટલો?',
          answer: '₹4,000નો વધુ સમાવેશ (સમાવેલ રકમ વાસ્તવિક કરતાં વધુ) — વધારાની રકમ પાછી જમા / સમાયોજિત કરાય છે.',
        },
      ],
    },
    title: 'Overhead Absorption',
    subject: 'Cost Accounting',
    icon: Layers,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Spread indirect costs onto products — allocation, apportionment, the six absorption methods (incl. machine-hour rate), and under-/over-absorption.',
    readingMinutes: 11,
    tags: ['overhead', 'absorption', 'machine hour rate', 'apportionment', 'under absorption', 'over absorption', 'recovery rate'],
    overview: [
      'Overheads are the indirect costs — indirect material, indirect labour and indirect expenses — that cannot be traced to a single product. Because they are shared, they must be spread fairly across cost units in three steps: allocation, apportionment, and absorption.',
      'Allocation charges a whole cost item to one department (e.g. a department’s own supervisor’s salary). Apportionment splits a shared cost across departments on an equitable basis (rent on floor area, power on machine kW-hours). Service-department costs are then re-apportioned to production departments (secondary distribution).',
      'Finally, each production department’s overhead is absorbed into the cost units passing through it using a predetermined rate. Six rates are common; the machine-hour rate suits machine-intensive work, the labour-hour rate suits labour-intensive work. Because the rate is set in advance, the amount absorbed rarely equals the actual overhead — the gap is under- or over-absorption.',
    ],
    keyTerms: [
      { term: 'Allocation', def: 'Charging an entire item of overhead to a single cost centre that wholly incurred it.' },
      { term: 'Apportionment', def: 'Splitting a shared overhead across cost centres on an equitable basis (area, value, headcount).' },
      { term: 'Absorption', def: 'Charging a department’s overhead to the cost units passing through it via a predetermined rate.' },
      { term: 'Machine-hour rate', def: 'Overhead ÷ machine hours; used where work is machine-paced.' },
      { term: 'Under-absorption', def: 'Actual overhead exceeds the amount absorbed — costs under-recovered.' },
      { term: 'Over-absorption', def: 'Absorbed overhead exceeds the actual — costs over-recovered.' },
    ],
    formulas: [
      { name: '% of direct material', expr: 'Overheads ÷ Direct material cost × 100' },
      { name: '% of direct labour', expr: 'Overheads ÷ Direct labour cost × 100' },
      { name: '% of prime cost', expr: 'Overheads ÷ Prime cost × 100' },
      { name: 'Labour-hour rate', expr: 'Overheads ÷ Direct labour hours' },
      { name: 'Machine-hour rate', expr: 'Overheads ÷ Machine hours' },
      { name: 'Rate per unit', expr: 'Overheads ÷ Units produced' },
      { name: 'Under-/over-absorption', expr: 'Actual overhead − Absorbed overhead', note: 'Absorbed = predetermined rate × actual base. Positive = under-absorbed.' },
    ],
    procedure: {
      heading: 'Overhead distribution & absorption',
      steps: [
        { title: '1 · Primary distribution', detail: 'Allocate and apportion all overheads to production and service departments on equitable bases.' },
        { title: '2 · Secondary distribution', detail: 'Re-apportion service-department costs to production departments (step-ladder or, for mutual services, simultaneous-equation/repeated-distribution).' },
        { title: '3 · Compute the absorption rate', detail: 'For each production department, rate = department overhead ÷ chosen base (machine hours, labour hours, etc.). Pick the base that drives the overhead.' },
        { title: '4 · Absorb into cost units', detail: 'Overhead absorbed = rate × actual units of the base in the job/unit.' },
        { title: '5 · Under-/over-absorption', detail: 'Compare actual overhead with absorbed. Clear the difference to the costing P&L, or use a supplementary rate if large and due to normal causes.' },
      ],
    },
    examTips: [
      'Use a predetermined (budgeted ÷ budgeted) rate — that is exactly why under-/over-absorption arises.',
      'Match the base to the cost driver: a machine shop → machine-hour rate; an assembly line → labour-hour rate. The % methods ignore time and can mislead.',
      'Under-absorption due to abnormal idle capacity is written off to P&L; if due to normal fluctuations, a supplementary rate may be used to adjust cost.',
    ],
    pitfalls: [
      'Confusing allocation (whole item, one department) with apportionment (split on a basis).',
      'Forgetting to re-apportion service-department costs before striking the absorption rate.',
      'Treating over-absorption as profit — it is merely a recovery of cost that must be adjusted.',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 6 (Overhead Cost Control)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Overhead absorption rate — methods', url: 'https://www.accountingnotes.net/cost-accounting/overheads/absorption-of-overheads/16413', kind: 'article', source: 'Accounting Notes' },
      { label: 'Absorption costing & overheads', url: 'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f2/technical-articles/absorption-costing.html', kind: 'official', source: 'ACCA' },
    ],
    workedExample: {
      title: 'Absorption rates & under-absorption (Arora §6.4 / §6.6)',
      problem:
        'Budgeted production overheads ₹40,000; direct material ₹2,00,000; direct labour ₹1,00,000 (prime cost ₹3,00,000); direct labour hours 2,500; machine hours 2,000; units 1,000. Actual overhead incurred ₹42,000 against 2,000 actual machine hours. Find the absorption rates and the under-/over-absorption on a machine-hour basis.',
      steps: [
        { label: '% of direct material', formula: '₹40,000 ÷ ₹2,00,000 × 100', result: '20%' },
        { label: '% of direct labour', formula: '₹40,000 ÷ ₹1,00,000 × 100', result: '40%' },
        { label: 'Machine-hour rate', formula: '₹40,000 ÷ 2,000', result: '₹20 per hour' },
        { label: 'Overhead absorbed', formula: '₹20 × 2,000 actual hours', result: '₹40,000' },
        { label: 'Under-absorption', formula: '₹42,000 actual − ₹40,000 absorbed', result: '₹2,000 under-absorbed' },
      ],
      answer: 'Rates: 20% of material, 40% of labour, ₹20 machine-hour. Absorbed ₹40,000 vs actual ₹42,000 → ₹2,000 under-absorbed, charged to the costing P&L.',
      source: 'M.N. Arora, Cost Accounting, Unit 6 (§6.4 & §6.6)',
    },
    practice: [
      {
        q: 'Why does under-/over-absorption arise at all?',
        answer: 'Because overheads are absorbed on a predetermined rate (budgeted ÷ budgeted). Actual overhead and actual activity differ from budget, so the absorbed amount rarely equals the actual.',
      },
      {
        q: 'A machine shop with little direct labour should use which absorption base?',
        options: ['% of direct labour', 'Machine-hour rate', '% of direct material', 'Rate per unit'],
        answer: 'Machine-hour rate — overhead is driven by machine running time, not labour.',
      },
      {
        q: 'Absorbed overhead ₹50,000; actual ₹46,000. Under- or over-absorbed, and by how much?',
        answer: 'Over-absorbed by ₹4,000 (absorbed exceeds actual) — the excess is credited back / adjusted.',
      },
    ],
    applications: [
      'Manufacturers absorb factory overheads into product cost via machine-hour or labour-hour rates for pricing.',
      'Service firms apportion shared costs (rent, administration) across departments for cost control.',
      'Under/over-absorption analysis tells management whether the overhead recovery rates need revising.',
    ],
    advantages: [
      'Spreads indirect cost fairly onto products, so total cost and price reflect resource use.',
      'Predetermined rates allow prompt costing and quotations before the actual costs are known.',
      'Highlights idle capacity and recovery problems through under/over-absorption.',
    ],
    limitations: [
      'Absorption involves estimates and an arbitrary choice of base — different bases give different product costs.',
      'Predetermined rates cause under- or over-absorption that must later be adjusted.',
      'Treats fixed overhead as a product cost, which can mislead short-run decisions (marginal costing avoids this).',
    ],
    calc: 'overhead-absorption',
  },
  {
    id: 'job-batch-costing',
    gu: {
      title: 'જૉબ અને બૅચ પડતર',
      blurb:
        'એક વખતના કાર્યની પડતર જૉબ કૉસ્ટ કાર્ડ પર કાઢો અને પડતર-વત્તા-નફો ભાવ આપો; વારંવાર બનતા જથ્થા માટે આર્થિક બૅચ જથ્થો (EBQ) શોધો.',
      overview: [
        'જૉબ પડતર અને બૅચ પડતર એ ચોક્કસ-હુકમ પડતર (specific-order costing)નાં સ્વરૂપો છે, જે ઉત્પાદન સતત હોવાને બદલે ગ્રાહકના હુકમ પ્રમાણે થાય ત્યાં વપરાય છે. દરેક પડતર-વસ્તુ અલગથી ઓળખી શકાય તેવી હોય છે અને તેની પડતર સ્વતંત્ર રીતે એકઠી કરાય છે — પ્રક્રિયા પડતર (process costing)થી ઊલટું, જ્યાં એકસરખા એકમો સતત વહેતા રહે છે.',
        'જૉબ પડતરમાં દરેક કાર્ય (છાપકામનો હુકમ, સમારકામ, ઑર્ડર પ્રમાણેનું યંત્ર) તેનું પોતાનું જૉબ કૉસ્ટ કાર્ડ મેળવે છે: પ્રત્યક્ષ માલસામગ્રી, પ્રત્યક્ષ મજૂરી અને પ્રત્યક્ષ ખર્ચ સીધાં તેને ચઢાવાય છે; પરોક્ષ ખર્ચ (ઓવરહેડ) પૂર્વનિર્ધારિત દરથી શોષાય છે; અને નફાનો વધારો ઉમેરતાં ભાવપત્રક(quotation)નો ભાવ મળે છે.',
        'બૅચ પડતર એકસરખા એકમોના એક જથ્થાને એક જ કાર્ય ગણે છે, અને પછી એકમ-દીઠ પડતર કાઢવા તેને એકમોની સંખ્યાથી ભાગે છે. મુખ્ય પ્રશ્ન છે શ્રેષ્ઠ બૅચ-કદ: મોટા જથ્થા એકમ-દીઠ સેટ-અપ ખર્ચ ઘટાડે પણ વહન ખર્ચ વધારે. આર્થિક બૅચ જથ્થો (EBQ) — EOQનો બૅચ-સમકક્ષ — આ બંનેને સંતુલિત કરે છે.',
      ],
      keyTerms: [
        { term: 'જૉબ કૉસ્ટ કાર્ડ', def: 'એક ચોક્કસ કાર્યની બધી પડતર એકઠી કરતો દસ્તાવેજ — જૉબ પડતરનો અનન્ય નોંધપત્ર.' },
        { term: 'પડતર-વત્તા-નફો ભાવનિર્ધારણ (cost-plus)', def: 'વેચાણ ભાવ = કુલ પડતર + પડતર પર નક્કી કરેલો નફાનો વધારો.' },
        { term: 'જથ્થો (બૅચ)', def: 'સાથે બનાવેલા અને એક જ કાર્ય તરીકે પડતર કઢાયેલા એકસરખા એકમોનો સમૂહ.' },
        { term: 'સેટ-અપ ખર્ચ', def: 'ઉત્પાદન-દોડ માટે યંત્રો/સાધનો તૈયાર કરવાનો સ્થાયી ખર્ચ; બૅચ-દીઠ સ્થિર હોવાથી જથ્થો વધતાં એકમ-દીઠ ઘટે છે.' },
        { term: 'આર્થિક બૅચ જથ્થો (EBQ)', def: 'કુલ સેટ-અપ વત્તા વહન ખર્ચને લઘુતમ કરતું બૅચ-કદ.' },
      ],
      formulas: [
        { name: 'મુખ્ય પડતર (Prime cost)', expr: 'Direct material + Direct wages + Direct expenses' },
        { name: 'કારખાના પડતર (Works cost)', expr: 'Prime cost + Factory overhead absorbed' },
        { name: 'કુલ પડતર', expr: 'Works cost + Administration overhead' },
        { name: 'ભાવપત્રક ભાવ (Quotation price)', expr: 'Total cost + Profit mark-up' },
        { name: 'આર્થિક બૅચ જથ્થો (EBQ)', expr: 'EBQ = √(2 × U × S ÷ C)', note: 'U = વાર્ષિક એકમો, S = બૅચ-દીઠ સેટ-અપ ખર્ચ, C = વર્ષે એકમ-દીઠ વહન ખર્ચ.' },
        { name: 'વર્ષે ઉત્પાદન-દોડ', expr: 'Annual units ÷ EBQ' },
      ],
      procedure: {
        heading: 'જૉબ કાર્ડ અને બૅચ-કદ',
        steps: [
          { title: '1 · પ્રત્યક્ષ પડતર ચઢાવો', detail: 'પ્રત્યક્ષ માલસામગ્રી, પ્રત્યક્ષ મજૂરી અને પ્રત્યક્ષ ખર્ચ સીધાં કાર્ય/જથ્થાને નોંધો.' },
          { title: '2 · પરોક્ષ ખર્ચ શોષો', detail: 'કારખાના પરોક્ષ ખર્ચ (ઘણીવાર મજૂરીની % કે મજૂર/યંત્ર-કલાક દર) અને વહીવટી પરોક્ષ ખર્ચ (ઘણીવાર કારખાના પડતરની %) લાગુ કરો.' },
          { title: '3 · નફો ઉમેરો → ભાવ', detail: 'ભાવપત્રક માટે કુલ પડતર પર નફાનો વધારો ઉમેરો (પડતર-વત્તા-નફો).' },
          { title: '4 · બૅચ-કદ', detail: 'વારંવારના ઉત્પાદન માટે EBQ = √(2US/C) ગણો; દોડની સંખ્યા = વાર્ષિક એકમો ÷ EBQ.' },
        ],
      },
      examTips: [
        'EBQ એ EOQ જેવી જ તર્કરચના વાપરે છે — હુકમ ખર્ચને બદલે સેટ-અપ ખર્ચ આવે, વહન ખર્ચ એ જ રહે.',
        'નફો એ પડતરની % (mark-up) છે કે વેચાણ ભાવની % (margin) એ સ્પષ્ટ રાખો — બંને જુદો ભાવ આપે છે.',
        'બૅચ પડતરમાં હંમેશાં એકમ-દીઠ પડતર = કુલ બૅચ પડતર ÷ બૅચમાંના એકમો જણાવો.',
      ],
      pitfalls: [
        'ભાવ આપતી વખતે પડતર પરનો નફો અને વેચાણ પરનો નફો ભેળવી દેવા.',
        'સેટ-અપ ખર્ચ બૅચ-દીઠ (સ્થિર) છે એ ભૂલવું, જેથી જથ્થો વધતાં એકમ-દીઠ પડતર ઘટે છે.',
        'જૉબ કાર્ડમાં ખોટો પરોક્ષ-ખર્ચ આધાર વાપરવો (જ્યાં મજૂર-કલાક દર અપેક્ષિત હોય ત્યાં માલની % વાપરવી).',
      ],
      applications: [
        'છાપખાનાં, સમારકામની દુકાનો, ભઠ્ઠીઓ (foundries) અને ઑર્ડર પ્રમાણેની ઇજનેરી પેઢીઓ દરેક કાર્યની પડતર જૉબ કાર્ડ પર કાઢે છે.',
        'ઔષધ અને ઘટક બનાવનારાઓ આર્થિક ઉત્પાદન-દોડનું કદ નક્કી કરવા EBQ સાથે બૅચ પડતર વાપરે છે.',
        'ઑર્ડર પ્રમાણેના ઑર્ડરો પર ગ્રાહકોને પડતર-વત્તા-નફો ભાવપત્રક આપવાનો આધાર પૂરો પાડે છે.',
      ],
      advantages: [
        'દરેક કાર્ય કે જથ્થાની ચોક્કસ પડતર અને નફો આપે છે — મજબૂત પડતર-નિયમન અને સચોટ ભાવ.',
        'નફાકારક અને ખોટ કરતાં કાર્યો ઓળખે છે, જે ભવિષ્યના ભાવનિર્ધારણને માર્ગદર્શન આપે.',
        'EBQ વારંવારના જથ્થા માટે સેટ-અપ વત્તા વહન ખર્ચને લઘુતમ કરે છે.',
      ],
      limitations: [
        'ભારે કારકુની કામ — દરેક કાર્યને તેનો પોતાનો વિગતવાર નોંધપત્ર જોઈએ.',
        'પડતર ઐતિહાસિક છે; કાર્યક્ષમતા ચકાસવા સરખામણી માટે પ્રમાણ-પડતર જોઈએ.',
        'દરેક કાર્યમાં શોષાયેલો પરોક્ષ ખર્ચ હજુ અંદાજિત દરો પર આધાર રાખે છે.',
      ],
      workedExample: {
        title: 'આર્થિક બૅચ જથ્થો (Arora §12.2.1)',
        problem:
          'વાર્ષિક ઉત્પાદન 12,000 એકમ; બૅચ-દીઠ સેટ-અપ ખર્ચ ₹150; વર્ષે એકમ-દીઠ વહન ખર્ચ ₹0.20. આર્થિક બૅચ જથ્થો અને વર્ષે ઉત્પાદન-દોડની સંખ્યા શોધો.',
        steps: [
          { label: 'EBQ = √(2 × U × S ÷ C)', formula: '√(2 × 12,000 × 150 ÷ 0.20) = √1,80,00,000', result: '≈ 4,243 units' },
          { label: 'વર્ષે ઉત્પાદન-દોડ', formula: '12,000 ÷ 4,243', result: '≈ 2.83 runs' },
        ],
        answer: 'આર્થિક બૅચ જથ્થો ≈ 4,243 એકમ, જે વર્ષે આશરે 2.8 ઉત્પાદન-દોડ આપે છે.',
        source: 'M.N. Arora, Cost Accounting, §12.2.1 (Economic Batch Quantity)',
      },
      practice: [
        {
          q: 'EBQ એ EOQથી કેવી રીતે જુદો છે?',
          answer: 'બંને એક જ √(2 × માગ × ઘટના-દીઠ ખર્ચ ÷ વહન ખર્ચ) સૂત્ર વાપરે છે. EOQ ખરીદેલી માલસામગ્રી માટે હુકમ ખર્ચ વાપરે; EBQ બનાવેલા જથ્થા માટે સેટ-અપ ખર્ચ વાપરે.',
        },
        {
          q: 'એક કાર્યની મુખ્ય પડતર ₹4,500, કારખાના પરોક્ષ ખર્ચ ₹1,500, વહીવટી પરોક્ષ ખર્ચ ₹600 છે. નફો પડતર પર 25% છે. ભાવ શોધો.',
          answer: 'કુલ પડતર = 4,500 + 1,500 + 600 = ₹6,600; નફો = 25% × 6,600 = ₹1,650; ભાવ = ₹8,250.',
        },
        {
          q: 'જથ્થાનું કદ વધતાં એકમ-દીઠ પડતર કેમ ઘટે છે?',
          answer: 'સેટ-અપ ખર્ચ બૅચ-દીઠ સ્થિર છે, તેથી તેને વધુ એકમો પર ફેલાવતાં એકમ-દીઠ સેટ-અપ ખર્ચ ઘટે છે (જ્યાં સુધી વધતો વહન ખર્ચ તેને સરભર ન કરે — એટલે જ EBQ).',
        },
      ],
    },
    title: 'Job & Batch Costing',
    subject: 'Cost Accounting',
    icon: ClipboardList,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Cost a one-off job on a job cost card and quote a cost-plus price; for repeated lots, find the Economic Batch Quantity.',
    readingMinutes: 9,
    tags: ['job costing', 'batch costing', 'ebq', 'economic batch quantity', 'job cost sheet', 'quotation', 'specific order costing'],
    overview: [
      'Job costing and batch costing are forms of specific-order costing, used where production is to customer order rather than continuous. Each cost object is identifiable and its costs are accumulated separately — unlike process costing, where identical units flow continuously.',
      'In job costing, every job (a printing order, a repair, a custom machine) gets its own job cost card: direct material, direct wages and direct expenses are charged directly; overheads are absorbed using a predetermined rate; and a profit mark-up gives the quotation price.',
      'Batch costing treats a batch of identical units as one job, then divides by the number of units for a cost per unit. The key question is the optimum batch size: large batches cut set-up cost per unit but raise carrying cost. The Economic Batch Quantity (EBQ) — the batch twin of EOQ — balances the two.',
    ],
    keyTerms: [
      { term: 'Job cost card', def: 'The document that accumulates all costs of a specific job — the unique record of job costing.' },
      { term: 'Cost-plus pricing', def: 'Selling price = total cost + an agreed profit mark-up on cost.' },
      { term: 'Batch', def: 'A group of identical units produced together and costed as a single job.' },
      { term: 'Set-up cost', def: 'The fixed cost of preparing machines/tools for a production run; fixed per batch, so falls per unit as batch size rises.' },
      { term: 'Economic Batch Quantity', def: 'The batch size that minimises total set-up plus carrying cost.' },
    ],
    formulas: [
      { name: 'Prime cost', expr: 'Direct material + Direct wages + Direct expenses' },
      { name: 'Works cost', expr: 'Prime cost + Factory overhead absorbed' },
      { name: 'Total cost', expr: 'Works cost + Administration overhead' },
      { name: 'Quotation price', expr: 'Total cost + Profit mark-up' },
      { name: 'Economic Batch Quantity', expr: 'EBQ = √(2 × U × S ÷ C)', note: 'U = annual units, S = set-up cost per batch, C = carrying cost per unit p.a.' },
      { name: 'Production runs per year', expr: 'Annual units ÷ EBQ' },
    ],
    procedure: {
      heading: 'Job card & batch size',
      steps: [
        { title: '1 · Charge direct costs', detail: 'Post direct material, direct wages and direct expenses straight to the job/batch.' },
        { title: '2 · Absorb overheads', detail: 'Apply factory overhead (often a % of wages or a labour/machine-hour rate) and administration overhead (often a % of works cost).' },
        { title: '3 · Add profit → price', detail: 'For a quotation, add the profit mark-up on total cost (cost-plus).' },
        { title: '4 · Batch size', detail: 'For repeated production, compute EBQ = √(2US/C); the number of runs = annual units ÷ EBQ.' },
      ],
    },
    examTips: [
      'EBQ uses the same logic as EOQ — set-up cost replaces ordering cost, carrying cost stays the same.',
      'Be clear whether profit is a % of cost (mark-up) or a % of selling price (margin) — they give different prices.',
      'For batch costing, always state cost per unit = total batch cost ÷ units in the batch.',
    ],
    pitfalls: [
      'Mixing up profit on cost vs profit on sales when quoting.',
      'Forgetting that set-up cost is per batch (fixed), so cost per unit falls as the batch grows.',
      'Applying the wrong overhead base in the job card (using % of material where a labour-hour rate is intended).',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Units 8 & 12 (Job & Batch Costing)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Job costing — meaning & procedure', url: 'https://www.accountingnotes.net/cost-accounting/job-costing/job-costing/16210', kind: 'article', source: 'Accounting Notes' },
      { label: 'Economic batch quantity', url: 'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f2.html', kind: 'official', source: 'ACCA' },
    ],
    workedExample: {
      title: 'Economic Batch Quantity (Arora §12.2.1)',
      problem:
        'Annual production 12,000 units; set-up cost ₹150 per batch; carrying cost ₹0.20 per unit per annum. Find the economic batch quantity and the number of production runs per year.',
      steps: [
        { label: 'EBQ = √(2 × U × S ÷ C)', formula: '√(2 × 12,000 × 150 ÷ 0.20) = √1,80,00,000', result: '≈ 4,243 units' },
        { label: 'Production runs per year', formula: '12,000 ÷ 4,243', result: '≈ 2.83 runs' },
      ],
      answer: 'Economic batch quantity ≈ 4,243 units, giving about 2.8 production runs a year.',
      source: 'M.N. Arora, Cost Accounting, §12.2.1 (Economic Batch Quantity)',
    },
    practice: [
      {
        q: 'How does EBQ differ from EOQ?',
        answer: 'They share the same √(2 × demand × cost-per-event ÷ carrying-cost) formula. EOQ uses ordering cost for purchased material; EBQ uses set-up cost for produced batches.',
      },
      {
        q: 'A job has prime cost ₹4,500, factory overhead ₹1,500, admin overhead ₹600. Profit is 25% on cost. Find the price.',
        answer: 'Total cost = 4,500 + 1,500 + 600 = ₹6,600; profit = 25% × 6,600 = ₹1,650; price = ₹8,250.',
      },
      {
        q: 'Why does cost per unit fall as batch size increases?',
        answer: 'Set-up cost is fixed per batch, so spreading it over more units lowers set-up cost per unit (until rising carrying cost offsets it — hence EBQ).',
      },
    ],
    applications: [
      'Printing presses, repair shops, foundries and custom engineering firms cost each job on a job card.',
      'Pharmaceutical and component makers use batch costing with the EBQ to size economical production runs.',
      'Provides the basis for cost-plus quotations to customers on bespoke orders.',
    ],
    advantages: [
      'Gives the exact cost and profit of each job or batch — strong cost control and accurate quoting.',
      'Identifies profitable versus loss-making jobs to guide future pricing.',
      'The EBQ minimises set-up plus carrying cost for repeated batches.',
    ],
    limitations: [
      'Heavy clerical work — each job needs its own detailed record.',
      'Costs are historical; judging efficiency needs a standard to compare against.',
      'Overhead absorbed into each job still relies on estimated rates.',
    ],
    calc: 'job-batch-costing',
  },
  {
    id: 'contract-costing',
    gu: {
      title: 'કરાર પડતર',
      blurb:
        'લાંબા ગાળાના કરારોની પડતર કાઢો — કરાર ખાતું, પ્રમાણિત/અપ્રમાણિત કામ, કાલ્પનિક નફો, અને અધૂરા કરારના નફા અંગેના સાવચેતીના નિયમો.',
      overview: [
        'કરાર પડતર પદ્ધતિ સ્થળ પર થતા મોટા, લાંબા ગાળાના કામો માટે વપરાય છે — બાંધકામ, સ્થાપત્ય (civil) ઇજનેરી, વહાણ-બાંધણી. દરેક કરાર પોતાના કરાર ખાતા સાથેનો એક પડતર એકમ છે, જેને બધી પ્રત્યક્ષ પડતર (માલસામગ્રી, મજૂરી, યંત્રસામગ્રી, પ્રત્યક્ષ ખર્ચ) ઉધારવામાં આવે છે. મોટા ભાગની પડતર પ્રત્યક્ષ હોવાથી, તે ખરેખર મોટા પાયે કરાતું જૉબ પડતર (job costing) જ છે.',
        'જ્યારે કોઈ કરાર એક કરતાં વધુ વર્ષ ચાલે, ત્યારે પ્રશ્ન એ ઊભો થાય કે અધૂરા કામ પર કેટલો નફો ગણવો. પૂરો નફો કેવળ કરાર પૂરો થયે જ લેવાથી વર્ષ-દર-વર્ષનાં પરિણામો વિકૃત થાય; અધૂરા કામ પર વધુ પડતો નફો લેવાથી સાવચેતી (prudence) ના સિદ્ધાંતનો ભંગ થાય. તેથી દર વર્ષે એક કાલ્પનિક નફો કાઢવામાં આવે છે અને તેનો માત્ર સંયમિત (conservative) હિસ્સો જ નફા-નુકસાન ખાતે જમા કરાય છે.',
        'વર્ષાંતે બે મૂલ્યાંકન મહત્ત્વનાં છે: પ્રમાણિત કામ (કરારદાતાના સ્થપતિ દ્વારા મંજૂર, કરાર કિંમતે મૂલવાયેલું, તેથી તેમાં નફો સમાયેલો છે) અને અપ્રમાણિત કામ (હજુ મંજૂર ન થયેલું, કેવળ પડતરે મૂલવાયેલું). કરારદાતા સામાન્ય રીતે પ્રમાણિત કામનો રોકડ ગુણોત્તર (cash ratio) જેટલો ભાગ ચૂકવે છે અને બાકીનો ભાગ રોકી રાખેલ રકમ તરીકે રોકી રાખે છે.',
      ],
      keyTerms: [
        { term: 'પ્રમાણિત કામ', def: 'સ્થપતિ દ્વારા મંજૂર થયેલું ચાલુ કામ, કરાર કિંમતે મૂલવાયેલું (નફો સમાવિષ્ટ).' },
        { term: 'અપ્રમાણિત કામ', def: 'પૂરું થયેલું પણ હજુ મંજૂર ન થયેલું કામ, કેવળ પડતરે મૂલવાયેલું (નફો નહીં).' },
        { term: 'રોકી રાખેલ રકમ', def: 'કરારદાતા જામીનગીરી તરીકે પ્રમાણિત કામનો જે ભાગ રોકી રાખે છે તે; રોકડ ગુણોત્તર એ ચૂકવાયેલ ભાગ છે.' },
        { term: 'કાલ્પનિક નફો', def: 'કરાર ખાતાનો સરવાળાનો આંકડો = પ્રમાણિત કામનું મૂલ્ય + અપ્રમાણિત કામની પડતર − આજ સુધીની પડતર.' },
        { term: 'અંદાજિત નફો', def: 'કરાર કિંમત − અંદાજિત કુલ પડતર; કરાર પૂરો થવાની નજીક હોય ત્યારે વપરાય છે.' },
      ],
      formulas: [
        { name: 'કાલ્પનિક નફો', expr: '(Work certified + Work uncertified) − Cost of work to date' },
        { name: 'કામ પૂર્ણતાનો તબક્કો', expr: 'Work certified ÷ Contract price' },
        { name: 'રોકડ ગુણોત્તર', expr: 'Cash received ÷ Work certified' },
        { name: 'નફો (¼ ≤ તબક્કો < ½)', expr: '⅓ × Notional profit × Cash ratio' },
        { name: 'નફો (½ ≤ તબક્કો < 9⁄10)', expr: '⅔ × Notional profit × Cash ratio' },
      ],
      procedure: {
        heading: 'અધૂરા કરાર પરનો નફો',
        steps: [
          { title: '૧ · કરાર ખાતું તૈયાર કરો', detail: 'બધી પડતર (માલસામગ્રી, મજૂરી, યંત્રસામગ્રી, ખર્ચ, પરોક્ષ ખર્ચ) ઉધારો. સ્થળ પરની આખર માલસામગ્રી/યંત્રસામગ્રી, અપ્રમાણિત કામ અને પ્રમાણિત કામ જમા કરો.' },
          { title: '૨ · કાલ્પનિક નફો શોધો', detail: 'તે ખાતાનો સરવાળાનો આંકડો છે. જો પડતર જમા કરતાં વધી જાય, તો તે કાલ્પનિક ખોટ છે.' },
          { title: '૩ · તબક્કો આંકો', detail: 'તબક્કો = પ્રમાણિત કામ ÷ કરાર કિંમત. ¼ થી નીચે → કોઈ નફો ન લો.' },
          { title: '૪ · સાવચેતીનો નિયમ લાગુ કરો', detail: '¼–½ → ⅓ × કાલ્પનિક નફો × રોકડ ગુણોત્તર; ½–9⁄10 → ⅔ × કાલ્પનિક નફો × રોકડ ગુણોત્તર; પૂર્ણતાની નજીક → અંદાજિત નફો વાપરો.' },
          { title: '૫ · અનામત રાખો', detail: 'નફા-નુકસાન ખાતે ન લેવાયેલ ભાગ ભવિષ્યની આકસ્મિકતા સામે અનામત તરીકે રોકી રખાય છે; કાલ્પનિક ખોટ આખેઆખી નફા-નુકસાન ખાતે જાય છે.' },
        ],
      },
      examTips: [
        'પ્રમાણિત કામ નફો ધરાવે છે (કરાર કિંમતે મૂલવાયેલું); અપ્રમાણિત કામ પડતરે હોય છે. અપ્રમાણિત કામને ક્યારેય વેચાણ કિંમતે ન મૂલવો.',
        'બમણી સાવચેતી માટે રોકડ ગુણોત્તર (રોકડ મળી ÷ પ્રમાણિત કામ) વડે ગુણો — એ “વધુ પ્રચલિત રીત” છે.',
        'કાલ્પનિક ખોટ, કામ પૂર્ણતાના તબક્કાને ધ્યાનમાં લીધા વિના, આખેઆખી નફા-નુકસાન ખાતે તબદીલ થાય છે.',
      ],
      pitfalls: [
        'કરાર ખાતામાં મળેલી રોકડ નોંધવી — તે કરારદાતાના અંગત ખાતે જાય છે, કરાર ખાતે નહીં.',
        'સ્થળ પરની આખર યંત્રસામગ્રી/માલસામગ્રી જમા કરવાનું ભૂલવું, જે કાલ્પનિક નફો ઓછો બતાવે છે.',
        'કરાર અધૂરો હોવા છતાં આખો કાલ્પનિક નફો નફા-નુકસાન ખાતે લઈ જવો.',
      ],
      applications: [
        'બાંધકામ, સ્થાપત્ય-ઇજનેરી અને વહાણ-બાંધણી પેઢીઓ દરેક સ્થળ કે કરારની પડતર અલગ કાઢે છે.',
        'લાંબા, બહુ-વર્ષીય કરારો પર વર્ષ-દર-વર્ષ સાવચેત નફો ગણવા માટે વપરાય છે.',
        'બિલિંગ (પ્રમાણિત કામ) અને કરારદાતા સાથે રોકી રાખેલ રકમ અંગે વાટાઘાટ માટેનો આધાર બને છે.',
      ],
      advantages: [
        'દરેક કરાર સ્વતંત્ર પડતર એકમ છે, જે કરારદીઠ સ્પષ્ટ નફાકારકતા આપે છે.',
        'સાવચેતીના નિયમો અધૂરા કામ પરનો નફો વધારે પડતો બતાવાતો અટકાવે છે.',
        'કૉસ્ટ-પ્લસ અને ભાવવધારા (escalation) કલમો કરારદીઠ દેખરેખ રાખી શકાય છે.',
      ],
      limitations: [
        'કામ પૂર્ણતાની માત્રા અને કાલ્પનિક નફો અંદાજવામાં અંગત સૂઝ સંકળાયેલી છે.',
        'લાંબા કરારો પર પડતર વધારો (ફુગાવો, વિલંબ) અંદાજવો અઘરો છે.',
        'કરાર પૂરો ન થાય ત્યાં સુધી ગણાયેલ નફો કેવળ એક અંદાજ જ છે.',
      ],
      workedExample: {
        title: 'કાલ્પનિક નફો અને નફાની તબદીલી (Arora, Illustration 10.1)',
        problem:
          'કરાર કિંમત ₹10,00,000. આજ સુધી: માલસામગ્રી ₹50,000, મજૂરી ₹3,00,000, યંત્રસામગ્રી ₹20,000. ₹5,000ની માલસામગ્રીને નુકસાન થયું. યંત્રસામગ્રી પર 25% ઘસારો → સ્થળ પર ₹15,000. રોકડ મળી ₹3,60,000 = પ્રમાણિત કામના 90%; અપ્રમાણિત કામ પડતરે ₹10,000. કાલ્પનિક નફો અને નફા-નુકસાન ખાતે જમા કરવાનો નફો શોધો.',
        steps: [
          { label: 'પ્રમાણિત કામ = રોકડ ÷ રોકડ ગુણોત્તર', formula: '₹3,60,000 ÷ 90%', result: '₹4,00,000' },
          { label: 'ઉધાર (પડતર) = માલસામગ્રી + મજૂરી + યંત્રસામગ્રી', formula: '50,000 + 3,00,000 + 20,000', result: '₹3,70,000' },
          { label: 'જમા = નુકસાન પામેલ + સ્થળ પરની યંત્રસામગ્રી + પ્રમાણિત + અપ્રમાણિત', formula: '5,000 + 15,000 + 4,00,000 + 10,000', result: '₹4,30,000' },
          { label: 'કાલ્પનિક નફો = જમા − ઉધાર', formula: '₹4,30,000 − ₹3,70,000', result: '₹60,000' },
          { label: 'તબક્કો = 4,00,000 ÷ 10,00,000 = 40% → ⅓ નિયમ', formula: '⅓ × ₹60,000 × 90% cash ratio', result: '₹18,000' },
        ],
        answer: 'કાલ્પનિક નફો ₹60,000; તબક્કો 40% (¼–½ પટ્ટો) → ⅓ × 60,000 × 90% = ₹18,000 નફા-નુકસાન ખાતે જમા, ₹42,000 અનામત તરીકે રખાય.',
        source: 'M.N. Arora, Cost Accounting, Illustration 10.1',
      },
      practice: [
        {
          q: 'અધૂરા કરાર પર કાલ્પનિક નફાનો માત્ર એક ભાગ જ નફા-નુકસાન ખાતે કેમ લેવાય છે?',
          answer:
            'સાવચેતી — કરાર અધૂરો છે અને ભવિષ્યમાં ખોટ/આકસ્મિકતા આવી શકે, તેથી અનામત રોકી રખાય છે. કામ જેટલું આગળ વધે અને જેટલી વધુ રોકડ વસૂલાય, તેટલો મોટો હિસ્સો ગણાય છે.',
        },
        {
          q: 'કયા તબક્કે કોઈ નફો તબદીલ થતો નથી?',
          answer:
            'જ્યારે પ્રમાણિત કામ કરાર કિંમતના ¼ કરતાં ઓછું હોય — કરાર નફો ભરોસાપાત્ર રીતે ગણવા જેટલો આગળ વધ્યો નથી.',
        },
        {
          q: 'કાલ્પનિક ખોટ સાથે કેવો વ્યવહાર કરાય છે?',
          answer: 'કામ પૂર્ણતાના તબક્કાને ધ્યાનમાં લીધા વિના, તે આખેઆખી નફા-નુકસાન ખાતે તબદીલ થાય છે.',
        },
      ],
    },
    title: 'Contract Costing',
    subject: 'Cost Accounting',
    icon: HardHat,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Cost long-duration contracts — the contract account, work certified/uncertified, notional profit, and the prudence rules for profit on incomplete contracts.',
    readingMinutes: 11,
    tags: ['contract costing', 'notional profit', 'work certified', 'retention money', 'cash ratio', 'incomplete contract'],
    overview: [
      'Contract costing applies to large, long-duration jobs carried out at a site — construction, civil engineering, shipbuilding. Each contract is a cost unit with its own contract account, to which all direct costs (materials, labour, plant, direct expenses) are charged. Because most costs are direct, it is essentially job costing on a big scale.',
      'When a contract spans more than one year, the problem is how much profit to recognise on the unfinished work. Taking all the profit only on completion would distort year-to-year results; taking too much on incomplete work breaches prudence. So a notional profit is struck each year and only a conservative portion is credited to the P&L.',
      'Two valuations matter at the year-end: work certified (approved by the contractee’s architect, valued at contract price, so it includes profit) and work uncertified (not yet approved, valued at cost only). The contractee usually pays a cash ratio of the work certified and holds back the rest as retention money.',
    ],
    keyTerms: [
      { term: 'Work certified', def: 'Work-in-progress approved by the architect, valued at contract price (includes profit).' },
      { term: 'Work uncertified', def: 'Completed work not yet approved, valued at cost only (no profit).' },
      { term: 'Retention money', def: 'The part of work certified withheld by the contractee as security; cash ratio is the part paid.' },
      { term: 'Notional profit', def: 'The contract account’s balancing figure = value of work certified + cost of uncertified − cost to date.' },
      { term: 'Estimated profit', def: 'Contract price − estimated total cost; used when a contract is near completion.' },
    ],
    formulas: [
      { name: 'Notional profit', expr: '(Work certified + Work uncertified) − Cost of work to date' },
      { name: 'Stage of completion', expr: 'Work certified ÷ Contract price' },
      { name: 'Cash ratio', expr: 'Cash received ÷ Work certified' },
      { name: 'Profit (¼ ≤ stage < ½)', expr: '⅓ × Notional profit × Cash ratio' },
      { name: 'Profit (½ ≤ stage < 9⁄10)', expr: '⅔ × Notional profit × Cash ratio' },
    ],
    procedure: {
      heading: 'Profit on an incomplete contract',
      steps: [
        { title: '1 · Prepare the contract account', detail: 'Debit all costs (materials, labour, plant, expenses, overheads). Credit closing materials/plant at site, work uncertified, and work certified.' },
        { title: '2 · Find notional profit', detail: 'It is the balancing figure of the account. If costs exceed the credits, it is a notional loss.' },
        { title: '3 · Judge the stage', detail: 'Stage = work certified ÷ contract price. Below ¼ → take no profit.' },
        { title: '4 · Apply the prudence rule', detail: '¼–½ → ⅓ × notional profit × cash ratio; ½–9⁄10 → ⅔ × notional profit × cash ratio; near completion → use estimated profit.' },
        { title: '5 · Carry the reserve', detail: 'The portion not taken to P&L is held back as a reserve against future contingencies; a notional loss goes to P&L in full.' },
      ],
    },
    examTips: [
      'Work certified carries profit (valued at contract price); work uncertified is at cost. Never value uncertified work at selling price.',
      'Multiply by the cash ratio (cash received ÷ work certified) — the “more common practice” — to be doubly prudent.',
      'A notional loss is transferred to P&L in full, regardless of the stage of completion.',
    ],
    pitfalls: [
      'Entering cash received in the contract account — it goes to the contractee’s personal account, not the contract account.',
      'Forgetting to credit closing plant/material at site, which understates notional profit.',
      'Taking the whole notional profit to P&L while the contract is incomplete.',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 10 (Contract Costing)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Contract costing — profit on incomplete contracts', url: 'https://www.accountingnotes.net/cost-accounting/contract-costing/contract-costing/16260', kind: 'article', source: 'Accounting Notes' },
      { label: 'Profit on incomplete contracts', url: 'https://www.yourarticlelibrary.com/cost-accounting/contract-costing/profit-on-incomplete-contracts/55617', kind: 'article', source: 'Article Library' },
    ],
    workedExample: {
      title: 'Notional profit & profit transfer (Arora, Illustration 10.1)',
      problem:
        'Contract price ₹10,00,000. To date: materials ₹50,000, labour ₹3,00,000, plant ₹20,000. Materials costing ₹5,000 were damaged. Plant depreciated 25% → ₹15,000 at site. Cash received ₹3,60,000 = 90% of work certified; work uncertified at cost ₹10,000. Find the notional profit and the profit to credit to P&L.',
      steps: [
        { label: 'Work certified = cash ÷ cash ratio', formula: '₹3,60,000 ÷ 90%', result: '₹4,00,000' },
        { label: 'Debits (cost) = materials + labour + plant', formula: '50,000 + 3,00,000 + 20,000', result: '₹3,70,000' },
        { label: 'Credits = damaged + plant at site + certified + uncertified', formula: '5,000 + 15,000 + 4,00,000 + 10,000', result: '₹4,30,000' },
        { label: 'Notional profit = credits − debits', formula: '₹4,30,000 − ₹3,70,000', result: '₹60,000' },
        { label: 'Stage = 4,00,000 ÷ 10,00,000 = 40% → ⅓ rule', formula: '⅓ × ₹60,000 × 90% cash ratio', result: '₹18,000' },
      ],
      answer: 'Notional profit ₹60,000; stage 40% (¼–½ band) → ⅓ × 60,000 × 90% = ₹18,000 credited to P&L, ₹42,000 carried as reserve.',
      source: 'M.N. Arora, Cost Accounting, Illustration 10.1',
    },
    practice: [
      {
        q: 'Why is only part of the notional profit taken to P&L on an incomplete contract?',
        answer: 'Prudence — the contract is unfinished and future losses/contingencies may arise, so a reserve is held back. The further along and the more cash collected, the larger the share recognised.',
      },
      {
        q: 'At what stage is no profit transferred?',
        answer: 'When work certified is less than ¼ of the contract price — the contract has not advanced far enough to recognise profit reliably.',
      },
      {
        q: 'How is a notional loss treated?',
        answer: 'Transferred to the P&L account in full, regardless of the stage of completion.',
      },
    ],
    applications: [
      'Construction, civil-engineering and shipbuilding firms cost each site or contract separately.',
      'Used to recognise prudent profit on long, multi-year contracts, year by year.',
      'Forms the basis for billing (work certified) and for negotiating retention money with the contractee.',
    ],
    advantages: [
      'Each contract is a self-contained cost unit, giving clear profitability per contract.',
      'The prudence rules prevent overstating profit on incomplete work.',
      'Cost-plus and escalation clauses can be monitored contract by contract.',
    ],
    limitations: [
      'Estimating the degree of completion and the notional profit involves judgement.',
      'Cost overruns on long contracts (inflation, delays) are hard to predict.',
      'Profit recognised is only an estimate until the contract is complete.',
    ],
    calc: 'contract-costing',
  },
  {
    id: 'process-costing',
    gu: {
      title: 'પ્રક્રિયા પડતર',
      blurb:
        'સતત ચાલતા ઉત્પાદનની પ્રક્રિયા-દર-પ્રક્રિયા પડતર કાઢો — સામાન્ય ઘટ, અસામાન્ય ઘટ અને અસામાન્ય લાભ, અને સારા ઉત્પાદન પર આવતી એકમ-દીઠ પડતર.',
      overview: [
        'પ્રક્રિયા પડતર ત્યાં વપરાય છે જ્યાં ઉત્પાદન સતત ચાલે છે અને પેદાશ એકસરખી હોય છે — રસાયણ, ખાંડ, કાગળ, રંગ, તેલ-શુદ્ધિકરણ. માલસામગ્રી શ્રેણીબદ્ધ પ્રક્રિયાઓમાંથી પસાર થાય છે, અને એક પ્રક્રિયાની પેદાશ બીજી પ્રક્રિયાનો કાચો માલ બને છે. એકમો સરખા હોવાથી પડતરની સરેરાશ કાઢવામાં આવે છે: એકમ-દીઠ પડતર = કુલ પ્રક્રિયા પડતર ÷ ઉત્પાદિત એકમો.',
        'એક મુખ્ય લક્ષણ એ પ્રક્રિયા દરમિયાનની ઘટ છે. સામાન્ય ઘટ એટલે કાર્યક્ષમ સ્થિતિમાં અપેક્ષિત એવી અનિવાર્ય ઘટ (બાષ્પીભવન, સંકોચન); તેની પડતર સારા ઉત્પાદન પર આવે છે, અને કેવળ તેની ભંગાર કિંમત પ્રક્રિયા ખાતે જમા થાય છે. અસામાન્ય ઘટ એટલે સામાન્યથી વધારે ઘટ — બેદરકારી, યંત્ર બગડવું, ખામીયુક્ત માલને કારણે — અને તે સારા ઉત્પાદન પર નખાતી નથી; તે પડતર નફા-નુકસાન ખાતે જાય છે જેથી સારા ઉત્પાદનની પડતર સ્થિર રહે.',
        'ક્યારેક ખરી ઘટ અપેક્ષા કરતાં ઓછી હોય, જેથી ઉત્પાદન સામાન્ય ઉત્પાદન કરતાં વધી જાય — એ અસામાન્ય લાભ છે. તેને એ જ એકમ-દીઠ પડતરે મૂલવાય છે, પ્રક્રિયા ખાતે ઉધારાય છે અને અસામાન્ય લાભ ખાતે જમા કરાય છે. જ્યાં શરૂઆતનું/આખરનું ચાલુ-કામ (WIP) હોય, ત્યાં સમકક્ષ-એકમોની રીત અધૂરા એકમોને સરેરાશ કાઢતાં પહેલાં સમકક્ષ પૂરા એકમોમાં ફેરવે છે.',
      ],
      keyTerms: [
        { term: 'સામાન્ય ઘટ', def: 'કાર્યક્ષમ કામકાજમાં અપેક્ષિત અનિવાર્ય ઘટ; તેની પડતર સારા ઉત્પાદન દ્વારા શોષાય છે. ભંગાર કિંમત પ્રક્રિયા ખાતે જમા થાય છે.' },
        { term: 'અસામાન્ય ઘટ', def: 'સામાન્યથી વધારે થયેલી ઘટ, સામાન્ય એકમ-દીઠ પડતરે મૂલવાય અને પડતર નફા-નુકસાન ખાતે વાળવામાં આવે છે.' },
        { term: 'અસામાન્ય લાભ', def: 'જ્યારે ખરું ઉત્પાદન અપેક્ષિત (સામાન્ય) ઉત્પાદન કરતાં વધે; એકમ-દીઠ પડતરે મૂલવાય, પ્રક્રિયા ખાતે ઉધારાય અને અસામાન્ય લાભ ખાતે જમા થાય.' },
        { term: 'એકમ-દીઠ પડતર', def: '(કુલ પ્રક્રિયા પડતર − સામાન્ય ઘટની ભંગાર કિંમત) ÷ (કાચા માલના એકમો − સામાન્ય ઘટના એકમો).' },
        { term: 'સમકક્ષ એકમો', def: 'અધૂરા એકમોને પૂરા એકમોની સમકક્ષ સંખ્યા તરીકે દર્શાવવા — ચાલુ-કામ (WIP) હોય ત્યારે વપરાય છે.' },
      ],
      formulas: [
        { name: 'સામાન્ય ઘટના એકમો', expr: 'Input units × Normal loss %' },
        { name: 'એકમ-દીઠ પડતર', expr: '(Total cost − Scrap value of normal loss) ÷ (Input − Normal loss units)' },
        { name: 'અસામાન્ય ઘટ/લાભ (એકમો)', expr: 'Expected output − Actual output', note: 'ધન = અસામાન્ય ઘટ; ઋણ = અસામાન્ય લાભ.' },
        { name: 'અસામાન્ય ઘટ/લાભનું મૂલ્ય', expr: 'Cost per unit × Abnormal units' },
        { name: 'સારા ઉત્પાદનની પડતર', expr: 'Cost per unit × Actual good output' },
      ],
      procedure: {
        heading: 'ઘટ સહિતની પ્રક્રિયાની પડતર કાઢવી',
        steps: [
          { title: '1 · પ્રક્રિયાની કુલ પડતર કાઢો', detail: 'દાખલ કરેલા એકમોની પડતર + માલસામગ્રી + મજૂરી + પ્રક્રિયા પર નખાયેલા પરોક્ષ ખર્ચ ઉમેરો.' },
          { title: '2 · સામાન્ય ઘટ માટે જોગવાઈ', detail: 'સામાન્ય ઘટના એકમો = કાચા માલના એકમો × સામાન્ય-ઘટ %. પ્રક્રિયા ખાતે કેવળ તેની ભંગાર કિંમત જમા કરો.' },
          { title: '3 · એકમ-દીઠ પડતર', detail: '(કુલ પડતર − ભંગાર કિંમત) ÷ (કાચા માલના એકમો − સામાન્ય ઘટ). દરેક સારો એકમ આ દર વહન કરે છે.' },
          { title: '4 · અસામાન્ય ઘટ કે લાભ', detail: 'ખરા ઉત્પાદનને અપેક્ષિત ઉત્પાદન સાથે સરખાવો. તફાવતને એકમ-દીઠ પડતરે મૂલવો; તેને પડતર નફા-નુકસાન ખાતે લઈ જાઓ (અસામાન્ય ઘટ પ્રક્રિયામાંથી જમા થઈને બહાર, અસામાન્ય લાભ પ્રક્રિયામાં ઉધારાઈને અંદર).' },
          { title: '5 · સમકક્ષ એકમો (જો WIP હોય)', detail: 'જ્યાં ચાલુ-કામ હોય ત્યાં, સમકક્ષ-એકમ-દીઠ પડતર કાઢતાં પહેલાં તેને સમકક્ષ પૂરા એકમોમાં (માલસામગ્રી, મજૂરી, પરોક્ષ ખર્ચ માટે અલગ અલગ) ફેરવો.' },
        ],
      },
      examTips: [
        'સામાન્ય ઘટ કોઈ પડતર વહન કરતી નથી (કેવળ ભંગાર કિંમત) — એકમ-દીઠ પડતરના સૂત્ર દ્વારા તેની પડતર આપોઆપ સારા એકમો દ્વારા શોષાઈ જાય છે.',
        'એકમ-દીઠ પડતર હંમેશાં (કાચા માલના એકમો − સામાન્ય ઘટ) એકમો પર કાઢો, ક્યારેય આખા કાચા માલ પર નહીં — એ રીતે જ સામાન્ય ઘટની પડતર સારા ઉત્પાદનમાં ભળે છે.',
        'અસામાન્ય લાભ પ્રક્રિયા ખાતે ઉધારાય છે (દેખાય વિચિત્ર, પણ તે સારા ઉત્પાદનની પડતરને સામાન્ય સ્થિતિએ પાછી લાવે છે).',
      ],
      pitfalls: [
        'કુલ પડતરને આખા કાચા માલના એકમોએ ભાગવી (સામાન્ય ઘટ બાદ કરવાનું ભૂલવું) — એકમ-દીઠ પડતર ઓછી દેખાડે છે.',
        'અસામાન્ય ઘટ સારા ઉત્પાદન પર નાખવી — તે પડતર નફા-નુકસાન ખાતે જ જવી જોઈએ.',
        'એકમ-દીઠ પડતર કાઢતાં પહેલાં સામાન્ય ઘટની ભંગાર કિંમત બાદ કરવાનું ભૂલવું.',
      ],
      workedExample: {
        title: 'સામાન્ય અને અસામાન્ય ઘટ (Arora, Unit 9 — Process A)',
        problem:
          'Process A માં 10,000 એકમો ₹1 લેખે (₹10,000) દાખલ થાય છે. ઉમેરો: માલસામગ્રી ₹1,000, મજૂરી ₹5,000, ખર્ચ ₹1,050. સામાન્ય ઘટ કાચા માલના 3% છે અને એકમ-દીઠ ભંગાર કિંમત ₹0.25 છે. ખરું ઉત્પાદન 9,500 એકમો છે. એકમ-દીઠ પડતર અને અસામાન્ય ઘટ શોધો.',
        steps: [
          { label: 'કુલ પ્રક્રિયા પડતર', formula: '10,000 + 1,000 + 5,000 + 1,050', result: '₹17,050' },
          { label: 'સામાન્ય ઘટ = 3% × 10,000', formula: '300 units; scrap 300 × ₹0.25', result: '300 units · scrap ₹75' },
          { label: 'એકમ-દીઠ પડતર = (17,050 − 75) ÷ (10,000 − 300)', formula: '16,975 ÷ 9,700', result: '₹1.75 per unit' },
          { label: 'અસામાન્ય ઘટ = અપેક્ષિત − ખરું', formula: '(10,000 − 300) − 9,500 = 200 units × ₹1.75', result: '₹350' },
          { label: 'સારા ઉત્પાદનની પડતર', formula: '9,500 × ₹1.75', result: '₹16,625' },
        ],
        answer: 'એકમ-દીઠ પડતર ₹1.75; અસામાન્ય ઘટ 200 એકમો = ₹350; વાળેલું સારું ઉત્પાદન ₹16,625.',
        source: 'M.N. Arora, Cost Accounting, Unit 9 (Process A)',
      },
      practice: [
        {
          q: 'સામાન્ય ઘટની પડતર ક્યાંય અલગથી કેમ નખાતી નથી?',
          answer: 'કારણ કે તે સારા ઉત્પાદન દ્વારા શોષાઈ જાય છે: પડતરને (કાચા માલના એકમો − સામાન્ય ઘટ)એ ભાગવાથી એકમ-દીઠ પડતર વધે છે, જેથી સારા એકમો આપોઆપ સામાન્ય ઘટની પડતર ઉઠાવી લે છે.',
        },
        {
          q: 'ખરું ઉત્પાદન અપેક્ષિત (સામાન્ય) ઉત્પાદન કરતાં વધી જાય છે. આ શું છે, અને તેની માવજત કેવી રીતે થાય છે?',
          answer: 'એ અસામાન્ય લાભ છે — સામાન્ય એકમ-દીઠ પડતરે મૂલવાય, પ્રક્રિયા ખાતે ઉધારાય અને અસામાન્ય લાભ ખાતે જમા થાય (→ પડતર નફા-નુકસાન ખાતે).',
        },
        {
          q: 'કાચો માલ 1,000 એકમો, પડતર ₹9,500; સામાન્ય ઘટ 5% અને કોઈ ભંગાર કિંમત નહીં. એકમ-દીઠ પડતર શોધો.',
          answer: 'એકમ-દીઠ પડતર = 9,500 ÷ (1,000 − 50) = 9,500 ÷ 950 = ₹10.',
        },
      ],
      applications: [
        'સતત-પ્રક્રિયા ઉદ્યોગો — રસાયણ, ખાંડ, કાગળ, રંગ, તેલ, સિમેન્ટ, ખાદ્યપદાર્થ — પ્રક્રિયા-દર-પ્રક્રિયા પેદાશની પડતર કાઢે છે.',
        'સામાન્ય અને અસામાન્ય ઘટ મૂલવવા તથા પ્રક્રિયાઓ વચ્ચે હસ્તાંતર કિંમત નક્કી કરવા વપરાય છે.',
        'સમકક્ષ-એકમોની રીત ગાળાના અંતે અધૂરા ચાલુ-કામને મૂલવે છે.',
      ],
      advantages: [
        'જ્યાં પેદાશ એકસરખી અને સતત હોય ત્યાં સાદી સરેરાશ એકમ-દીઠ પડતર આપે છે.',
        'સામાન્ય-ઘટની માવજત આપોઆપ સારા ઉત્પાદન પર અનિવાર્ય ઘટનો ભાર નાખે છે.',
        'પ્રક્રિયા-વાર પડતર માહિતી નિયંત્રણ અને પ્રક્રિયાઓ વચ્ચેની સરખામણીમાં મદદ કરે છે.',
      ],
      limitations: [
        'એકમ-દીઠ પડતર સરેરાશ છે — તે વ્યક્તિગત એકમો વચ્ચેના પડતર-તફાવત છુપાવે છે.',
        'સમકક્ષ એકમો દ્વારા ચાલુ-કામ મૂલવવું પૂર્ણતાની માત્રાના અંદાજ પર આધાર રાખે છે.',
        'સંયુક્ત પેદાશ અને ગૌણ પેદાશની પડતર વહેંચવી થોડી મનસ્વી હોય છે.',
      ],
    },
    title: 'Process Costing',
    subject: 'Cost Accounting',
    icon: GitBranch,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Cost continuous production process by process — normal loss, abnormal loss and abnormal gain, and the cost per unit that good output carries.',
    readingMinutes: 11,
    tags: ['process costing', 'normal loss', 'abnormal loss', 'abnormal gain', 'process account', 'equivalent units', 'scrap'],
    overview: [
      'Process costing is used where production is continuous and the output is uniform — chemicals, sugar, paper, paint, oil refining. The material passes through a series of processes, and the output of one process becomes the input of the next. Because the units are identical, cost is averaged: cost per unit = total process cost ÷ units produced.',
      'A defining feature is loss in process. Normal loss is the unavoidable loss expected under efficient conditions (evaporation, shrinkage); its cost is borne by the good output, and only its scrap value is credited to the process. Abnormal loss is the excess over normal — due to carelessness, breakdown, defective material — and is NOT charged to good output; it goes to the costing P&L so the cost of good production stays stable.',
      'Sometimes the actual loss is less than expected, so output exceeds the normal output — an abnormal gain. It is valued at the same cost per unit, debited to the process account and credited to an Abnormal Gain account. Where there is opening/closing work-in-progress, the equivalent-units method converts part-finished units into equivalent whole units before averaging cost.',
    ],
    keyTerms: [
      { term: 'Normal loss', def: 'Unavoidable loss expected under efficient working; its cost is absorbed by good output. Scrap value is credited to the process.' },
      { term: 'Abnormal loss', def: 'Loss in excess of normal, valued at the normal cost per unit and transferred to the costing P&L.' },
      { term: 'Abnormal gain', def: 'When actual output exceeds expected (normal) output; valued at cost per unit, debited to the process, credited to Abnormal Gain A/c.' },
      { term: 'Cost per unit', def: '(Total process cost − scrap value of normal loss) ÷ (input units − normal loss units).' },
      { term: 'Equivalent units', def: 'Part-finished units expressed as an equivalent number of complete units, used when there is work-in-progress.' },
    ],
    formulas: [
      { name: 'Normal loss units', expr: 'Input units × Normal loss %' },
      { name: 'Cost per unit', expr: '(Total cost − Scrap value of normal loss) ÷ (Input − Normal loss units)' },
      { name: 'Abnormal loss/gain (units)', expr: 'Expected output − Actual output', note: 'Positive = abnormal loss; negative = abnormal gain.' },
      { name: 'Value of abnormal loss/gain', expr: 'Cost per unit × Abnormal units' },
      { name: 'Cost of good output', expr: 'Cost per unit × Actual good output' },
    ],
    procedure: {
      heading: 'Costing a process with loss',
      steps: [
        { title: '1 · Total the process cost', detail: 'Add cost of units introduced + materials + labour + overheads charged to the process.' },
        { title: '2 · Allow for normal loss', detail: 'Normal loss units = input × normal-loss %. Credit the process with its scrap value only.' },
        { title: '3 · Cost per unit', detail: '(Total cost − scrap value) ÷ (input − normal loss). This is the rate every good unit carries.' },
        { title: '4 · Abnormal loss or gain', detail: 'Compare actual output with expected output. Value the difference at the cost per unit; take it to the costing P&L (abnormal loss credited out of, abnormal gain debited into, the process).' },
        { title: '5 · Equivalent units (if WIP)', detail: 'Where work-in-progress exists, convert it to equivalent complete units (separately for material, labour, overheads) before computing cost per equivalent unit.' },
      ],
    },
    examTips: [
      'Normal loss carries NO cost (only scrap value) — its cost is automatically absorbed by good units through the cost-per-unit formula.',
      'Always compute cost per unit on (input − normal loss) units, never on full input — that is how the normal-loss cost transfers to good output.',
      'Abnormal gain is debited to the process account (it looks odd, but it restores the good-output cost to normal).',
    ],
    pitfalls: [
      'Dividing total cost by full input units (forgetting to remove normal loss) — understates cost per unit.',
      'Charging abnormal loss to good output — it must go to the costing P&L.',
      'Forgetting to deduct the scrap value of normal loss before computing the cost per unit.',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 9 (Process Costing)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Process costing — normal & abnormal loss', url: 'https://www.accountingnotes.net/cost-accounting/process-costing/process-costing/16236', kind: 'article', source: 'Accounting Notes' },
      { label: 'Process costing technical article', url: 'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f2/technical-articles/process-costing.html', kind: 'official', source: 'ACCA' },
    ],
    workedExample: {
      title: 'Normal & abnormal loss (Arora, Unit 9 — Process A)',
      problem:
        '10,000 units are introduced into Process A at ₹1 each (₹10,000). Added: materials ₹1,000, labour ₹5,000, expenses ₹1,050. Normal loss is 3% of input with a scrap value of ₹0.25 per unit. Actual output is 9,500 units. Find the cost per unit and the abnormal loss.',
      steps: [
        { label: 'Total process cost', formula: '10,000 + 1,000 + 5,000 + 1,050', result: '₹17,050' },
        { label: 'Normal loss = 3% × 10,000', formula: '300 units; scrap 300 × ₹0.25', result: '300 units · scrap ₹75' },
        { label: 'Cost per unit = (17,050 − 75) ÷ (10,000 − 300)', formula: '16,975 ÷ 9,700', result: '₹1.75 per unit' },
        { label: 'Abnormal loss = expected − actual', formula: '(10,000 − 300) − 9,500 = 200 units × ₹1.75', result: '₹350' },
        { label: 'Cost of good output', formula: '9,500 × ₹1.75', result: '₹16,625' },
      ],
      answer: 'Cost per unit ₹1.75; abnormal loss 200 units = ₹350; good output transferred ₹16,625.',
      source: 'M.N. Arora, Cost Accounting, Unit 9 (Process A)',
    },
    practice: [
      {
        q: 'Why is the cost of normal loss not separately charged anywhere?',
        answer: 'Because it is absorbed by good output: dividing cost by (input − normal loss) raises the cost per unit so the good units automatically bear the normal-loss cost.',
      },
      {
        q: 'Actual output exceeds the expected (normal) output. What is this, and how is it treated?',
        answer: 'An abnormal gain — valued at the normal cost per unit, debited to the process account and credited to the Abnormal Gain account (→ costing P&L).',
      },
      {
        q: 'Input 1,000 units, cost ₹9,500; normal loss 5% with no scrap value. Find the cost per unit.',
        answer: 'Cost per unit = 9,500 ÷ (1,000 − 50) = 9,500 ÷ 950 = ₹10.',
      },
    ],
    applications: [
      'Continuous-process industries — chemicals, sugar, paper, paint, oil, cement, food — cost output process by process.',
      'Used to value normal and abnormal loss and to set transfer prices between processes.',
      'The equivalent-units method values partly-finished work-in-progress at the period-end.',
    ],
    advantages: [
      'Simple averaging gives a cost per unit where output is uniform and continuous.',
      'Normal-loss treatment automatically loads good output with the unavoidable loss.',
      'Process-wise cost data aids control and inter-process comparison.',
    ],
    limitations: [
      'Cost per unit is an average — it hides cost differences between individual units.',
      'Valuing WIP through equivalent units relies on estimates of the degree of completion.',
      'Apportioning joint- and by-product costs is somewhat arbitrary.',
    ],
    calc: 'process-costing',
  },
  {
    id: 'operating-costing',
    gu: {
      title: 'સંચાલન / સેવા પડતર',
      blurb:
        'ઉત્પાદનને બદલે સેવાઓની પડતર કાઢો — પરિવહન અને બીજાં સેવા-એકમો વાપરે છે તે કિમી દીઠ પડતર અને સંયુક્ત ટન-કિમી / પૅસેન્જર-કિમી.',
      overview: [
        'સંચાલન (કે સેવા) પડતર એ ઉત્પાદન બનાવવાને બદલે સેવા આપતાં એકમો વાપરે છે — પરિવહન, હૉસ્પિટલ, હોટેલ, ભોજનાલય, વીજઘર, સિનેમા. હેતુ છે સેવાના એકમ દીઠ પડતર, જેનો ઉપયોગ પછી ભાડાં, શુલ્ક કે ભાડે-આપવાના દર નક્કી કરવા થાય છે.',
        'પડતર એકમ પસંદ કરવો એ જ આખી વાતનું હાર્દ છે. કેટલીક સેવાઓને એક સાદો એકમ (કિમી દીઠ, 1,000 લિટર દીઠ, ભોજન દીઠ) બંધબેસે છે; પણ પરિવહનને સામાન્ય રીતે એક સંયુક્ત એકમની જરૂર પડે છે જે બે પરિબળોને એકમાં ભેળવે — માલ માટે ટન-કિમી (1 ટન માલ 1 કિમી લઈ જવો), કે મુસાફરો માટે પૅસેન્જર-કિમી. આ દર્શાવે છે કે ભાર અને અંતર — બંને પડતરને ચલાવે છે.',
        'પડતરને આ રીતે વર્ગીકૃત કરાય છે: સ્થાયી (નિશ્ચિત) ખર્ચ — વીમો, વેરો, ગૅરેજ, પગાર — જે અંતર સાથે બદલાતા નથી; ચાલુ (ચલિત) ખર્ચ — બળતણ, તેલ, ટાયર — જે ચાલેલા કિમી સાથે બદલાય છે; અને જાળવણી, જે અર્ધ-ચલિત છે. કુલ પડતરને સેવા-એકમોની સંખ્યાથી ભાગવાથી એકમ દીઠ પડતર મળે છે.',
      ],
      keyTerms: [
        { term: 'સંચાલન પડતર', def: 'સેવા આપતાં એકમો માટેની પડતર પદ્ધતિ, જે સેવાના એકમ દીઠ પડતર શોધે છે.' },
        { term: 'સાદો પડતર એકમ', def: 'એક-પરિબળ એકમ — કિમી દીઠ, 1,000 લિટર દીઠ, પથારી-દિવસ દીઠ.' },
        { term: 'સંયુક્ત પડતર એકમ', def: 'બે-પરિબળ એકમ — ટન-કિમી (માલ) કે પૅસેન્જર-કિમી (મુસાફરો).' },
        { term: 'સ્થાયી ખર્ચ', def: 'અંતર ગમે તે હોય તોપણ થતા નિશ્ચિત ખર્ચ (વેરો, વીમો, ગૅરેજ, પગાર).' },
        { term: 'ચાલુ ખર્ચ', def: 'અંતર સાથે બદલાતા ચલિત ખર્ચ (બળતણ, તેલ, ટાયર).' },
      ],
      formulas: [
        { name: 'કુલ સંચાલન પડતર', expr: 'Standing charges + Running charges + Maintenance' },
        { name: 'કિમી દીઠ પડતર', expr: 'Total operating cost ÷ Distance run (km)' },
        { name: 'સંયુક્ત એકમો', expr: 'Distance (km) × Average load (tonnes or passengers)' },
        { name: 'ટન-કિમી / પૅસેન્જર-કિમી દીઠ પડતર', expr: 'Total operating cost ÷ Composite units' },
        { name: 'વસૂલવાનો દર', expr: 'Cost per unit × (1 + Profit %)' },
      ],
      procedure: {
        heading: 'સંચાલન પડતરપત્રક બનાવવું',
        steps: [
          { title: '૧ · પડતરનું વર્ગીકરણ કરો', detail: 'સ્થાયી (નિશ્ચિત), ચાલુ (ચલિત) અને જાળવણી (અર્ધ-ચલિત) ખર્ચમાં વહેંચો.' },
          { title: '૨ · પડતરનો સરવાળો કરો', detail: 'ગાળાની કુલ સંચાલન પડતર માટે ત્રણેય જૂથ ઉમેરો.' },
          { title: '૩ · સેવા-એકમો ગણો', detail: 'કિમી દીઠ પડતર અંતર વાપરે છે; સંયુક્ત એકમ અંતર × સરેરાશ ભાર (ટન-કિમી કે પૅસેન્જર-કિમી) વાપરે છે.' },
          { title: '૪ · એકમ દીઠ પડતર અને દર', detail: 'કુલ પડતરને સેવા-એકમોથી ભાગો; ભાડું કે માલભાડું નક્કી કરવા નફાનું માર્જિન ઉમેરો.' },
        ],
      },
      examTips: [
        'સંયુક્ત એકમ માટે અંતરને સરેરાશ ભારથી ગુણો — ટન-કિમી એટલે 1 ટન 1 કિમી ખસેડ્યો.',
        'ચોખ્ખું (absolute) ટન-કિમી દરેક તબક્કાનો અલગ સરવાળો કરે (અંતર × તે તબક્કાનો ભાર); વાણિજ્યિક (commercial) ટન-કિમી કુલ અંતર × સરેરાશ ભાર વાપરે છે.',
        'સ્થાયી અને ચાલુ ખર્ચ અલગ રાખો — પોતાનું વાહન વિરુદ્ધ ભાડે-લીધેલ પરિવહનની પડતર સરખાવવાનો એ આધાર છે.',
      ],
      pitfalls: [
        'જ્યારે પ્રશ્ન ટન-કિમી દીઠ પડતર પૂછે ત્યારે કેવળ અંતરથી ભાગવું (તમારે ભાર સામેલ કરવો જ પડે).',
        'બળતણને સ્થાયી ખર્ચ કે વીમાને ચાલુ ખર્ચ ગણવો.',
        'સરેરાશ ભાર ગણતી વખતે પાછા-ફરતી ખાલી મુસાફરી અવગણવી.',
      ],
      workedExample: {
        title: 'ટન-કિમી દીઠ પડતર',
        problem:
          'એક ટ્રકના માસિક ખર્ચ છે: સ્થાયી ખર્ચ ₹9,000, ચાલુ ખર્ચ ₹8,000, જાળવણી ₹3,000. તે મહિનામાં સરેરાશ 5 ટન ભાર સાથે 10,000 કિમી ચાલે છે. કુલ સંચાલન પડતર, કિમી દીઠ પડતર અને ટન-કિમી દીઠ પડતર શોધો.',
        steps: [
          { label: 'કુલ સંચાલન પડતર', formula: '₹9,000 + ₹8,000 + ₹3,000', result: '₹20,000' },
          { label: 'કિમી દીઠ પડતર', formula: '₹20,000 ÷ 10,000 km', result: '₹2.00 per km' },
          { label: 'ટન-કિમી = અંતર × સરેરાશ ભાર', formula: '10,000 × 5', result: '50,000 tonne-km' },
          { label: 'ટન-કિમી દીઠ પડતર', formula: '₹20,000 ÷ 50,000', result: '₹0.40 per tonne-km' },
        ],
        answer: 'કુલ સંચાલન પડતર ₹20,000; પડતર ₹2.00 પ્રતિ કિમી અને ₹0.40 પ્રતિ ટન-કિમી.',
      },
      practice: [
        {
          q: 'માલ-પરિવહનનો ધંધો કિમીને બદલે ટન-કિમીને પોતાનો પડતર એકમ કેમ વાપરે છે?',
          answer: 'કારણ કે પડતર વહન કરેલ ભાર અને અંતર — બંને પર આધાર રાખે છે. ટન-કિમી (1 ટન × 1 કિમી) બંનેને પકડે છે, તેથી પડતરની સરખામણી અને ભાવ-નિર્ધારણ વધુ ન્યાયી બને છે.',
        },
        {
          q: 'એક બસ સરેરાશ 40 મુસાફરો સાથે 4,000 કિમી ચાલે છે. પૅસેન્જર-કિમી કેટલા?',
          answer: '4,000 × 40 = 1,60,000 પૅસેન્જર-કિમી.',
        },
        {
          q: 'ટાયર સ્થાયી ખર્ચ છે કે ચાલુ ખર્ચ?',
          answer: 'ચાલુ (ચલિત) ખર્ચ — ટાયરનો ઘસારો ચાલેલા અંતર પર આધાર રાખે છે.',
        },
      ],
      applications: [
        'પરિવહન કાફલા, હૉસ્પિટલ, હોટેલ, ભોજનાલય, વીજઘર અને સિનેમા પોતાની સેવાની એકમ દીઠ પડતર કાઢે છે.',
        'સંયુક્ત એકમો (ટન-કિમી, પૅસેન્જર-કિમી, પથારી-દિવસ) ભાડાં, માલભાડું અને શુલ્ક નક્કી કરવા વપરાય છે.',
        'પોતાની સેવા ચલાવવાની પડતર બહારથી કરાવવા કે ભાડે લેવા સામે સરખાવવામાં મદદ કરે છે.',
      ],
      advantages: [
        'ભાડાં, શુલ્ક અને ભાડે-આપવાના દર નક્કી કરવા સેવાના એકમ દીઠ પડતર પૂરી પાડે છે.',
        'નિયમન અને ખરીદો-કે-બનાવો નિર્ણયો માટે સ્થાયી (નિશ્ચિત) અને ચાલુ (ચલિત) ખર્ચ અલગ પાડે છે.',
        'જ્યાં બે પરિબળો (ભાર × અંતર) પડતરને ચલાવે ત્યાં સંયુક્ત એકમો પડતરની સરખામણી ન્યાયી બનાવે છે.',
      ],
      limitations: [
        'યોગ્ય પડતર એકમ (સાદો કે સંયુક્ત) પસંદ કરવા સૂઝની જરૂર પડે છે.',
        'ઘણા ખર્ચ સ્થાયી/ગાળા-ખર્ચ હોય છે, તેથી પ્રવૃત્તિના સ્તર સાથે એકમ દીઠ પડતર વધઘટ થાય છે.',
        'સહિયારી સેવા-પડતરની વહેંચણી મનસ્વી બની શકે છે.',
      ],
    },
    title: 'Operating / Service Costing',
    subject: 'Cost Accounting',
    icon: Bus,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Cost services rather than products — the cost per km and the composite tonne-km / passenger-km used by transport and other service undertakings.',
    readingMinutes: 9,
    tags: ['operating costing', 'service costing', 'transport costing', 'cost per km', 'tonne-km', 'passenger-km', 'composite unit'],
    overview: [
      'Operating (or service) costing is used by undertakings that provide a service rather than make a product — transport, hospitals, hotels, canteens, power houses, cinemas. The aim is the cost per unit of service, which is then used to fix fares, charges or hire rates.',
      'Choosing the cost unit is the crux. A simple unit (per km, per 1,000 litres, per meal) suits some services; but transport usually needs a composite unit that rolls two factors into one — a tonne-km (1 tonne carried 1 km) for goods, or a passenger-km for passengers. This reflects that both the load and the distance drive cost.',
      'Costs are grouped as standing (fixed) charges — insurance, tax, garage, salaries — which do not vary with distance; running (variable) charges — fuel, oil, tyres — which vary with km run; and maintenance, which is semi-variable. Dividing total cost by the number of service units gives the cost per unit.',
    ],
    keyTerms: [
      { term: 'Operating costing', def: 'Costing method for undertakings rendering services, to find the cost per unit of service.' },
      { term: 'Simple cost unit', def: 'A single-factor unit — per km, per 1,000 litres, per bed-day.' },
      { term: 'Composite cost unit', def: 'A two-factor unit — tonne-km (goods) or passenger-km (passengers).' },
      { term: 'Standing charges', def: 'Fixed costs incurred regardless of distance run (tax, insurance, garage, salaries).' },
      { term: 'Running charges', def: 'Variable costs that change with distance (fuel, oil, tyres).' },
    ],
    formulas: [
      { name: 'Total operating cost', expr: 'Standing charges + Running charges + Maintenance' },
      { name: 'Cost per km', expr: 'Total operating cost ÷ Distance run (km)' },
      { name: 'Composite units', expr: 'Distance (km) × Average load (tonnes or passengers)' },
      { name: 'Cost per tonne-km / passenger-km', expr: 'Total operating cost ÷ Composite units' },
      { name: 'Rate to charge', expr: 'Cost per unit × (1 + Profit %)' },
    ],
    procedure: {
      heading: 'Building the operating cost sheet',
      steps: [
        { title: '1 · Classify the costs', detail: 'Group into standing (fixed), running (variable) and maintenance (semi-variable) charges.' },
        { title: '2 · Total the cost', detail: 'Add all three groups for the period’s total operating cost.' },
        { title: '3 · Count service units', detail: 'Cost per km uses distance; the composite unit uses distance × average load (tonne-km or passenger-km).' },
        { title: '4 · Cost per unit & rate', detail: 'Divide total cost by service units; add the profit margin to fix the fare or freight rate.' },
      ],
    },
    examTips: [
      'For a composite unit, multiply distance by the average load — a tonne-km is 1 tonne moved 1 km.',
      'Absolute tonne-km totals each leg separately (distance × load on that leg); commercial tonne-km uses total distance × average load.',
      'Keep standing and running charges separate — it is the basis for comparing own-vehicle vs hired-transport cost.',
    ],
    pitfalls: [
      'Dividing by distance alone when the question asks for cost per tonne-km (you must include the load).',
      'Treating fuel as a standing charge or insurance as a running charge.',
      'Ignoring return-trip empty running when computing average load.',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 11 (Operating Costing)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Operating costing — transport (illustrated)', url: 'https://www.accountingnotes.net/cost-accounting/operating-costing/operating-costing/16320', kind: 'article', source: 'Accounting Notes' },
      { label: 'Service costing technical article', url: 'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f2.html', kind: 'official', source: 'ACCA' },
    ],
    workedExample: {
      title: 'Cost per tonne-km',
      problem:
        'A truck’s monthly costs are: standing charges ₹9,000, running charges ₹8,000, maintenance ₹3,000. It runs 10,000 km in the month carrying an average load of 5 tonnes. Find the total operating cost, the cost per km, and the cost per tonne-km.',
      steps: [
        { label: 'Total operating cost', formula: '₹9,000 + ₹8,000 + ₹3,000', result: '₹20,000' },
        { label: 'Cost per km', formula: '₹20,000 ÷ 10,000 km', result: '₹2.00 per km' },
        { label: 'Tonne-km = distance × average load', formula: '10,000 × 5', result: '50,000 tonne-km' },
        { label: 'Cost per tonne-km', formula: '₹20,000 ÷ 50,000', result: '₹0.40 per tonne-km' },
      ],
      answer: 'Total operating cost ₹20,000; cost ₹2.00 per km and ₹0.40 per tonne-km.',
    },
    practice: [
      {
        q: 'Why does a goods-transport business use tonne-km rather than km as its cost unit?',
        answer: 'Because cost depends on both the load carried and the distance. A tonne-km (1 tonne × 1 km) captures both, so cost comparison and pricing are fairer.',
      },
      {
        q: 'A bus runs 4,000 km carrying on average 40 passengers. What are the passenger-kms?',
        answer: '4,000 × 40 = 1,60,000 passenger-km.',
      },
      {
        q: 'Are tyres a standing charge or a running charge?',
        answer: 'A running (variable) charge — tyre wear depends on distance run.',
      },
    ],
    applications: [
      'Transport fleets, hospitals, hotels, canteens, power houses and cinemas cost their service per unit.',
      'Composite units (tonne-km, passenger-km, bed-day) are used to set fares, freight and charges.',
      'Helps compare the cost of running an own service against outsourcing or hiring.',
    ],
    advantages: [
      'Provides a cost per unit of service for pricing fares, charges and hire rates.',
      'Separates standing (fixed) and running (variable) charges for control and make-or-buy decisions.',
      'Composite units make cost comparison fair where two factors (load × distance) drive the cost.',
    ],
    limitations: [
      'Choosing the right cost unit (simple vs composite) needs judgement.',
      'Many costs are fixed/period costs, so the cost per unit swings with the level of activity.',
      'Apportioning shared service costs can be arbitrary.',
    ],
    calc: 'operating-costing',
  },
  {
    id: 'standard-costing',
    gu: {
      title: 'પ્રમાણ-પડતર અને વિચલન',
      // REVIEW: Dr. Desai confirmed (Jun 2026): variance = વિચલન → Price variance = ભાવ વિચલન, Rate variance = દર વિચલન (Material=માલસામગ્રી, Labour=મજૂરી, Overhead=ઓવરહેડ are standard).
      // REVIEW: still unverified vs B.S. Shah Sem-4 / VNSGU lecturer — Usage/Quantity = વપરાશ/જથ્થા, Efficiency = કાર્યક્ષમતા, Volume = જથ્થા/કદ, Capacity = ક્ષમતા, Calendar = કેલેન્ડર.
      blurb:
        'પ્રમાણ-પડતર નક્કી કરો, પછી વાસ્તવિક પડતર સાથેનો તફાવત સમજાવો — material, labour અને overhead variance ભાવ/દર (price/rate), વપરાશ/કાર્યક્ષમતા (usage/efficiency) અને સ્થાયી-ઓવરહેડના volume/capacity/calendar વિશ્લેષણમાં વહેંચાય છે.',
      overview: [
        'પ્રમાણ-પડતર પદ્ધતિ દરેક એકમ માટે અગાઉથી નક્કી કરેલી પડતર — પ્રમાણ-પડતર — ઠરાવે છે, જે પ્રમાણભૂત જથ્થા અને પ્રમાણભૂત ભાવમાંથી બંધાય છે. ત્યારબાદ વાસ્તવિક પરિણામોને આ પ્રમાણ સાથે સરખાવવામાં આવે છે, અને તફાવતો (variances / વિચલન)નું કારણ પ્રમાણે વિશ્લેષણ થાય છે. આ નિયંત્રણનું સાધન છે: કામગીરી ક્યાં અને કેટલા પ્રમાણમાં યોજનાથી ભટકી તે તે ચોક્કસપણે દર્શાવે છે.',
        'જ્યારે વિચલન પડતર બચાવે — વાસ્તવિક પ્રમાણ કરતાં ઓછું હોય — ત્યારે તે અનુકૂળ (F) અને જ્યારે વધારે ખર્ચ થાય ત્યારે પ્રતિકૂળ (A) ગણાય. કોઈ એક ઘટકનું કુલ Cost variance (પડતર વિચલન) ભાવ/દર વિચલન — Price/Rate variance — (જુદો ભાવ ચૂકવવાની અસર) અને વપરાશ/કાર્યક્ષમતા વિચલન — Usage/Efficiency variance — (જુદો જથ્થો કે સમય વાપરવાની અસર)માં વહેંચાય છે. આ બે ઉપ-વિચલનો હંમેશાં મળીને કુલ સાથે મેળ ખાય છે.',
        'એ જ તર્ક માલસામગ્રી અને મજૂરી બંનેને લાગુ પડે છે. માલસામગ્રી માટે: Price variance (ભાવ વિચલન) ચૂકવેલા ભાવને અલગ તારવે છે, Usage variance (વપરાશ વિચલન) વપરાયેલા જથ્થાને. મજૂરી માટે: Rate variance (દર વિચલન) મજૂરી-દરને અલગ તારવે છે, Efficiency variance (કાર્યક્ષમતા વિચલન) કામ કરેલા કલાકોને. જવાબદારી સામાન્ય રીતે જુદી હોય છે — ભાવ ખરીદ-વિભાગની, વપરાશ અને કાર્યક્ષમતા ઉત્પાદન-વિભાગની.',
        'ઓવરહેડનું વિશ્લેષણ બે પ્રવાહમાં થાય છે. ચલિત ઓવરહેડ Expenditure variance (ખર્ચ વિચલન — કામ કરેલા કલાકો માટે પ્રમાણ કરતાં વધુ કે ઓછું ખર્ચવું) અને Efficiency variance (કાર્યક્ષમતા વિચલન — મંજૂર કરતાં વધુ કે ઓછા કલાક લેવા)માં વહેંચાય છે. સ્થાયી ઓવરહેડ Expenditure (budget) variance (ખર્ચ/અંદાજપત્ર વિચલન) અને Volume variance (જથ્થા/કદ વિચલન)માં વહેંચાય છે — અંદાજિત ઉત્પાદન કરતાં વધુ કે ઓછું ઉત્પાદન કરવાથી થતું વધુ-/ઓછું-આવરણ — અને Volume variance પોતે Capacity (ક્ષમતા), Efficiency (કાર્યક્ષમતા) અને, જ્યાં કામકાજના દિવસોની સંખ્યા જુદી હોય ત્યાં, Calendar variance (કેલેન્ડર વિચલન)માં વધુ વહેંચાય છે.',
      ],
      keyTerms: [
        { term: 'પ્રમાણ-પડતર (Standard cost)', def: 'અગાઉથી નક્કી કરેલી પડતર = પ્રમાણભૂત જથ્થો × પ્રમાણભૂત ભાવ (ઉત્પાદનના એકમ દીઠ).' },
        { term: 'વિચલન (Variance)', def: 'પ્રમાણ-પડતર (વાસ્તવિક ઉત્પાદનની) અને વાસ્તવિક પડતર વચ્ચેનો તફાવત. F = અનુકૂળ, A = પ્રતિકૂળ.' },
        { term: 'Material price variance (માલસામગ્રી ભાવ વિચલન)', def: '(SP − AP) × AQ — જુદો ભાવ ચૂકવવાની અસર.' },
        { term: 'Material usage variance (માલસામગ્રી વપરાશ વિચલન)', def: '(SQ − AQ) × SP — જુદો જથ્થો વાપરવાની અસર.' },
        { term: 'Labour rate variance (મજૂરી દર વિચલન)', def: '(SR − AR) × AH — જુદા મજૂરી-દરની અસર.' },
        { term: 'Labour efficiency variance (મજૂરી કાર્યક્ષમતા વિચલન)', def: '(SH − AH) × SR — જુદા કલાક લેવાની અસર.' },
        { term: 'Overhead cost variance (ઓવરહેડ પડતર વિચલન)', def: 'આવરેલ (વસૂલ કરેલ) ઓવરહેડ − વાસ્તવિક ઓવરહેડ. ચલિત OH (ખર્ચ + કાર્યક્ષમતા) અને સ્થાયી OH (ખર્ચ + જથ્થા/કદ) વિચલનોમાં વહેંચાય છે.' },
        { term: 'Fixed OH volume variance (સ્થાયી OH જથ્થા/કદ વિચલન)', def: 'આવરેલ સ્થાયી OH − અંદાજિત સ્થાયી OH — અંદાજપત્રથી વધુ કે ઓછું ઉત્પાદન કરવાથી સ્થાયી પડતરનું વધુ-/ઓછું-આવરણ. તે Capacity (ક્ષમતા), Efficiency (કાર્યક્ષમતા) અને (કામકાજના દિવસો જુદા હોય ત્યારે) Calendar વિચલનોમાં વહેંચાય છે.' },
      ],
      formulas: [
        { name: 'Material cost variance (માલસામગ્રી પડતર વિચલન)', expr: '(SQ × SP) − (AQ × AP)' },
        { name: 'Material price variance (માલસામગ્રી ભાવ વિચલન)', expr: '(SP − AP) × AQ' },
        { name: 'Material usage variance (માલસામગ્રી વપરાશ વિચલન)', expr: '(SQ − AQ) × SP', note: 'ભાવ + વપરાશ = પડતર વિચલન.' },
        { name: 'Labour cost variance (મજૂરી પડતર વિચલન)', expr: '(SH × SR) − (AH × AR)' },
        { name: 'Labour rate variance (મજૂરી દર વિચલન)', expr: '(SR − AR) × AH' },
        { name: 'Labour efficiency variance (મજૂરી કાર્યક્ષમતા વિચલન)', expr: '(SH − AH) × SR', note: 'દર + કાર્યક્ષમતા = પડતર વિચલન.' },
        { name: 'Total overhead cost variance (કુલ ઓવરહેડ પડતર વિચલન)', expr: 'Overhead absorbed − Actual overhead', note: 'આવરેલ = વાસ્તવિક ઉત્પાદન માટેના પ્રમાણભૂત કલાક × પ્રમાણભૂત દર.' },
        { name: 'Variable OH expenditure (ચલિત OH ખર્ચ)', expr: '(Std rate × Actual hours) − Actual variable OH' },
        { name: 'Variable OH efficiency (ચલિત OH કાર્યક્ષમતા)', expr: '(Std hours for actual output − Actual hours) × Std rate', note: 'ચલિત: ખર્ચ + કાર્યક્ષમતા = ચલિત OH પડતર વિચલન.' },
        { name: 'Fixed OH expenditure (સ્થાયી OH ખર્ચ)', expr: 'Budgeted fixed OH − Actual fixed OH' },
        { name: 'Fixed OH volume (સ્થાયી OH જથ્થા/કદ)', expr: 'Absorbed fixed OH − Budgeted fixed OH', note: 'સ્થાયી: ખર્ચ + જથ્થા/કદ = સ્થાયી OH પડતર વિચલન.' },
        { name: 'Fixed OH volume split (સ્થાયી OH જથ્થા/કદ વિભાજન)', expr: 'Volume = Capacity + Efficiency  (+ Calendar when working days differ)', note: 'Capacity = (Actual − Budgeted hrs) × rate; Efficiency = (SHAO − Actual hrs) × rate; Calendar = (Actual − Budgeted days) × rate per day.' },
      ],
      procedure: {
        heading: 'વિચલન ગણવાની રીત',
        steps: [
          { title: '1 · વાસ્તવિક ઉત્પાદન માટેનું પ્રમાણ નક્કી કરો', detail: 'પ્રમાણભૂત જથ્થો/કલાક એ ખરેખર સિદ્ધ થયેલા ઉત્પાદન માટે મંજૂર હોય તેટલા, પ્રમાણભૂત ભાવ/દરે.' },
          { title: '2 · કુલ પડતર વિચલન', detail: 'પ્રમાણ-પડતર − વાસ્તવિક પડતર. ધન હોય તો અનુકૂળ (પડતર બચી).' },
          { title: '3 · ભાવ / દર વિચલન (Price / Rate)', detail: 'જથ્થો વાસ્તવિક રાખો, ભાવ બદલો: માલસામગ્રી માટે (SP − AP) × AQ; મજૂરી માટે (SR − AR) × AH.' },
          { title: '4 · વપરાશ / કાર્યક્ષમતા વિચલન (Usage / Efficiency)', detail: 'ભાવ પ્રમાણભૂત રાખો, જથ્થો બદલો: માલસામગ્રી માટે (SQ − AQ) × SP; મજૂરી માટે (SH − AH) × SR.' },
          { title: '5 · મેળ બેસાડો', detail: 'ભાવ/દર + વપરાશ/કાર્યક્ષમતા કુલ પડતર વિચલન બરાબર થવા જ જોઈએ — એ અંતર્ગત ચકાસણી છે.' },
        ],
      },
      examTips: [
        'દરેક વિચલનને F કે A લખો — અંકગણિત સાચું હોય તોપણ વગર-લેબલના આંકડા માટે ગુણ કપાય છે.',
        'ભાવ વિચલન માટે AQ અને વપરાશ વિચલન માટે SP વાપરો (અને મજૂરી માટે AH/SR) — ગુણક અદલબદલ કરવો એ સૌથી સામાન્ય ભૂલ છે.',
        'પ્રમાણભૂત જથ્થો/કલાક ખરેખર સિદ્ધ થયેલા વાસ્તવિક ઉત્પાદન માટેના હોવા જોઈએ, અંદાજિત ઉત્પાદન માટેના નહીં.',
      ],
      pitfalls: [
        'વપરાશ વિચલન પ્રમાણભૂત ભાવને બદલે વાસ્તવિક ભાવે ગણવું.',
        'ભાવ + વપરાશ પડતર વિચલન સાથે મેળ ખાવા જ જોઈએ એ ભૂલી જવું — જો ન ખાય તો કોઈ એક નિશાની ખોટી છે.',
        'આંધળી રીતે અનુકૂળને ધન આંકડા સાથે ગૂંચવવું — હંમેશાં દિશા ચકાસો (ઓછી વાસ્તવિક પડતર = અનુકૂળ).',
      ],
      applications: [
        'ઉત્પાદકો પડતર નિયંત્રણ અને જવાબદારી-હિસાબ માટે પ્રમાણ-પડતર નક્કી કરી દર મહિને વિચલનોનું વિશ્લેષણ કરે છે.',
        'વિચલનો દર્શાવે છે કે યોજનાથી ક્યાં (ભાવ, વપરાશ, દર, કાર્યક્ષમતા, ઓવરહેડ) અને કોણ ભટક્યું.',
        'પ્રમાણ અંદાજપત્ર, ભાવ-નિર્ધારણના નિર્ણયો અને માલસામગ્રીના મૂલ્યાંકનને પોષે છે.',
      ],
      advantages: [
        'અપવાદ દ્વારા સંચાલન શક્ય બનાવે છે — ધ્યાન કેવળ નોંધપાત્ર વિચલનો પર જ જાય છે.',
        'જવાબદારી નક્કી કરે છે (ભાવ ખરીદ-વિભાગની; વપરાશ અને કાર્યક્ષમતા ઉત્પાદન-વિભાગની).',
        'કામગીરી માટેનો માપદંડ અને અંદાજપત્ર તથા ભાવ-નિર્ધારણ માટેનો આધાર પૂરો પાડે છે.',
      ],
      limitations: [
        'સચોટ પ્રમાણ નક્કી કરવાં મુશ્કેલ અને ખર્ચાળ છે; જૂનાં પ્રમાણ ગેરમાર્ગે દોરે છે.',
        'જ્યાં ઉત્પાદન બિન-પ્રમાણભૂત હોય કે પરિસ્થિતિ ઝડપથી બદલાય ત્યાં અયોગ્ય.',
        'પડતર વિચલનો પર વધુ પડતો ભાર ગુણવત્તા કે કર્મચારી-મનોબળને નુકસાન કરી શકે.',
      ],
      workedExample: {
        title: 'માલસામગ્રી અને મજૂરી વિચલન (Arora, Unit 13)',
        problem:
          'માલસામગ્રી: વાસ્તવિક ઉત્પાદન માટે પ્રમાણભૂત જથ્થો 4,000 kg @ ₹5; વાસ્તવિક 4,300 kg @ ₹4.80. મજૂરી: પ્રમાણભૂત 2,000 hrs @ ₹10; વાસ્તવિક 2,100 hrs @ ₹9.50. પડતર, ભાવ/દર અને વપરાશ/કાર્યક્ષમતા વિચલનો ગણો.',
        steps: [
          { label: 'Material price variance = (SP − AP) × AQ', formula: '(5 − 4.80) × 4,300', result: '₹860 (F)' },
          { label: 'Material usage variance = (SQ − AQ) × SP', formula: '(4,000 − 4,300) × 5', result: '₹1,500 (A)' },
          { label: 'Material cost variance = price + usage', formula: '+860 − 1,500', result: '₹640 (A)' },
          { label: 'Labour rate variance = (SR − AR) × AH', formula: '(10 − 9.50) × 2,100', result: '₹1,050 (F)' },
          { label: 'Labour efficiency variance = (SH − AH) × SR', formula: '(2,000 − 2,100) × 10', result: '₹1,000 (A)' },
          { label: 'Labour cost variance = rate + efficiency', formula: '+1,050 − 1,000', result: '₹50 (F)' },
        ],
        answer: 'માલસામગ્રી: ભાવ ₹860 (F), વપરાશ ₹1,500 (A), પડતર ₹640 (A). મજૂરી: દર ₹1,050 (F), કાર્યક્ષમતા ₹1,000 (A), પડતર ₹50 (F).',
        source: 'M.N. Arora, Cost Accounting, Unit 13',
      },
      practice: [
        {
          q: 'માલસામગ્રીનું વપરાશ વિચલન પ્રતિકૂળ છે. સામાન્ય રીતે કોણ જવાબદાર છે?',
          answer: 'ઉત્પાદન-વિભાગ — પ્રતિકૂળ વપરાશ એટલે પ્રમાણ કરતાં વધુ માલસામગ્રી વપરાઈ (બગાડ, ખામીયુક્ત માલ, નબળી કારીગરી). ભાવ ખરીદનારની જવાબદારી છે.',
        },
        {
          q: 'SP ₹8, AP ₹8.50, AQ 1,000 kg. માલસામગ્રીનું ભાવ વિચલન અને તેનો સ્વભાવ શોધો.',
          answer: '(8 − 8.50) × 1,000 = −₹500 → ₹500 (A), પ્રતિકૂળ — પ્રમાણ કરતાં વધુ ચૂકવાયું.',
        },
        {
          q: 'ભાવ અને વપરાશ વિચલનો પડતર વિચલન સાથે કેમ સરવાળે મળવાં જોઈએ?',
          answer: 'કારણ કે તેઓ ભેગાં મળીને એક જ કુલ તફાવતને વિભાજિત કરે છે: એક ભાવની અસર અલગ તારવે, બીજો જથ્થાની — તેમનો સરવાળો આખું પડતર વિચલન છે.',
        },
        {
          q: 'ચલિત ઓવરહેડમાં volume (capacity/calendar) વિચલન કેમ નથી, જ્યારે સ્થાયી ઓવરહેડમાં છે?',
          answer: 'ચલિત ઓવરહેડ પ્રવૃત્તિ સાથે સીધું વધ-ઘટ થાય છે, એટલે આવરેલ રકમ હંમેશાં કામ કરેલા કલાકો સાથે મેળ ખાય છે — જથ્થાથી થતું વધુ-/ઓછું-આવરણ રહેતું નથી, કેવળ ખર્ચ અને કાર્યક્ષમતા. સ્થાયી ઓવરહેડ એ સપાટ અંદાજિત રકમ છે, એટલે અંદાજિત જથ્થાથી વધુ કે ઓછું ઉત્પાદન કરવાથી તે વધુ-/ઓછું-આવરિત થાય છે — એ તફાવત જ volume વિચલન છે.',
        },
        {
          q: 'આવરેલ સ્થાયી ઓવરહેડ ₹9,500; અંદાજિત સ્થાયી ઓવરહેડ ₹10,000; વાસ્તવિક સ્થાયી ઓવરહેડ ₹10,500. સ્થાયી-OH ખર્ચ, જથ્થા/કદ અને પડતર વિચલનો શોધો.',
          answer: 'ખર્ચ = 10,000 − 10,500 = ₹500 (A); જથ્થા/કદ = 9,500 − 10,000 = ₹500 (A); પડતર = 9,500 − 10,500 = ₹1,000 (A). ચકાસણી: ખર્ચ + જથ્થા/કદ = પડતર ✓ (M.N. Arora Illustration 13.3ના આંકડા).',
        },
      ],
    },
    title: 'Standard Costing & Variances',
    subject: 'Cost Accounting',
    icon: SlidersHorizontal,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Set standard costs, then explain the gap to actuals — material, labour and overhead variances split into price/rate, usage/efficiency and the fixed-overhead volume/capacity/calendar analysis.',
    readingMinutes: 11,
    tags: ['standard costing', 'variance analysis', 'material variance', 'labour variance', 'price variance', 'efficiency variance', 'favourable adverse'],
    overview: [
      'Standard costing sets a predetermined cost for each unit — the standard cost — built from standard quantities and standard prices. Actual results are then compared with these standards, and the differences (variances) are analysed by cause. It is a tool of control: it pinpoints where, and by how much, performance departed from plan.',
      'A variance is favourable (F) when it saves cost — actual is less than standard — and adverse (A) when it costs more. The total cost variance for an element is split into a price/rate variance (the effect of paying a different price) and a usage/efficiency variance (the effect of using a different quantity or time). The two sub-variances always reconcile to the total.',
      'The same logic applies to material and labour. For material: price variance isolates the price paid, usage variance the quantity used. For labour: rate variance isolates the wage rate, efficiency variance the hours worked. Responsibility usually differs — purchasing owns price; production owns usage and efficiency.',
      'Overheads are analysed in two streams. Variable overhead splits into an expenditure variance (spending more or less than standard for the hours worked) and an efficiency variance (taking more or fewer hours than allowed). Fixed overhead splits into an expenditure (budget) variance and a volume variance — the over- or under-absorption caused by producing above or below the budgeted output — and the volume variance itself sub-divides into capacity, efficiency and, where the number of working days differs, a calendar variance.',
    ],
    keyTerms: [
      { term: 'Standard cost', def: 'A predetermined cost = standard quantity × standard price (per unit of output).' },
      { term: 'Variance', def: 'Difference between standard cost (of actual output) and actual cost. F = favourable, A = adverse.' },
      { term: 'Material price variance', def: '(SP − AP) × AQ — the effect of paying a different price.' },
      { term: 'Material usage variance', def: '(SQ − AQ) × SP — the effect of using a different quantity.' },
      { term: 'Labour rate variance', def: '(SR − AR) × AH — the effect of a different wage rate.' },
      { term: 'Labour efficiency variance', def: '(SH − AH) × SR — the effect of taking different hours.' },
      { term: 'Overhead cost variance', def: 'Absorbed (recovered) overhead − actual overhead. Split into variable OH (expenditure + efficiency) and fixed OH (expenditure + volume) variances.' },
      { term: 'Fixed OH volume variance', def: 'Absorbed fixed OH − budgeted fixed OH — the over/under-absorption of fixed cost from producing above or below budget. It sub-divides into capacity, efficiency and (when working days differ) calendar variances.' },
    ],
    formulas: [
      { name: 'Material cost variance', expr: '(SQ × SP) − (AQ × AP)' },
      { name: 'Material price variance', expr: '(SP − AP) × AQ' },
      { name: 'Material usage variance', expr: '(SQ − AQ) × SP', note: 'Price + Usage = Cost variance.' },
      { name: 'Labour cost variance', expr: '(SH × SR) − (AH × AR)' },
      { name: 'Labour rate variance', expr: '(SR − AR) × AH' },
      { name: 'Labour efficiency variance', expr: '(SH − AH) × SR', note: 'Rate + Efficiency = Cost variance.' },
      { name: 'Total overhead cost variance', expr: 'Overhead absorbed − Actual overhead', note: 'Absorbed = standard hours for actual output × standard rate.' },
      { name: 'Variable OH expenditure', expr: '(Std rate × Actual hours) − Actual variable OH' },
      { name: 'Variable OH efficiency', expr: '(Std hours for actual output − Actual hours) × Std rate', note: 'Variable: expenditure + efficiency = variable OH cost variance.' },
      { name: 'Fixed OH expenditure', expr: 'Budgeted fixed OH − Actual fixed OH' },
      { name: 'Fixed OH volume', expr: 'Absorbed fixed OH − Budgeted fixed OH', note: 'Fixed: expenditure + volume = fixed OH cost variance.' },
      { name: 'Fixed OH volume split', expr: 'Volume = Capacity + Efficiency  (+ Calendar when working days differ)', note: 'Capacity = (Actual − Budgeted hrs) × rate; Efficiency = (SHAO − Actual hrs) × rate; Calendar = (Actual − Budgeted days) × rate per day.' },
    ],
    procedure: {
      heading: 'Computing a variance',
      steps: [
        { title: '1 · Fix the standard for actual output', detail: 'Standard quantity/hours are those allowed for the output actually achieved, at standard price/rate.' },
        { title: '2 · Total cost variance', detail: 'Standard cost − actual cost. Favourable if positive (cost saved).' },
        { title: '3 · Price / rate variance', detail: 'Hold quantity at actual, vary the price: (SP − AP) × AQ for material; (SR − AR) × AH for labour.' },
        { title: '4 · Usage / efficiency variance', detail: 'Hold price at standard, vary the quantity: (SQ − AQ) × SP for material; (SH − AH) × SR for labour.' },
        { title: '5 · Reconcile', detail: 'Price/rate + usage/efficiency must equal the total cost variance — a built-in check.' },
      ],
    },
    examTips: [
      'Label every variance F or A — marks are lost for an unlabelled number, even if the arithmetic is right.',
      'Use AQ for the price variance and SP for the usage variance (and AH/SR for labour) — swapping the multiplier is the commonest mistake.',
      'Standard quantity/hours must be for the ACTUAL output achieved, not the budgeted output.',
    ],
    pitfalls: [
      'Computing the usage variance at actual price instead of standard price.',
      'Forgetting that price + usage must reconcile to the cost variance — if they don’t, a sign is wrong.',
      'Confusing favourable with a positive number blindly — always check the direction (lower actual cost = favourable).',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 13 (Standard Costing)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Variance analysis — material & labour', url: 'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f2/technical-articles/variance-analysis.html', kind: 'official', source: 'ACCA' },
      { label: 'Standard costing & variances', url: 'https://www.accountingnotes.net/cost-accounting/standard-costing/standard-costing/16480', kind: 'article', source: 'Accounting Notes' },
      { label: 'Fixed overhead — total, expenditure, volume, capacity, efficiency', url: 'https://www.acowtancy.com/textbook/acca-pm/basic-variance-analysis/fixed-overhead-total-expenditure-volume-capacity-and-efficiency-variance/notes', kind: 'article', source: 'aCOWtancy (ACCA PM)' },
    ],
    workedExample: {
      title: 'Material & labour variances (Arora, Unit 13)',
      problem:
        'Material: standard quantity for actual output 4,000 kg @ ₹5; actual 4,300 kg @ ₹4.80. Labour: standard 2,000 hrs @ ₹10; actual 2,100 hrs @ ₹9.50. Compute the cost, price/rate and usage/efficiency variances.',
      steps: [
        { label: 'Material price variance = (SP − AP) × AQ', formula: '(5 − 4.80) × 4,300', result: '₹860 (F)' },
        { label: 'Material usage variance = (SQ − AQ) × SP', formula: '(4,000 − 4,300) × 5', result: '₹1,500 (A)' },
        { label: 'Material cost variance = price + usage', formula: '+860 − 1,500', result: '₹640 (A)' },
        { label: 'Labour rate variance = (SR − AR) × AH', formula: '(10 − 9.50) × 2,100', result: '₹1,050 (F)' },
        { label: 'Labour efficiency variance = (SH − AH) × SR', formula: '(2,000 − 2,100) × 10', result: '₹1,000 (A)' },
        { label: 'Labour cost variance = rate + efficiency', formula: '+1,050 − 1,000', result: '₹50 (F)' },
      ],
      answer: 'Material: price ₹860 (F), usage ₹1,500 (A), cost ₹640 (A). Labour: rate ₹1,050 (F), efficiency ₹1,000 (A), cost ₹50 (F).',
      source: 'M.N. Arora, Cost Accounting, Unit 13',
    },
    practice: [
      {
        q: 'A material usage variance is adverse. Who is usually responsible?',
        answer: 'The production department — adverse usage means more material was consumed than the standard allowed (waste, defective material, poor workmanship). Price is the buyer’s responsibility.',
      },
      {
        q: 'SP ₹8, AP ₹8.50, AQ 1,000 kg. Find the material price variance and its nature.',
        answer: '(8 − 8.50) × 1,000 = −₹500 → ₹500 (A), adverse — more was paid than standard.',
      },
      {
        q: 'Why must the price and usage variances add up to the cost variance?',
        answer: 'Because together they decompose the same total difference: one isolates the price effect, the other the quantity effect — their sum is the whole cost variance.',
      },
      {
        q: 'Why does variable overhead have no volume (capacity/calendar) variance, while fixed overhead does?',
        answer: 'Variable overhead flexes directly with activity, so the amount absorbed always matches the hours worked — there is no over/under-absorption from volume, only expenditure and efficiency. Fixed overhead is a flat budgeted amount, so producing above or below the budgeted volume over- or under-absorbs it — that gap is the volume variance.',
      },
      {
        q: 'Absorbed fixed overhead ₹9,500; budgeted fixed overhead ₹10,000; actual fixed overhead ₹10,500. Find the fixed-OH expenditure, volume and cost variances.',
        answer: 'Expenditure = 10,000 − 10,500 = ₹500 (A); Volume = 9,500 − 10,000 = ₹500 (A); Cost = 9,500 − 10,500 = ₹1,000 (A). Check: expenditure + volume = cost ✓ (the M.N. Arora Illustration 13.3 figures).',
      },
    ],
    applications: [
      'Manufacturers set standard costs and analyse variances monthly for cost control and responsibility accounting.',
      'Variances pinpoint where (price, usage, rate, efficiency, overhead) and who departed from the plan.',
      'Standards feed budgets, pricing decisions and inventory valuation.',
    ],
    advantages: [
      'Enables management by exception — attention goes only to the significant variances.',
      'Fixes responsibility (purchasing owns price; production owns usage and efficiency).',
      'Provides a yardstick for performance and a basis for budgets and pricing.',
    ],
    limitations: [
      'Setting accurate standards is difficult and costly; outdated standards mislead.',
      'Unsuitable where output is non-standard or conditions change rapidly.',
      'Over-emphasis on cost variances can harm quality or staff morale.',
    ],
    calc: 'standard-costing-variances',
  },
]

export const getResourceTopic = (id: string): ResourceTopic | undefined =>
  resourceTopics.find((t) => t.id === id)
