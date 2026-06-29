/* ----------------------------------------------------------------------------
   Bilingual support for the Resource Library — English (en) / Gujarati (gu).

   ~70% of VNSGU commerce students study in the Gujarati medium, so each topic
   can carry a `gu` translation (see ResourceTopic.gu). The toggle persists to
   localStorage and syncs across components via a window event (same pattern as
   the dark-mode toggle). UI chrome strings live in UI_STRINGS below; per-topic
   content is translated in src/data/resources.ts.

   Translation register follows docs/i18n-gujarati-glossary.md — native Gujarati
   coinages for established terms (પડતર, ગુણોત્તર, વિચરણ), transliteration kept for
   formula labels (EOQ, FIFO) and loanwords (બજેટ, સ્ટૉક). Numbers/₹/formulas are
   language-neutral and never "translated".
---------------------------------------------------------------------------- */
import { useEffect, useState } from 'react'

export type Lang = 'en' | 'gu'

const KEY = 'cl-lang'
const EVENT = 'cl-lang-change'

export function getLang(): Lang {
  if (typeof localStorage === 'undefined') return 'en'
  return localStorage.getItem(KEY) === 'gu' ? 'gu' : 'en'
}

export function setLang(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT))
}

/** Reactive language state, synced across all components on the page. */
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, set] = useState<Lang>(getLang)
  useEffect(() => {
    const handler = () => set(getLang())
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [])
  return [lang, setLang]
}

