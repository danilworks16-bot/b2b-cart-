'use client'

import { Fragment, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatAmount, formatDecimal, formatInteger, formatTierRange } from '@/lib/b2b/format'
import { resolveTier } from '@/lib/b2b/logistics'
import type { HtProduct, HtVariant } from '@/lib/b2b/types'
import { useCustomer } from './customer-context'
import { useOrderDraft } from './order-draft-context'
import { QuantityStepper } from './quantity-stepper'

const INVENTORY: Record<HtVariant['inventory_state'], { label: string; tone: string }> = {
  in_stock: { label: 'На складе', tone: 'bg-success' },
  on_request: { label: 'Доступно по запросу', tone: 'bg-success' },
  made_to_order: { label: 'Под заказ', tone: 'bg-muted-foreground' },
}

const COLUMNS = [
  { key: 'sku', label: 'Артикул и фасовка', align: 'left' as const },
  { key: 'stock', label: 'Наличие', align: 'left' as const },
  { key: 'lead', label: 'Срок', align: 'left' as const },
  { key: 'base', label: 'Базовая цена', align: 'right' as const },
  { key: 'yours', label: 'Ваша цена', align: 'right' as const },
  { key: 'qty', label: 'Количество', align: 'center' as const },
  { key: 'sum', label: 'Сумма строки', align: 'right' as const },
]

/**
 * Матрица фасовок: одна строка = один StoreProductVariant.
 *
 * Верстка намеренно табличная с контролируемым горизонтальным скроллом
 * и залипающей первой колонкой — 7 колонок B2B-параметров не влезают
 * в мобильный экран, а «схлопывание» в карточки ломает сравнение цен.
 */
