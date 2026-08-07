'use client'

import { useEffect, useRef, useState } from 'react'
import { Container, Loader2, ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatAmount } from '@/lib/b2b/format'
import { calcContainerLoad, formatM3, type HtContainerCode } from '@/lib/b2b/container'
import type { HtOrderSummary } from '@/lib/b2b/summary'
import type { HtCustomerCtx } from '@/lib/b2b/types'

/**
 * Прилипающая панель заявки.
 * Показывается только когда статичный блок итога ушёл из вьюпорта и в заявке
 * есть позиции — иначе на мобильном она перекрывает контент без пользы.
 *
 * Mobile: строка «Итого + Добавить», деталь раскрывается вверх.
 * Desktop: одна строка с метриками и действиями.
 */
export function StickyOrderBar({
  summary,
  customer,
  container,
  isRecalculating,
  anchorRef,
}: {
  summary: HtOrderSummary
  customer: HtCustomerCtx
  container: HtContainerCode
  isRecalculating: boolean
  anchorRef: React.RefObject<HTMLDivElement | null>
}) {
  const [pinned, setPinned] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const detailsId = useRef('ht-sticky-details').current

  useEffect(() => {
    const node = anchorRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // прилипаем, когда якорь (статичный блок итога) выше вьюпорта
        setPinned(!entry.isIntersecting && entry.boundingClientRect.top < 0)
      },
      { threshold: 0 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [anchorRef])

  const isEmpty = summary.lines === 0
  const isGuest = customer.state === 'guest'
  const locked = customer.state === 'loading' || isRecalculating
  const visible = pinned && !isEmpty
  const load = calcContainerLoad(summary.volumeM3, summary.grossWeightKg, container)

  useEffect(() => {
    if (!visible) setDetailsOpen(false)
  }, [visible])

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md transition-[transform,opacity] duration-300 ease-out',
        'shadow-[0_-8px_24px_-16px_rgb(22_22_26/0.25)]',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0',
      )}
    >
      {/* Раскрытая деталь — только мобильный */}
      {detailsOpen && (
        <dl
          id={detailsId}
          className="ht-numeric animate-in slide-in-from-bottom-2 mx-auto grid max-w-[1160px] grid-cols-2 gap-x-4 gap-y-2 border-b border-border px-4 py-3 text-[12.5px] duration-200 ease-out sm:hidden"
        >
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Позиций</dt>
            <dd className="font-medium">
              {summary.lines} из {summary.totalLines}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Единиц</dt>
            <dd className="font-medium">{summary.units}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Брутто</dt>
            <dd className="font-medium">{Math.round(summary.grossWeightKg)} кг</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Объём</dt>
            <dd className="font-medium">{formatM3(summary.volumeM3)}</dd>
          </div>
          <div className="col-span-2 flex justify-between gap-2 border-t border-border/70 pt-2">
            <dt className="text-muted-foreground">Загрузка {load.spec.label}</dt>
            <dd className="font-medium">{load.percent}%</dd>
          </div>
        </dl>
      )}

      <div className="mx-auto flex max-w-[1160px] items-center gap-3 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:gap-5 sm:py-3">
        {/* Метрики — desktop */}
        <dl className="ht-numeric hidden shrink-0 items-center gap-5 text-[12.5px] sm:flex">
          <div>
            <dt className="text-muted-foreground">Позиций</dt>
            <dd className="font-semibold">
              {summary.lines} из {summary.totalLines}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Брутто</dt>
            <dd className="font-semibold">{Math.round(summary.grossWeightKg)} кг</dd>
          </div>
          <div className="hidden lg:block">
            <dt className="flex items-center gap-1 text-muted-foreground">
              <Container className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
              {load.spec.label}
            </dt>
            <dd className="font-semibold">{load.percent}%</dd>
          </div>
        </dl>

        {/* Итого — мобильный тап открывает деталь */}
        <button
          type="button"
          onClick={() => setDetailsOpen((value) => !value)}
          aria-expanded={detailsOpen}
          aria-controls={detailsId}
          className="ht-numeric flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left sm:pointer-events-none sm:justify-end"
        >
          <span className="hidden text-[12.5px] text-muted-foreground sm:inline">Итого без НДС</span>
          <span className="font-display truncate text-[18px] font-semibold tracking-tight sm:text-[20px]">
            {formatAmount(summary.total)}
          </span>
          {detailsOpen ? (
            <X className="size-4 shrink-0 text-muted-foreground sm:hidden" strokeWidth={2} aria-hidden="true" />
          ) : (
            <span className="shrink-0 text-[11.5px] text-muted-foreground sm:hidden">детали</span>
          )}
        </button>

        <Button
          size="lg"
          disabled={locked}
          tabIndex={visible ? 0 : -1}
          className="h-11 shrink-0 px-4 text-[13.5px] font-semibold transition-transform duration-100 ease-out active:scale-[0.99] sm:px-6 sm:text-[14px]"
        >
          {isRecalculating ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ShoppingCart className="size-4" strokeWidth={2} aria-hidden="true" />
          )}
          <span className="hidden sm:inline">
            {isGuest ? 'Запросить котировку' : 'Добавить в заявку'}
          </span>
          <span className="sm:hidden">{isGuest ? 'Котировка' : 'В заявку'}</span>
        </Button>
      </div>
    </div>
  )
}
