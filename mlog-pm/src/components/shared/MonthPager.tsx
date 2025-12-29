import React from 'react'

type Props = {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

export default function MonthPager({ year, month, onChange }: Props) {
  function changeMonthBy(delta: number) {
    const d = new Date(year, month - 1)
    d.setMonth(d.getMonth() + delta)
    const ny = d.getFullYear()
    const nm = d.getMonth() + 1
    onChange(ny, nm)
  }

  const yearOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    const arr: number[] = []
    for (let i = 0; i <= 10; i++) arr.push(currentYear - i)
    if (!arr.includes(year)) arr.unshift(year)
    return arr
  }, [year])

  return (
    <div className="flex items-center gap-4">
      <button aria-label="Previous month" onClick={() => changeMonthBy(-1)} className="w-10 h-10 rounded-md tp-muted-bg hover-accent tp-text flex items-center justify-center">◀</button>
      <div className="text-center">
        <div className="flex items-center gap-2">
          <select value={String(month)} onChange={e => onChange(year, Number(e.target.value))} className="tp-card tp-text text-sm rounded px-2 py-1 border tp-border">
            {Array.from({ length: 12 }).map((_, i) => {
              const monthNum = i + 1
              const date = new Date(year, i)
              const label = new Intl.DateTimeFormat('cs-CZ', { month: 'long' }).format(date)
              return <option key={monthNum} value={monthNum}>{label}</option>
            })}
          </select>
          <select value={String(year)} onChange={e => onChange(Number(e.target.value), month)} className="tp-card tp-text text-sm rounded px-2 py-1 border tp-border">
            {yearOptions.map(yearNum => <option key={yearNum} value={yearNum}>{yearNum}</option>)}
          </select>
        </div>
      </div>
      <button aria-label="Next month" onClick={() => changeMonthBy(1)} className="w-10 h-10 rounded-md tp-muted-bg hover-accent tp-text flex items-center justify-center">▶</button>
    </div>
  )
}
