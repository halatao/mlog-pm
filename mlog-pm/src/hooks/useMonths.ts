const MONTHS = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'] as const

export function monthName(month?: number) {
  const m = Number(month) || 1
  return MONTHS[m - 1] ?? String(month)
}

export function monthLabel(month?: number) {
  // capitalized label as used in selects (e.g. "Leden")
  const name = monthName(month)
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : ''
}

export default function useMonths() {
  return {
    months: MONTHS as readonly string[],
    monthName,
    monthLabel,
  }
}
