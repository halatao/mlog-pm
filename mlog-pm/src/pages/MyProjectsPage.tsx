import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useTexts from '../hooks/useTexts'
import { fetchProjects, fetchMilestones, fetchPlannedCapacities, fetchLoggedCapacities, fetchUsers } from '../api'
import type { Project, ProjectMilestone, User, PlannedCapacity, LoggedCapacity } from '../types'

export default function MyProjectsPage() {
    const texts = useTexts()
    const { userId } = useParams<{ userId?: string }>()
    const uid = Number(userId || 1)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [users, setUsers] = useState<User[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [projectData, setProjectData] = useState<Record<number, { milestones: ProjectMilestone[]; planned: PlannedCapacity[]; logged: LoggedCapacity[] }>>({})

    useEffect(() => {
        let mounted = true
        async function load() {
            setLoading(true)
            try {
                const [us, ps] = await Promise.all([fetchUsers(), fetchProjects()])
                if (!mounted) return
                setUsers(us)
                setProjects(ps)

                await Promise.all(ps.map(async (p: Project) => {
                    const [ms, pl, lo] = await Promise.all([
                        fetchMilestones(p.id),
                        fetchPlannedCapacities(p.id),
                        fetchLoggedCapacities(p.id),
                    ])
                    if (!mounted) return
                    setProjectData(prev => ({ ...prev, [p.id]: { milestones: ms, planned: pl, logged: lo } }))
                }))
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err)
                setError(msg || 'Failed to load')
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    const pmProjects = useMemo(() => projects.filter((p: Project) => p.manager && Number(p.manager.id) === uid), [projects, uid])
    const otherProjects = useMemo(() => projects.filter((p: Project) => !pmProjects.some(pp => pp.id === p.id) && (() => {
        const data = projectData[p.id]
        if (!data) return false
        const { planned, logged } = data
        return (planned || []).some((x: PlannedCapacity) => x.userId === uid) || (logged || []).some((x: LoggedCapacity) => x.userId === uid)
    })()), [projects, pmProjects, projectData, uid])

    if (loading) return <div>{texts.general.loading}</div>
    if (error) return <div>{texts.general.errorPrefix} {error}</div>

    function fmtMoney(n: number) { return n === 0 ? '—' : n.toLocaleString('cs-CZ') + '\u00A0Kč' }

    return (
        <div className="max-w-screen-2xl mx-auto p-6 space-y-12">

            {/* PAGE HEADER */}
            <div>
                <h1 className="text-3xl font-semibold tp-text">{texts.pages.myProjects.pageTitle}</h1>
                <p className="tp-muted">{texts.pages.myProjects.description}</p>
            </div>

            {/* PM PROJECTS */}
            {pmProjects.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold tp-text">{texts.pages.myProjects.headerPM}</h2>

                    <div className="border tp-border rounded-xl overflow-x-auto tp-muted-bg">
                        <table className="min-w-full border-collapse">
                            <thead className="text-xs tp-muted border-b tp-border">
                                <tr>
                                    <th className="px-4 py-3 text-left">Projekt / Milník</th>
                                    <th className="px-4 py-3 text-left">PM</th>
                                    <th className="px-4 py-3 text-left">Hotovo</th>
                                    <th className="px-4 py-3 text-right">Plán</th>
                                    <th className="px-4 py-3 text-right">Čerp.</th>
                                    <th className="px-4 py-3 text-right">Pred. náklad</th>
                                    <th className="px-4 py-3 text-right">Pred. zisk</th>
                                    <th className="px-4 py-3 text-right">Zisk proj.*</th>
                                    <th className="px-4 py-3 text-right">%*</th>
                                </tr>
                            </thead>

                            {pmProjects.map(p => {
                                const data = projectData[p.id] || { milestones: [], planned: [], logged: [] }
                                const { milestones, planned, logged } = data
                                const projectIncome = milestones.reduce((s, m) => s + (m.incomeAmount || 0), 0)
                                const totalPlannedCost = planned.reduce((s: number, it: PlannedCapacity) => {
                                    const user = users.find((u: User) => u.id === it.userId)
                                    return s + (it.plannedHours || 0) * (user?.costPerHour || 0)
                                }, 0)
                                const totalPredictedProfit = Math.round(projectIncome - totalPlannedCost)
                                const profitPct = projectIncome > 0 ? Math.round((totalPredictedProfit / projectIncome) * 100) : 0

                                return (
                                    <tbody key={`proj-${p.id}`}>
                                        <tr className="bg-slate-800/40 border-t tp-border">
                                            <td className="px-4 py-3 font-semibold tp-text" colSpan={9}>
                                                <Link to={`/projects/${p.id}`} className="tp-text underline">{p.name}</Link>
                                                <span className="ml-3 text-xs tp-muted">Příjem projektu: {fmtMoney(projectIncome)}</span>
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
                                                <tr key={`m-${m.id}`} className="border-t tp-border">
                                                    <td className="px-4 py-3 pl-6">{m.name}</td>
                                                    <td className="px-4 py-3">{p.manager?.shortName || `${p.manager?.firstName || ''} ${p.manager?.lastName || ''}`}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 h-2 tp-muted-bg rounded overflow-hidden">
                                                                <div className="h-2 tp-accent-bg" style={{ width: `${Math.min(100, Math.max(0, m.donePercent || 0))}%` }} />
                                                            </div>
                                                            <span className="text-xs tp-muted">{m.donePercent ?? 0} %</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">{mPlanned || '—'}</td>
                                                    <td className="px-4 py-3 text-right">{mLogged || '—'}</td>
                                                    <td className="px-4 py-3 text-right">{fmtMoney(mPlannedCost)}</td>
                                                    <td className="px-4 py-3 text-right tp-positive font-medium">{fmtMoney(mPredictedProfit)}</td>
                                                    <td className="px-4 py-3 text-right tp-positive font-semibold">{fmtMoney(totalPredictedProfit)}</td>
                                                    <td className="px-4 py-3 text-right tp-positive font-semibold">{profitPct} %</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                )
                            })}
                        </table>
                    </div>

                </div>
            )}

            {/* OTHER PROJECTS */}
            {otherProjects.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold tp-text">{texts.pages.myProjects.headerParticipation}</h2>

                    <div className="border tp-border rounded-xl overflow-x-auto tp-muted-bg">
                        <table className="min-w-full border-collapse">
                            <thead className="text-xs tp-muted border-b tp-border">
                                <tr>
                                    <th className="px-4 py-3 text-left">Projekt / Milník</th>
                                    <th className="px-4 py-3 text-left">PM</th>
                                    <th className="px-4 py-3 text-left">Hotovo</th>
                                    <th className="px-4 py-3 text-right">Plán</th>
                                    <th className="px-4 py-3 text-right">Čerp.</th>
                                    <th className="px-4 py-3 text-right">Pred. náklad</th>
                                    <th className="px-4 py-3 text-right">Pred. zisk</th>
                                    <th className="px-4 py-3 text-right">Zisk proj.*</th>
                                    <th className="px-4 py-3 text-right">%*</th>
                                </tr>
                            </thead>

                            {otherProjects.map((p: Project) => {
                                const data = projectData[p.id] || { milestones: [], planned: [], logged: [] }
                                const { milestones, planned, logged } = data
                                const projectIncome = milestones.reduce((s: number, m: ProjectMilestone) => s + (m.incomeAmount || 0), 0)
                                const totalPlannedCost = planned.reduce((s: number, it: PlannedCapacity) => {
                                    const user = users.find((u: User) => u.id === it.userId)
                                    return s + (it.plannedHours || 0) * (user?.costPerHour || 0)
                                }, 0)
                                const totalPredictedProfit = Math.round(projectIncome - totalPlannedCost)
                                const profitPct = projectIncome > 0 ? Math.round((totalPredictedProfit / projectIncome) * 100) : 0

                                return (
                                    <tbody key={`other-${p.id}`}>
                                        <tr className="bg-slate-800/40 border-t tp-border">
                                            <td className="px-4 py-3 font-semibold tp-text" colSpan={9}>
                                                <Link to={`/projects/${p.id}`} className="tp-text underline">{p.name}</Link>
                                                <span className="ml-3 text-xs tp-muted">Příjem projektu: {fmtMoney(projectIncome)}</span>
                                            </td>
                                        </tr>

                                        {milestones.map((m: ProjectMilestone) => {
                                            const mPlanned = planned.filter((pp: PlannedCapacity) => pp.milestoneId === m.id).reduce((s: number, it: PlannedCapacity) => s + (it.plannedHours || 0), 0)
                                            const mLogged = logged.filter((ll: LoggedCapacity) => ll.milestoneId === m.id).reduce((s: number, it: LoggedCapacity) => s + (it.loggedHours || 0), 0)
                                            const mPlannedCost = planned.filter((pp: PlannedCapacity) => pp.milestoneId === m.id).reduce((s: number, it: PlannedCapacity) => {
                                                const user = users.find((u: User) => u.id === it.userId)
                                                return s + (it.plannedHours || 0) * (user?.costPerHour || 0)
                                            }, 0)

                                            return (
                                                <tr key={`other-m-${m.id}`} className="border-t tp-border">
                                                    <td className="px-4 py-3 pl-6">{m.name}</td>
                                                    <td className="px-4 py-3">{p.manager?.shortName}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 h-2 tp-muted-bg rounded overflow-hidden">
                                                                <div className="h-2 tp-accent-bg" style={{ width: `${Math.min(100, Math.max(0, m.donePercent || 0))}%` }} />
                                                            </div>
                                                            <span className="text-xs tp-muted">{m.donePercent ?? 0} %</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">{mPlanned || '—'}</td>
                                                    <td className="px-4 py-3 text-right">{mLogged || '—'}</td>
                                                    <td className="px-4 py-3 text-right">{fmtMoney(mPlannedCost)}</td>
                                                    <td className="px-4 py-3 text-right tp-positive font-medium">{fmtMoney(Math.round((m.incomeAmount || 0) - mPlannedCost))}</td>
                                                    <td className="px-4 py-3 text-right tp-positive font-semibold">{fmtMoney(totalPredictedProfit)}</td>
                                                    <td className="px-4 py-3 text-right tp-positive font-semibold">{profitPct} %</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                )
                            })}
                        </table>
                    </div>
                </div>
            )}

            {/* Fallback when both tables are empty */}
            {pmProjects.length === 0 && otherProjects.length === 0 && (
                <div className="tp-muted text-center py-12">{texts.pages.myProjects.fallback}</div>
            )}
        </div>
    )
}
