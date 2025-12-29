import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import useTexts from '../hooks/useTexts'
import PlanLoggedControls from '../components/shared/PlanLoggedControls'
import MonthPager from '../components/shared/MonthPager'
import { fetchProjects, fetchUsers, fetchMilestones, fetchPlannedCapacities, fetchLoggedCapacities } from '../api'
import type { Project, ProjectMilestone, User } from '../types'
import { getUserRole, getRoleColorClass, getInitials } from '../hooks/useRoles'

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

    // removed unused onPickMonth (previously used by a hidden month input)

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
    // employees table filters
    const [empSearch, setEmpSearch] = useState('')
    const [empFilterProject, setEmpFilterProject] = useState<string>('')
    const [empFilterRole, setEmpFilterRole] = useState<string>('')
    const [empOnlyParticipants, setEmpOnlyParticipants] = useState(true)

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
                    // load planned and logged for project
                    const planned = await fetchPlannedCapacities(p.id)
                    const logged = await fetchLoggedCapacities(p.id)

                    // project-level aggregates (for project profit columns)

                    for (const ms of milestones) {
                        // find planned/logged entries for this milestone in selected month
                        const plannedEntriesForMonth = planned.filter(pp => pp.milestoneId === ms.id && pp.year === y && pp.month === m)
                        const loggedEntriesForMonth = logged.filter(ll => ll.milestoneId === ms.id && ll.year === y && ll.month === m)

                        if (plannedEntriesForMonth.length === 0 && loggedEntriesForMonth.length === 0) continue

                        const plannedByUser: Record<number, number> = {}
                        const loggedByUser: Record<number, number> = {}
                        us.forEach(u => { plannedByUser[u.id] = 0; loggedByUser[u.id] = 0 })

                        plannedEntriesForMonth.forEach(pv => { plannedByUser[pv.userId] = (plannedByUser[pv.userId] || 0) + (pv.plannedHours || 0) })
                        loggedEntriesForMonth.forEach(lv => { loggedByUser[lv.userId] = (loggedByUser[lv.userId] || 0) + (lv.loggedHours || 0) })

                        // compute month value — prorate incomeAmount by share of planned hours in this month vs milestone total planned
                        const totalPlannedForMilestone = planned.filter(pp => pp.milestoneId === ms.id).reduce((s, it) => s + (it.plannedHours || 0), 0)
                        const incomeForMonth = (totalPlannedForMilestone > 0 && ms.incomeAmount) ? Math.round((ms.incomeAmount || 0) * (ms.donePercent / 100)) : 0

                        // predicted cost = sum planned for month * user cost
                        const predictedCost = Object.entries(plannedByUser).reduce((s, [userIdStr, hrs]) => {
                            const user = us.find(u => u.id === Number(userIdStr))
                            return s + (hrs || 0) * (user?.costPerHour || 0)
                        }, 0)

                        const predictedProfit = Math.round((incomeForMonth || 0) - predictedCost)

                        allRows.push({ project: p, milestone: ms, plannedByUser, loggedByUser, incomeForMonth, valueForMonth: incomeForMonth, predictedCost, predictedProfit })
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

    // per-user aggregates across all rows for summary lines
    const userAssigned: Record<number, number> = {}
    const userLoggedInProjects: Record<number, number> = {}
    const userLoggedTotal: Record<number, number> = {}
    users.forEach(u => { userAssigned[u.id] = 0; userLoggedInProjects[u.id] = 0; userLoggedTotal[u.id] = 0 })

    // Local helper type for optional user properties used only in this view
    type UserExtras = { capacity?: number; monthlyCapacity?: number; role?: string }

    // role helpers are shared in src/utils/roles

    // list of projects present in rows (for filter select)
    const projectsForFilter = useMemo(() => {
        const map = new Map<number, Project>()
        rows.forEach(r => map.set(r.project.id, r.project))
        return Array.from(map.values())
    }, [rows])

    // roles found on users (derived from flags)
    const rolesForFilter = useMemo(() => {
        const set = new Set<string>()
        users.forEach(u => set.add(getUserRole(u)))
        return Array.from(set)
    }, [users])

    // map user -> set of project ids they participate in (based on rows)
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

    // filtered users for employees table

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            // search by full name (firstName + lastName) or shortName
            const q = empSearch.trim().toLowerCase()
            if (q) {
                const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim()
                const matchesFull = fullName.toLowerCase().includes(q)
                const matchesShort = (u.shortName || '').toLowerCase().includes(q)
                if (!matchesFull && !matchesShort) return false
            }

            // role filter (derived)
            if (empFilterRole) {
                const role = getUserRole(u)
                if (role !== empFilterRole) return false
            }

            // project filter / participants filter
            if (empFilterProject) {
                const pid = Number(empFilterProject)
                const set = userProjectMap.get(u.id)
                if (!set || !set.has(pid)) return false
            } else if (empOnlyParticipants) {
                // when no project selected but checkbox is enabled, only show users who participate in any project
                const set = userProjectMap.get(u.id)
                if (!set || set.size === 0) return false
            }

            return true
        })
    }, [users, empSearch, empFilterProject, empFilterRole, userProjectMap, empOnlyParticipants])

    // collect per-project logged for displayed projects
    for (const r of rows) {
        for (const [uidStr, hrs] of Object.entries(r.plannedByUser)) userAssigned[Number(uidStr)] += hrs
        for (const [uidStr, hrs] of Object.entries(r.loggedByUser)) userLoggedInProjects[Number(uidStr)] += hrs
    }

    // compute logged total across all projects for the month by refetching per-project logged entries (simpler: rows contain logged for displayed projects; for total logged we reuse same value here)
    // NOTE: in real API we'd fetch all logs for month. For now use userLoggedInProjects as total as well.
    Object.keys(userLoggedInProjects).forEach(k => userLoggedTotal[Number(k)] = userLoggedInProjects[Number(k)])

    if (loading) return <div>{texts.general.loading}</div>
    if (error) return <div>{texts.general.errorPrefix} {String(error)}</div>

    return (
        <div className="max-w-screen-2xl mx-auto p-6 space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tp-text">{title}</h1>
                    <div className="tp-muted mt-2">{texts.pages.monthlyOverview.description}</div>
                </div>

                <div className="flex items-center gap-4">
                    <MonthPager year={y} month={m} onChange={(ny, nm) => replaceYearMonth(ny, nm)} />
                </div>
            </div>

            {/* GLOBAL LEGEND: show roles and status once at the top */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm tp-muted">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full role-pm" /> {texts.capacityMatrix.roles.pm}</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full role-creative" /> {texts.capacityMatrix.roles.creative}</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full role-inactive" /> {texts.capacityMatrix.roles.inactive}</div>
                </div>

                <div className="flex items-center gap-6 text-xs tp-muted">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full status-logged"></span><span>Zalogováno</span></div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full status-none"></span><span>Bez logů</span></div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full status-over"></span><span>Překročeno (logy &gt; plán)</span></div>
                </div>
            </div>

            {/* QUICK NAV: employees + projects on left, Plan/Logged controls aligned to the right */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div>
                        <a href="#employee-capacity" className="px-3 py-1 tp-muted-bg hover-accent tp-text rounded text-sm">Přejít na kapacitu zaměstnanců</a>
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


            <div id="projects" className="space-y-6">
                {Object.values(rows.reduce((acc, r) => {
                    if (!acc[r.project.id]) acc[r.project.id] = { project: r.project, rows: [] as typeof rows }
                    acc[r.project.id].rows.push(r)
                    return acc
                }, {} as Record<number, { project: Project; rows: typeof rows }>)).map(group => {
                    const projRows = group.rows
                    const projectIncome = projRows.reduce((s, it) => s + (it.milestone.incomeAmount || 0), 0)
                    const projectPredictedCost = projRows.reduce((s, it) => s + (it.predictedCost || 0), 0)
                    const projectPredictedProfit = projectIncome - projectPredictedCost
                    const projectProfitPct = projectIncome > 0 ? Math.round((projectPredictedProfit / projectIncome) * 1000) / 10 : 0

                    // participants for this project (users with any planned/logged in project)
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
                            {/* PROJECT HEADER */}
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
                                            <div className="text-xs tp-muted">Celkový příjem</div>
                                            <div className="font-semibold tp-text">{projectIncome ? fmtMoney(projectIncome) : '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs tp-muted">Predikce zisku</div>
                                            <div className="font-semibold tp-positive">{projectPredictedProfit ? fmtMoney(projectPredictedProfit) : '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs tp-muted">Zisk / příjem</div>
                                            <div className="font-semibold tp-positive">{projectIncome ? `${projectProfitPct} %` : '—'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* per-project legend removed — single global legend shown at top */}
                            </div>

                            {/* MILESTONES MATRIX */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse">
                                    <colgroup>
                                        <col style={{ width: '14rem' }} />
                                        {participants.map(p => (
                                            <col key={`col-${group.project.id}-${p.id}`} style={{ width: '5rem' }} />
                                        ))}
                                        <col style={{ width: '10rem' }} />
                                        <col style={{ width: '10rem' }} />
                                        <col style={{ width: '10rem' }} />
                                    </colgroup>
                                    <tbody>
                                        <tr className="tp-muted-bg text-xs tp-muted border-b tp-border">
                                            <td className="px-4 py-2">Milník</td>
                                            {participants.map(p => (
                                                <td key={`hdr-${group.project.id}-${p.id}`} className="text-center font-semibold">
                                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${getRoleColorClass(getUserRole(p))}`} aria-label={getUserRole(p)}>
                                                        {getInitials(p)}
                                                    </span>
                                                </td>
                                            ))}
                                            <td className='px-3 py-2 text-right'>Hodnota (Kč)</td>
                                            <td className="px-3 py-2 text-right">Plán (Kč)</td>
                                            <td className="px-3 py-2 text-right">Čerp. (Kč)</td>
                                            <td className="px-3 py-2 pr-6 text-right">Pred. zisk (Kč)</td>
                                        </tr>

                                        {projRows.map((rr, idx2) => {
                                            // plan in CZK: sum of planned hours * user's tariff (costPerHour)
                                            const planCzk = Object.entries(rr.plannedByUser).reduce((s, [uidStr, hrs]) => {
                                                const user = users.find(u => u.id === Number(uidStr))
                                                return s + (hrs || 0) * (user?.costPerHour || 0)
                                            }, 0)

                                            const loggedCost = Object.entries(rr.loggedByUser).reduce((s, [uidStr, hrs]) => {
                                                const user = users.find(u => u.id === Number(uidStr))
                                                return s + (hrs || 0) * (user?.costPerHour || 0)
                                            }, 0)

                                            return (
                                                <tr key={`m-${group.project.id}-${idx2}`} className="border-t tp-border">
                                                    <td className="px-4 py-3 font-medium">{rr.milestone.name}</td>
                                                    {participants.map(p => (
                                                        <td key={`cell-${group.project.id}-${rr.milestone.id}-${p.id}`} className="text-center">
                                                            <div className="font-medium">{showPlan ? String(rr.plannedByUser[p.id] || 0) : ''}{(showPlan && showLogged) ? ' / ' : ''}{showLogged ? String(rr.loggedByUser[p.id] || 0) : ''}</div>
                                                            <div className={`w-2 h-2 mx-auto mt-1 rounded-full ${((rr.loggedByUser[p.id] || 0) > (rr.plannedByUser[p.id] || 0)) ? 'status-over' : (rr.loggedByUser[p.id] ? 'status-logged' : 'status-none')}`} title={rr.loggedByUser[p.id] ? `Zalogováno: ${rr.loggedByUser[p.id]}h` : 'Bez logů'} />
                                                        </td>
                                                    ))}

                                                    <td className="text-right">{rr.valueForMonth ? fmtMoney(rr.valueForMonth) : '—'}</td>
                                                    <td className="text-right">{planCzk ? fmtMoney(planCzk) : '—'}</td>
                                                    <td className="text-right">{loggedCost ? fmtMoney(loggedCost) : '—'}</td>
                                                    <td className="text-right tp-positive font-semibold pr-6">{rr.predictedProfit ? fmtMoney(rr.predictedProfit) : '—'}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* EMPLOYEES SUMMARY TABLE (moved below projects) */}
            <div id="employee-capacity" className="tp-muted-bg border tp-border rounded-xl p-4">
                <h3 className="text-lg font-semibold tp-text mb-3">Kapacita zaměstnanců — {String(m).padStart(2, '0')} / {y}</h3>
                {/* legend removed from capacity list — using the global legend at the top of the page */}
                <div className="overflow-x-auto">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                            <input value={empSearch} onChange={e => setEmpSearch(e.target.value)} className="w-56 tp-card tp-text border tp-border rounded px-3 py-2 placeholder:tp-muted focus:outline-none focus:ring-1" placeholder="Hledat jméno" />
                            <select value={empFilterRole} onChange={e => setEmpFilterRole(e.target.value)} className="w-40 tp-card tp-text border tp-border rounded px-3 py-2 focus:outline-none focus:ring-1">
                                <option value="">Všechny role</option>
                                {rolesForFilter.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <label className="flex items-center text-sm tp-muted">
                                <input type="checkbox" checked={empOnlyParticipants} onChange={e => setEmpOnlyParticipants(e.target.checked)} className="form-checkbox h-4 w-4 tp-accent bg-transparent border tp-border rounded mr-2" />
                                Pouze účastníci projektu
                            </label>
                        </div>

                        <div className="flex items-center gap-2">
                            <select value={empFilterProject} onChange={e => setEmpFilterProject(e.target.value)} className="w-64 tp-card tp-text border tp-border rounded px-3 py-2 focus:outline-none focus:ring-1">
                                <option value="">Všechny projekty</option>
                                {projectsForFilter.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
                            </select>
                            <button onClick={() => { setEmpSearch(''); setEmpFilterProject(''); setEmpFilterRole(''); setEmpOnlyParticipants(true) }} className="px-3 py-2 tp-muted-bg hover-accent tp-text rounded border tp-border">Reset</button>
                        </div>
                    </div>

                    <table className="min-w-full border-collapse text-sm">
                        <colgroup>
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '12%' }} />
                        </colgroup>
                        <thead>
                            <tr className="tp-muted text-xs border-b tp-border">
                                <th className="px-4 py-3 text-left">Osoba</th>
                                <th className="px-4 py-3 text-right">Kapacita</th>
                                <th className="px-4 py-3 text-right">Přiděleno</th>
                                <th className="px-4 py-3 text-right">Zbývá</th>
                                <th className="px-4 py-3 text-right">Zalog. projekty</th>
                                <th className="px-4 py-3 text-right">Zalog. celkem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => {
                                const extra = u as UserExtras
                                const capacity = extra.capacity ?? extra.monthlyCapacity ?? 160
                                const role = getUserRole(u)
                                const assigned = userAssigned[u.id] || 0
                                const loggedProj = userLoggedInProjects[u.id] || 0
                                const loggedTotal = userLoggedTotal[u.id] || 0
                                const remaining = capacity - assigned
                                const remainingLabel = (remaining >= 0 ? `+${remaining}h` : `${remaining}h`)
                                return (
                                    <tr key={`emp-${u.id}`} className="border-t tp-border">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span title={role} className={`inline-block w-3 h-3 rounded-full ${getRoleColorClass(role)}`} />
                                                <div className="font-medium tp-text">{`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.shortName}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">{String(capacity)}h</td>
                                        <td className="px-4 py-3 text-right">{String(assigned)}h</td>
                                        <td className={`px-4 py-3 text-right ${remaining >= 0 ? 'tp-positive' : 'tp-danger'} font-semibold`}>{remainingLabel}</td>
                                        <td className="px-4 py-3 text-right">{String(loggedProj)}h</td>
                                        <td className="px-4 py-3 text-right">{String(loggedTotal)}h</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