export function VariantMatrix({ product }: { product: HtProduct }) {
  const { customer, isRecalculating } = useCustomer()
  const { quantities, setQuantity } = useOrderDraft()
  const [openTiers, setOpenTiers] = useState<string | null>(null)

  const isLoading = customer.state === 'loading'
  const isB2B = customer.state === 'b2b'
  const locked = isLoading || isRecalculating

  return (
    <section aria-labelledby="matrix-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h2 id="matrix-heading" className="font-display text-[19px] font-semibold">
            Матрица фасовок
          </h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
            Наберите заявку из нескольких фасовок — цена по сетке и логистика считаются на всю партию.
          </p>
        </div>
        {isB2B && customer.state === 'b2b' && (
          <p className="ht-numeric text-[12.5px] text-muted-foreground">
            {customer.price_list_name}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-panel">
        <div className="ht-scroll-x">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <caption className="sr-only">
              Фасовки товара {product.title}: наличие, срок производства, цена и количество
            </caption>
            <thead>
              <tr className="bg-muted/60">
                {COLUMNS.map((column, index) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      'whitespace-nowrap border-b border-border px-4 py-3 text-[12.5px] font-medium text-muted-foreground',
                      column.align === 'right' && 'text-right',
                      column.align === 'center' && 'text-center',
                      index === 0 && 'sticky left-0 z-20 bg-[#f5f5f6] pl-5',
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {product.variants.map((variant) => {
                const quantity = quantities[variant.id] ?? 0
                const tier = resolveTier(variant, quantity, isB2B)
                const unitAmount = isB2B ? tier.amount : variant.calculated_price.calculated_amount
                const lineTotal = unitAmount * quantity
                const inventory = INVENTORY[variant.inventory_state]
                const belowMoq = quantity > 0 && quantity < variant.min_order_quantity
                const tiersOpen = openTiers === variant.id
                // следующая выгодная ступень: подсказка «доберите до …», а не просто следующая строка сетки
                const nextTier = variant.price_tiers.find(
                  (t) => t.min_quantity > quantity && t.discount_percent > tier.discount_percent,
                )

                return (
                  <Fragment key={variant.id}>
                    <tr
                      className={cn(
                        'border-b border-border transition-colors duration-200 last:border-b-0',
                        quantity > 0 && 'bg-primary-soft/40',
                      )}
                    >
                      {/* Артикул — залипающая колонка */}
                      <th
                        scope="row"
                        className={cn(
                          'sticky left-0 z-10 h-[92px] min-w-[220px] border-r border-border/60 px-5 py-4 text-left align-middle font-normal',
                          quantity > 0 ? 'bg-[#fdf7f9]' : 'bg-card',
                        )}
                      >
                        <span className="ht-numeric block text-[12.5px] text-muted-foreground">
                          {variant.sku}
                        </span>
                        <span className="mt-0.5 block text-[14.5px] font-semibold tracking-[-0.01em]">
                          {variant.metadata.packaging}
                        </span>
                        <span className="ht-numeric mt-0.5 block text-[12px] text-muted-foreground">
                          {variant.metadata.grade} · MOQ {variant.min_order_quantity} ед.
                        </span>
                      </th>

                      <td className="whitespace-nowrap px-4 py-4 align-middle">
                        <span className="flex items-center gap-2 text-[13.5px]">
                          <span
                            className={cn('size-1.5 shrink-0 rounded-full', inventory.tone)}
                            aria-hidden="true"
                          />
                          {inventory.label}
                        </span>
                        <span className="ht-numeric mt-0.5 block pl-[14px] text-[12px] text-muted-foreground">
                          {variant.inventory_quantity > 0
                            ? `${formatInteger(variant.inventory_quantity)} ед.`
                            : 'производство под заявку'}
                        </span>
                      </td>

                      <td className="ht-numeric whitespace-nowrap px-4 py-4 align-middle text-[13.5px]">
                        {variant.metadata.lead_time_days} дней
                      </td>

                      <td className="ht-numeric whitespace-nowrap px-4 py-4 text-right align-middle">
                        {isLoading ? (
                          <span className="ml-auto block h-4 w-20 animate-pulse rounded bg-muted" />
                        ) : (
                          <span
                            className={cn(
                              'text-[13.5px]',
                              unitAmount < variant.calculated_price.original_amount
                                ? 'text-muted-foreground line-through'
                                : 'text-muted-foreground',
                            )}
                          >
                            {formatAmount(variant.calculated_price.original_amount)}
                          </span>
                        )}
                      </td>

                      {/* Ваша цена: высота зафиксирована под skeleton / guest / b2b */}
                      <td className="whitespace-nowrap px-4 py-4 text-right align-middle">
                        <div className="flex min-h-[42px] flex-col items-end justify-center">
                          {isLoading ? (
                            <>
                              <span className="h-5 w-24 animate-pulse rounded bg-muted" />
                              <span className="mt-1.5 h-3 w-16 animate-pulse rounded bg-muted" />
                            </>
                          ) : !isB2B ? (
                            <>
                              <span className="ht-numeric text-[15px] font-semibold tracking-[-0.01em] text-muted-foreground">
                                по запросу
                              </span>
                              <span className="mt-0.5 text-[12px] text-muted-foreground">
                                войдите в B2B-аккаунт
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="ht-numeric font-display text-[16px] font-semibold tracking-[-0.015em]">
                                {formatAmount(unitAmount)}
                              </span>
                              {tier.discount_percent > 0 ? (
                                <span className="ht-numeric mt-0.5 text-[12px] font-medium text-success">
                                  −{tier.discount_percent}% · уровень от {tier.min_quantity} ед.
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  aria-expanded={tiersOpen}
                                  onClick={() => setOpenTiers(tiersOpen ? null : variant.id)}
                                  className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-muted-foreground transition-colors duration-150 hover:text-primary"
                                >
                                  базовый уровень
                                  <ChevronDown
                                    className={cn(
                                      'size-3 transition-transform duration-200 ease-out',
                                      tiersOpen && 'rotate-180',
                                    )}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                  />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 align-middle">
                        <div className="flex min-h-[58px] flex-col items-center justify-center gap-1">
                          {isLoading ? (
                            <span className="h-10 w-[132px] animate-pulse rounded-lg bg-muted" />
                          ) : (
                            <>
                              <QuantityStepper
                                value={quantity}
                                min={variant.min_order_quantity}
                                step={variant.order_step}
                                disabled={locked}
                                label={variant.sku}
                                onChange={(next) => setQuantity(variant.id, next)}
                              />
                              <span
                                className={cn(
                                  'ht-numeric text-[11.5px]',
                                  belowMoq ? 'font-medium text-primary' : 'text-muted-foreground',
                                )}
                              >
                                {belowMoq
                                  ? `минимум ${variant.min_order_quantity} ед.`
                                  : isB2B && nextTier
                                    ? `от ${nextTier.min_quantity} ед. → −${nextTier.discount_percent}%`
                                    : `шаг ${variant.order_step} ед.`}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="ht-numeric whitespace-nowrap px-4 py-4 pr-5 text-right align-middle">
                        {quantity > 0 && !isLoading ? (
                          <>
                            <span className="font-display text-[15.5px] font-semibold tracking-[-0.015em]">
                              {formatAmount(lineTotal)}
                            </span>
                            <span className="mt-0.5 block text-[12px] text-muted-foreground">
                              {formatDecimal(variant.metadata.net_weight_kg * quantity, 0)} кг нетто
                            </span>
                          </>
                        ) : (
                          <span className="text-[14px] text-muted-foreground/60" aria-label="не выбрано">
                            —
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Оптовая сетка строки — раскрывается по запросу, чтобы таблица оставалась читаемой */}
                    {tiersOpen && isB2B && (
                      <tr className="border-b border-border last:border-b-0">
                        <th
                          scope="row"
                          className="sticky left-0 z-10 border-r border-border/60 bg-muted/40 px-5 py-3 text-left text-[12px] font-medium text-muted-foreground"
                        >
                          Оптовая сетка
                        </th>
                        <td colSpan={6} className="bg-muted/40 px-4 py-3">
                          <ul className="flex flex-wrap gap-2">
                            {variant.price_tiers.map((t) => {
                              const active = t.min_quantity === tier.min_quantity && quantity > 0
                              return (
                                <li
                                  key={t.min_quantity}
                                  className={cn(
                                    'ht-numeric rounded-lg border px-2.5 py-1.5 text-[12.5px] transition-colors duration-150',
                                    active
                                      ? 'border-primary/40 bg-card font-semibold text-primary'
                                      : 'border-border bg-card text-muted-foreground',
                                  )}
                                >
                                  {formatTierRange(t.min_quantity, t.max_quantity)} ед.
                                  <span className="mx-1.5 text-border">|</span>
                                  {formatAmount(t.amount)}
                                </li>
                              )
                            })}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
