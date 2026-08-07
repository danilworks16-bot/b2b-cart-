'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatAmount, formatTierRange } from '@/lib/b2b/format'
import { resolveTier } from '@/lib/b2b/pricing'
import type { HtVariant } from '@/lib/b2b/types'

/**
 * Одна общая оптовая сетка на всю карточку вместо таблицы в каждой строке.
 * Ступени берутся у выбранного варианта: в Medusa v2 price rule `quantity`
 * живёт на price set конкретного варианта, поэтому сетка всегда «чья-то».
 */
export function TierGrid({
  variants,
  quantities,
  isB2B,
}: {
  variants: HtVariant[]
  quantities: Record<string, number>
  isB2B: boolean
}) {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState(variants[0]?.id)

  // Пользователь набирает количество -> сетка переключается на этот вариант.
  const firstFilled = variants.find((variant) => (quantities[variant.id] ?? 0) > 0)?.id
  useEffect(() => {
    if (firstFilled) setActiveId(firstFilled)
  }, [firstFilled])

  if (!isB2B) return null

  const active = variants.find((variant) => variant.id === activeId) ?? variants[0]
  const quantity = quantities[active.id] ?? 0
  const activeTier = resolveTier(active, quantity, true)
  const maxTier = active.price_tiers.at(-1)

  return (
    <div className="rounded-xl border border-border bg-muted/40">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="ht-tier-grid"
        className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors duration-150 hover:bg-muted/70"
      >
        <span className="text-[13px] font-medium">
          Оптовая сетка
          <span className="ht-numeric ml-1.5 font-normal text-muted-foreground">
            до −{maxTier?.discount_percent}% от {maxTier?.min_quantity} ед.
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out',
            open && 'rotate-180',
          )}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id="ht-tier-grid"
          className="animate-in fade-in slide-in-from-top-1 border-t border-border px-4 pb-4 pt-3 duration-200 ease-out"
        >
          <div
            role="tablist"
            aria-label="Вариант фасовки"
            className="ht-scroll-x -mx-1 flex gap-1.5 px-1 pb-3"
          >
            {variants.map((variant) => (
              <button
                key={variant.id}
                role="tab"
                type="button"
                aria-selected={variant.id === active.id}
                onClick={() => setActiveId(variant.id)}
                className={cn(
                  'ht-numeric shrink-0 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors duration-150',
                  variant.id === active.id
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-input bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {variant.sku}
              </button>
            ))}
          </div>

          <table className="w-full text-left">
            <caption className="sr-only">Ступени оптовой цены для {active.sku}</caption>
            <thead>
              <tr className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="pb-1.5 font-medium">
                  Количество
                </th>
                <th scope="col" className="pb-1.5 text-right font-medium">
                  Цена за ед.
                </th>
                <th scope="col" className="pb-1.5 text-right font-medium">
                  Выгода
                </th>
              </tr>
            </thead>
            <tbody className="ht-numeric text-[13px]">
              {active.price_tiers.map((tier) => {
                const isActiveTier = tier.min_quantity === activeTier.min_quantity && quantity > 0
                return (
                  <tr
                    key={tier.min_quantity}
                    className={cn(
                      'border-t border-border/70',
                      isActiveTier && 'font-semibold text-primary',
                    )}
                  >
                    <td className="py-1.5">{formatTierRange(tier.min_quantity, tier.max_quantity)}</td>
                    <td className="py-1.5 text-right">{formatAmount(tier.amount)}</td>
                    <td className="py-1.5 text-right">
                      {tier.discount_percent > 0 ? `−${tier.discount_percent}%` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
