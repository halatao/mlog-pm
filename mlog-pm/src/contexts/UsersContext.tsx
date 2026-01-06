/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { fetchUsers } from '../api'
import type { User } from '../types'

type UsersContextValue = {
    users: User[]
    loading: boolean
    reload: () => Promise<void>
}

const UsersContext = createContext<UsersContextValue | undefined>(undefined)

export function UsersProvider({ children }: { children: React.ReactNode }) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const us = await fetchUsers()
            setUsers(us)
        } catch {
            // ignore
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { void load() }, [load])

    return (
        <UsersContext.Provider value={{ users, loading, reload: load }}>
            {children}
        </UsersContext.Provider>
    )
}

export function useUsers() {
    const ctx = useContext(UsersContext)
    if (!ctx) throw new Error('useUsers must be used within UsersProvider')
    return ctx
}
