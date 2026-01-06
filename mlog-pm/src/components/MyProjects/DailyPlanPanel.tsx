import React, { useEffect, useState } from 'react'
import type { Project, ProjectMilestone, Requirement, SubRequirement } from '../../types'
import WorkLogsModal from '../modals/WorkLogsModal'
import { useModal } from '../modals/ModalContext'
import { useRequirements } from '../../contexts/RequirementsContext'
import { useDailyPlan } from '../../contexts/DailyPlanContext'
import { useUsers } from '../../contexts/UsersContext'
import { useWorkLogs } from '../../contexts/WorkLogsContext'

type Props = {
    projects: Project[]
    projectData: Record<number, { milestones: ProjectMilestone[] }>
}

export default function DailyPlanPanel({ projects, projectData }: Props) {
    const { showModal } = useModal()
    const { requirementsMap, subReqMap } = useRequirements()
    const { dailyItems, toggleSubAssigned, toggleReqAssigned } = useDailyPlan()
    const { users } = useUsers()
    const workLogs = useWorkLogs()
    const [loggedByMilestone, setLoggedByMilestone] = useState<Record<number, Record<number, number>>>({})

    const subById: Record<number, SubRequirement> = {}
    Object.values(subReqMap).forEach(arr => arr.forEach(s => { subById[s.id] = s }))
    const reqById: Record<number, Requirement> = {}
    Object.values(requirementsMap).forEach(arr => arr.forEach(r => { reqById[r.id] = r }))
    const milestoneById: Record<number, ProjectMilestone> = {}
    Object.values(projectData).forEach(d => (d.milestones || []).forEach(m => { milestoneById[m.id] = m }))

    const assignedSubIds = new Set(dailyItems.map(d => d.subRequirementId))
    const milestoneToProject: Record<number, number> = {}
    Object.keys(projectData).forEach(k => {
        const pid = Number(k)
        ; (projectData[pid]?.milestones || []).forEach(m => { milestoneToProject[m.id] = pid })
    })
    const projectById: Record<number, Project> = {}
    projects.forEach(pr => { projectById[pr.id] = pr })

    const byProject: Record<number, Record<number, Record<number, SubRequirement[]>>> = {}
    Object.values(subReqMap).forEach(arr => arr.forEach(s => {
        if (!assignedSubIds.has(s.id)) return
        const mId = s.milestoneId
        const pId = milestoneToProject[mId] || 0
        byProject[pId] = byProject[pId] || {}
        byProject[pId][mId] = byProject[pId][mId] || {}
        byProject[pId][mId][s.requirementId] = byProject[pId][mId][s.requirementId] || []
        byProject[pId][mId][s.requirementId].push(s)
    }))

    const mIds: number[] = []
    Object.keys(byProject).forEach(pidStr => {
        const pid = Number(pidStr)
        const milestonesMap = byProject[pid]
        Object.keys(milestonesMap).forEach(mIdStr => {
            const mId = Number(mIdStr)
            if (!mIds.includes(mId)) mIds.push(mId)
        })
    })
    const mIdsKey = mIds.join(',')

    useEffect(() => {
        let mounted = true
        const mids = mIdsKey ? mIdsKey.split(',').map(s => Number(s)).filter(n => !Number.isNaN(n)) : []
        if (mids.length === 0) return
        Promise.all(mids.map(mid => workLogs.getLoggedBySubForMilestone(mid).then(map => ({ mid, map })))).
            then(results => {
                if (!mounted) return
                const next: Record<number, Record<number, number>> = {}
                results.forEach(r => { next[r.mid] = r.map })
                setLoggedByMilestone(next)
            }).catch(() => { /* ignore */ })
        return () => { mounted = false }
    }, [mIdsKey, workLogs])

    return (
        Object.keys(byProject).length === 0 ? <div className="text-sm tp-muted">Žádné přiřazené položky dneška.</div> : (
            <div className="space-y-2">
                {Object.keys(byProject).map(pidStr => {
                    const pid = Number(pidStr)
                    const pr = projectById[pid]
                    const milestonesMap = byProject[pid]
                    return (
                        <div key={`proj-day-${pid}`} className="mb-4">
                            <div className="text-sm font-semibold mb-2">{pr ? pr.name : `Projekt ${pid}`}</div>
                            <div className="border tp-border rounded overflow-hidden">
                                <table className="min-w-full text-sm">
                                    <thead className="tp-muted-bg text-xs tp-muted">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Úkol / Požadavek</th>
                                            <th className="px-3 py-2 text-left">Přiděleno</th>
                                            <th className="px-3 py-2 text-right">Plán (h)</th>
                                            <th className="px-3 py-2 text-right">Logy (h)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(milestonesMap).map(mIdStr => {
                                            const mId = Number(mIdStr)
                                            const milestone = milestoneById[mId]
                                            const reqMap = milestonesMap[mId]
                                            return (
                                                <React.Fragment key={`proj-${pid}-mil-${mId}`}>
                                                    <tr className="bg-slate-800/20">
                                                        <td className="px-3 py-2 font-medium" colSpan={4}>{milestone ? milestone.name : `Milník ${mId}`}</td>
                                                    </tr>
                                                    {Object.keys(reqMap).map(rIdStr => {
                                                        const rId = Number(rIdStr)
                                                        const subsForReq = reqMap[rId]
                                                        const subIds = subsForReq.map(s => s.id)
                                                        const req = (requirementsMap[pid] || []).find(rr => rr.id === rId)
                                                        return (
                                                            <React.Fragment key={`req-${rId}`}>
                                                                <tr className="bg-slate-800/10">
                                                                    <td className="px-3 py-2">
                                                                        <label className="flex items-center gap-3">
                                                                            <input type="checkbox" className="w-4 h-4" checked={!subIds.some(id => !assignedSubIds.has(id))} onChange={() => void toggleReqAssigned(subIds)} />
                                                                            <span className="font-semibold">{req ? req.name : `Požadavek ${rId}`}</span>
                                                                        </label>
                                                                    </td>
                                                                    <td className="px-3 py-2">&nbsp;</td>
                                                                    <td className="px-3 py-2 text-right">{subsForReq.reduce((s2, ss) => s2 + (ss.estimateHours || 0), 0)}</td>
                                                                    <td className="px-3 py-2 text-right">{Math.round((subsForReq.reduce((s2, ss) => s2 + (loggedByMilestone[mId]?.[ss.id] || 0), 0) + Number.EPSILON) * 100) / 100}</td>
                                                                </tr>
                                                                {subsForReq.map(s => {
                                                                    const assigned = users.find(u => u.id === s.assignedToId)
                                                                    return (
                                                                        <tr key={`sub-${s.id}`} className="border-t tp-border">
                                                                            <td className="px-3 py-2 pl-6">
                                                                                <label className="flex items-center gap-2">
                                                                                    <input type="checkbox" className="w-4 h-4" checked={!assignedSubIds.has(s.id)} onChange={() => void toggleSubAssigned(s.id)} />
                                                                                    <span className="text-sm">{s.name}</span>
                                                                                </label>
                                                                            </td>
                                                                            <td className="px-3 py-2">{assigned ? `${assigned.firstName} ${assigned.lastName}` : '-'}</td>
                                                                            <td className="px-3 py-2 text-right">{s.estimateHours ?? 0}</td>
                                                                            <td className="px-3 py-2 text-right">
                                                                                {/* use workLogs context to fetch and show modal */}
                                                                                {(loggedByMilestone[mId]?.[s.id] ?? 0) ? (
                                                                                    <button className="text-right w-full text-sm tp-text" onClick={async (e) => { e.stopPropagation(); e.preventDefault(); const w = await workLogs.getWorkLogsForMilestone(mId); const filtered = w.filter(wl => wl.subRequirementId === s.id); showModal(<WorkLogsModal workLogs={filtered} users={users} />); }} aria-label="Zobrazit logy práce">{Math.round(((loggedByMilestone[mId]?.[s.id] ?? 0) + Number.EPSILON) * 100) / 100}</button>
                                                                                ) : '—'}
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </React.Fragment>
                                                        )
                                                    })}
                                                </React.Fragment>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    )
}
