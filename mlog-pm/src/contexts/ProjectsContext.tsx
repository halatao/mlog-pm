/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { fetchProjects, fetchMilestones, fetchPlannedCapacities, fetchLoggedCapacities } from '../api'
import type { Project, ProjectMilestone, PlannedCapacity, LoggedCapacity } from '../types'

type ProjectData = { milestones: ProjectMilestone[]; planned: PlannedCapacity[]; logged: LoggedCapacity[] }

type ProjectsContextValue = {
    projects: Project[]
    projectData: Record<number, ProjectData>
    loading: boolean
    reload: () => Promise<void>
}

const ProjectsContext = createContext<ProjectsContextValue | undefined>(undefined)

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([])
    const [projectData, setProjectData] = useState<Record<number, ProjectData>>({})
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const ps = await fetchProjects()
            setProjects(ps)
            const data: Record<number, ProjectData> = {}
            await Promise.all(ps.map(async p => {
                const [ms, pl, lo] = await Promise.all([
                    fetchMilestones(p.id),
                    fetchPlannedCapacities(p.id),
                    fetchLoggedCapacities(p.id),
                ])
                data[p.id] = { milestones: ms, planned: pl, logged: lo }
            }))
            setProjectData(data)
        } catch {
            // ignore
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { void load() }, [load])

    return (
        <ProjectsContext.Provider value={{ projects, projectData, loading, reload: load }}>
            {children}
        </ProjectsContext.Provider>
    )
}

export function useProjects() {
    const ctx = useContext(ProjectsContext)
    if (!ctx) throw new Error('useProjects must be used within ProjectsProvider')
    return ctx
}
