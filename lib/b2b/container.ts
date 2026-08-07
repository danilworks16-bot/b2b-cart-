/**
 * Расчёт загрузки контейнера — чистый фронтовый расчёт по
 * `variant.metadata` (volume_m3 / gross_weight_kg). Никакой серверной
 * логики Medusa для этого не требуется: значения приходят вместе с
 * вариантом в `StoreProductVariant.metadata`.
 */

export type HtContainerCode = '20FT' | '40HQ'

export type HtContainerSpec = {
  code: HtContainerCode
  label: string
  /** полезный объём, м³ */
  volume_m3: number
  /** предельная загрузка по массе, кг */
  payload_kg: number
}

export const CONTAINERS: Record<HtContainerCode, HtContainerSpec> = {
  '20FT': { code: '20FT', label: '20FT', volume_m3: 28, payload_kg: 21000 },
  '40HQ': { code: '40HQ', label: '40HQ', volume_m3: 68, payload_kg: 26000 },
}

export type HtContainerLoad = {
  spec: HtContainerSpec
  /** 0…1, ограничивающий фактор — объём или масса */
  ratio: number
  percent: number
  limitedBy: 'volume' | 'weight'
}

export function calcContainerLoad(
  volumeM3: number,
  grossKg: number,
  code: HtContainerCode,
): HtContainerLoad {
  const spec = CONTAINERS[code]
  const byVolume = volumeM3 / spec.volume_m3
  const byWeight = grossKg / spec.payload_kg
  const ratio = Math.max(byVolume, byWeight)

  return {
    spec,
    ratio,
    // до 1 % округляем вверх, чтобы ненулевая заявка не показывала «0 %»
    percent: ratio > 0 ? Math.max(1, Math.round(ratio * 100)) : 0,
    limitedBy: byWeight >= byVolume ? 'weight' : 'volume',
  }
}

export function formatM3(value: number) {
  return `${new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} м³`
}

export function formatKg(value: number, fractionDigits = 1) {
  return `${new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(value)} кг`
}
