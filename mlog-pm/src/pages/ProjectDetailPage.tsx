import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { fetchMilestones, fetchPlannedCapacities, fetchLoggedCapacities, fetchProject, fetchUsers, updateMilestone, addMilestoneMonth } from '../api'
import type { User } from '../types'
import type { Project, ProjectMilestone, PlannedCapacity, LoggedCapacity } from '../types'
import CapacityMatrix from '../components/ProjectDetail/CapacityMatrix'
import type { MatrixHandle } from '../components/ProjectDetail/CapacityMatrix'
import ProjectHeader from '../components/ProjectDetail/ProjectHeader'
import useTexts from '../hooks/useTexts'
import MilestoneEditModal from '../components/ProjectDetail/MilestoneEditModal'


export default function ProjectDetailPage() {
    const { projectId } = useParams<{ projectId: string }>()
    const id = Number(projectId)

    const [project, setProject] = useState<Project | null>(null)
    const [milestones, setMilestones] = useState<ProjectMilestone[]>([])
    const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null)
    const [planned, setPlanned] = useState<PlannedCapacity[]>([])
    const [logged, setLogged] = useState<LoggedCapacity[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showPlan, setShowPlan] = useState(true)
    const [showLogged, setShowLogged] = useState(true)
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        let mounted = true
        async function load() {
            setLoading(true)
            try {
                const [p, m, pl, lo, us] = await Promise.all([
                    fetchProject(id),
                    fetchMilestones(id),
                    fetchPlannedCapacities(id),
                    fetchLoggedCapacities(id),
                    fetchUsers(),
                ])
                if (!mounted) return
                setProject(p)
                setMilestones(m)
                setPlanned(pl)
                setLogged(lo)
                setUsers(us)
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err)
                setError(msg || 'Failed to load project data')
            } finally {
                setLoading(false)
            }
        }
        load()
        return () => {
            mounted = false
        }
    }, [id])

    // reload helper passed to CapacityMatrix so it can refresh data after save
    async function reload() {
        setLoading(true)
        try {
            const [m, pl, lo] = await Promise.all([
                fetchMilestones(id),
                fetchPlannedCapacities(id),
                fetchLoggedCapacities(id),
            ])
            const computed = m.map(mm => {
                const totalPlanned = pl.filter(x => x.milestoneId === mm.id).reduce((s, it) => s + (it.plannedHours || 0), 0)
                const totalLogged = lo.filter(x => x.milestoneId === mm.id).reduce((s, it) => s + (it.loggedHours || 0), 0)
                const done = totalPlanned > 0 ? Math.round((totalLogged / totalPlanned) * 100) : (mm.donePercent ?? 0)
                return { ...mm, donePercent: done }
            })
            setMilestones(computed)
            setPlanned(pl)
            setLogged(lo)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            setError(msg || 'Failed to reload project data')
        } finally {
            setLoading(false)
        }
    }

    async function handleSaveMilestone(m: ProjectMilestone) {
        await updateMilestone(m)
        await reload()
    }

    async function handleAddMonth(m: ProjectMilestone) {
        await addMilestoneMonth(m.id)
        await reload()
    }

    const texts = useTexts()

    const matrixRef = useRef<MatrixHandle | null>(null)


    if (loading) return <div>{texts.general.loading}</div>
    if (error) return <div>{texts.general.errorPrefix} {String(error)}</div>
    if (!project) return <div>{texts.general.notFound}</div>

    // compute KPIs
    const totalIncome = milestones.reduce((s, mm) => s + (mm.incomeAmount || 0), 0)
    // predicted costs: sum per planned entry using user costPerHour
    const userCostMap = Object.fromEntries(users.map(u => [u.id, u.costPerHour || 0]))
    const predictedCosts = planned.reduce((s, p) => s + ((p.plannedHours || 0) * (userCostMap[p.userId] || 0)), 0)
    const predictedProfit = Math.round(totalIncome - predictedCosts)
    const profitPct = totalIncome > 0 ? Math.round((predictedProfit / totalIncome) * 1000) / 10 : 0

    function fmtMoney(n: number) { return n.toLocaleString('cs-CZ') + '\u00A0Kč' }

    return (
        <div className="max-w-screen-2xl mx-auto p-6 space-y-8">
            {/* HEADER + LEGEND (grouped to avoid parent vertical spacing) */}
            <div className="space-y-2">
                <div className="flex items-start justify-between">
                    <ProjectHeader
                        projectName={project.name}
                        managerName={`${project.manager.firstName} ${project.manager.lastName}`}
                        showPlan={showPlan}
                        showLogged={showLogged}
                        editMode={editMode}
                        onTogglePlan={() => setShowPlan(v => !v)}
                        onToggleLogged={() => setShowLogged(v => !v)}
                        onToggleEdit={() => setEditMode(v => !v)}
                    />
                </div>

                <div className="flex items-center gap-6 text-sm tp-muted">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full role-pm" /> {texts.capacityMatrix.roles.pm}</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full role-creative" /> {texts.capacityMatrix.roles.creative}</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full role-inactive" /> {texts.capacityMatrix.roles.inactive}</div>
                </div>

                <div className="flex items-center gap-6 text-xs tp-muted">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 mx-auto mt-1 rounded-full status-logged"></span><span>Zalogováno</span></div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 mx-auto mt-1 rounded-full status-none"></span><span>Bez logů</span></div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 mx-auto mt-1 rounded-full status-over"></span><span>Překročeno (logy &gt; plán)</span></div>
                </div>
            </div>

            {/* MATRIX */}
            <CapacityMatrix
                milestones={milestones}
                planned={planned}
                logged={logged}
                showPlan={showPlan}
                showLogged={showLogged}
                editMode={editMode}
                users={users}
                onReload={reload}
                onEditMilestone={setEditingMilestone}
                onAddMonth={handleAddMonth}
                ref={matrixRef}
            />

            {/* OVERALL KPI */}
            <div className="grid grid-cols-3 gap-6">
                <div className="tp-muted-bg p-5 rounded-xl border tp-border">
                    <div className="tp-muted text-sm">{texts.kpis.totalIncome}</div>
                    <div className="text-2xl font-semibold tp-text">{fmtMoney(totalIncome)}</div>
                </div>

                <div className="tp-muted-bg p-5 rounded-xl border tp-border">
                    <div className="tp-muted text-sm">{texts.kpis.predictedProfit}</div>
                    <div className="text-2xl font-semibold tp-positive">{predictedProfit >= 0 ? '+' : ''}{fmtMoney(predictedProfit)}</div>
                </div>

                <div className="tp-muted-bg p-5 rounded-xl border tp-border">
                    <div className="tp-muted text-sm">Zisk / Příjem</div>
                    <div className="text-2xl font-semibold tp-positive">{profitPct} %</div>
                </div>


            </div>

            <MilestoneEditModal
                open={!!editingMilestone}
                milestone={editingMilestone}
                onClose={() => setEditingMilestone(null)}
                onSave={handleSaveMilestone}
            />
        </div>
    )
}
