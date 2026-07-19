/* Client-side image compression — shrink a phone photo before upload so the
   free Storage tier lasts. A legible photo of handwritten working only needs
   ~1600px on the long edge; we re-encode to JPEG at ~0.82 quality, which turns
   a 3–8 MB capture into roughly 150–300 KB. Runs entirely in the browser
   (canvas), no network, no dependency. Falls back to the original file if the
   browser can't decode it. */

const MAX_DIM = 1600
const QUALITY = 0.82

export type PreparedImage = { blob: Blob; previewUrl: string; name: string }

/** Downscale + re-encode one image file to a JPEG blob. */
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close?.()
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', QUALITY))
    // If compression somehow produced a bigger file, keep the smaller original.
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file // decode failed (exotic format) — upload as-is
  }
}

/** Prepare a batch: compress each and make object URLs for instant previews. */
export async function prepareImages(files: File[]): Promise<PreparedImage[]> {
  const out: PreparedImage[] = []
  for (const f of files) {
    const blob = await compressImage(f)
    out.push({ blob, previewUrl: URL.createObjectURL(blob), name: f.name })
  }
  return out
}
