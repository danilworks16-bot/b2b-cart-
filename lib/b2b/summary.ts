import { resolveUnitAmount } from './pricing'
import type { HtVariant } from './types'

export type HtOrderSummary = {
  /** заполненных позиций */
  lines: number
  /** всего вариантов в карточке */
  totalLines: number
  /** единиц фасовки */
  units: number
  /** итог без НДС, минорные единицы */
  total: number
  /** сумма по базовому прайсу — для «экономии по сетке» */
  originalTotal: number
  savings: number
  netWeightKg: number
  grossWeightKg: number
  volumeM3: number
  /** максимальный lead time среди выбранных позиций */
  leadTimeDays: number
}

/**
 * Единая агрегация заявки. Используется и статичным блоком, и sticky-панелью,
 * поэтому суммы гарантированно совпадают.
 *
 * При переносе в Medusa v2 источником становится `cart` (line_items с
 * `unit_price`, `original_total`, `total`), а метрики логистики по-прежнему
 * считаются из `variant.metadata`.
 */
export function buildSummary(
  variants: HtVariant[],
  quantities: Record<string, number>,
  isB2B: boolean,
): HtOrderSummary {
  const summary: HtOrderSummary = {
    lines: 0,
    totalLines: variants.length,
    units: 0,
    total: 0,
    originalTotal: 0,
    savings: 0,
    netWeightKg: 0,
    grossWeightKg: 0,
    volumeM3: 0,
    leadTimeDays: 0,
  }

  for (const variant of variants) {
    const quantity = quantities[variant.id] ?? 0
    if (quantity <= 0) continue

    summary.lines += 1
    summary.units += quantity
    summary.total += resolveUnitAmount(variant, quantity, isB2B) * quantity
    summary.originalTotal += variant.calculated_price.original_amount * quantity
    summary.netWeightKg += variant.metadata.net_weight_kg * quantity
    summary.grossWeightKg += variant.metadata.gross_weight_kg * quantity
    summary.volumeM3 += variant.metadata.volume_m3 * quantity
    summary.leadTimeDays = Math.max(summary.leadTimeDays, variant.metadata.lead_time_days)
  }

  summary.savings = Math.max(0, summary.originalTotal - summary.total)
  return summary
}
