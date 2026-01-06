import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { fetchUsers, updateMilestone, addMilestoneMonth } from '../api'
import type { User, ProjectMilestone } from '../types'
import CapacityMatrix from '../components/ProjectDetail/CapacityMatrix'
import type { MatrixHandle } from '../components/ProjectDetail/CapacityMatrix'
import ProjectHeader from '../components/ProjectDetail/ProjectHeader'
import useTexts from '../hooks/useTexts'
import CapacityLegend from '../components/shared/CapacityLegend'
import MilestoneEditModal from '../components/modals/MilestoneEditModal'
import ProjectUsersModal from '../components/modals/ProjectUsersModal'
import { useModal } from '../components/modals/ModalContext'
import { useUsers } from '../contexts/UsersContext'
import { useProjects } from '../contexts/ProjectsContext'


export default function ProjectDetailPage() {
    const { projectId } = useParams<{ projectId: string }>()
    const id = Number(projectId)
    const [assignedUsers, setAssignedUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showPlan, setShowPlan] = useState(true)
    const [showLogged, setShowLogged] = useState(true)
    const [editMode, setEditMode] = useState(false)

    const { projects, projectData, reload: reloadProjects, loading: projectsLoading } = useProjects()
    const { users: allUsers, loading: usersLoading } = useUsers()

    useEffect(() => {
        let mounted = true
        async function loadAssigned() {
            try {
                setLoading(true)
                const usAssigned = await fetchUsers(id)
                if (!mounted) return
                setAssignedUsers(usAssigned)
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err)
                setError(msg || 'Failed to load project data')
            } finally {
                if (mounted) setLoading(false)
            }
        }
        void loadAssigned()
        return () => { mounted = false }
    }, [id])

    async function reloadProjectUsers() {
        try {
            const usAssigned = await fetchUsers(id)
            setAssignedUsers(usAssigned)
        } catch {
            // ignore
        }
    }

    async function reload() {
        try {
            setLoading(true)
            await reloadProjects()
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
    const { showModal } = useModal()


    if (loading || projectsLoading || usersLoading) return <div>{texts.general.loading}</div>
    if (error) return <div>{texts.general.errorPrefix} {String(error)}</div>
    const project = projects.find(p => p.id === id)
    if (!project) return <div>{texts.general.notFound}</div>

    const rawMilestones = projectData[id]?.milestones || []
    const planned = projectData[id]?.planned || []
    const logged = projectData[id]?.logged || []
    const milestones = rawMilestones.map(mm => {
        const totalPlanned = (planned || []).filter(x => x.milestoneId === mm.id).reduce((s, it) => s + (it.plannedHours || 0), 0)
        const totalLogged = (logged || []).filter(x => x.milestoneId === mm.id).reduce((s, it) => s + (it.loggedHours || 0), 0)
        const done = totalPlanned > 0 ? Math.round((totalLogged / totalPlanned) * 100) : (mm.donePercent ?? 0)
        return { ...mm, donePercent: done }
    })
    const totalIncome = milestones.reduce((s, mm) => s + (mm.incomeAmount || 0), 0)
    const userCostMap = Object.fromEntries(assignedUsers.map(u => [u.id, u.costPerHour || 0]))
    const predictedCosts = planned.reduce((s, p) => s + ((p.plannedHours || 0) * (userCostMap[p.userId] || 0)), 0)
    const predictedProfit = Math.round(totalIncome - predictedCosts)
    const profitPct = totalIncome > 0 ? Math.round((predictedProfit / totalIncome) * 1000) / 10 : 0

    function fmtMoney(n: number) { return n.toLocaleString('cs-CZ') + '\u00A0Kč' }

    return (
        <div className="max-w-screen-2xl mx-auto p-6 space-y-8">
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
                        onManageUsers={() => showModal(<ProjectUsersModal projectId={id} users={allUsers} onSaved={() => { reloadProjectUsers() }} />)}
                    />
                </div>
            </div>

            <CapacityLegend inline />

            <CapacityMatrix
                milestones={milestones}
                planned={planned}
                logged={logged}
                showPlan={showPlan}
                showLogged={showLogged}
                editMode={editMode}
                users={assignedUsers}
                projectId={id}
                onReload={reload}
                onEditMilestone={(m) => showModal(<MilestoneEditModal milestone={m} onSave={async (mm: ProjectMilestone) => { await handleSaveMilestone(mm); }} />)}
                onAddMonth={handleAddMonth}
                ref={matrixRef}
            />

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
        </div>
    )
}
