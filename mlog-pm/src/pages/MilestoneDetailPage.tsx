import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useTexts from '../hooks/useTexts'
import useRoles from '../hooks/useRoles'
import useMonths from '../hooks/useMonths'
import { createRequirement, updateRequirement, createWorkLog } from '../api'
import type { User, Requirement, SubRequirement, WorkLog } from '../types'
import { useUsers } from '../contexts/UsersContext'
import { useProjects } from '../contexts/ProjectsContext'
import { RequirementsProvider, useRequirements } from '../contexts/RequirementsContext'
import { useWorkLogs } from '../contexts/WorkLogsContext'
import TaskEditModal from '../components/modals/TaskEditModal'
import RequirementEditModal from '../components/modals/RequirementEditModal'
import WorkLogModal from '../components/modals/WorkLogModal'
import WorkLogsModal from '../components/modals/WorkLogsModal'
import { useModal } from '../components/modals/ModalContext'

export default function MilestoneDetailPage() {
    const { projectId, milestoneId } = useParams<{ projectId: string; milestoneId: string }>()
    const pid = Number(projectId)
    const mid = Number(milestoneId)

    return (
        <RequirementsProvider projectIds={pid ? [pid] : []} milestoneIds={mid ? [mid] : []}>
            <MilestoneDetailContent pid={pid} mid={mid} />
        </RequirementsProvider>
    )
}

