import type { HtCustomerCtx, HtPriceTier, HtProduct, HtVariant } from './types'

/**
 * Вся арифметика заявки живёт здесь, вне React.
 *
 * Причина: в Medusa v2 те же числа обязаны сойтись в трёх местах —
 * карточка товара (клиент), корзина (`/store/carts`) и approval-правило
 * компании. Если считать в компоненте, значения разъезжаются.
 * При переносе в b2b-starter этот файл копируется как есть,
 * а на входе вместо мока подаются `StoreProductVariant[]`.
 */

/** Габариты 20FT DC под сухой груз. В starter'е выносится в env / metadata региона. */
export const CONTAINER_20FT = {
  label: '20FT',
  volume_m3: 28,
  payload_kg: 21000,
} as const

export type HtDraftLine = {
  variant: HtVariant
  quantity: number
  /** активная ступень сетки (price rule `quantity`) */
  tier: HtPriceTier
  unit_amount: number
  line_total: number
  /** сумма по базовой каталожной цене — нужна, чтобы показать экономию */
  line_base_total: number
  net_weight_kg: number
  gross_weight_kg: number
  volume_m3: number
  below_moq: boolean
}

export type HtDraftStatus = 'empty' | 'below_moq' | 'ready' | 'needs_approval'

export type HtOrderDraft = {
  lines: HtDraftLine[]
  /** позиций выбрано / всего вариантов в товаре */
  lines_count: number
  variants_count: number
  units: number
  net_weight_kg: number
  gross_weight_kg: number
  volume_m3: number
  pallets: number
  /** готовность партии = максимальный lead time среди выбранных строк */
  lead_time_days: number
  total: number
  base_total: number
  savings: number
  /** 0…1, лимитирует объём ИЛИ грузоподъёмность — что упирается раньше */
  container_load: number
  container_limiter: 'volume' | 'weight'
  /** SKU строк ниже MOQ — уйдут в котировку, а не в заказ */
  moq_violations: string[]
  /** доступный остаток лимита сотрудника, минорные единицы */
  limit_available: number | null
  limit_used: number | null
  over_limit: boolean
  status: HtDraftStatus
}

/** Ступень выбирается по количеству — так же, как price rule `quantity` на price set. */
export function resolveTier(variant: HtVariant, quantity: number, isB2B: boolean): HtPriceTier {
  if (!isB2B || quantity <= 0) return variant.price_tiers[0]
  return (
    [...variant.price_tiers].reverse().find((tier) => quantity >= tier.min_quantity) ??
    variant.price_tiers[0]
  )
}

export function buildOrderDraft(
  product: HtProduct,
  quantities: Record<string, number>,
  customer: HtCustomerCtx,
): HtOrderDraft {
  const isB2B = customer.state === 'b2b'

  const lines: HtDraftLine[] = []

  for (const variant of product.variants) {
    const quantity = quantities[variant.id] ?? 0
    if (quantity <= 0) continue

    const tier = resolveTier(variant, quantity, isB2B)
    const unitAmount = isB2B ? tier.amount : variant.calculated_price.calculated_amount

    lines.push({
      variant,
      quantity,
      tier,
      unit_amount: unitAmount,
      line_total: unitAmount * quantity,
      line_base_total: variant.calculated_price.original_amount * quantity,
      net_weight_kg: variant.metadata.net_weight_kg * quantity,
      gross_weight_kg: variant.metadata.gross_weight_kg * quantity,
      volume_m3: variant.metadata.volume_m3 * quantity,
      below_moq: quantity < variant.min_order_quantity,
    })
  }

  const sum = (pick: (line: HtDraftLine) => number) => lines.reduce((acc, l) => acc + pick(l), 0)

  const total = sum((l) => l.line_total)
  const baseTotal = sum((l) => l.line_base_total)
  const volume = sum((l) => l.volume_m3)
  const grossWeight = sum((l) => l.gross_weight_kg)

  const pallets = lines.reduce(
    (acc, l) => acc + Math.ceil(l.quantity / l.variant.metadata.units_per_pallet),
    0,
  )

  const byVolume = volume / CONTAINER_20FT.volume_m3
  const byWeight = grossWeight / CONTAINER_20FT.payload_kg

  const limitAvailable =
    customer.state === 'b2b'
      ? Math.max(customer.employee.spending_limit - customer.employee.spent, 0)
      : null

  const overLimit = limitAvailable !== null && total > limitAvailable
  const moqViolations = lines.filter((l) => l.below_moq).map((l) => l.variant.sku)

  const status: HtDraftStatus =
    lines.length === 0
      ? 'empty'
      : moqViolations.length > 0
        ? 'below_moq'
        : overLimit
          ? 'needs_approval'
          : 'ready'

  return {
    lines,
    lines_count: lines.length,
    variants_count: product.variants.length,
    units: sum((l) => l.quantity),
    net_weight_kg: sum((l) => l.net_weight_kg),
    gross_weight_kg: grossWeight,
    volume_m3: volume,
    pallets,
    lead_time_days: lines.reduce((acc, l) => Math.max(acc, l.variant.metadata.lead_time_days), 0),
    total,
    base_total: baseTotal,
    savings: Math.max(baseTotal - total, 0),
    container_load: Math.min(Math.max(byVolume, byWeight), 1),
    container_limiter: byWeight > byVolume ? 'weight' : 'volume',
    moq_violations: moqViolations,
    limit_available: limitAvailable,
    limit_used: limitAvailable === null ? null : Math.min(total, limitAvailable),
    over_limit: overLimit,
    status,
  }
}
