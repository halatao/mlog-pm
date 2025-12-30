import { useEffect, useMemo, useState } from 'react'
import type { User, PlannedCapacity, ProjectMilestone, LoggedCapacity } from '../../types'
import { savePlannedCapacities, removeMilestoneMonth } from '../../api'
import useTexts from '../../hooks/useTexts'
import type { ChangeHistoryEntry } from '../../models/changeHistory'

interface Props {
    open: boolean
    milestone: ProjectMilestone | null
    month: number
    year: number
    users: User[]
    planned: PlannedCapacity[]
    logged?: LoggedCapacity[]
    onClose: () => void
    onSaved?: () => Promise<void>
    history?: ChangeHistoryEntry[]
}

export default function MonthCapacityModal({ open, milestone, month, year, users, planned, logged, onClose, onSaved, history }: Props) {
    const texts = useTexts()
    const t = texts.monthCapacityModal
    const [localPlannedTotal, setLocalPlannedTotal] = useState<number>(0)
    const [userHours, setUserHours] = useState<Record<number, number>>({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!open || !milestone) return
        const ms = milestone
        const map: Record<number, number> = {}
        users.forEach(u => {
            const entry = planned.find(p => p.userId === u.id && p.milestoneId === ms.id && p.month === month && p.year === year)
            map[u.id] = entry ? entry.plannedHours : 0
        })
        setUserHours(map)
        const total = Object.values(map).reduce((s, v) => s + v, 0)
        setLocalPlannedTotal(total)
    }, [open, milestone, month, year, users, planned])

    const sumUserHours = useMemo(() => Object.values(userHours).reduce((s, v) => s + v, 0), [userHours])
    const remaining = localPlannedTotal - sumUserHours

    if (!open || !milestone) return null

    async function handleSave() {
        setSaving(true)
        try {
            const payload: PlannedCapacity[] = users.map(u => ({
                userId: u.id,
                milestoneId: milestone!.id,
                month,
                year,
                plannedHours: Number(userHours[u.id] || 0),
            }))
            await savePlannedCapacities(payload)
            if (onSaved) await onSaved()
            onClose()
        } catch (err) {
            console.error('Failed to save month capacities', err)
            alert('Chyba při ukládání kapacit')
        } finally {
            setSaving(false)
        }
    }

    async function handleRemove() {
        if (!milestone) return
        const ok = confirm('Opravdu chcete odstranit tento měsíc? Tato akce smaže plánované i zalogované záznamy pro tento měsíc.')
        if (!ok) return
        setSaving(true)
        try {
            await removeMilestoneMonth(milestone.id, month, year)
            if (onSaved) await onSaved()
            onClose()
        } catch (err) {
            console.error('Failed to remove month', err)
            alert('Chyba při odstraňování měsíce')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            <div className="w-full max-w-3xl bg-[var(--tp-modal-bg)] rounded-xl border tp-border shadow-xl z-10">

                {/* HEADER */}
                <div className="px-6 py-4 border-b tp-border flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold tp-text">{t.title} – {milestone!.name} / {String(month).padStart(2, '0')} / {year}</h2>
                        {t.subtitle ? <p className="text-sm tp-muted">{t.subtitle}</p> : null}
                    </div>
                    <button className="tp-muted hover:text-white text-2xl px-2" onClick={onClose} aria-label="Zavřít">×</button>
                </div>

                {/* SUMMARY */}
                <div className="px-6 py-4 tp-muted-bg grid grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs tp-muted mb-1">{t.plannedTotalLabel}</label>
                        <input
                            type="number"
                            value={localPlannedTotal}
                            className="w-full px-3 py-2 rounded tp-card border tp-border tp-text focus:ring-1"
                            onChange={e => setLocalPlannedTotal(Number(e.target.value))}
                        />
                    </div>

                    <div>
                        <div className="text-xs tp-muted mb-1">Rozděleno (h)</div>
                        <div className="px-3 py-2 rounded tp-card border tp-border tp-text">{sumUserHours}</div>
                    </div>

                    <div>
                        <div className="text-xs tp-muted mb-1">{t.remainingLabel}</div>
                        <div className={`px-3 py-2 rounded ${remaining < 0 ? 'tp-danger font-semibold tp-card border tp-border' : 'tp-card border tp-border tp-text'}`}>
                            {remaining} {remaining < 0 ? ` ${t.overflowSuffix ?? ''}` : ''}
                        </div>
                    </div>
                </div>

                {/* CONTENT: USER TABLE (left) + HISTORY (right) */}
                <div className="px-6 py-4 grid grid-cols-3 gap-6">
                    <div className="col-span-2">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="text-xs tp-muted border-b tp-border">
                                    <th className="text-left py-2">Pracovník</th>
                                    <th className="text-right py-2 w-32">{t.userPlannedLabel}</th>
                                    <th className="text-right py-2 w-32">Aktuálně (h)</th>
                                    <th className="text-left py-2 pl-4">Poznámka</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => {
                                    const loggedEntry = (logged || []).find((l: LoggedCapacity) => l.userId === u.id && l.milestoneId === milestone!.id && l.month === month && l.year === year)
                                    const current = loggedEntry ? loggedEntry.loggedHours : 0
                                    return (
                                        <tr key={u.id} className="border-t tp-border">
                                            <td className="py-3 tp-text">{u.shortName}</td>
                                            <td className="py-3 text-right">
                                                <input
                                                    type="number"
                                                    value={userHours[u.id] ?? 0}
                                                    className="w-20 text-right px-2 py-1 rounded tp-card border tp-border tp-text focus:ring-1"
                                                    onChange={e => setUserHours(prev => ({ ...prev, [u.id]: Number(e.target.value) }))}
                                                />
                                            </td>
                                            <td className="py-3 text-right tp-text">{current}</td>
                                            <td className="py-3 pl-4 tp-muted text-sm">{u.isActivePM ? 'PM' : u.isActiveCreative ? 'Kreativa' : ''}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* RIGHT: HISTORY */}
                    <div className="border-l tp-border pl-6 space-y-4">
                        <div className="text-sm font-semibold tp-muted">Historie změn</div>

                        {(!history || history.length === 0) && (
                            <div className="text-xs tp-muted">Žádné změny</div>
                        )}

                        {history && history.map((h, idx) => (
                            <div key={idx} className="text-xs tp-muted">
                                <div className="flex justify-between">
                                    <span className="font-medium tp-muted">{h.userName}</span>
                                    <span>{h.date}</span>
                                </div>
                                <div className="mt-1">Plán: <span className="tp-danger">{h.from} h</span> → <span className="tp-positive">{h.to} h</span>{h.note ? <span className="block tp-muted text-sm">{h.note}</span> : null}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t tp-border flex items-center justify-between">
                    <div className="text-sm tp-muted">{t.footerNote}</div>

                    <div className="flex gap-3">
                        <button className="px-4 py-2 rounded border tp-border tp-text tp-danger hover:bg-transparent" onClick={handleRemove} disabled={saving}>{saving ? '...' : 'Odstranit měsíc'}</button>
                        <button className="px-4 py-2 rounded border tp-border hover-accent tp-text" onClick={onClose} disabled={saving}>{t.cancel}</button>
                        <button className="px-4 py-2 rounded tp-btn-accent" onClick={handleSave} disabled={saving}>{saving ? t.saving : t.save}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
