'use client'

import { Building2, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatAmount } from '@/lib/b2b/format'
import type { HtCustomerCtx, HtProduct } from '@/lib/b2b/types'
import { TierGrid } from './tier-grid'
import { VariantRow } from './variant-row'

/**
 * Правая колонка карточки: заголовок, контекст компании, строки вариантов
 * и одна общая оптовая сетка.
 *
 * Суммы и действия живут в `OrderSummary` / `StickyOrderBar`, поэтому здесь
 * нет ни одного собственного расчёта — состояние поднято в `OrderBuilder`.
 */
export function PurchasePanel({
  product,
  customer,
  quantities,
  locked,
  onQuantityChange,
}: {
  product: HtProduct
  customer: HtCustomerCtx
  quantities: Record<string, number>
  locked: boolean
  onQuantityChange: (variantId: string, next: number) => void
}) {
  const isLoading = customer.state === 'loading'
  const isB2B = customer.state === 'b2b'

  const basePrice = Math.min(...product.variants.map((v) => v.calculated_price.calculated_amount))

  return (
    <section aria-labelledby="purchase-heading" className="flex flex-col gap-5">
      {/* Заголовок и базовая цена */}
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-primary-soft px-2 py-1 text-[11.5px] font-semibold uppercase tracking-wide text-primary">
          B2B-карточка товара
        </span>

        <h1
          id="purchase-heading"
          className="mt-3 text-balance font-display text-[27px] font-semibold leading-[1.15] sm:text-[31px]"
        >
          {product.title}
        </h1>

        <p className="mt-2 text-pretty text-[14px] leading-relaxed text-muted-foreground">
          {product.subtitle}
        </p>

        {/* Блок цены: min-height зафиксирована под все три состояния */}
        <div className="mt-5 flex min-h-[62px] flex-col justify-center">
          {isLoading ? (
            <>
              <span className="h-8 w-40 animate-pulse rounded-md bg-muted" />
              <span className="mt-2 h-3.5 w-24 animate-pulse rounded bg-muted" />
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-medium text-muted-foreground">От</span>
                <span className="ht-numeric font-display text-[30px] font-semibold leading-none tracking-tight">
                  {formatAmount(basePrice)}
                </span>
              </div>
              <p className="mt-2 text-[12px] text-muted-foreground">
                {customer.state === 'b2b'
                  ? `${customer.price_list_name} · без НДС`
                  : 'Базовая каталожная цена, без НДС'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Контекст компании / приглашение авторизоваться */}
      <div className="min-h-[58px]">
        {isLoading ? (
          <div className="h-[58px] animate-pulse rounded-xl bg-muted" />
        ) : customer.state === 'b2b' ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-3.5 py-3">
            <Building2 className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{customer.company.name}</p>
              <p className="ht-numeric text-[12px] text-muted-foreground">
                Лимит: {formatAmount(customer.employee.spent)} из{' '}
                {formatAmount(customer.employee.spending_limit)}
              </p>
            </div>
            {customer.company.requires_admin_approval && (
              <span className="hidden shrink-0 items-center gap-1 rounded-md bg-card px-2 py-1 text-[11px] font-medium text-muted-foreground sm:inline-flex">
                <ShieldCheck className="size-3" strokeWidth={2} aria-hidden="true" />
                Согласование
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-input px-3.5 py-3">
            <Lock className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
            <p className="flex-1 text-[13px] leading-snug text-muted-foreground">
              Оптовые цены и сетка от объёма доступны после входа в B2B-аккаунт.
            </p>
            <Button variant="outline" size="sm" className="shrink-0 bg-transparent">
              Войти
            </Button>
          </div>
        )}
      </div>

      {/* Варианты */}
      <div className="flex flex-col gap-2.5">
        {product.variants.map((variant) => (
          <VariantRow
            key={variant.id}
            variant={variant}
            customer={customer}
            locked={locked}
            quantity={quantities[variant.id] ?? 0}
            onQuantityChange={(next) => onQuantityChange(variant.id, next)}
          />
        ))}
      </div>

      {/* Одна общая оптовая сетка на всю карточку */}
      <TierGrid variants={product.variants} quantities={quantities} isB2B={isB2B} />

      <Button
        variant="outline"
        size="lg"
        disabled={locked}
        className="h-11 w-full bg-transparent text-[14px] font-medium"
      >
        Получить образец и TDS
      </Button>

      <p className="text-pretty text-[12px] leading-relaxed text-muted-foreground">
        {product.metadata.commercial_terms}
      </p>
    </section>
  )
}
