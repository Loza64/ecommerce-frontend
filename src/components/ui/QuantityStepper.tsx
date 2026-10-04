import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface QuantityStepperProps {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled = false,
}: QuantityStepperProps) {
  return (
    <div
      className="inline-flex items-center gap-2"
      role="group"
      aria-label="Cantidad"
    >
      <Button
        variant="icon"
        tooltip="Disminuir"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={14} />
      </Button>
      <span className="min-w-6 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <Button
        variant="icon"
        tooltip="Aumentar"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={14} />
      </Button>
    </div>
  )
}