function MilestoneDetailContent({ pid, mid }: { pid: number; mid: number }) {
    const texts = useTexts()
    const roles = useRoles()
    const months = useMonths()
    const { users } = useUsers()
    const { projects, projectData, reload: reloadProjects } = useProjects()
    const { requirementsMap, subReqMap, reload: reloadRequirements } = useRequirements()
    const workLogs = useWorkLogs()
    const { showModal } = useModal()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [taskModalOpen, setTaskModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<SubRequirement | null>(null)
    const [workLogModalOpen, setWorkLogModalOpen] = useState(false)
    const [workLogInitialSubId, setWorkLogInitialSubId] = useState<number | null>(null)
    const [requirementModalOpen, setRequirementModalOpen] = useState(false)
    const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null)
    const [wlogs, setWlogs] = useState<WorkLog[]>([])
    const [loggedBySub, setLoggedBySub] = useState<Record<number, number>>({})
    const [localSubs, setLocalSubs] = useState<SubRequirement[]>(() => subReqMap[mid] || [])

    useEffect(() => {
        setLocalSubs(subReqMap[mid] || [])
    }, [subReqMap, mid])

    const project = projects.find(p => p.id === pid)
    const milestone = (projectData[pid]?.milestones || []).find(m => m.id === mid) || null

    useEffect(() => {
        let mounted = true
        async function load() {
            try {
                setLoading(true)
                if (!pid || !mid) {
                    setError('Missing ids')
                    return
                }
                const w = await workLogs.getWorkLogsForMilestone(mid)
                const map = await workLogs.getLoggedBySubForMilestone(mid)
                if (!mounted) return
                setWlogs(w)
                setLoggedBySub(map)
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err)
                setError(msg)
            } finally {
                setLoading(false)
            }
        }
        void load()
        return () => { mounted = false }
    }, [pid, mid, workLogs])

    function getAvatarClassByUser(u: User) {
        const role = roles.getUserRole(u)
        return roles.getRoleColorClass(role)
    }

    function fmtHours(h: number) {
        if (h === undefined || h === null) return '0:00'
        const whole = Math.floor(h)
        const minutes = Math.round((h - whole) * 60)
        return `${whole}:${String(minutes).padStart(2, '0')}`
    }

    // derive per-user planned from projectData and logged from actual worklogs (seconds -> hours)
    const plannedEntries = (projectData[pid]?.planned || []).filter(p => p.milestoneId === mid)
    const pmap: Record<number, number> = {}
    users.forEach(u => { pmap[u.id] = 0 })
    plannedEntries.forEach(p => { pmap[p.userId] = (pmap[p.userId] || 0) + (p.plannedHours || 0) })

    // aggregate logged seconds from loaded worklogs for accuracy (matches modal)
    const lmapSeconds: Record<number, number> = {}
    users.forEach(u => { lmapSeconds[u.id] = 0 })
    wlogs.forEach(w => { lmapSeconds[w.userId] = (lmapSeconds[w.userId] || 0) + (w.seconds || 0) })
    const roundedLogged: Record<number, number> = {}
    Object.keys(lmapSeconds).forEach(k => { roundedLogged[Number(k)] = Math.round(((lmapSeconds[Number(k)] / 3600) + Number.EPSILON) * 100) / 100 })

    if (loading) return <div className="p-6">{texts.general.loading}</div>
    if (error) return <div className="p-6">{texts.general.errorPrefix} {error}</div>
    if (!milestone) return <div className="p-6">Milník nenalezen</div>

    return (
        <div className="max-w-screen-xl mx-auto p-6 space-y-6">

            {/* HEADER CARD */}
            <div className="tp-card rounded-lg shadow p-6 flex items-start gap-6">

                {/* LEFT (title + progress + key numbers) */}
                <div className="flex-1 min-w-0">
                    <div>
                        <div className="text-xs tp-muted">Milník</div>
                        <div className="text-3xl md:text-4xl font-semibold leading-tight">{milestone.name}</div>
                        {project?.name ? <div className="text-sm tp-muted mt-1">{project?.name}</div> : null}
                    </div>

                    <div className="mt-4">
                        <div className="text-xs tp-muted">Hotovo</div>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex-1 h-2 tp-muted-bg rounded overflow-hidden">
                                <div className="h-2 tp-accent-bg rounded" style={{ width: `${Math.min(100, Math.max(0, milestone.donePercent ?? 0))}%` }} />
                            </div>
                            <div className="font-semibold text-sm whitespace-nowrap tp-positive">{milestone.donePercent ?? 0}&nbsp;%</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-6 items-center">
                        <div>
                            <div className="text-xs tp-muted">Příjem</div>
                            <div className="text-2xl md:text-3xl font-bold">{milestone.incomeAmount.toLocaleString('cs-CZ')} Kč</div>
                        </div>
                        <div>
                            <div className="text-xs tp-muted">Začátek</div>
                            <div className="font-medium">{months.monthName(milestone.startMonth)} {milestone.startYear}</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT – PEOPLE SUMMARY (card) */}
                <div className="w-full sm:w-96">
                    <div className="tp-muted-bg border tp-border rounded-xl p-4">
                        <div className="text-sm font-semibold tp-text mb-3">Kapacity osob</div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse text-xs">
                                <colgroup>
                                    <col style={{ width: '40%' }} />
                                    <col style={{ width: '20%' }} />
                                    <col style={{ width: '20%' }} />
                                    <col style={{ width: '20%' }} />
                                </colgroup>
                                <thead>
                                    <tr className="tp-muted-bg text-xs tp-muted border-b tp-border">
                                        <th className="px-4 py-2 text-left"></th>
                                        <th className="px-4 py-2 text-right">Plán</th>
                                        <th className="px-4 py-2 text-right">Logy</th>
                                        <th className="px-4 py-2 text-right">Rozdíl</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => {
                                        const p = pmap[u.id] || 0
                                        const l = roundedLogged[u.id] || 0
                                        const diff = l - p
                                        return (
                                            <tr key={`sum-${u.id}`} className="border-t tp-border">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-8 h-8 rounded-full ${getAvatarClassByUser(u)} text-white flex items-center justify-center text-xs`}>{u.shortName}</span>
                                                        <div>
                                                            <div className="text-sm tp-text font-medium">{u.firstName || ''}</div>
                                                            <div className="text-xs tp-muted">{u.lastName || ''}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">{p}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="text-right w-full text-sm tp-text" onClick={(e) => { e.stopPropagation(); e.preventDefault(); showModal(<WorkLogsModal workLogs={wlogs.filter(w => w.userId === u.id)} users={users} />); }} aria-label={`Zobrazit logy uživatele ${u.firstName}`}>{l}</button>
                                                </td>
                                                <td className={`px-4 py-3 text-right ${diff < 0 ? 'text-red-600' : diff > 0 ? 'text-green-600' : ''}`}>{diff < 0 ? String(diff) : diff > 0 ? `+${diff}` : '0'}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* TASK GROUPS */}
            <div className="tp-card rounded-lg shadow p-6 space-y-6">
                {(localSubs.length === 0) ? (
                    <div className="text-sm tp-muted">Žádné úkoly v tomto milníku.</div>
                ) : (
                    Object.entries(
                        localSubs.reduce((acc: Record<number, SubRequirement[]>, s) => {
                            if (!acc[s.requirementId]) acc[s.requirementId] = []
                            acc[s.requirementId].push(s)
                            return acc
                        }, {})
                    ).map(([reqId, subs]) => {
                        const req = (requirementsMap[pid] || []).find(r => r.id === Number(reqId))
                        return (
                            <div key={reqId}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="font-semibold">{req?.name}</div>
                                        {req?.category ? <div className="text-xs tp-muted ml-2">{req.category}</div> : null}
                                    {req?.priority ? <div className="text-xs tp-muted ml-2">{req.priority}</div> : null}
                                    <div className="ml-auto flex items-center gap-2">
                                        <button
                                            className="px-2 py-1 text-xs border rounded hover-accent tp-text"
                                            onClick={(e) => {
                                                e.stopPropagation(); e.preventDefault(); setEditingRequirement(req ?? null); setTimeout(() => setRequirementModalOpen(true), 0)
                                            }}
                                        >E</button>
                                        <button
                                            title="Přidat log práce"
                                            className="px-2 py-1 text-xs border rounded hover-accent tp-text"
                                            onClick={(e) => {
                                                e.stopPropagation(); e.preventDefault();
                                                // prefill with first subRequirement of this requirement if available
                                                const firstSub = localSubs.find(s => s.requirementId === req?.id)
                                                setWorkLogInitialSubId(firstSub ? firstSub.id : null)
                                                setWorkLogModalOpen(true)
                                            }}
                                        >+</button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse text-sm">
                                        <colgroup>
                                            <col style={{ width: '50%' }} />
                                            <col style={{ width: '20%' }} />
                                            <col style={{ width: '15%' }} />
                                            <col style={{ width: '15%' }} />
                                        </colgroup>
                                        <thead>
                                            <tr className="tp-muted-bg text-xs tp-muted border-b tp-border">
                                                <th className="px-4 py-2 text-left">Úkol</th>
                                                <th className="px-4 py-2 text-left">Přiděleno</th>
                                                <th className="px-4 py-2 text-right">Plán (h)</th>
                                                <th className="px-4 py-2 text-right">Logy (h)</th>
                                                <th className="px-4 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subs.map(s => {
                                                const assigned = users.find(u => u.id === s.assignedToId)
                                                const loggedH = loggedBySub[s.id] || 0
                                                return (
                                                    <tr className="border-t tp-border" key={s.id}>
                                                        <td className="px-4 py-3">{s.name}</td>
                                                        <td className="px-4 py-3">{assigned ? `${assigned.firstName} ${assigned.lastName}` : '-'}</td>
                                                        <td className="px-4 py-3 text-right">{s.estimateHours ? `${s.estimateHours}:00` : '-'}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button className="text-right w-full text-sm tp-text" onClick={(e) => { e.stopPropagation(); e.preventDefault(); showModal(<WorkLogsModal workLogs={wlogs.filter(w => w.subRequirementId === s.id)} users={users} />); }} aria-label="Zobrazit logy práce">{fmtHours(loggedH)}</button>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button className="px-2 py-1 text-xs border rounded hover-accent tp-text" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setEditingTask(s); setTimeout(() => setTaskModalOpen(true), 0); }}>E</button>
                                                                <button className="px-2 py-1 text-xs border rounded hover-accent tp-text" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setWorkLogInitialSubId(s.id); setWorkLogModalOpen(true); }}>+</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <button className="mt-2 text-sm tp-accent" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setEditingTask({ id: 0, requirementId: Number(reqId), milestoneId: milestone!.id, name: '', estimateHours: 0, assignedToId: undefined }); setTimeout(() => setTaskModalOpen(true), 0); }}>+ úkol</button>
                            </div>
                        )
                    })
                )}

                <button className="text-sm tp-accent" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setEditingRequirement(null); setTimeout(() => setRequirementModalOpen(true), 0); }}>+ požadavek</button>
            </div>

                <TaskEditModal
                open={taskModalOpen}
                onClose={() => { setTaskModalOpen(false); setEditingTask(null) }}
                users={users}
                initial={editingTask}
                onSave={(task) => {
                    // update localSubs (no API provided for sub-requirements here)
                    if (!task.id || !localSubs.find(s => s.id === task.id)) {
                        const nextId = (localSubs.reduce((m, s) => Math.max(m, s.id), 0) || 1100) + 1
                        const newTask: SubRequirement = { ...task, id: nextId, milestoneId: milestone!.id }
                        setLocalSubs(prev => [...prev, newTask])
                    } else {
                        setLocalSubs(prev => prev.map(s => s.id === task.id ? { ...s, ...task } : s))
                    }
                }}
            />

                <RequirementEditModal
                open={requirementModalOpen}
                onClose={() => { setRequirementModalOpen(false); setEditingRequirement(null) }}
                projectId={pid}
                initial={editingRequirement}
                onSave={async (req) => {
                    if (!req.id || !(requirementsMap[pid] || []).find(r => r.id === req.id)) {
                        await createRequirement(pid, { name: req.name, priority: req.priority, description: req.description, category: req.category, activity: req.activity })
                    } else {
                        await updateRequirement(req)
                    }
                    // refresh requirements and project data
                    await reloadRequirements([pid])
                    await reloadProjects()
                }}
            />

                <WorkLogModal
                open={workLogModalOpen}
                onClose={() => { setWorkLogModalOpen(false); setWorkLogInitialSubId(null) }}
                initialSubRequirementId={workLogInitialSubId}
                users={users.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName }))}
                onSave={async (payload) => {
                    await createWorkLog({ ...payload })
                    // clear worklogs cache and refresh derived data
                    workLogs.clearCache()
                    await reloadProjects()
                    await reloadRequirements([pid], [mid])
                    const w = await workLogs.getWorkLogsForMilestone(mid)
                    const map = await workLogs.getLoggedBySubForMilestone(mid)
                    setWlogs(w)
                    setLoggedBySub(map)
                }}
            />

        </div>
    )
}
