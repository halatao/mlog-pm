import ModalWrapper from './ModalWrapper'
import type { User, WorkLog } from '../../types'

type Props = {
    open?: boolean
    onClose?: () => void
    workLogs?: WorkLog[]
    users?: User[]
}

function fmtHoursFromSeconds(sec: number) {
    if (!sec) return '0:00'
    const h = Math.floor(sec / 3600)
    const m = Math.round((sec % 3600) / 60)
    return `${h}:${String(m).padStart(2, '0')}`
}

export default function WorkLogsModal({ open, onClose, workLogs: workLogsProp = [], users: usersProp }: Props) {
    const workLogs: WorkLog[] = workLogsProp ?? []
    const findUser = (id?: number) => usersProp?.find(u => u.id === id)
    const safeOpen = !!open
    const safeOnClose = onClose ?? (() => {})

    return (
        <ModalWrapper open={safeOpen} onClose={safeOnClose} title="Worklogs" maxWidth="max-w-3xl">
            <div className="max-h-[60vh] overflow-y-auto">
                {workLogs.length === 0 ? (
                    <div className="p-4 tp-muted">Žádné logy práce.</div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="tp-muted-bg tp-muted text-xs">
                                <th className="px-3 py-2 text-left">Datum a čas</th>
                                <th className="px-3 py-2 text-left">Uživatel</th>
                                <th className="px-3 py-2 text-right">Čas (h)</th>
                                <th className="px-3 py-2 text-left">Aktivita</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workLogs.map(w => {
                                const dt = new Date(w.date)
                                const dateStr = dt.toLocaleDateString('cs-CZ')
                                const timeStr = dt.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
                                const dateTime = `${dateStr} ${timeStr}`
                                return (
                                    <tr key={w.id} className="border-t tp-border">
                                        <td className="px-3 py-2">{dateTime}</td>
                                        <td className="px-3 py-2">{(() => {
                                            const u = findUser(w.userId)
                                            return u ? `${u.firstName || ''} ${u.lastName || ''}` : String(w.userId)
                                        })()}</td>
                                        <td className="px-3 py-2 text-right">{fmtHoursFromSeconds(w.seconds || 0)}</td>
                                        <td className="px-3 py-2">{(w as WorkLog).description || ''}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="mt-4 text-right">
                <button className="px-4 py-2 tp-border rounded" onClick={safeOnClose}>Zavřít</button>
            </div>
        </ModalWrapper>
    )
}