/** UI chrome strings (section headings, buttons) per language. */
export const UI_STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    library: 'Resource Library',
    downloadPdf: 'Download PDF',
    minRead: 'min read',
    overview: 'Overview',
    keyTerms: 'Key terms',
    keyFormulas: 'Key formulas',
    theMethod: 'The method',
    workedExample: 'Worked example',
    problem: 'Problem.',
    answer: 'Answer.',
    applications: 'Industrial applications',
    applicationsSub: 'Where this is used in the real world — and why it matters in practice.',
    advantages: 'Advantages',
    limitations: 'Limitations',
    examTips: 'Exam tips',
    commonMistakes: 'Common mistakes',
    testYourself: 'Test yourself',
    testYourselfSub: 'A few quick questions to check your understanding — attempt each before revealing the answer.',
    viewAnswer: 'View answer',
    hideAnswer: 'Hide answer',
    tryFirst: 'Try it yourself first — then reveal the answer.',
    answerLabel: 'Answer:',
    tryCalculator: 'Try the calculator',
    tryCalculatorSub: 'See it worked step by step.',
    formulaSheet: 'Formula sheet',
    formulaSheetSub: 'Revise every key formula in one place.',
    references: 'References & further reading',
    search: 'Search topics — ratio analysis, EOQ, variances…',
    allSubjects: 'All',
    study: 'Study',
    heroTitle: 'Study notes that actually teach the method',
    heroSubtitle:
      'Topic-by-topic guides for commerce students — the concept, the formulas, the step-by-step method, exam tips and common mistakes, each grounded in standard texts and linked to a calculator that shows the working.',
    disclaimer:
      'These notes are a study aid grounded in standard B.Com / CA-CS-CMA texts and cross-checked against authoritative sources (each topic lists its references). For statutory rates and the latest exam scheme, always confirm with the official source.',
    topicDisclaimer:
      'A study aid grounded in standard B.Com / CA-CS-CMA texts and Dr. Desai’s class material. Always confirm statutory rates and the current exam scheme with the official source before relying on them.',
  },
  gu: {
    library: 'સંદર્ભ ગ્રંથાલય',
    downloadPdf: 'PDF ડાઉનલોડ કરો',
    minRead: 'મિનિટ વાંચન',
    overview: 'ઝાંખી',
    keyTerms: 'મુખ્ય શબ્દો',
    keyFormulas: 'મુખ્ય સૂત્રો',
    theMethod: 'રીત',
    workedExample: 'ઉકેલેલ દાખલો',
    problem: 'દાખલો.',
    answer: 'જવાબ.',
    applications: 'ઔદ્યોગિક ઉપયોગ',
    applicationsSub: 'આ વાસ્તવિક જગતમાં ક્યાં વપરાય છે — અને વ્યવહારમાં તે શા માટે મહત્ત્વનું છે.',
    advantages: 'ફાયદા',
    limitations: 'મર્યાદાઓ',
    examTips: 'પરીક્ષાની ટિપ્સ',
    commonMistakes: 'સામાન્ય ભૂલો',
    testYourself: 'તમારી જાતને ચકાસો',
    testYourselfSub: 'તમારી સમજ ચકાસવા થોડા પ્રશ્નો — જવાબ જોતાં પહેલાં દરેકનો જાતે પ્રયાસ કરો.',
    viewAnswer: 'જવાબ જુઓ',
    hideAnswer: 'જવાબ છુપાવો',
    tryFirst: 'પહેલાં જાતે પ્રયાસ કરો — પછી જવાબ જુઓ.',
    answerLabel: 'જવાબ:',
    tryCalculator: 'કૅલ્ક્યુલેટર અજમાવો',
    tryCalculatorSub: 'પગલાં-દર-પગલાં ઉકેલ જુઓ.',
    formulaSheet: 'સૂત્ર પત્રક',
    formulaSheetSub: 'બધાં મુખ્ય સૂત્રો એક જ ઠેકાણે ઉજાળો.',
    references: 'સંદર્ભ અને વધુ વાંચન',
    search: 'વિષય શોધો — ગુણોત્તર, EOQ, વિચરણ…',
    allSubjects: 'બધા',
    study: 'અભ્યાસ',
    heroTitle: 'અભ્યાસ-નોંધો જે ખરેખર પદ્ધતિ શીખવે',
    heroSubtitle:
      'વાણિજ્ય વિદ્યાર્થીઓ માટે વિષય-વાર માર્ગદર્શિકાઓ — ખ્યાલ, સૂત્રો, પગલાં-દર-પગલાં પદ્ધતિ, પરીક્ષાની ટિપ્સ અને સામાન્ય ભૂલો; દરેક પ્રમાણભૂત પાઠ્યપુસ્તકો પર આધારિત અને ઉકેલ બતાવતા કૅલ્ક્યુલેટર સાથે જોડાયેલ.',
    disclaimer:
      'આ નોંધો પ્રમાણભૂત B.Com / CA-CS-CMA પાઠ્યપુસ્તકો પર આધારિત અને અધિકૃત સ્રોતો સામે ચકાસેલ અભ્યાસ-સહાય છે (દરેક વિષય તેના સંદર્ભો દર્શાવે છે). કાયદાકીય દરો અને નવીનતમ પરીક્ષા-યોજના માટે હંમેશાં અધિકૃત સ્રોત સાથે ખાતરી કરો.',
    topicDisclaimer:
      'પ્રમાણભૂત B.Com / CA-CS-CMA પાઠ્યપુસ્તકો અને ડૉ. દેસાઈની વર્ગ-સામગ્રી પર આધારિત અભ્યાસ-સહાય. આધાર રાખતા પહેલાં કાયદાકીય દરો અને વર્તમાન પરીક્ષા-યોજના હંમેશાં અધિકૃત સ્રોત સાથે ખાતરી કરો.',
  },
}

export const useUI = (lang: Lang) => UI_STRINGS[lang]

/** Gujarati labels for the three ResourceSubject groups (chips + section headings).
    Keyed by the English subject string; falls back to that string if unmapped. */
const SUBJECT_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    'Financial Statement Analysis': 'Financial Statement Analysis',
    'Budgetary Control': 'Budgetary Control',
    'Cost Accounting': 'Cost Accounting',
  },
  gu: {
    'Financial Statement Analysis': 'નાણાકીય પત્રકોનું વિશ્લેષણ',
    'Budgetary Control': 'અંદાજપત્રીય નિયમન',
    'Cost Accounting': 'પડતર હિસાબ',
  },
}

export function subjectLabel(lang: Lang, subject: string): string {
  return SUBJECT_LABELS[lang][subject] ?? subject
}
