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

    type UserExtras = { capacity?: number; monthlyCapacity?: number; role?: string }

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

    Object.keys(userLoggedInProjects).forEach(k => userLoggedTotal[Number(k)] = userLoggedInProjects[Number(k)])

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

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm tp-muted">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full role-pm" /> {texts.capacityMatrix.roles.pm}</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full role-creative" /> {texts.capacityMatrix.roles.creative}</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full role-inactive" /> {texts.capacityMatrix.roles.inactive}</div>
                </div>

                <div className="flex items-center gap-6 text-sm tp-muted">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full status-logged" /> <span>Zalogováno</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full status-none" /> <span>Bez logů</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full status-over" /> <span>Překročeno (logy &gt; plán)</span></div>
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
                                            <div className="text-xs tp-muted">Celkový příjem</div>
                                            <div className="font-semibold tp-text">{projectIncome ? fmtMoney(projectIncome) : '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs tp-muted">Celková predikce zisku</div>
                                            <div className="font-semibold tp-positive">{projectPredictedProfit ? fmtMoney(projectPredictedProfit) : '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs tp-muted">Celkový zisk / příjem</div>
                                            <div className="font-semibold tp-positive">{projectIncome ? `${projectProfitPct} %` : '—'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse">
                                    <colgroup>
                                        <col style={{ width: '16rem' }} />
                                        {participants.map(p => (
                                            <col key={`col-${group.project.id}-${p.id}`} style={{ width: '6rem' }} />
                                        ))}
                                        <col style={{ width: '9rem' }} />
                                        <col style={{ width: '10rem' }} />
                                        <col style={{ width: '9rem' }} />
                                        <col style={{ width: '9rem' }} />
                                        <col style={{ width: '9rem' }} />
                                        <col style={{ width: '9rem' }} />
                                    </colgroup>
                                    <tbody>
                                        <tr className="tp-muted-bg text-xs tp-muted border-b tp-border">
                                            <th scope="col" className="px-4 py-2 text-left">Milník</th>
                                            {participants.map(p => (
                                                <th key={`hdr-${group.project.id}-${p.id}`} scope="col" className="text-center font-semibold">
                                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${getRoleColorClass(getUserRole(p))}`} aria-label={getUserRole(p)}>
                                                        {getInitials(p)}
                                                    </span>
                                                </th>
                                            ))}
                                            <th scope="col" className='px-3 py-2 text-right'>
                                                <div className="flex flex-col items-end">
                                                    <span>Příjem</span>
                                                    <span className="text-xs tp-muted">(Kč)</span>
                                                </div>
                                            </th>
                                            <th scope="col" className='px-3 py-2 text-right'>
                                                <div className="flex flex-col items-end">
                                                    <span>Hodnota</span>
                                                    <span className="text-xs tp-muted">(Kč)</span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span>Plán</span>
                                                    <span className="text-xs tp-muted">(Kč)</span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span>Čerp.</span>
                                                    <span className="text-xs tp-muted">(Kč)</span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-3 py-2 pr-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span>Pred. náklad</span>
                                                    <span className="text-xs tp-muted">(Kč)</span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-3 py-2 pr-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span>Pred. zisk</span>
                                                    <span className="text-xs tp-muted">(Kč)</span>
                                                </div>
                                            </th>
                                        </tr>

                                        {projRows.map((rr, idx2) => {
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
                                                    <td className="text-right">{rr.incomeForMonth ? fmtNumber(rr.incomeForMonth) : '—'}</td>
                                                    <td className="text-right">{rr.valueForMonth ? fmtNumber(rr.valueForMonth) : '—'}</td>
                                                    <td className="text-right">{planCzk ? fmtNumber(planCzk) : '—'}</td>
                                                    <td className="text-right">{loggedCost ? fmtNumber(loggedCost) : '—'}</td>
                                                    <td className="text-right pr-6">{rr.predictedCost ? fmtNumber(rr.predictedCost) : '—'}</td>
                                                    <td className={`text-right ${typeof rr.predictedProfit === 'number' && rr.predictedProfit < 0 ? 'tp-danger' : 'tp-positive'} font-semibold pr-6`}>
                                                        {typeof rr.predictedProfit === 'number' ? fmtNumber(rr.predictedProfit) : '—'}
                                                    </td>
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

            <div id="employee-capacity" className="tp-muted-bg border tp-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold tp-text">Kapacita zaměstnanců — {String(m).padStart(2, '0')} / {y}</h3>
                    <div className="ml-auto">
                        <button
                            type="button"
                            aria-pressed={empEditMode}
                            onClick={() => {
                                if (!empEditMode) {
                                    // enter edit mode: base values come from saved (if any) or user's capacity
                                    const base: Record<number, number> = {}
                                    users.forEach(u => {
                                        const extra = u as UserExtras
                                        const baseCapacity = empSavedCapacity?.[u.id] ?? (extra.capacity ?? extra.monthlyCapacity ?? 160)
                                        base[u.id] = baseCapacity
                                    })
                                    setEmpEditedCapacity(base)
                                    setEmpEditMode(true)
                                } else {
                                    // exit edit mode: clear editing state
                                    setEmpEditMode(false)
                                    setEmpEditedCapacity(null)
                                    setEmpCellEditingCapacityUserId(null)
                                }
                            }}
                            className={`px-3 py-1 text-sm rounded focus:outline-none ${empEditMode ? 'tp-btn-accent-alt' : 'tp-card tp-text'}`}>
                            {texts.projectHeader.edit}
                        </button>
                    </div>
                </div>
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
                                <th className="px-4 py-3 text-center">Kapacita</th>
                                <th className="px-4 py-3 text-center">Přiděleno</th>
                                <th className="px-4 py-3 text-center">Zbývá</th>
                                <th className="px-4 py-3 text-center">Zalog. projekty (výše)</th>
                                <th className="px-4 py-3 text-center">Zalog. celkem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => {
                                const extra = u as UserExtras
                                const capacity = empSavedCapacity?.[u.id] ?? (empEditedCapacity?.[u.id] ?? (extra.capacity ?? extra.monthlyCapacity ?? 160))
                                const role = getUserRole(u)
                                const baseAssigned = userAssigned[u.id] || 0
                                const assigned = baseAssigned
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
                                        <td className="px-4 py-3 text-center">
                                            {empEditMode ? (
                                                empCellEditingCapacityUserId === u.id ? (
                                                    <input
                                                        autoFocus
                                                        className="w-16 px-2 py-1 text-sm text-center border rounded tp-card tp-text tp-border focus:ring-1"
                                                        value={String(empEditedCapacity?.[u.id] ?? capacity)}
                                                        onChange={(e) => {
                                                            const v = Number(e.target.value || 0)
                                                            setEmpEditedCapacity(prev => ({ ...(prev || {}), [u.id]: v }))
                                                        }}
                                                        onBlur={() => {
                                                            const val = Number(empEditedCapacity?.[u.id] ?? capacity)
                                                            setEmpSavedCapacity(prev => ({ ...(prev || {}), [u.id]: val }))
                                                            setEmpCellEditingCapacityUserId(null)
                                                        }}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur() }}
                                                    />
                                                ) : (
                                                    <div className={`text-sm ${empEditMode ? 'cursor-pointer' : ''}`} onClick={() => { setEmpCellEditingCapacityUserId(u.id); if (!empEditedCapacity) { const base: Record<number, number> = {}; users.forEach(uu => { const ex = uu as UserExtras; base[uu.id] = empSavedCapacity?.[uu.id] ?? (ex.capacity ?? ex.monthlyCapacity ?? 160) }); setEmpEditedCapacity(base) } }}>
                                                        {String(empEditedCapacity?.[u.id] ?? capacity)}h
                                                    </div>
                                                )
                                            ) : (
                                                String(capacity) + 'h'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center align-middle">{String(assigned) + 'h'}</td>
                                        <td className={`px-4 py-3 text-center ${remaining >= 0 ? 'tp-positive' : 'tp-danger'} font-semibold`}>{remainingLabel}</td>
                                        <td className="px-4 py-3 text-center">{String(loggedProj)}h</td>
                                        <td className="px-4 py-3 text-center">{String(loggedTotal)}h</td>
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
