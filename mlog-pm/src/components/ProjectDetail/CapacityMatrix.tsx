import { useEffect, useMemo, useState, useImperativeHandle, forwardRef, useCallback } from 'react'
import type { ProjectMilestone, PlannedCapacity, LoggedCapacity, User } from '../../types'
import { savePlannedCapacities } from '../../api'
import useTexts from '../../hooks/useTexts'
import { isActiveUser } from '../../hooks/useRoles'
import MilestoneHeader from './MilestoneHeader'
import MilestoneMonthRow from './MilestoneMonthRow'
import UserHeaderCell from './UserHeaderCell'
import MonthCapacityModal from './MonthCapacityModal'

interface Props {
    milestones: ProjectMilestone[]
    planned: PlannedCapacity[]
    logged: LoggedCapacity[]
    showPlan?: boolean
    showLogged?: boolean
    editMode?: boolean
}

export type MatrixHandle = {
    save: () => Promise<void> | void
    cancel: () => void
    isDirty: () => boolean
    isSaving: () => boolean
}

type AllProps = Props & {
    users?: User[]
    onReload?: () => Promise<void>
    onEditMilestone?: (m: ProjectMilestone) => void
    onAddMonth?: (m: ProjectMilestone) => void
}

const CapacityMatrix = forwardRef<MatrixHandle, AllProps>(function CapacityMatrix({
    milestones,
    planned,
    logged,
    showPlan = true,
    showLogged = true,
    editMode = false,
    users = [],
    onReload,
    onEditMilestone,
    onAddMonth,
}: AllProps, ref) {
    const [edits, setEdits] = useState<Record<string, number>>({})
    const [dirty, setDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        function onBeforeUnload(e: BeforeUnloadEvent) {
            if (dirty) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', onBeforeUnload)
        return () => window.removeEventListener('beforeunload', onBeforeUnload)
    }, [dirty])

    const visibleUsers = useMemo(() => (users || []).filter(u => isActiveUser(u)), [users])

    function keyFor(userId: number, milestoneId: number, month: number, year: number) {
        return `${userId}-${milestoneId}-${month}-${year}`
    }

    function handleChange(userId: number, milestoneId: number, month: number, year: number, hours: number) {
        const k = keyFor(userId, milestoneId, month, year)
        setEdits(prev => ({ ...prev, [k]: hours }))
        setDirty(true)
    }

    const handleSave = useCallback(async () => {
        if (!dirty) return
        setSaving(true)
        try {
            const payload: PlannedCapacity[] = (Object.entries(edits) as [string, number][]).map(([key, plannedHours]) => {
                const [userIdStr, milestoneIdStr, monthStr, yearStr] = key.split('-')
                return { userId: Number(userIdStr), milestoneId: Number(milestoneIdStr), month: Number(monthStr), year: Number(yearStr), plannedHours }
            })
            await savePlannedCapacities(payload)
            setEdits({})
            setDirty(false)
            if (onReload) await onReload()
        } catch (err) {
            console.error('Failed to save planned capacities', err)
            alert('Failed to save planned capacities')
        } finally {
            setSaving(false)
        }
    }, [dirty, edits, onReload])

    function handleCancel() {
        setEdits({})
        setDirty(false)
    }

    useImperativeHandle(ref, () => ({
        save: handleSave,
        cancel: handleCancel,
        isDirty: () => dirty,
        isSaving: () => saving,
    }), [dirty, saving, handleSave])

    // month-edit modal state
    const [editMonthOpen, setEditMonthOpen] = useState(false)
    const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null)
    const [editingRow, setEditingRow] = useState<{ month: number; year: number } | null>(null)

    function openEditMonth(m: ProjectMilestone, row: { month: number; year: number }) {
        setEditingMilestone(m)
        setEditingRow(row)
        setEditMonthOpen(true)
    }

    const texts = useTexts()

    return (
        <div className="rounded-md tp-text">
            <div className="space-y-4">
                {milestones.map(m => {
                    const monthKeys = new Set<string>()
                    monthKeys.add(`${m.startYear}-${String(m.startMonth).padStart(2, '0')}`)
                    planned.filter(p => p.milestoneId === m.id).forEach(p => monthKeys.add(`${p.year}-${String(p.month).padStart(2, '0')}`))
                    logged.filter(l => l.milestoneId === m.id).forEach(l => monthKeys.add(`${l.year}-${String(l.month).padStart(2, '0')}`))
                    const monthRows = Array.from(monthKeys).map(k => {
                        const [yearStr, monthStr] = k.split('-')
                        return { month: Number(monthStr), year: Number(yearStr) }
                    }).sort((a, b) => a.year - b.year || a.month - b.month)

                    return (
                        <div key={`table-${m.id}`} className="rounded-md overflow-x-auto">
                            <table className="min-w-full table-fixed border-collapse tp-card">
                                <colgroup>
                                    <col style={{ width: '6rem' }} />
                                    {visibleUsers.map(u => (
                                        <col key={`col-user-${m.id}-${u.id}`} style={{ width: '6rem' }} />
                                    ))}
                                    <col style={{ width: '6rem' }} />
                                    <col style={{ width: '6rem' }} />
                                    <col style={{ width: '8rem' }} />
                                    <col style={{ width: '8rem' }} />
                                    <col style={{ width: '8rem' }} />
                                    <col style={{ width: '6rem' }} />
                                </colgroup>
                                <tbody>
                                    <MilestoneHeader m={m} onEditMilestone={onEditMilestone} onAddMonth={onAddMonth} />

                                    

                                    <tr className="text-xs tp-muted border-b tp-border">
                                        <td className="px-4 py-2 w-36">{texts.capacityMatrix.headers.month}</td>
                                        {visibleUsers.map(u => (
                                            <td key={`hdr-${m.id}-${u.id}`} className="px-4 py-2 text-center"><UserHeaderCell user={u} /></td>
                                        ))}
                                        <td className="px-4 py-2 text-right">{texts.capacityMatrix.headers.planned}</td>
                                        <td className="px-4 py-2 text-right">{texts.capacityMatrix.headers.value}</td>
                                        <td className="px-4 py-2 text-right">{texts.capacityMatrix.headers.logged}</td>
                                        <td className="px-4 py-2 text-right">{texts.capacityMatrix.headers.predictedCost}</td>
                                        <td className="px-4 py-2 text-right">{texts.capacityMatrix.headers.predictedProfit}</td>
                                        <td></td>
                                    </tr>

                                    {monthRows.map(row => (
                                        <MilestoneMonthRow
                                            key={`${m.id}-${row.year}-${row.month}`}
                                            m={m}
                                            row={row}
                                            visibleUsers={visibleUsers}
                                            planned={planned}
                                            logged={logged}
                                            edits={edits}
                                            keyFor={keyFor}
                                            onChange={handleChange}
                                            showPlan={showPlan}
                                            showLogged={showLogged}
                                            editMode={editMode}
                                            onEditMonth={openEditMonth}
                                        />
                                    ))}

                                    {/* Totals row for milestone */}
                                    {(() => {
                                        const userTotals = visibleUsers.map(u => {
                                            const userPlanned = planned.filter(p => p.milestoneId === m.id && p.userId === u.id).reduce((s, it) => s + (it.plannedHours || 0), 0)
                                            const userLogged = logged.filter(l => l.milestoneId === m.id && l.userId === u.id).reduce((s, it) => s + (it.loggedHours || 0), 0)
                                            return { planned: userPlanned, logged: userLogged }
                                        })

                                        const totalPlanned = userTotals.reduce((s, u) => s + u.planned, 0)
                                        const totalLogged = userTotals.reduce((s, u) => s + u.logged, 0)
                                        const totalPlannedCost = visibleUsers.reduce((s, u) => {
                                            const userPlanned = planned.filter(p => p.milestoneId === m.id && p.userId === u.id).reduce((ss, it) => ss + (it.plannedHours || 0), 0)
                                            return s + userPlanned * (u.costPerHour || 0)
                                        }, 0)
                                        const totalPredictedProfit = Math.round((m.incomeAmount || 0) - totalPlannedCost)
                                        const totalValue = (() => {
                                            const totalPlannedForMilestone = planned.filter(p => p.milestoneId === m.id).reduce((s, it) => s + (it.plannedHours || 0), 0)
                                            if (totalPlannedForMilestone === 0) return 0
                                            const sumsByMonth = monthRows.map(row => {
                                                const sumPlanned = visibleUsers.reduce((s, u) => {
                                                    const entry = planned.find(p => p.userId === u.id && p.milestoneId === m.id && p.month === row.month && p.year === row.year)
                                                    const editedKey = keyFor(u.id, m.id, row.month, row.year)
                                                    const edited = edits[editedKey]
                                                    const displayPlanned = edited !== undefined ? edited : (entry ? entry.plannedHours : 0)
                                                    return s + displayPlanned
                                                }, 0)
                                                const monthVal = Math.round(((m.incomeAmount || 0) * (sumPlanned / totalPlannedForMilestone)))
                                                return monthVal
                                            })
                                            return sumsByMonth.reduce((s, v) => s + v, 0)
                                        })()

                                        return (
                                            <tr className="tp-muted-bg border-t-2 tp-border font-semibold">
                                                <td className="px-4 py-3">Součet</td>
                                                {userTotals.map((u, idx) => (
                                                    <td key={idx} className="text-center">{u.planned}</td>
                                                ))}
                                                <td className="px-4 py-3 text-right">{totalPlanned}</td>
                                                <td className="px-4 py-3 text-right tp-text">{totalValue ? totalValue.toLocaleString('cs-CZ') + '\u00A0Kč' : '—'}</td>
                                                <td className="px-4 py-3 text-right">{totalLogged}</td>
                                                <td className="px-4 py-3 text-right">{totalPlannedCost.toLocaleString('cs-CZ') + '\u00A0Kč'}</td>
                                                <td className="px-4 py-3 text-right">{totalPredictedProfit.toLocaleString('cs-CZ') + '\u00A0Kč'}</td>
                                                <td className="px-4 py-3"></td>
                                            </tr>
                                        )
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    )
                })}

                {/* Month capacity modal (single instance) */}
                <MonthCapacityModal
                    open={editMonthOpen}
                    milestone={editingMilestone}
                    month={editingRow?.month ?? 0}
                    year={editingRow?.year ?? 0}
                    users={visibleUsers}
                    planned={planned}
                    logged={logged}
                    onClose={() => setEditMonthOpen(false)}
                    onSaved={async () => { if (onReload) await onReload() }}
                />
            </div>

        </div>
    )
})

export default CapacityMatrix
