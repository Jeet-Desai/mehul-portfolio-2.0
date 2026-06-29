/* ----------------------------------------------------------------------------
   Attachment handling for the AI doubt-tutor.

   The tutor runs on Groq (OpenAI-compatible). Groq's vision models accept
   IMAGES only — no native PDF/Word ingestion. So we split work in the browser:

     - Images  → compressed + encoded as a base64 data URL, sent to the vision
                 model as an `image_url` content part.
     - PDF     → text extracted client-side with pdf.js (lazy-loaded), sent as
                 plain text. NOTE: scanned/photo-only PDFs yield no text (no OCR).
     - .txt    → read directly as text.

   Everything here is React-free and runs entirely on the student's device —
   no upload server, no egress beyond the eventual tutor call.

   Groq limits we respect: base64 image ≤ 4 MB, ≤ 5 images per request.
---------------------------------------------------------------------------- */

export type AttachmentKind = 'image' | 'pdf' | 'text'

export type Attachment = {
  id: string
  name: string
  kind: AttachmentKind
  size: number
  status: 'reading' | 'ready' | 'error'
  /** images only — base64 data URL fed to the vision model */
  dataUrl?: string
  /** pdf / text — extracted text fed as plain text */
  text?: string
  /** true when extracted text was truncated to the cap */
  truncated?: boolean
  /** set when status === 'error' */
  error?: string
}

export const MAX_IMAGES = 5
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // Groq base64 ceiling
export const MAX_FILE_BYTES = 25 * 1024 * 1024 // sane upload ceiling (pre-compression)
export const MAX_TEXT_CHARS = 12_000 // per-file cap on extracted text
const IMAGE_MAX_EDGE = 2000 // longest side after downscale (px)

/** What the <input accept> should advertise. */
export const ACCEPT_ATTR = 'image/*,application/pdf,.pdf,text/plain,.txt'

let counter = 0
function nextId(): string {
  counter += 1
  return `att-${Date.now().toString(36)}-${counter}`
}

export function classify(file: File): AttachmentKind | null {
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  if (type.startsWith('image/')) return 'image'
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (type.startsWith('text/') || name.endsWith('.txt')) return 'text'
  return null
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

/** Estimate the byte size of a base64 data URL (without the data: prefix). */
function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(',')
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
  // 4 base64 chars → 3 bytes; subtract padding.
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0
  return Math.floor((b64.length * 3) / 4) - padding
}

/** Downscale + re-encode an image so it stays comfortably under Groq's 4 MB. */
async function compressImage(file: File): Promise<string> {
  const objUrl = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Could not read this image.'))
      el.src = objUrl
    })

    const longest = Math.max(img.naturalWidth, img.naturalHeight) || 1
    const scale = Math.min(1, IMAGE_MAX_EDGE / longest)
    const w = Math.max(1, Math.round(img.naturalWidth * scale))
    const h = Math.max(1, Math.round(img.naturalHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not process this image.')
    // White matte so transparent PNGs don't turn black as JPEG.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)

    // Step quality down until it fits the base64 ceiling.
    for (const quality of [0.85, 0.7, 0.55, 0.4]) {
      const url = canvas.toDataURL('image/jpeg', quality)
      if (dataUrlBytes(url) <= MAX_IMAGE_BYTES) return url
    }
    throw new Error('Image is too detailed to send — try a smaller crop.')
  } finally {
    URL.revokeObjectURL(objUrl)
  }
}

async function readTextFile(file: File): Promise<{ text: string; truncated: boolean }> {
  const raw = (await file.text()).trim()
  if (raw.length > MAX_TEXT_CHARS) return { text: raw.slice(0, MAX_TEXT_CHARS), truncated: true }
  return { text: raw, truncated: false }
}

async function extractPdfText(file: File): Promise<{ text: string; truncated: boolean }> {
  // Lazy-load pdf.js so it never weighs down the main bundle.
  const pdfjs = await import('pdfjs-dist')
  const workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

  const buf = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: buf }).promise
  const parts: string[] = []
  let truncated = false
  let total = 0

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    const line = content.items
      .map((it) => ('str' in it ? (it as { str: string }).str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (line) {
      parts.push(line)
      total += line.length
    }
    if (total > MAX_TEXT_CHARS) {
      truncated = true
      break
    }
  }
  await doc.cleanup?.()

  const text = parts.join('\n\n').slice(0, MAX_TEXT_CHARS).trim()
  return { text, truncated }
}

/**
 * Turn a picked File into a ready (or errored) Attachment.
 * Never throws — failures come back as `status: 'error'` with a friendly message.
 */
export async function processFile(file: File): Promise<Attachment> {
  const kind = classify(file)
  const base: Attachment = { id: nextId(), name: file.name, size: file.size, kind: kind ?? 'text', status: 'reading' }

  if (!kind) {
    return { ...base, status: 'error', error: 'Unsupported file — use an image, PDF or .txt.' }
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ...base, status: 'error', error: `File is too large (max ${formatBytes(MAX_FILE_BYTES)}).` }
  }

  try {
    if (kind === 'image') {
      const dataUrl = await compressImage(file)
      return { ...base, status: 'ready', dataUrl }
    }
    const { text, truncated } = kind === 'pdf' ? await extractPdfText(file) : await readTextFile(file)
    if (!text) {
      return {
        ...base,
        status: 'error',
        error:
          kind === 'pdf'
            ? 'No selectable text found — this looks like a scanned PDF. Try a photo of the page instead.'
            : 'This file looks empty.',
      }
    }
    return { ...base, status: 'ready', text, truncated }
  } catch (e) {
    return { ...base, status: 'error', error: e instanceof Error ? e.message : 'Could not read this file.' }
  }
}
