/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { fetchDailyPlanForUser, saveDailyPlanItem, removeDailyPlanItem } from '../api'
import type { DailyPlanItem } from '../types'

type DailyPlanContextValue = {
    dailyItems: DailyPlanItem[]
    loading: boolean
    reload: () => Promise<void>
    toggleSubAssigned: (subId: number) => Promise<void>
    toggleReqAssigned: (subIds: number[]) => Promise<void>
}

const DailyPlanContext = createContext<DailyPlanContextValue | undefined>(undefined)

export function DailyPlanProvider({ children, userId, dateStr }: { children: React.ReactNode, userId: number, dateStr: string }) {
    const [dailyItems, setDailyItems] = useState<DailyPlanItem[]>([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const items = await fetchDailyPlanForUser(userId, dateStr)
            setDailyItems(items)
        } catch {
            // ignore
        } finally {
            setLoading(false)
        }
    }, [userId, dateStr])

    useEffect(() => { void load() }, [load])

    async function toggleSubAssigned(subId: number) {
        const existing = dailyItems.find(d => d.subRequirementId === subId && d.userId === userId && d.date === dateStr)
        if (existing) {
            await removeDailyPlanItem(existing.id)
            setDailyItems(prev => prev.filter(p => p.id !== existing.id))
            return
        }
        const created = await saveDailyPlanItem({ userId, date: dateStr, subRequirementId: subId })
        setDailyItems(prev => [...prev, created])
    }

    async function toggleReqAssigned(subIds: number[]) {
        if (!subIds.length) return
        const assignedIds = dailyItems.filter(d => subIds.includes(d.subRequirementId)).map(d => ({ id: d.id, subId: d.subRequirementId }))
        if (assignedIds.length === subIds.length) {
            await Promise.all(assignedIds.map(a => removeDailyPlanItem(a.id)))
            setDailyItems(prev => prev.filter(d => !subIds.includes(d.subRequirementId)))
            return
        }
        const toCreate = subIds.filter(sid => !dailyItems.some(d => d.subRequirementId === sid))
        const created = await Promise.all(toCreate.map(sid => saveDailyPlanItem({ userId, date: dateStr, subRequirementId: sid })))
        setDailyItems(prev => [...prev, ...created])
    }

    return (
        <DailyPlanContext.Provider value={{ dailyItems, loading, reload: load, toggleSubAssigned, toggleReqAssigned }}>
            {children}
        </DailyPlanContext.Provider>
    )
}

export function useDailyPlan() {
    const ctx = useContext(DailyPlanContext)
    if (!ctx) throw new Error('useDailyPlan must be used within DailyPlanProvider')
    return ctx
}
