import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import useTexts from '../hooks/useTexts'
import DailyPlanPanel from '../components/MyProjects/DailyPlanPanel'
import ProjectTable from '../components/MyProjects/ProjectTable'
import { useUsers } from '../contexts/UsersContext'
import { useProjects } from '../contexts/ProjectsContext'
import { RequirementsProvider } from '../contexts/RequirementsContext'
import { useWorkLogs } from '../contexts/WorkLogsContext'
import { DailyPlanProvider, useDailyPlan } from '../contexts/DailyPlanContext'
import type { Project, PlannedCapacity, LoggedCapacity } from '../types'

export default function MyProjectsPage() {
    const texts = useTexts()
    const { userId } = useParams<{ userId?: string }>()
    const uid = Number(userId || 1)

    const [dailyMode, setDailyMode] = useState(false)
    const todayStr = (() => {
        const d = new Date()
        const dd = String(d.getDate()).padStart(2, '0')
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const yyyy = d.getFullYear()
        return `${dd}.${mm}.${yyyy}`
    })()

    function MyProjectsContent() {
        const { users } = useUsers()
        const { projects, projectData } = useProjects()
        const { dailyItems, toggleSubAssigned, toggleReqAssigned } = useDailyPlan()
        const workLogs = useWorkLogs()

        const [localSubLogged, setLocalSubLogged] = useState<Record<number, number>>({})

        useEffect(() => {
            let mounted = true
            async function load() {
                const loggedMap: Record<number, number> = {}
                try {
                    await Promise.all(Object.keys(projectData).map(async pk => {
                        const ms = projectData[Number(pk)]?.milestones || []
                        await Promise.all(ms.map(async (m) => {
                            try {
                                const map = await workLogs.getLoggedBySubForMilestone(m.id)
                                Object.keys(map).forEach(k => { loggedMap[Number(k)] = (loggedMap[Number(k)] || 0) + (map[Number(k)] || 0) })
                            } catch (err) { void err }
                        }))
                    }))
                    Object.keys(loggedMap).forEach(k => { loggedMap[Number(k)] = Math.round((loggedMap[Number(k)] + Number.EPSILON) * 100) / 100 })
                    if (mounted) {
                        setLocalSubLogged(loggedMap)
                    }
                } catch (err) { void err }
            }
            void load()
            return () => { mounted = false }
        }, [projectData, workLogs])

        const pmProjects = useMemo(() => projects.filter((p: Project) => p.manager && Number(p.manager.id) === uid), [projects])
        const otherProjects = useMemo(() => projects.filter((p: Project) => !pmProjects.some(pp => pp.id === p.id) && (() => {
            const data = projectData[p.id]
            if (!data) return false
            const { planned, logged } = data
            return (planned || []).some((x: PlannedCapacity) => x.userId === uid) || (logged || []).some((x: LoggedCapacity) => x.userId === uid)
        })()), [projects, pmProjects, projectData])

        return (
            <RequirementsProvider projectIds={projects.map(p => p.id)} milestoneIds={Object.values(projectData).flatMap(d => (d.milestones || []).map(m => m.id))}>
                {/** The DailyPlanPanel still accepts props; feed it from context-derived values */}
                <div className="max-w-screen-2xl mx-auto p-6 space-y-12">
                    {/* PAGE HEADER */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold tp-text">{texts.pages.myProjects.pageTitle}</h1>
                            <p className="tp-muted">{texts.pages.myProjects.description}</p>
                        </div>
                        <div className="ml-4">
                            <button className={`px-3 py-2 text-sm border rounded ${dailyMode ? 'tp-accent' : 'tp-muted-bg'}`} onClick={() => setDailyMode(m => !m)}>{dailyMode ? 'Denní režim: Zapnuto' : 'Denní režim: Vypnuto'}</button>
                        </div>
                    </div>

                    <div className="tp-card rounded-lg shadow p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">Denní plán — {todayStr}</div>
                        </div>
                        <DailyPlanPanel
                            projects={projects}
                            projectData={projectData}
                        />
                    </div>

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

                                    {pmProjects.map(p => (
                                        <ProjectTable
                                            key={p.id}
                                            project={p}
                                            data={projectData[p.id] || { milestones: [], planned: [], logged: [] }}
                                            users={users}
                                            subLogged={localSubLogged}
                                            dailyMode={dailyMode}
                                            toggleSubAssigned={toggleSubAssigned}
                                            toggleReqAssigned={toggleReqAssigned}
                                            isSubAssigned={(id: number) => dailyItems.some(d => d.subRequirementId === id && d.userId === uid && d.date === todayStr)}
                                            isReqFullyAssigned={(ids: number[]) => ids.length > 0 && ids.every(id => dailyItems.some(d => d.subRequirementId === id && d.userId === uid && d.date === todayStr))}
                                            managerFallbackFullName={true}
                                        />
                                    ))}
                                </table>
                            </div>
                        </div>
                    )}

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

                                    {otherProjects.map((p: Project) => (
                                        <ProjectTable
                                            key={p.id}
                                            project={p}
                                            data={projectData[p.id] || { milestones: [], planned: [], logged: [] }}
                                            users={users}
                                            subLogged={localSubLogged}
                                            dailyMode={dailyMode}
                                            toggleSubAssigned={toggleSubAssigned}
                                            toggleReqAssigned={toggleReqAssigned}
                                            isSubAssigned={(id: number) => dailyItems.some(d => d.subRequirementId === id && d.userId === uid && d.date === todayStr)}
                                            isReqFullyAssigned={(ids: number[]) => ids.length > 0 && ids.every(id => dailyItems.some(d => d.subRequirementId === id && d.userId === uid && d.date === todayStr))}
                                            managerFallbackFullName={false}
                                        />
                                    ))}
                                </table>
                            </div>
                        </div>
                    )}

                    {pmProjects.length === 0 && otherProjects.length === 0 && (
                        <div className="tp-muted text-center py-12">{texts.pages.myProjects.fallback}</div>
                    )}
                </div>
            </RequirementsProvider>
        )
    }

    return (
        <DailyPlanProvider userId={uid} dateStr={todayStr}>
            <MyProjectsContent />
        </DailyPlanProvider>
    )
}
