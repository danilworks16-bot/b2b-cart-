'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import type { HtContainerCode } from '@/lib/b2b/container'
import { buildSummary } from '@/lib/b2b/summary'
import type { HtProduct } from '@/lib/b2b/types'
import { useCustomer } from './customer-context'
import { OrderSummary } from './order-summary'
import { ProductGallery } from './product-gallery'
import { PurchasePanel } from './purchase-panel'
import { StickyOrderBar } from './sticky-order-bar'

/**
 * Владелец состояния заявки для всей карточки.
 * Количества нужны одновременно строкам вариантов, общей сетке, итогу и
 * sticky-панели, поэтому стейт поднят на уровень выше сетки колонок.
 *
 * При переносе в Medusa v2: заменить `quantities` на line items черновика
 * корзины (`useCart` / server action `addToCart`).
 */
export function OrderBuilder({ product }: { product: HtProduct }) {
  const { customer, isRecalculating } = useCustomer()
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [container, setContainer] = useState<HtContainerCode>('20FT')
  const summaryAnchor = useRef<HTMLDivElement>(null)

  const isB2B = customer.state === 'b2b'
  const locked = customer.state === 'loading' || isRecalculating

  const summary = useMemo(
    () => buildSummary(product.variants, quantities, isB2B),
    [product.variants, quantities, isB2B],
  )

  const handleQuantityChange = useCallback((variantId: string, next: number) => {
    setQuantities((prev) => ({ ...prev, [variantId]: next }))
  }, [])

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery images={product.images} />
        </div>

        <PurchasePanel
          product={product}
          customer={customer}
          quantities={quantities}
          locked={locked}
          onQuantityChange={handleQuantityChange}
        />
      </div>

      <div ref={summaryAnchor} className="mt-10 scroll-mt-24">
        <OrderSummary
          summary={summary}
          customer={customer}
          container={container}
          onContainerChange={setContainer}
          onClear={() => setQuantities({})}
          isRecalculating={isRecalculating}
        />
      </div>

      <StickyOrderBar
        summary={summary}
        customer={customer}
        container={container}
        isRecalculating={isRecalculating}
        anchorRef={summaryAnchor}
      />
    </>
  )
}
