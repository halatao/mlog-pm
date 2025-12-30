import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import useTexts from '../hooks/useTexts'
import PlanLoggedControls from '../components/shared/PlanLoggedControls'
import CapacityLegend from '../components/shared/CapacityLegend'
import MonthPager from '../components/shared/MonthPager'
import EmployeeCapacityTable from '../components/shared/EmployeeCapacityTable'
import { fetchProjects, fetchUsers, fetchMilestones, fetchPlannedCapacities, fetchLoggedCapacities } from '../api'
import type { Project, ProjectMilestone, User } from '../types'
import { getUserRole } from '../hooks/useRoles'
import ProjectMilestonesTable from '../components/shared/ProjectMilestonesTable'

export default function MonthlyOverviewPage() {
    const { year, month } = useParams<{ year: string; month: string }>()
    const y = Number(year)
    const m = Number(month)
    const texts = useTexts()
    const navigate = useNavigate()
    const location = useLocation()

    function replaceYearMonth(newY: number, newM: number) {
        const parts = location.pathname.split('/').filter(Boolean)
        if (parts.length >= 2) {
            parts[parts.length - 2] = String(newY)
            parts[parts.length - 1] = String(newM)
            navigate('/' + parts.join('/'))
        } else {
            navigate(`/${newY}/${newM}`)
        }
    }

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [users, setUsers] = useState<User[]>([])
    const [rows, setRows] = useState<Array<{
        project: Project
        milestone: ProjectMilestone
        plannedByUser: Record<number, number>
        loggedByUser: Record<number, number>
        incomeForMonth: number
        valueForMonth: number
        predictedCost: number
        predictedProfit: number
    }>>([])

    const [showPlan, setShowPlan] = useState(true)
    const [showLogged, setShowLogged] = useState(true)
    const [empSearch, setEmpSearch] = useState('')
    const [empFilterProject, setEmpFilterProject] = useState<string>('')
    const [empFilterRole, setEmpFilterRole] = useState<string>('')
    const [empOnlyParticipants, setEmpOnlyParticipants] = useState(true)
    const [empEditMode, setEmpEditMode] = useState(false)
    const [empEditedCapacity, setEmpEditedCapacity] = useState<Record<number, number> | null>(null)
    const [empSavedCapacity, setEmpSavedCapacity] = useState<Record<number, number> | null>(null)
    const [empCellEditingCapacityUserId, setEmpCellEditingCapacityUserId] = useState<number | null>(null)

    useEffect(() => {
        let mounted = true
        async function load() {
            setLoading(true)
            try {
                const [ps, us] = await Promise.all([fetchProjects(), fetchUsers()])
                if (!mounted) return
                setUsers(us)

                const allRows: typeof rows = []

                await Promise.all(ps.map(async (p) => {
                    const [milestones] = await Promise.all([fetchMilestones(p.id)])
                    const planned = await fetchPlannedCapacities(p.id)
                    const logged = await fetchLoggedCapacities(p.id)

                    const plannedByMilestone = planned.reduce((map, entry) => {
                        const arr = map.get(entry.milestoneId) || []
                        arr.push(entry)
                        map.set(entry.milestoneId, arr)
                        return map
                    }, new Map<number, typeof planned>())

                    const loggedByMilestone = logged.reduce((map, entry) => {
                        const arr = map.get(entry.milestoneId) || []
                        arr.push(entry)
                        map.set(entry.milestoneId, arr)
                        return map
                    }, new Map<number, typeof logged>())

                    const usersById = new Map(us.map(u => [u.id, u]))

                    for (const ms of milestones) {
                        const allPlanned = plannedByMilestone.get(ms.id) || []
                        const plannedEntriesForMonth = allPlanned.filter(pp => pp.year === y && pp.month === m)
                        const allLogged = loggedByMilestone.get(ms.id) || []
                        const loggedEntriesForMonth = allLogged.filter(ll => ll.year === y && ll.month === m)

                        const plannedByUser = Object.fromEntries(us.map(u => [u.id, 0])) as Record<number, number>
                        const loggedByUser = Object.fromEntries(us.map(u => [u.id, 0])) as Record<number, number>

                        for (const pv of plannedEntriesForMonth) plannedByUser[pv.userId] = (plannedByUser[pv.userId] || 0) + (pv.plannedHours || 0)
                        for (const lv of loggedEntriesForMonth) loggedByUser[lv.userId] = (loggedByUser[lv.userId] || 0) + (lv.loggedHours || 0)

                        const plannedTotalForMilestone = allPlanned.reduce((s, pv) => s + (pv.plannedHours || 0), 0)
                        const plannedThisMonthTotal = plannedEntriesForMonth.reduce((s, pv) => s + (pv.plannedHours || 0), 0)

                        const incomeForMonth = (ms.endMonth === m && ms.endYear === y) ? Math.round(ms.incomeAmount) : 0

                        const predictedCost = Object.entries(plannedByUser).reduce((s, [userIdStr, hrs]) => {
                            const user = usersById.get(Number(userIdStr))
                            return s + (hrs || 0) * (user?.costPerHour || 0)
                        }, 0)

                        const predictedProfit = incomeForMonth - predictedCost

                        const numberOfMonths = ((ms.endYear ?? ms.startYear) - ms.startYear) * 12 + ((ms.endMonth ?? ms.startMonth) - ms.startMonth + 1)
                        let valueForMonth = 0
                        if (plannedTotalForMilestone > 0) {
                            valueForMonth = Math.round((ms.incomeAmount || 0) * (plannedThisMonthTotal / plannedTotalForMilestone))
                        } else {
                            valueForMonth = numberOfMonths ? Math.round((ms.incomeAmount || 0) / numberOfMonths) : 0
                        }

                        allRows.push({ project: p, milestone: ms, plannedByUser, loggedByUser, incomeForMonth, valueForMonth, predictedCost, predictedProfit })
                    }
                }))

                if (!mounted) return
                setRows(allRows)
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err)
                setError(msg || 'Failed to load monthly overview data')
            } finally {
                setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [y, m])

    const title = useMemo(() => texts.pages.monthlyOverview.title.split('—')[0].trim(), [texts])

    function fmtMoney(n: number) { return n.toLocaleString('cs-CZ') + '\u00A0Kč' }
    function fmtNumber(n: number) { return n.toLocaleString('cs-CZ') }

    const userAssigned: Record<number, number> = {}
    const userLoggedInProjects: Record<number, number> = {}
    const userLoggedTotal: Record<number, number> = {}
    users.forEach(u => { userAssigned[u.id] = 0; userLoggedInProjects[u.id] = 0; userLoggedTotal[u.id] = 0 })



    const projectsForFilter = useMemo(() => {
        const map = new Map<number, Project>()
        rows.forEach(r => map.set(r.project.id, r.project))
        return Array.from(map.values())
    }, [rows])

    const rolesForFilter = useMemo(() => {
        const set = new Set<string>()
        users.forEach(u => set.add(getUserRole(u)))
        return Array.from(set)
    }, [users])

    const userProjectMap = useMemo(() => {
        const map = new Map<number, Set<number>>()
        rows.forEach(r => {
            const pid = r.project.id
            Object.keys(r.plannedByUser).forEach(k => {
                if (Number(r.plannedByUser[Number(k)]) || Number(r.loggedByUser[Number(k)])) {
                    const uid = Number(k)
                    if (!map.has(uid)) map.set(uid, new Set())
                    map.get(uid)!.add(pid)
                }
            })
            Object.keys(r.loggedByUser).forEach(k => {
                if (Number(r.plannedByUser[Number(k)]) || Number(r.loggedByUser[Number(k)])) {
                    const uid = Number(k)
                    if (!map.has(uid)) map.set(uid, new Set())
                    map.get(uid)!.add(pid)
                }
            })
        })
        return map
    }, [rows])


    for (const r of rows) {
        for (const [uidStr, hrs] of Object.entries(r.plannedByUser)) userAssigned[Number(uidStr)] += hrs
        for (const [uidStr, hrs] of Object.entries(r.loggedByUser)) userLoggedInProjects[Number(uidStr)] += hrs
    }

    Object.keys(userLoggedInProjects).forEach(k => userLoggedTotal[Number(k)] = userLoggedInProjects[Number(k)])

    const activeProjectGroups = useMemo(() => {
        const grouped = Object.values(rows.reduce((acc, r) => {
            if (!acc[r.project.id]) acc[r.project.id] = { project: r.project, rows: [] as typeof rows }
            acc[r.project.id].rows.push(r)
            return acc
        }, {} as Record<number, { project: Project; rows: typeof rows }>))

        return grouped.filter(group => group.rows.some(rr => {
            const ms = rr.milestone
            const started = ms.startYear < y || (ms.startYear === y && ms.startMonth <= m)
            const notEnded = (ms.endYear === undefined) || (ms.endYear > y) || (ms.endYear === y && (ms.endMonth ?? ms.startMonth) >= m)
            return started && notEnded
        }))
    }, [rows, y, m])

    if (loading) return <div>{texts.general.loading}</div>
    if (error) return <div>{texts.general.errorPrefix} {String(error)}</div>

    return (
        <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tp-text">{title}</h1>
                    <div className="tp-muted mt-2">{texts.pages.monthlyOverview.description}</div>
                </div>

                <div className="flex items-center gap-4">
                    <MonthPager year={y} month={m} onChange={(ny, nm) => replaceYearMonth(ny, nm)} />
                </div>
            </div>

            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div>
                        <a href="#employee-capacity" className="px-3 py-1 tp-muted-bg hover-accent tp-text rounded text-sm">{texts.capacityMatrix?.gotoEmployeeCapacity || 'Přejít na kapacitu zaměstnanců'}</a>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="flex gap-2 items-center">
                            {projectsForFilter.map(p => (
                                <a key={`nav-${p.id}`} href={`#proj-${p.id}`} className="px-2 py-1 tp-muted-bg hover-accent tp-text rounded text-sm whitespace-nowrap">{p.name}</a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="ml-4 flex-shrink-0 self-start">
                    <PlanLoggedControls showPlan={showPlan} showLogged={showLogged} onTogglePlan={() => setShowPlan(v => !v)} onToggleLogged={() => setShowLogged(v => !v)} showEditButton={false} />
                </div>
            </div>


            <CapacityLegend inline />

            <div id="projects" className="space-y-6">
                {activeProjectGroups.map(group => {
                    const projRows = group.rows
                    const projectIncome = projRows.reduce((s, it) => s + (it.milestone.incomeAmount || 0), 0)
                    const projectPredictedCost = projRows.reduce((s, it) => s + (it.predictedCost || 0), 0)
                    const projectPredictedProfit = projectIncome - projectPredictedCost
                    const projectProfitPct = projectIncome > 0 ? Math.round((projectPredictedProfit / projectIncome) * 1000) / 10 : 0

                    const participantIds = new Set<number>()
                    projRows.forEach(rr => {
                        Object.keys(rr.plannedByUser).forEach(k => { if (Number(rr.plannedByUser[Number(k)]) || Number(rr.loggedByUser[Number(k)])) participantIds.add(Number(k)) })
                        Object.keys(rr.loggedByUser).forEach(k => { if (Number(rr.plannedByUser[Number(k)]) || Number(rr.loggedByUser[Number(k)])) participantIds.add(Number(k)) })
                    })
                    const participants = (() => {
                        const pms: User[] = []
                        const creatives: User[] = []
                        const others: User[] = []
                        users.forEach(u => {
                            if (!participantIds.has(u.id)) return
                            if (u.isActivePM) pms.push(u)
                            else if (u.isActiveCreative) creatives.push(u)
                            else others.push(u)
                        })
                        return [...pms, ...others, ...creatives]
                    })()


                    return (
                        <div id={`proj-${group.project.id}`} key={`proj-${group.project.id}`} className="border tp-border rounded-xl tp-muted-bg">
                            <div className="px-6 py-5 border-b tp-border space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold tp-text">
                                            <Link to={`/projects/${group.project.id}`} className="tp-text underline">{group.project.name}</Link>
                                        </h2>
                                        <div className="text-sm tp-muted">{texts.projectHeader.responsible} {group.project.manager ? (`${group.project.manager.firstName || ''} ${group.project.manager.lastName || ''}`.trim() || group.project.manager.shortName) : '—'}</div>
                                    </div>

                                    <div className="flex gap-8 text-sm">
                                        <div>
                                            <div className="text-xs tp-muted">{texts.kpis.totalIncome}</div>
                                            <div className="font-semibold tp-text">{projectIncome ? fmtMoney(projectIncome) : '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs tp-muted">{texts.kpis.predictedProfit}</div>
                                            <div className="font-semibold tp-positive">{projectPredictedProfit ? fmtMoney(projectPredictedProfit) : '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs tp-muted">{texts.kpis.totalIncome}</div>
                                            <div className="font-semibold tp-positive">{projectIncome ? `${projectProfitPct} %` : '—'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <ProjectMilestonesTable project={group.project} rows={projRows} users={users} participants={participants} showPlan={showPlan} showLogged={showLogged} fmtNumber={fmtNumber} />
                            </div>
                        </div>
                    )
                })}
            </div>

            <EmployeeCapacityTable
                users={users}
                month={m}
                year={y}
                userAssigned={userAssigned}
                userLoggedInProjects={userLoggedInProjects}
                userLoggedTotal={userLoggedTotal}
                projectsForFilter={projectsForFilter}
                rolesForFilter={rolesForFilter}
                userProjectMap={userProjectMap}

                empSearch={empSearch}
                setEmpSearch={setEmpSearch}
                empFilterProject={empFilterProject}
                setEmpFilterProject={setEmpFilterProject}
                empFilterRole={empFilterRole}
                setEmpFilterRole={setEmpFilterRole}
                empOnlyParticipants={empOnlyParticipants}
                setEmpOnlyParticipants={setEmpOnlyParticipants}

                empEditMode={empEditMode}
                setEmpEditMode={setEmpEditMode}
                empEditedCapacity={empEditedCapacity}
                setEmpEditedCapacity={setEmpEditedCapacity}
                empSavedCapacity={empSavedCapacity}
                setEmpSavedCapacity={setEmpSavedCapacity}
                empCellEditingCapacityUserId={empCellEditingCapacityUserId}
                setEmpCellEditingCapacityUserId={setEmpCellEditingCapacityUserId}
            />
        </div>
    )
}
