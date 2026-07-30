'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import { translateContent } from '@/i18n/contentDict'

/**
 * Admin/veritabanı içeriğindeki STANDART metinleri (menü, kategori adı vb.)
 * seçili dile göre çevirir. Server bileşenlerinde de kullanılabilir (client
 * ada). Eşleşme yoksa metni aynen gösterir — bozulmaz.
 */
export default function TransLabel({ tr }: { tr?: string | null }) {
  const { locale } = useTranslation()
  return <>{translateContent(tr, locale)}</>
}
