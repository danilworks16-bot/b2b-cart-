'use client'

import { Building2, ArrowDown, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatAmount } from '@/lib/b2b/format'
import type { HtProduct } from '@/lib/b2b/types'
import { useCustomer } from './customer-context'
import { useOrderDraft } from './order-draft-context'
import { VariantRow } from './variant-row'

export function PurchasePanel({ product }: { product: HtProduct }) {
  const { customer, isRecalculating } = useCustomer()
  const { quantities, draft, setQuantity } = useOrderDraft()

  const isLoading = customer.state === 'loading'
  const isGuest = customer.state === 'guest'
  const isB2B = customer.state === 'b2b'
  const locked = isLoading || isRecalculating

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
            onQuantityChange={(next) => setQuantity(variant.id, next)}
          />
        ))}
      </div>

      {/* Мост к расчёту заявки: итог и действие живут в одном месте — в OrderBuilder */}
      <div className="min-h-[92px]">
        <div
          className={cn(
            'flex items-center gap-4 rounded-xl border p-4 transition-colors duration-200',
            draft.lines_count > 0 ? 'border-border bg-muted/50' : 'border-dashed border-input',
          )}
        >
          <dl className="ht-numeric min-w-0 flex-1">
            <dt className="text-[12.5px] text-muted-foreground">
              {draft.lines_count > 0
                ? `В заявке ${draft.lines_count} из ${draft.variants_count} позиций`
                : 'Заявка пока пуста'}
            </dt>
            <dd className="mt-0.5 font-display text-[18px] font-semibold tracking-[-0.02em]">
              {isLoading ? (
                <span className="block h-5 w-24 animate-pulse rounded bg-muted" />
              ) : (
                formatAmount(draft.total)
              )}
            </dd>
          </dl>

          <Button
            variant="outline"
            size="sm"
            disabled={locked}
            onClick={() =>
              document
                .getElementById('order-builder')
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            className="shrink-0 bg-transparent text-[13px] font-medium"
          >
            {isRecalculating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                Пересчёт…
              </>
            ) : (
              <>
                К расчёту
                <ArrowDown className="size-3.5" strokeWidth={2} aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Button
          variant="outline"
          size="lg"
          disabled={locked}
          className="h-11 w-full bg-transparent text-[14px] font-medium"
        >
          Получить образец и TDS
        </Button>

        <p className="text-pretty text-[12px] leading-relaxed text-muted-foreground">
          {isGuest
            ? 'Гостевой доступ: цены по запросу. Полная сетка и лимиты открываются после входа в B2B-аккаунт.'
            : product.metadata.commercial_terms}
        </p>
      </div>
    </section>
  )
}
