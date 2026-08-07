import type { HtCurrency } from './types'

const LOCALE = 'ru-RU'

/**
 * Medusa хранит суммы в минорных единицах. Один общий форматтер на всё
 * приложение — иначе цена в карточке и цена в корзине разъезжаются.
 */
export function formatAmount(minor: number, currency: HtCurrency = 'CNY') {
  const value = minor / 100
  const formatted = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

  const prefix: Record<HtCurrency, string> = {
    CNY: 'CN¥',
    RUB: '₽',
    USD: '$',
  }

  return currency === 'RUB' ? `${formatted} ${prefix.RUB}` : `${prefix[currency]}${formatted}`
}

export function formatQuantity(value: number, unit = 'кг') {
  return `${new Intl.NumberFormat(LOCALE).format(value)} ${unit}`
}

export function formatTierRange(min: number, max: number | null) {
  if (max === null) return `${new Intl.NumberFormat(LOCALE).format(min)}+`
  return `${new Intl.NumberFormat(LOCALE).format(min)}–${new Intl.NumberFormat(LOCALE).format(max)}`
}
