type Props = {
  label: string
  value: string
  onChange: (v: string) => void
  prefix?: string
  suffix?: string
  placeholder?: string
  hint?: string
}

/** Ledger input — muted label over a hairline field; ₹/unit cells sit in
    bordered prefix/suffix compartments on the paper background. */
export default function CalcField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
  hint,
}: Props) {
  return (
    <label className="block">
      <span className="text-[12.5px] font-semibold text-slate-600">{label}</span>
      <div className="mt-1.5 flex items-stretch overflow-hidden rounded-[9px] border border-slate-200 bg-slate-50 transition focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100">
        {prefix && (
          <span className="grid place-items-center border-r border-slate-200 px-3 text-sm text-slate-400">
            {prefix}
          </span>
        )}
        <input
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-3 py-2.5 text-[15px] font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
        />
        {suffix && (
          <span className="grid place-items-center border-l border-slate-200 px-3 text-sm text-slate-400">
            {suffix}
          </span>
        )}
      </div>
      {hint && <span className="mt-1.5 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  )
}
