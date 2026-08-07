'use client'

import { useMemo, useState } from 'react'
import { Building2, Loader2, Lock, ShieldCheck, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatAmount } from '@/lib/b2b/format'
import type { HtProduct } from '@/lib/b2b/types'
import { useCustomer } from './customer-context'
import { VariantRow } from './variant-row'

export function PurchasePanel({ product }: { product: HtProduct }) {
  const { customer, isRecalculating } = useCustomer()
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const isLoading = customer.state === 'loading'
  const isGuest = customer.state === 'guest'
  const isB2B = customer.state === 'b2b'
  const locked = isLoading || isRecalculating

  const summary = useMemo(() => {
    let lines = 0
    let units = 0
    let total = 0
    let netWeight = 0

    for (const variant of product.variants) {
      const quantity = quantities[variant.id] ?? 0
      if (quantity <= 0) continue

      const tier =
        isB2B
          ? [...variant.price_tiers].reverse().find((t) => quantity >= t.min_quantity) ??
            variant.price_tiers[0]
          : variant.price_tiers[0]

      lines += 1
      units += quantity
      total += tier.amount * quantity
      netWeight += variant.metadata.net_weight_kg * quantity
    }

    return { lines, units, total, netWeight }
  }, [quantities, product.variants, isB2B])

  const overLimit =
    isB2B && customer.state === 'b2b'
      ? customer.employee.spent + summary.total > customer.employee.spending_limit
      : false

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
                {isB2B && customer.state === 'b2b'
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
        ) : isB2B && customer.state === 'b2b' ? (
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
            onQuantityChange={(next) =>
              setQuantities((prev) => ({ ...prev, [variant.id]: next }))
            }
          />
        ))}
      </div>

      {/* Итог заявки: высота зарезервирована, поэтому появление не сдвигает страницу */}
      <div className="min-h-[112px]">
        <div
          className={cn(
            'rounded-xl border p-4 transition-colors duration-200',
            summary.lines > 0 ? 'border-border bg-muted/50' : 'border-dashed border-input',
          )}
        >
          <dl className="ht-numeric grid grid-cols-3 gap-3 text-[12.5px]">
            <div>
              <dt className="text-muted-foreground">Позиций</dt>
              <dd className="mt-0.5 font-display text-[15px] font-semibold">{summary.lines}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Нетто</dt>
              <dd className="mt-0.5 font-display text-[15px] font-semibold">
                {summary.netWeight} кг
              </dd>
            </div>
            <div className="text-right">
              <dt className="text-muted-foreground">Сумма</dt>
              <dd className="mt-0.5 font-display text-[15px] font-semibold">
                {summary.total > 0 ? formatAmount(summary.total) : '—'}
              </dd>
            </div>
          </dl>

          {overLimit && (
            <p className="mt-3 rounded-lg bg-primary-soft px-2.5 py-2 text-[12px] leading-snug text-primary">
              Сумма превышает лимит сотрудника — заявка уйдёт на согласование администратору компании.
            </p>
          )}
        </div>
      </div>

      {/* Действия */}
      <div className="flex flex-col gap-2.5">
        <Button
          size="lg"
          disabled={locked || summary.lines === 0}
          className="h-11 w-full text-[14px] font-semibold transition-transform duration-100 ease-out active:scale-[0.99]"
        >
          {isRecalculating ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Пересчёт цен…
            </>
          ) : (
            <>
              <ShoppingCart className="size-4" strokeWidth={2} aria-hidden="true" />
              {isGuest ? 'Запросить котировку' : 'Добавить в заявку'}
            </>
          )}
        </Button>

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
      </div>
    </section>
  )
}
