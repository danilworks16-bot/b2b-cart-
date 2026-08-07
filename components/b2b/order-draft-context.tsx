'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { buildOrderDraft, type HtOrderDraft } from '@/lib/b2b/logistics'
import type { HtProduct } from '@/lib/b2b/types'
import { useCustomer } from './customer-context'

/**
 * Один источник правды по количествам на всей карточке товара.
 *
 * Матрица фасовок, компактный список вариантов и панель расчёта читают
 * один и тот же черновик — иначе цифры в трёх местах разъезжаются.
 * В b2b-starter этот провайдер оборачивает `ProductTemplate`, а
 * `addToCart` получает `draft.lines` как массив line items.
 */

type CtxValue = {
  quantities: Record<string, number>
  draft: HtOrderDraft
  setQuantity: (variantId: string, next: number) => void
  reset: () => void
}

const OrderDraftContext = createContext<CtxValue | null>(null)

export function OrderDraftProvider({
  product,
  children,
}: {
  product: HtProduct
  children: React.ReactNode
}) {
  const { customer } = useCustomer()
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const setQuantity = useCallback((variantId: string, next: number) => {
    setQuantities((prev) => ({ ...prev, [variantId]: Math.max(next, 0) }))
  }, [])

  const reset = useCallback(() => setQuantities({}), [])

  const draft = useMemo(
    () => buildOrderDraft(product, quantities, customer),
    [product, quantities, customer],
  )

  const value = useMemo<CtxValue>(
    () => ({ quantities, draft, setQuantity, reset }),
    [quantities, draft, setQuantity, reset],
  )

  return <OrderDraftContext.Provider value={value}>{children}</OrderDraftContext.Provider>
}

export function useOrderDraft() {
  const ctx = useContext(OrderDraftContext)
  if (!ctx) throw new Error('useOrderDraft must be used inside OrderDraftProvider')
  return ctx
}
