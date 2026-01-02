import { useState } from 'react'

interface Props {
    value?: number | null
    onChange: (value: number) => void
    className?: string
    placeholder?: string
}

function fmtHours(h?: number) {
    if (h === undefined || h === null) return ''
    let whole = Math.floor(h)
    // round minutes to nearest 15
    let minutes = Math.round((h - whole) * 60)
    minutes = Math.round(minutes / 15) * 15
    if (minutes >= 60) { whole += 1; minutes = 0 }
    return `${whole}:${String(minutes).padStart(2, '0')}`
}

function parseHours(s: string) {
    if (!s) return 0
    const raw = String(s).trim()
    const normalized = raw.replace(',', '.')

    if (normalized.includes(':')) {
        const parts = normalized.split(':')
        const h = Number.isFinite(Number(parts[0])) ? Number(parts[0]) : 0
        let m = Number.isFinite(Number(parts[1])) ? Math.abs(Math.round(Number(parts[1]))) : 0
        m = Math.min(59, m)
        m = Math.round(m / 15) * 15
        if (m >= 60) return h + 1
        return h + m / 60
    }

    if (normalized.includes('.')) {
        const num = Number(normalized)
        if (!Number.isFinite(num)) return 0
        const whole = Math.floor(num)
        let minutes = Math.round((num - whole) * 60)
        minutes = Math.round(minutes / 15) * 15
        if (minutes >= 60) return whole + 1
        return whole + minutes / 60
    }

    const n = Number(normalized)
    return Number.isFinite(n) ? n : 0
}

export default function TimeInput({ value, onChange, className, placeholder }: Props) {
    const [text, setText] = useState(() => fmtHours(value ?? 0))
    const [editing, setEditing] = useState(false)

    return (
        <input
            className={className}
            value={editing ? text : fmtHours(value ?? 0)}
            placeholder={placeholder}
            onFocus={() => setEditing(true)}
            onChange={e => setText(e.target.value)}
            onBlur={() => {
                const parsed = parseHours(text)
                onChange(parsed)
                setText(fmtHours(parsed))
                setEditing(false)
            }}
        />
    )
}
