import { useState, useEffect } from 'react'
import WorkLogsModal from '../modals/WorkLogsModal'
import { useModal } from '../modals/ModalContext'
import { useWorkLogs } from '../../contexts/WorkLogsContext'
import type { WorkLog } from '../../types'
import { useUsers } from '../../contexts/UsersContext'

interface Props {
  userId: number
  milestoneId: number
  month: number
  year: number
  planned?: number
  logged?: number
  showPlan?: boolean
  showLogged?: boolean
  onChange?: (hours: number) => void
  disabled?: boolean
}

import useTexts from '../../hooks/useTexts'

export default function CapacityCell({
  userId,
  milestoneId,
  month,
  year,
  planned = 0,
  logged = 0,
  showPlan = true,
  showLogged = true,
  onChange,
  disabled = false,
}: Props) {
  const texts = useTexts()
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(String(planned ?? ''))
  const { showModal } = useModal()
  const workLogs = useWorkLogs()
  const { users } = useUsers()
  const [cellLoggedHours, setCellLoggedHours] = useState<number | null>(null)
  const [cellWorkLogs, setCellWorkLogs] = useState<WorkLog[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const hours = await workLogs.getLoggedForUser(milestoneId, month, year, userId)
        const w = await workLogs.getWorkLogsForMilestone(milestoneId)
        const want = `${year}-${String(month).padStart(2, '0')}`
        const filtered = w.filter(wl => wl.userId === userId && (typeof wl.date === 'string' ? wl.date.slice(0, 7) === want : false))
        if (!mounted) return
        setCellWorkLogs(filtered)
        setCellLoggedHours(Math.round(((hours) + Number.EPSILON) * 100) / 100)
      } catch (err) {
        console.debug('Failed to compute cell worklogs', err)
        if (mounted) {
          setCellWorkLogs([])
          setCellLoggedHours(0)
        }
      }
    }
    void load()
    return () => { mounted = false }
  }, [workLogs, milestoneId, userId, month, year])

  function commit() {
    const num = Number(local) || 0
    onChange?.(num)
    setEditing(false)
  }

  const showBoth = showPlan && showLogged
  const onlyPlan = showPlan && !showLogged
  const onlyLogged = !showPlan && showLogged

  return (
    <td className="p-3 text-center border-t tp-border align-middle">
      {editing && !disabled ? (
        <input
          autoFocus
          className="w-16 px-2 py-1 text-sm text-center border rounded tp-card tp-text tp-border focus:ring-1"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
        />
      ) : (
        <div
          className={`text-sm ${disabled ? 'tp-muted' : 'cursor-pointer'} flex flex-col items-center gap-1`}
          onClick={() => {
            if (!disabled && showPlan) {
              setLocal(String(planned ?? ''))
              setEditing(true)
            }
          }}
        >
          <div className="flex items-center justify-center gap-2">
            {showBoth ? (
              <>
                <span className="tp-text">{planned ?? 0}</span>
                <span className="tp-muted">/</span>
                {((cellLoggedHours ?? logged) ?? 0) > 0 ? (
                  <button
                    className="tp-muted"
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation(); e.preventDefault()
                      try {
                        const filtered = cellWorkLogs.length > 0 ? cellWorkLogs : (await workLogs.getWorkLogsForMilestone(milestoneId)).filter(wl => wl.userId === userId)
                        showModal(<WorkLogsModal workLogs={filtered} users={users} />)
                      } catch (err) {
                        console.debug('Failed to load worklogs for modal', err)
                        showModal(<WorkLogsModal workLogs={[]} users={users} />)
                      }
                    }}
                  >{cellLoggedHours !== null ? cellLoggedHours : (logged ?? 0)}</button>
                ) : (
                  <span className="tp-muted">{cellLoggedHours !== null ? cellLoggedHours : (logged ?? 0)}</span>
                )}
              </>
            ) : onlyPlan ? (
              <span className="tp-text">{planned ?? 0}</span>
            ) : onlyLogged ? (
              ((cellLoggedHours ?? logged) ?? 0) > 0 ? (
                <button
                  className="tp-muted"
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation(); e.preventDefault()
                    try {
                      const filtered = cellWorkLogs.length > 0 ? cellWorkLogs : (await workLogs.getWorkLogsForMilestone(milestoneId)).filter(wl => wl.userId === userId)
                      showModal(<WorkLogsModal workLogs={filtered} users={users} />)
                    } catch (err) {
                      console.debug('Failed to load worklogs for modal', err)
                      showModal(<WorkLogsModal workLogs={[]} users={users} />)
                    }
                  }}
                >{cellLoggedHours !== null ? cellLoggedHours : (logged ?? 0)}</button>
              ) : (
                <span className="tp-muted">{cellLoggedHours !== null ? cellLoggedHours : (logged ?? 0)}</span>
              )
            ) : (
              <span className="tp-muted">-</span>
            )}
          </div>
          <div
            className={`w-2 h-2 mt-1 rounded-full ${((logged || 0) > (planned || 0)) ? 'status-over' : (logged ? 'status-logged' : 'status-none')}`}
            title={
              logged
                ? (texts.capacityMatrix?.loggedTooltip ? texts.capacityMatrix.loggedTooltip.replace('{hours}', String(logged)) : `Zalogováno: ${logged}h`)
                : (texts.capacityMatrix?.noLogs || 'Bez logů')
            }
          />
        </div>
      )}
    </td>
  )
}
