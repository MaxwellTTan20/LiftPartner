import type { Language } from '../types'

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTH_NAMES_ZH = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
]

export function monthKeyOf(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

export function formatMonthLabel(monthKey: string, language: Language): string {
  const [yearStr, monthStr] = monthKey.split('-')
  const monthIndex = Number(monthStr) - 1
  const names = language === 'zh-CN' ? MONTH_NAMES_ZH : MONTH_NAMES_EN
  const name = names[monthIndex] ?? monthStr
  return language === 'zh-CN' ? `${yearStr}年${name}` : `${name} ${yearStr}`
}
