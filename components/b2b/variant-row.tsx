'use client'

import { Package, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatAmount } from '@/lib/b2b/format'
import { resolveTier, resolveUnitAmount } from '@/lib/b2b/pricing'
import type { HtCustomerCtx, HtVariant } from '@/lib/b2b/types'
import { QuantityStepper } from './quantity-stepper'

const STATE_COPY: Record<HtVariant['inventory_state'], { label: string; tone: string }> = {
  in_stock: { label: 'На складе', tone: 'bg-success' },
  on_request: { label: 'Доступно по запросу', tone: 'bg-success' },
  made_to_order: { label: 'Под заказ', tone: 'bg-muted-foreground' },
}

/**
 * Одна строка = один StoreProductVariant.
 * `min-h` на блоке цены зафиксирована, чтобы переход
 * skeleton -> guest -> b2b не «дёргал» страницу.
 */
export function VariantRow({
  variant,
  customer,
  quantity,
  locked,
  onQuantityChange,
}: {
  variant: HtVariant
  customer: HtCustomerCtx
  quantity: number
  locked: boolean
  onQuantityChange: (next: number) => void
}) {
  const isB2B = customer.state === 'b2b'
  const isLoading = customer.state === 'loading'
  const inventory = STATE_COPY[variant.inventory_state]

  const activeTier = resolveTier(variant, quantity, isB2B)
  const unitAmount = resolveUnitAmount(variant, quantity, isB2B)
  const isSelected = quantity > 0

  return (
    <div
      className={cn(
        'rounded-xl border bg-card transition-[border-color,box-shadow] duration-200 ease-out',
        isSelected ? 'border-primary/40 shadow-panel' : 'border-border',
      )}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="ht-numeric text-[13px] font-medium tracking-tight text-muted-foreground">
              {variant.sku}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
              {variant.metadata.grade}
            </span>
          </div>

          {/* Цена: минимальная высота зарезервирована */}
          <div className="mt-1.5 flex min-h-[30px] items-baseline gap-2">
            {isLoading ? (
              <span className="h-[22px] w-28 animate-pulse rounded-md bg-muted" />
            ) : (
              <>
                <span className="ht-numeric font-display text-[19px] font-semibold tracking-tight">
                  {formatAmount(unitAmount)}
                </span>
                {isB2B && activeTier.discount_percent > 0 && (
                  <span className="ht-numeric text-[13px] font-medium text-muted-foreground line-through">
                    {formatAmount(variant.calculated_price.original_amount)}
                  </span>
                )}
                {isB2B && activeTier.discount_percent > 0 && (
                  <span className="ht-numeric rounded-md bg-success-soft px-1.5 py-0.5 text-[11px] font-semibold text-success">
                    −{activeTier.discount_percent}%
                  </span>
                )}
              </>
            )}
          </div>

          <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Package className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <dt className="sr-only">Фасовка</dt>
              <dd className="ht-numeric">{variant.metadata.net_weight_kg} кг</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <dt className="sr-only">Срок поставки</dt>
              <dd className="ht-numeric">{variant.metadata.lead_time_days} дн.</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn('size-1.5 shrink-0 rounded-full', inventory.tone)} aria-hidden="true" />
              <dt className="sr-only">Наличие</dt>
              <dd>{inventory.label}</dd>
            </div>
          </dl>

        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {isLoading ? (
            <span className="h-10 w-[132px] animate-pulse rounded-lg bg-muted" />
          ) : (
            <QuantityStepper
              value={quantity}
              min={variant.min_order_quantity}
              step={variant.order_step}
              disabled={locked}
              label={variant.sku}
              onChange={onQuantityChange}
            />
          )}
          <span className="ht-numeric text-[11.5px] text-muted-foreground">
            MOQ {variant.min_order_quantity} ед.
          </span>
        </div>
      </div>
    </div>
  )
}
