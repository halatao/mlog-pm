import React from 'react'
import { UsersProvider } from './contexts/UsersContext'
import { ProjectsProvider } from './contexts/ProjectsContext'
import { WorkLogsProvider } from './contexts/WorkLogsContext'

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <UsersProvider>
            <ProjectsProvider>
                <WorkLogsProvider>
                    {children}
                </WorkLogsProvider>
            </ProjectsProvider>
        </UsersProvider>
    )
}
