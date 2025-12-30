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

    const monthYearOptions = React.useMemo(() => {
        const center = new Date(year, month - 1)
        const start = new Date(center)
        start.setMonth(start.getMonth() - 12)
        const opts: { year: number; month: number; label: string }[] = []
        for (let i = 0; i < 25; i++) {
            const d = new Date(start.getFullYear(), start.getMonth() + i)
            opts.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: new Intl.DateTimeFormat('cs-CZ', { month: 'long', year: 'numeric' }).format(d) })
        }
        return opts
    }, [year, month])

    return (
        <div className="flex items-center gap-4">
            <button aria-label="Previous month" onClick={() => changeMonthBy(-1)} className="w-10 h-10 rounded-md tp-muted-bg hover-accent tp-text flex items-center justify-center">◀</button>
            <div className="text-center">
                <div className="flex items-center gap-2">
                    <select
                        value={`${year}-${month}`}
                        onChange={e => {
                            const [yStr, mStr] = String(e.target.value).split('-')
                            onChange(Number(yStr), Number(mStr))
                        }}
                        className="tp-card tp-text text-sm rounded px-2 py-1 border tp-border"
                    >
                        {monthYearOptions.map(o => (
                            <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>{o.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            <button aria-label="Next month" onClick={() => changeMonthBy(1)} className="w-10 h-10 rounded-md tp-muted-bg hover-accent tp-text flex items-center justify-center">▶</button>
        </div>
    )
}
