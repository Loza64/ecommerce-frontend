export interface ColorFieldProps {
  label: string
  hint?: string
  value: string
  onValueChange: (value: string) => void
}

export function ColorField({
  label,
  hint = '',
  value,
  onValueChange,
}: ColorFieldProps) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)_92px] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 max-[480px]:grid-cols-[36px_minmax(0,1fr)_78px]">
      <label
        className="group relative inline-block h-9 w-9 cursor-pointer justify-self-start"
        title={`Elegir ${label.toLowerCase()}`}
      >
        <input
          type="color"
          className="absolute inset-0 h-full w-full cursor-pointer border-none p-0 opacity-0"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          aria-label={label}
        />
        <span
          className="pointer-events-none block h-full w-full rounded-full border-2 border-[var(--surface)] shadow-[0_0_0_1px_var(--border)] transition-transform group-hover:scale-[1.08]"
          style={{ background: value }}
        />
      </label>

      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="block truncate text-[13px] font-semibold text-[var(--text)]">
          {label}
        </span>
        {hint && (
          <span className="block truncate text-xs text-[var(--text-muted)]">
            {hint}
          </span>
        )}
      </div>

      <input
        type="text"
        className="field-input w-full text-center lowercase"
        style={{
          fontFamily: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
        }}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        spellCheck={false}
        maxLength={7}
        aria-label="Código hexadecimal"
      />
    </div>
  )
}
