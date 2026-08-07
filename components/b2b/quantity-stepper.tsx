'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Шаг заказа и MOQ приходят из variant.metadata (b2b-starter).
 * Ввод не «чинится» на каждый keystroke — нормализация на blur,
 * иначе пользователь не может стереть значение.
 */
export function QuantityStepper({
  value,
  min,
  step,
  disabled,
  onChange,
  label,
}: {
  value: number
  min: number
  step: number
  disabled?: boolean
  onChange: (next: number) => void
  label: string
}) {
  const normalize = (raw: number) => {
    if (!Number.isFinite(raw) || raw <= 0) return 0
    const stepped = Math.round(raw / step) * step
    return Math.max(min, stepped)
  }

  return (
    <div
      className={cn(
        'inline-flex h-10 items-center rounded-lg border border-input bg-card transition-opacity duration-150',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <button
        type="button"
        aria-label={`Уменьшить количество: ${label}`}
        disabled={disabled || value === 0}
        onClick={() => onChange(value <= min ? 0 : value - step)}
        className="flex size-10 items-center justify-center rounded-l-lg text-muted-foreground transition-colors duration-100 hover:bg-accent hover:text-foreground active:bg-accent/80 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Minus className="size-4" strokeWidth={2} aria-hidden="true" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        aria-label={`Количество: ${label}`}
        value={value === 0 ? '' : value}
        placeholder="0"
        disabled={disabled}
        onChange={(event) => {
          const digits = event.target.value.replace(/[^\d]/g, '')
          onChange(digits === '' ? 0 : Number(digits))
        }}
        onBlur={(event) => {
          const raw = Number(event.target.value.replace(/[^\d]/g, ''))
          onChange(normalize(raw))
        }}
        className="ht-numeric h-10 w-12 border-x border-input bg-transparent text-center text-sm font-medium tracking-tight outline-none placeholder:text-muted-foreground/60 focus-visible:bg-primary-soft"
      />

      <button
        type="button"
        aria-label={`Увеличить количество: ${label}`}
        disabled={disabled}
        onClick={() => onChange(value === 0 ? min : value + step)}
        className="flex size-10 items-center justify-center rounded-r-lg text-muted-foreground transition-colors duration-100 hover:bg-accent hover:text-foreground active:bg-accent/80"
      >
        <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}
