import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { shareCalculation } from '../lib/urlState'

/** "Share this calculation" — native share sheet on mobile (WhatsApp-friendly),
    copy-to-clipboard on desktop. Lives on every calculator page header. */
export default function ShareButton({ title }: { title: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const onShare = async () => {
    const result = await shareCalculation(title)
    if (result === 'copied') {
      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    } else if (result === 'failed') {
      setState('failed')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  return (
    <button
      onClick={onShare}
      className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-[10px] border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-800 transition hover:border-brand-600 hover:text-brand-600"
      title="Share a link with your inputs filled in"
    >
      {state === 'copied' ? (
        <>
          <Check className="h-4 w-4 text-brand-600" /> Link copied
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" /> {state === 'failed' ? 'Copy failed' : 'Share'}
        </>
      )}
    </button>
  )
}
