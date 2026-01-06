/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { fetchRequirements, fetchSubRequirementsForMilestone } from '../api'
import type { Requirement, SubRequirement } from '../types'

type RequirementsContextValue = {
    requirementsMap: Record<number, Requirement[]>
    subReqMap: Record<number, SubRequirement[]>
    loading: boolean
    reload: (projectIds?: number[], milestoneIds?: number[]) => Promise<void>
}

const RequirementsContext = createContext<RequirementsContextValue | undefined>(undefined)

export function RequirementsProvider({ children, projectIds, milestoneIds }: { children: React.ReactNode, projectIds?: number[], milestoneIds?: number[] }) {
    const [requirementsMap, setRequirementsMap] = useState<Record<number, Requirement[]>>({})
    const [subReqMap, setSubReqMap] = useState<Record<number, SubRequirement[]>>({})
    const [loading, setLoading] = useState(true)

    const load = useCallback(async (pids?: number[], mids?: number[]) => {
        setLoading(true)
        try {
            const pList = pids || projectIds || []
            const mList = mids || milestoneIds || []
            const reqsMap: Record<number, Requirement[]> = {}
            const subsMap: Record<number, SubRequirement[]> = {}

            await Promise.all(pList.map(async pid => {
                const reqs = await fetchRequirements(pid)
                reqsMap[pid] = reqs
            }))

            await Promise.all(mList.map(async mid => {
                const subs = await fetchSubRequirementsForMilestone(mid)
                subsMap[mid] = subs
            }))

            setRequirementsMap(reqsMap)
            setSubReqMap(subsMap)
        } catch {
            // ignore
        } finally {
            setLoading(false)
        }
    }, [projectIds, milestoneIds])

    useEffect(() => { void load() }, [load])

    return (
        <RequirementsContext.Provider value={{ requirementsMap, subReqMap, loading, reload: load }}>
            {children}
        </RequirementsContext.Provider>
    )
}

export function useRequirements() {
    const ctx = useContext(RequirementsContext)
    if (!ctx) throw new Error('useRequirements must be used within RequirementsProvider')
    return ctx
}
