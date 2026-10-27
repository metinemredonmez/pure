/**
 * Sitede öğütme seçimi yalnızca iki seçenek: Çekirdek / Öğütülmüş.
 * Eski varyant tipleri (Filtre, Espresso, V60, French Press, Türk Kahvesi) "Öğütülmüş" sayılır.
 */
export type GrindGroup = 'WHOLE_BEAN' | 'GROUND'

export const GRIND_GROUP_LABELS: Record<GrindGroup, string> = {
  WHOLE_BEAN: 'Çekirdek',
  GROUND: 'Öğütülmüş',
}

export function grindGroup(grindType?: string | null): GrindGroup | null {
  if (!grindType) return null
  return grindType === 'WHOLE_BEAN' ? 'WHOLE_BEAN' : 'GROUND'
}
