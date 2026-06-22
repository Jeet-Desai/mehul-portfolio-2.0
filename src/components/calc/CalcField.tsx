type Props = {
  label: string
  value: string
  onChange: (v: string) => void
  prefix?: string
  suffix?: string
  placeholder?: string
  hint?: string
}

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
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="mt-1.5 flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
        {prefix && (
          <span className="grid place-items-center bg-slate-50 px-3 text-sm font-medium text-slate-500">
            {prefix}
          </span>
        )}
        <input
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
        />
        {suffix && (
          <span className="grid place-items-center bg-slate-50 px-3 text-sm font-medium text-slate-500">
            {suffix}
          </span>
        )}
      </div>
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}
