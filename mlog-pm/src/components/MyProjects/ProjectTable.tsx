import React from 'react'
import type { Project, ProjectMilestone, User, PlannedCapacity, LoggedCapacity, SubRequirement } from '../../types'
import { useRequirements } from '../../contexts/RequirementsContext'
import WorkLogsModal from '../modals/WorkLogsModal'
import { useWorkLogs } from '../../contexts/WorkLogsContext'
import { useModal } from '../modals/ModalContext'

type Props = {
    project: Project
    data: { milestones: ProjectMilestone[]; planned: PlannedCapacity[]; logged: LoggedCapacity[] }
    users: User[]
    subLogged: Record<number, number>
    dailyMode: boolean
    toggleSubAssigned: (subId: number) => Promise<void>
    toggleReqAssigned: (subIds: number[]) => Promise<void>
    isSubAssigned: (subId: number) => boolean
    isReqFullyAssigned: (subIds: number[]) => boolean
    managerFallbackFullName?: boolean
}

export default function ProjectTable({ project, data, users, subLogged, dailyMode, toggleSubAssigned, toggleReqAssigned, isSubAssigned, isReqFullyAssigned, managerFallbackFullName = true }: Props) {
    const { showModal } = useModal()
    const workLogs = useWorkLogs()
    const { requirementsMap, subReqMap } = useRequirements()
    const { milestones, planned, logged } = data

    const projectIncome = milestones.reduce((s, m) => s + (m.incomeAmount || 0), 0)
    const totalPlannedCost = planned.reduce((s: number, it: PlannedCapacity) => {
        const user = users.find((u: User) => u.id === it.userId)
        return s + (it.plannedHours || 0) * (user?.costPerHour || 0)
    }, 0)
    const totalPredictedProfit = Math.round(projectIncome - totalPlannedCost)
    const profitPct = projectIncome > 0 ? Math.round((totalPredictedProfit / projectIncome) * 100) : 0

    return (
        <tbody key={`proj-${project.id}`}>
            <tr className="bg-slate-800/40 border-t tp-border">
                <td className="px-4 py-3 font-semibold tp-text" colSpan={9}>
                    <a className="tp-text underline" href={`/projects/${project.id}`}>{project.name}</a>
                    <span className="ml-3 text-xs tp-muted">Příjem projektu: {projectIncome === 0 ? '—' : projectIncome.toLocaleString('cs-CZ') + '\u00A0Kč'}</span>
                </td>
            </tr>

            {milestones.map((m: ProjectMilestone) => {
                const mPlanned = planned.filter((pp: PlannedCapacity) => pp.milestoneId === m.id).reduce((s: number, it: PlannedCapacity) => s + (it.plannedHours || 0), 0)
                const mLogged = logged.filter((ll: LoggedCapacity) => ll.milestoneId === m.id).reduce((s: number, it: LoggedCapacity) => s + (it.loggedHours || 0), 0)
                const mPlannedCost = planned.filter((pp: PlannedCapacity) => pp.milestoneId === m.id).reduce((s: number, it: PlannedCapacity) => {
                    const user = users.find((u: User) => u.id === it.userId)
                    return s + (it.plannedHours || 0) * (user?.costPerHour || 0)
                }, 0)
                const mPredictedProfit = Math.round((m.incomeAmount || 0) - mPlannedCost)

                return (
                    <React.Fragment key={`m-${m.id}`}>
                        <tr className="border-t tp-border">
                            <td className="px-4 py-3 pl-6">{m.name}</td>
                            <td className="px-4 py-3">{project.manager?.shortName || (managerFallbackFullName ? `${project.manager?.firstName || ''} ${project.manager?.lastName || ''}` : project.manager?.shortName)}</td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 tp-muted-bg rounded overflow-hidden">
                                        <div className="h-2 tp-accent-bg" style={{ width: `${Math.min(100, Math.max(0, m.donePercent || 0))}%` }} />
                                    </div>
                                    <span className="text-xs tp-muted">{m.donePercent ?? 0} %</span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right">{mPlanned || '—'}</td>
                            <td className="px-4 py-3 text-right">
                                {mLogged ? (
                                    <button className="text-right w-full text-sm tp-text" onClick={async (e) => { e.stopPropagation(); e.preventDefault(); const w = await workLogs.getWorkLogsForMilestone(m.id); showModal(<WorkLogsModal workLogs={w} users={users} />); }} aria-label="Zobrazit logy práce milníku">{mLogged}</button>
                                ) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right">{mPlannedCost === 0 ? '—' : mPlannedCost.toLocaleString('cs-CZ') + '\u00A0Kč'}</td>
                            <td className="px-4 py-3 text-right tp-positive font-medium">{(mPredictedProfit || 0) === 0 ? '—' : Math.round(mPredictedProfit).toLocaleString('cs-CZ') + '\u00A0Kč'}</td>
                            <td className="px-4 py-3 text-right tp-positive font-semibold">{totalPredictedProfit === 0 ? '—' : totalPredictedProfit.toLocaleString('cs-CZ') + '\u00A0Kč'}</td>
                            <td className="px-4 py-3 text-right tp-positive font-semibold">{profitPct} %</td>
                        </tr>

                        {dailyMode && (
                            <tr key={`m-daily-${m.id}`} className="bg-slate-900/10">
                                <td colSpan={9} className="px-6 py-3">
                                    <div className="overflow-x-auto">
                                        {(() => {
                                            const reqs = requirementsMap[project.id] || []
                                            const subs = subReqMap[m.id] || []
                                            if (!reqs.length && !subs.length) return <div className="text-sm tp-muted">Žádné požadavky / úkoly.</div>
                                            const grouped: Record<number, SubRequirement[]> = {}
                                            subs.forEach(s => { if (!grouped[s.requirementId]) grouped[s.requirementId] = []; grouped[s.requirementId].push(s) })
                                            return (
                                                <table className="min-w-full border-collapse text-sm">
                                                    <colgroup>
                                                        <col style={{ width: '60%' }} />
                                                        <col style={{ width: '20%' }} />
                                                        <col style={{ width: '10%' }} />
                                                        <col style={{ width: '10%' }} />
                                                    </colgroup>
                                                    <thead className="tp-muted-bg text-xs tp-muted">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left">Úkol / Požadavek</th>
                                                            <th className="px-3 py-2 text-left">Přiděleno</th>
                                                            <th className="px-3 py-2 text-right">Plán (h)</th>
                                                            <th className="px-3 py-2 text-right">Logy (h)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reqs.map(r => {
                                                            const subsForReq = (grouped[r.id] || [])
                                                            const subIds = subsForReq.map(s => s.id)
                                                            return (
                                                                <React.Fragment key={`reqfrag-${r.id}`}>
                                                                    <tr className="bg-slate-800/20">
                                                                        <td className="px-3 py-2">
                                                                            <label className="flex items-center gap-3">
                                                                                <input type="checkbox" className="w-4 h-4" checked={isReqFullyAssigned(subIds)} onChange={() => void toggleReqAssigned(subIds)} />
                                                                                <span className="font-semibold">{r.name}</span>
                                                                            </label>
                                                                        </td>
                                                                        <td className="px-3 py-2">&nbsp;</td>
                                                                        <td className="px-3 py-2 text-right">{subsForReq.reduce((s2, ss) => s2 + (ss.estimateHours || 0), 0)}</td>
                                                                        <td className="px-3 py-2 text-right">{Math.round((subsForReq.reduce((s2, ss) => s2 + (subLogged[ss.id] || 0), 0) + Number.EPSILON) * 100) / 100}</td>
                                                                    </tr>
                                                                    {subsForReq.map(s => {
                                                                        const assigned = users.find(u => u.id === s.assignedToId)
                                                                        return (
                                                                            <tr key={`sub-${s.id}`} className="border-t tp-border">
                                                                                <td className="px-3 py-2 pl-6">
                                                                                    <label className="flex items-center gap-2">
                                                                                        <input type="checkbox" className="w-4 h-4" checked={isSubAssigned(s.id)} onChange={() => void toggleSubAssigned(s.id)} />
                                                                                        <span className="text-sm tp-muted">{s.name}</span>
                                                                                    </label>
                                                                                </td>
                                                                                <td className="px-3 py-2">{assigned ? `${assigned.firstName} ${assigned.lastName}` : '-'}</td>
                                                                                <td className="px-3 py-2 text-right">{s.estimateHours ?? 0}</td>
                                                                                <td className="px-3 py-2 text-right">
                                                                                    {(subLogged[s.id] ?? 0) ? (
                                                                                        <button className="text-right w-full text-sm tp-text" onClick={async (e) => { e.stopPropagation(); e.preventDefault(); const w = await workLogs.getWorkLogsForMilestone(m.id); const filtered = w.filter(wl => wl.subRequirementId === s.id); showModal(<WorkLogsModal workLogs={filtered} users={users} />); }} aria-label="Zobrazit logy práce">{Math.round(((subLogged[s.id] ?? 0) + Number.EPSILON) * 100) / 100}</button>
                                                                                    ) : '—'}
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    })}
                                                                </React.Fragment>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            )
                                        })()}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                )
            })}
        </tbody>
    )
}
