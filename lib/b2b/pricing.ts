import type { HtPriceTier, HtVariant } from './types'

/**
 * Активная ступень оптовой сетки для введённого количества.
 *
 * В Medusa v2 это делает price set с price rule `quantity`:
 * бэкенд возвращает уже посчитанный `variant.calculated_price`.
 * Здесь логика вынесена в один helper, чтобы строка варианта,
 * общая сетка и итог заявки НЕ считали цену каждый по-своему.
 */
export function resolveTier(variant: HtVariant, quantity: number, isB2B: boolean): HtPriceTier {
  const base = variant.price_tiers[0]
  if (!isB2B || quantity <= 0) return base

  return (
    [...variant.price_tiers].reverse().find((tier) => quantity >= tier.min_quantity) ?? base
  )
}

/** Цена за единицу с учётом контекста авторизации. */
export function resolveUnitAmount(variant: HtVariant, quantity: number, isB2B: boolean): number {
  if (!isB2B) return variant.calculated_price.calculated_amount
  return resolveTier(variant, quantity, isB2B).amount
}
