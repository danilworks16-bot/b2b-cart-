'use client'

import { Check, Container, Loader2, ShieldCheck, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatAmount } from '@/lib/b2b/format'
import {
  CONTAINERS,
  calcContainerLoad,
  formatKg,
  formatM3,
  type HtContainerCode,
} from '@/lib/b2b/container'
import type { HtOrderSummary } from '@/lib/b2b/summary'
import type { HtCustomerCtx } from '@/lib/b2b/types'

const CONTAINER_CODES = Object.keys(CONTAINERS) as HtContainerCode[]

/**
 * Итог заявки: метрики партии · загрузка контейнера · сумма и действия.
 *
 * Desktop — три колонки с вертикальными разделителями.
 * Mobile — вертикальный стек, порядок сохранён (сначала цифры, потом деньги).
 */
export function OrderSummary({
  summary,
  customer,
  container,
  onContainerChange,
  onClear,
  isRecalculating,
  className,
}: {
  summary: HtOrderSummary
  customer: HtCustomerCtx
  container: HtContainerCode
  onContainerChange: (next: HtContainerCode) => void
  onClear: () => void
  isRecalculating: boolean
  className?: string
}) {
  const isLoading = customer.state === 'loading'
  const isGuest = customer.state === 'guest'
  const locked = isLoading || isRecalculating
  const isEmpty = summary.lines === 0

  const load = calcContainerLoad(summary.volumeM3, summary.grossWeightKg, container)

  const overLimit =
    customer.state === 'b2b' &&
    customer.employee.spent + summary.total > customer.employee.spending_limit

  const metrics = [
    { label: 'Позиций в заявке', value: `${summary.lines} из ${summary.totalLines}` },
    { label: 'Единиц фасовки', value: summary.units > 0 ? `${summary.units}` : '—' },
    {
      label: 'Вес нетто / брутто',
      value: isEmpty
        ? '—'
        : `${new Intl.NumberFormat('ru-RU').format(summary.netWeightKg)} / ${formatKg(
            summary.grossWeightKg,
          )}`,
    },
    { label: 'Объём партии', value: isEmpty ? '—' : formatM3(summary.volumeM3) },
  ]

  return (
    <section
      aria-labelledby="ht-summary-heading"
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-card shadow-panel',
        className,
      )}
    >
      <h2 id="ht-summary-heading" className="sr-only">
        Итог заявки
      </h2>

      <div className="flex flex-col divide-y divide-border lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1.15fr)] lg:divide-x lg:divide-y-0">
        {/* 1 — метрики партии */}
        <dl className="flex flex-col px-5 py-4 sm:px-6 sm:py-5">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={cn(
                'flex items-baseline justify-between gap-4 py-2.5',
                index > 0 && 'border-t border-border/70',
              )}
            >
              <dt className="text-[13px] text-muted-foreground">{metric.label}</dt>
              <dd className="ht-numeric text-right text-[14px] font-semibold tracking-tight">
                {isLoading ? (
                  <span className="block h-4 w-16 animate-pulse rounded bg-muted" />
                ) : (
                  metric.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        {/* 2 — загрузка контейнера */}
        <div className="flex flex-col gap-3 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[13.5px] font-medium">
              <Container className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
              Загрузка контейнера
            </span>
            <div role="group" aria-label="Тип контейнера" className="flex rounded-lg bg-secondary p-0.5">
              {CONTAINER_CODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  aria-pressed={container === code}
                  onClick={() => onContainerChange(code)}
                  className={cn(
                    'ht-numeric rounded-[7px] px-2.5 py-1 text-[12px] font-medium transition-colors duration-150',
                    container === code
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {CONTAINERS[code].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="ht-numeric text-[12px] text-muted-foreground">
                {formatM3(load.spec.volume_m3)} / {formatKg(load.spec.payload_kg, 0)}
              </span>
              <span className="ht-numeric text-[13px] font-semibold">{load.percent}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Заполнение контейнера"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={load.percent}
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                style={{ width: `${Math.min(100, load.percent)}%` }}
              />
            </div>
          </div>

          <p className="text-pretty text-[12.5px] leading-relaxed text-muted-foreground">
            {isEmpty
              ? 'Наберите позиции — покажем, какую часть контейнера занимает партия.'
              : load.limitedBy === 'weight'
                ? 'Ограничение по массе. Догруз лёгкими артикулами снижает ставку фрахта на единицу.'
                : 'Ограничение по объёму. Догруз плотными артикулами снижает ставку фрахта на единицу.'}
          </p>
        </div>

        {/* 3 — сумма и действия */}
        <div className="flex flex-col gap-3.5 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <span className="text-[13px] font-medium text-muted-foreground sm:text-[14px] sm:text-foreground">
              Итого без НДС
            </span>
            {isLoading ? (
              <span className="h-8 w-36 animate-pulse rounded-md bg-muted" />
            ) : (
              <span className="ht-numeric font-display text-[26px] font-semibold leading-none tracking-tight sm:text-[30px]">
                {isEmpty ? '—' : formatAmount(summary.total)}
              </span>
            )}
          </div>

          <div className="min-h-[64px]">
            {overLimit ? (
              <p className="flex items-start gap-2 rounded-xl bg-primary-soft px-3 py-2.5 text-[12.5px] leading-relaxed text-primary">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                Сумма превышает лимит сотрудника — заявка уйдёт на согласование администратору компании.
              </p>
            ) : !isEmpty && !isGuest ? (
              <p className="flex items-start gap-2 rounded-xl bg-success-soft px-3 py-2.5 text-[12.5px] leading-relaxed text-success">
                <Check className="mt-0.5 size-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
                Условия соблюдены: MOQ, лимит и срок производства подтверждаются при оформлении.
              </p>
            ) : (
              <p className="text-pretty px-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                {isGuest
                  ? 'Войдите в B2B-аккаунт, чтобы увидеть оптовые цены и оформить заявку.'
                  : 'Добавьте позиции, чтобы увидеть сумму заявки.'}
              </p>
            )}
          </div>

          <Button
            size="lg"
            disabled={locked || isEmpty}
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

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              size="lg"
              disabled={locked}
              className="h-11 flex-1 bg-transparent text-[14px] font-medium"
            >
              Запросить котировку
            </Button>
            <Button
              variant="ghost"
              size="lg"
              disabled={locked || isEmpty}
              onClick={onClear}
              className="h-11 text-[14px] font-medium text-muted-foreground sm:w-auto sm:px-4"
            >
              Очистить
            </Button>
          </div>

          <p className="flex items-start gap-2 text-pretty text-[12px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            Финальные логистика, скидка и пакет документов подтверждаются в котировке менеджера.
          </p>
        </div>
      </div>
    </section>
  )
}
