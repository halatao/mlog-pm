/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext } from 'react'
import { fetchWorkLogsForMilestone } from '../api'
import type { WorkLog } from '../types'

type WorkLogsContextValue = {
    getWorkLogsForMilestone: (mid: number) => Promise<WorkLog[]>
    getLoggedBySubForMilestone: (mid: number) => Promise<Record<number, number>>
    getLoggedByUserForMilestone: (mid: number, month: number, year: number) => Promise<Record<number, number>>
    getLoggedForUser: (mid: number, month: number, year: number, userId: number) => Promise<number>
    clearCache: () => void
}

const WorkLogsContext = createContext<WorkLogsContextValue | undefined>(undefined)

export function WorkLogsProvider({ children }: { children: React.ReactNode }) {
    const cache: Record<number, WorkLog[]> = {}

    async function getWorkLogsForMilestone(mid: number) {
        if (cache[mid]) return cache[mid]
        const w = await fetchWorkLogsForMilestone(mid)
        cache[mid] = w
        return w
    }

    async function getLoggedBySubForMilestone(mid: number) {
        const w = await getWorkLogsForMilestone(mid)
        const map: Record<number, number> = {}
        w.forEach(wl => {
            const h = (wl.seconds || 0) / 3600
            map[wl.subRequirementId] = (map[wl.subRequirementId] || 0) + h
        })
        Object.keys(map).forEach(k => { map[Number(k)] = Math.round((map[Number(k)] + Number.EPSILON) * 100) / 100 })
        return map
    }

    async function getLoggedByUserForMilestone(mid: number, month: number, year: number) {
        const w = await getWorkLogsForMilestone(mid)
        const map: Record<number, number> = {}
        const want = `${year}-${String(month).padStart(2, '0')}`
        w.forEach(wl => {
            const m = typeof wl.date === 'string' ? wl.date.slice(0, 7) : ''
            if (m === want) {
                map[wl.userId] = (map[wl.userId] || 0) + ((wl.seconds || 0) / 3600)
            }
        })
        Object.keys(map).forEach(k => { map[Number(k)] = Math.round((map[Number(k)] + Number.EPSILON) * 100) / 100 })
        return map
    }

    async function getLoggedForUser(mid: number, month: number, year: number, userId: number) {
        const map = await getLoggedByUserForMilestone(mid, month, year)
        return map[userId] || 0
    }

    function clearCache() {
        Object.keys(cache).forEach(k => delete cache[Number(k)])
    }

    return (
        <WorkLogsContext.Provider value={{ getWorkLogsForMilestone, getLoggedBySubForMilestone, getLoggedByUserForMilestone, getLoggedForUser, clearCache }}>
            {children}
        </WorkLogsContext.Provider>
    )
}

export function useWorkLogs() {
    const ctx = useContext(WorkLogsContext)
    if (!ctx) throw new Error('useWorkLogs must be used within WorkLogsProvider')
    return ctx
}
