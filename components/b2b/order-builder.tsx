'use client'

import { AlertTriangle, Check, Container, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatAmount, formatDecimal, formatInteger } from '@/lib/b2b/format'
import { CONTAINER_20FT } from '@/lib/b2b/logistics'
import { useCustomer } from './customer-context'
import { useOrderDraft } from './order-draft-context'

/**
 * Панель расчёта заявки: логистика партии, загрузка контейнера,
 * лимит сотрудника и итог по сетке цен.
 *
 * Высоты всех трёх колонок зафиксированы (`min-h`), поэтому переход
 * skeleton → guest → b2b и появление статус-баннера не сдвигают страницу.
 * Кнопка действия — единственная точка входа в `addToCart` / approval flow.
 */
export function OrderBuilder() {
  const { customer, isRecalculating } = useCustomer()
  const { draft, reset } = useOrderDraft()

  const isLoading = customer.state === 'loading'
  const isGuest = customer.state === 'guest'
  const isB2B = customer.state === 'b2b'
  const locked = isLoading || isRecalculating

  const containerPercent = Math.round(draft.container_load * 100)
  // маленькая партия не должна читаться как «контейнер пустой»
  const containerLabel =
    draft.container_load > 0 && containerPercent === 0 ? '<1%' : `${containerPercent}%`
  const containerBarWidth = draft.container_load > 0 ? Math.max(containerPercent, 1.5) : 0
  const limitPercent =
    draft.limit_available && draft.limit_available > 0
      ? Math.min((draft.total / draft.limit_available) * 100, 100)
      : 0

  const metrics = [
    {
      label: 'Позиций в заявке',
      value: `${draft.lines_count} из ${draft.variants_count}`,
    },
    { label: 'Единиц фасовки', value: formatInteger(draft.units) },
    {
      label: 'Вес нетто / брутто',
      value: `${formatInteger(draft.net_weight_kg)} / ${formatDecimal(draft.gross_weight_kg, 1)} кг`,
    },
    { label: 'Объём партии', value: `${formatDecimal(draft.volume_m3, 2)} м³` },
    { label: 'Паллетомест', value: formatInteger(draft.pallets) },
    {
      label: 'Готовность партии',
      value: draft.lead_time_days > 0 ? `${draft.lead_time_days} дней` : '—',
    },
  ]

  return (
    <section
      aria-labelledby="order-builder-heading"
      aria-live="polite"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-panel"
    >
      <h2 id="order-builder-heading" className="sr-only">
        Расчёт заявки
      </h2>

      <div className="grid divide-border lg:grid-cols-[minmax(0,322px)_minmax(0,1fr)_minmax(0,428px)] lg:divide-x">
        {/* 1 — логистика партии */}
        <dl className="px-6 py-5">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={cn(
                'flex items-baseline justify-between gap-4 py-2.5',
                index < metrics.length - 1 && 'border-b border-border/70',
              )}
            >
              <dt className="text-[13px] leading-snug text-muted-foreground">{metric.label}</dt>
              <dd className="ht-numeric whitespace-nowrap text-right text-[14.5px] font-semibold tracking-[-0.01em]">
                {isLoading ? (
                  <span className="block h-4 w-16 animate-pulse rounded bg-muted" />
                ) : (
                  metric.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        {/* 2 — контейнер и лимит: две шкалы, которые определяют себестоимость */}
        <div className="flex flex-col gap-5 border-t border-border px-6 py-6 lg:border-t-0">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-[13.5px] font-medium">
                <Container className="size-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                Загрузка {CONTAINER_20FT.label}
              </span>
              <span className="ht-numeric text-[13.5px] font-semibold">{containerLabel}</span>
            </div>
            <div
              role="progressbar"
              aria-label={`Загрузка контейнера ${CONTAINER_20FT.label}`}
              aria-valuenow={containerPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <span
                className="block h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                style={{ width: `${containerBarWidth}%` }}
              />
            </div>
            <p className="mt-2.5 text-pretty text-[12.5px] leading-relaxed text-muted-foreground">
              Контейнер: {CONTAINER_20FT.volume_m3} м³ / {formatInteger(CONTAINER_20FT.payload_kg)} кг.
              {draft.container_load > 0
                ? draft.container_limiter === 'weight'
                  ? ' Ограничение по грузоподъёмности — добавьте лёгкие артикулы.'
                  : ' Догруз совместимыми артикулами снижает ставку фрахта на единицу.'
                : ' Догруз совместимыми артикулами снижает ставку фрахта на единицу.'}
            </p>
          </div>

          <div className="min-h-[74px]">
            {isB2B && customer.state === 'b2b' && draft.limit_available !== null ? (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] text-muted-foreground">
                    Лимит закупки сотрудника
                  </span>
                  <span className="ht-numeric text-right text-[13px] font-medium">
                    {formatAmount(draft.limit_available)} доступно
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Использование лимита закупки"
                  aria-valuenow={Math.round(limitPercent)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                >
                  <span
                    className={cn(
                      'block h-full rounded-full transition-[width,background-color] duration-300 ease-out',
                      draft.over_limit ? 'bg-warning' : 'bg-foreground',
                    )}
                    style={{ width: `${draft.over_limit ? 100 : limitPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground">
                  Период сброса:{' '}
                  {customer.company.spending_limit_reset_frequency === 'monthly'
                    ? 'ежемесячно'
                    : 'без сброса'}
                </p>
              </>
            ) : isLoading ? (
              <div className="h-[74px] animate-pulse rounded-xl bg-muted" />
            ) : (
              <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                Лимиты закупки, оптовая сетка и паллетная логистика показываются после входа в
                B2B-аккаунт компании.
              </p>
            )}
          </div>
        </div>

        {/* 3 — итог и действие */}
        <div className="flex flex-col gap-4 border-t border-border px-6 py-6 lg:border-t-0">
          <div className="flex min-h-[62px] flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="text-[15px] font-medium">Итого без НДС</span>
            <div className="text-right">
              {isLoading ? (
                <span className="block h-8 w-40 animate-pulse rounded-md bg-muted" />
              ) : isGuest ? (
                <span className="block font-display text-[22px] font-semibold leading-none tracking-[-0.02em] text-muted-foreground">
                  по запросу
                </span>
              ) : (
                <span className="ht-numeric block font-display text-[30px] font-semibold leading-none tracking-[-0.03em]">
                  {formatAmount(draft.total)}
                </span>
              )}
              <span
                className={cn(
                  'ht-numeric mt-1.5 block text-[12.5px]',
                  !isGuest && draft.savings > 0 ? 'font-medium text-success' : 'text-muted-foreground',
                )}
              >
                {isGuest
                  ? 'цену подтверждает менеджер в котировке'
                  : draft.savings > 0
                    ? `экономия по сетке ${formatAmount(draft.savings)}`
                    : 'скидка появится с первого уровня сетки'}
              </span>
            </div>
          </div>

          {/* Статус-баннер: высота зарезервирована под самый длинный текст */}
          <div className="min-h-[68px]">
            {isLoading ? (
              <div className="h-[68px] animate-pulse rounded-xl bg-muted" />
            ) : isGuest ? (
              <p className="flex min-h-[68px] items-center rounded-xl bg-muted/60 px-3.5 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
                {draft.lines_count > 0
                  ? 'Заявка уйдёт в котировку: менеджер подтвердит цены, MOQ и логистику по вашему региону.'
                  : 'Наберите позиции — заявка уйдёт в котировку, цены подтвердит менеджер.'}
              </p>
            ) : draft.status === 'below_moq' ? (
              <StatusBanner tone="warning">
                Ниже MOQ: {draft.moq_violations.join(', ')}. Увеличьте количество, иначе строка
                уйдёт в котировку, а не в заказ.
              </StatusBanner>
            ) : draft.status === 'needs_approval' && draft.limit_available !== null ? (
              <StatusBanner tone="warning">
                Сумма превышает ваш лимит {formatAmount(draft.limit_available)} — заявка уйдёт на
                согласование администратору компании.
              </StatusBanner>
            ) : draft.status === 'ready' ? (
              <StatusBanner tone="success">
                Условия соблюдены: MOQ, лимит и срок производства подтверждаются при оформлении.
              </StatusBanner>
            ) : (
              <p className="flex min-h-[68px] items-center text-[13px] leading-relaxed text-muted-foreground">
                Укажите количество в матрице фасовок — расчёт партии, скидка по сетке и загрузка
                контейнера обновятся сразу.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <Button
              size="lg"
              disabled={locked || draft.lines_count === 0}
              className="h-12 w-full text-[15px] font-semibold transition-transform duration-100 ease-out active:scale-[0.99]"
            >
              {isRecalculating ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Пересчёт цен…
                </>
              ) : isGuest ? (
                'Запросить котировку'
              ) : draft.status === 'needs_approval' ? (
                'Отправить на согласование'
              ) : (
                'Добавить в заявку'
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                disabled={locked}
                className="h-11 flex-1 bg-transparent text-[14px] font-medium"
              >
                {isGuest ? 'Войти в B2B-аккаунт' : 'Запросить котировку'}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                disabled={locked || draft.lines_count === 0}
                onClick={reset}
                className="h-11 text-[14px] font-medium text-muted-foreground"
              >
                Очистить
              </Button>
            </div>
          </div>

          <p className="flex items-start gap-2 text-pretty text-[12px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-px size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            Финальные логистика, скидка и пакет документов подтверждаются в котировке менеджера.
          </p>
        </div>
      </div>
    </section>
  )
}

function StatusBanner({
  tone,
  children,
}: {
  tone: 'success' | 'warning'
  children: React.ReactNode
}) {
  const Icon = tone === 'success' ? Check : AlertTriangle

  return (
    <p
      className={cn(
        'flex min-h-[68px] items-center gap-2.5 rounded-xl px-3.5 py-3 text-[12.5px] leading-relaxed',
        tone === 'success' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning',
      )}
    >
      <Icon className="mt-px size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
      <span className="text-pretty">{children}</span>
    </p>
  )
}
