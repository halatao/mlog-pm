import type { Dispatch, SetStateAction } from 'react'
import { useMemo, useEffect, useState } from 'react'
import type { Project, User, WorkLog } from '../../types'
import { getUserRole, getRoleColorClass } from '../../hooks/useRoles'
import { useModal } from '../../components/modals/ModalContext'
import { fetchWorkLogsForProject } from '../../api'
type UserExtras = { capacity?: number; monthlyCapacity?: number }
import useTexts from '../../hooks/useTexts'
import WorkLogsModal from '../modals/WorkLogsModal'

type NumMap = Record<number, number>

interface Props {
  users: User[]
  month: number
  year: number
  userAssigned: NumMap
  projectsForFilter: Project[]
  rolesForFilter: string[]
  userProjectMap: Map<number, Set<number>>

  empSearch: string
  setEmpSearch: Dispatch<SetStateAction<string>>
  empFilterProject: string
  setEmpFilterProject: Dispatch<SetStateAction<string>>
  empFilterRole: string
  setEmpFilterRole: Dispatch<SetStateAction<string>>
  empOnlyParticipants: boolean
  setEmpOnlyParticipants: Dispatch<SetStateAction<boolean>>

  empEditMode: boolean
  setEmpEditMode: Dispatch<SetStateAction<boolean>>
  empEditedCapacity: Record<number, number> | null
  setEmpEditedCapacity: Dispatch<SetStateAction<Record<number, number> | null>>
  empSavedCapacity: Record<number, number> | null
  setEmpSavedCapacity: Dispatch<SetStateAction<Record<number, number> | null>>
  empCellEditingCapacityUserId: number | null
  setEmpCellEditingCapacityUserId: Dispatch<SetStateAction<number | null>>
}

export default function EmployeeCapacityTable({
  users,
  month,
  year,
  userAssigned,
  projectsForFilter,
  rolesForFilter,
  userProjectMap,

  empSearch,
  setEmpSearch,
  empFilterProject,
  setEmpFilterProject,
  empFilterRole,
  setEmpFilterRole,
  empOnlyParticipants,
  setEmpOnlyParticipants,

  empEditMode,
  setEmpEditMode,
  empEditedCapacity,
  setEmpEditedCapacity,
  empSavedCapacity,
  setEmpSavedCapacity,
  empCellEditingCapacityUserId,
  setEmpCellEditingCapacityUserId,
}: Props) {
  const texts = useTexts()
  const { showModal } = useModal()

  const [worklogSums, setWorklogSums] = useState<{ byUserMonth: Record<number, number>; byUserTotal: Record<number, number> }>({ byUserMonth: {}, byUserTotal: {} })
  const [worklogDetails, setWorklogDetails] = useState<Record<number, WorkLog[]>>({})

  useEffect(() => {
    let mounted = true
    async function load() {
      const projMap = new Map<number, Project>()
      projectsForFilter.forEach(p => projMap.set(p.id, p))

      const pidsAll = projectsForFilter.map(p => p.id)

      const byUserProjMonth: Record<number, number> = {} // non-internal projects only
      const byUserMonthTotal: Record<number, number> = {} // includes internal projects
      const details: Record<number, WorkLog[]> = {}

      for (const pid of pidsAll) {
        const project = projMap.get(pid)
        const isInternal = !!project?.isInternal
        try {
          const logs = await fetchWorkLogsForProject(pid)
          logs.forEach((w: WorkLog) => {
            const dt = new Date(w.date)
            const m = dt.getMonth() + 1
            const y = dt.getFullYear()
            const hours = (w.seconds || 0) / 3600

            if (m === month && y === year) {
              byUserMonthTotal[w.userId] = (byUserMonthTotal[w.userId] || 0) + hours

              if (!isInternal) {
                byUserProjMonth[w.userId] = (byUserProjMonth[w.userId] || 0) + hours
              }

              details[w.userId] = details[w.userId] || []
              details[w.userId].push(w)
            }
          })
        } catch (err) {
          void err
        }
      }
      if (!mounted) return

      const byUserMonth: Record<number, number> = {}
      const byUserTotal: Record<number, number> = {}
      const allUserIds = new Set<number>([...Object.keys(byUserMonthTotal).map(Number), ...Object.keys(byUserProjMonth).map(Number)])
      allUserIds.forEach(uid => {
        const pm = byUserProjMonth[uid] || 0
        const total = byUserMonthTotal[uid] || 0
        byUserMonth[uid] = Math.round((pm + Number.EPSILON) * 100) / 100
        byUserTotal[uid] = Math.round((total + Number.EPSILON) * 100) / 100
      })

      setWorklogSums({ byUserMonth, byUserTotal })
      setWorklogDetails(details)
    }
    load()
    return () => { mounted = false }
  }, [projectsForFilter, month, year])

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = empSearch.trim().toLowerCase()
      if (q) {
        const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim()
        const matchesFull = fullName.toLowerCase().includes(q)
        const matchesShort = (u.shortName || '').toLowerCase().includes(q)
        if (!matchesFull && !matchesShort) return false
      }

      if (empFilterRole) {
        const role = getUserRole(u)
        if (role !== empFilterRole) return false
      }

      if (empFilterProject) {
        const pid = Number(empFilterProject)
        const set = userProjectMap.get(u.id)
        if (!set || !set.has(pid)) return false
      } else if (empOnlyParticipants) {
        const set = userProjectMap.get(u.id)
        if (!set || set.size === 0) return false
      }

      return true
    })
  }, [users, empSearch, empFilterProject, empFilterRole, userProjectMap, empOnlyParticipants])

  function toggleEditMode() {
    if (!empEditMode) {
      const base: Record<number, number> = {}
      users.forEach(u => {
        const extra = u as unknown as UserExtras
        const baseCapacity = empSavedCapacity?.[u.id] ?? (extra.capacity ?? extra.monthlyCapacity ?? 160)
        base[u.id] = baseCapacity
      })
      setEmpEditedCapacity(base)
      setEmpEditMode(true)
    } else {
      setEmpEditMode(false)
      setEmpEditedCapacity(null)
      setEmpCellEditingCapacityUserId(null)
    }
  }

  return (
    <div id="employee-capacity" className="tp-muted-bg border tp-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold tp-text">{texts.capacityMatrix?.title || `Kapacita zaměstnanců — ${String(month).padStart(2, '0')} / ${year}`}</h3>
        <div className="ml-auto">
          <button
            type="button"
            aria-pressed={empEditMode}
            onClick={toggleEditMode}
            className={`px-3 py-1 text-sm rounded focus:outline-none ${empEditMode ? 'tp-btn-accent-alt' : 'tp-card tp-text'}`}>
            {texts.projectHeader?.edit || (empEditMode ? 'Ukončit editaci' : 'Upravit')}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <input value={empSearch} onChange={e => setEmpSearch(e.target.value)} className="w-56 tp-card tp-text border tp-border rounded px-3 py-2 placeholder:tp-muted focus:outline-none focus:ring-1" placeholder={texts.capacityMatrix?.searchPlaceholder || 'Hledat jméno'} />
            <select value={empFilterRole} onChange={e => setEmpFilterRole(e.target.value)} className="w-40 tp-card tp-text border tp-border rounded px-3 py-2 focus:outline-none focus:ring-1">
              <option value="">Všechny role</option>
              {rolesForFilter.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <label className="flex items-center text-sm tp-muted">
              <input type="checkbox" checked={empOnlyParticipants} onChange={e => setEmpOnlyParticipants(e.target.checked)} className="form-checkbox h-4 w-4 tp-accent bg-transparent border tp-border rounded mr-2" />
              {texts.capacityMatrix?.onlyParticipants || 'Pouze účastníci projektu'}
            </label>
          </div>

          <div className="flex items-center gap-2">
            <select value={empFilterProject} onChange={e => setEmpFilterProject(e.target.value)} className="w-64 tp-card tp-text border tp-border rounded px-3 py-2 focus:outline-none focus:ring-1">
              <option value="">Všechny projekty</option>
              {projectsForFilter.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
            </select>
            <button onClick={() => { setEmpSearch(''); setEmpFilterProject(''); setEmpFilterRole(''); setEmpOnlyParticipants(true) }} className="px-3 py-2 tp-muted-bg hover-accent tp-text rounded border tp-border">{texts.general?.reset || 'Reset'}</button>
          </div>
        </div>

        <table className="min-w-full border-collapse text-sm">
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr className="tp-muted text-xs border-b tp-border">
              <th className="px-4 py-3 text-left">{texts.capacityMatrix?.headers.person}</th>
              <th className="px-4 py-3 text-center">{texts.capacityMatrix?.headers.capacity}</th>
              <th className="px-4 py-3 text-center">{texts.capacityMatrix?.headers.assigned}</th>
              <th className="px-4 py-3 text-center">{texts.capacityMatrix?.headers.remaining}</th>
              <th className="px-4 py-3 text-center">{texts.capacityMatrix?.headers.loggedProject}</th>
              <th className="px-4 py-3 text-center">{texts.capacityMatrix?.headers.loggedTotal}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => {
              const extra = u as UserExtras
              const capacity = empSavedCapacity?.[u.id] ?? (empEditedCapacity?.[u.id] ?? (extra.capacity ?? extra.monthlyCapacity ?? 160))
              const role = getUserRole(u)
              const baseAssigned = userAssigned[u.id] || 0
              const assigned = baseAssigned
              const loggedProj = worklogSums.byUserMonth[u.id] ?? 0
              const loggedTotal = worklogSums.byUserTotal[u.id] ?? 0
              const remaining = capacity - assigned
              const remainingLabel = (remaining >= 0 ? `+${remaining}h` : `${remaining}h`)
              return (
                <tr key={`emp-${u.id}`} className="border-t tp-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span title={role} className={`inline-block w-3 h-3 rounded-full ${getRoleColorClass(role)}`} />
                      <div className="font-medium tp-text">{`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.shortName}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {empEditMode ? (
                      empCellEditingCapacityUserId === u.id ? (
                        <input
                          autoFocus
                          className="w-16 px-2 py-1 text-sm text-center border rounded tp-card tp-text tp-border focus:ring-1"
                          value={String(empEditedCapacity?.[u.id] ?? capacity)}
                          onChange={(e) => { const v = Number(e.target.value || 0); setEmpEditedCapacity(prev => ({ ...(prev || {}), [u.id]: v })) }}
                          onBlur={() => { const val = Number(empEditedCapacity?.[u.id] ?? capacity); setEmpSavedCapacity(prev => ({ ...(prev || {}), [u.id]: val })); setEmpCellEditingCapacityUserId(null) }}
                          onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur() }}
                        />
                      ) : (
                        <div className={`text-sm ${empEditMode ? 'cursor-pointer' : ''}`} onClick={() => { setEmpCellEditingCapacityUserId(u.id); if (!empEditedCapacity) { const base: Record<number, number> = {}; users.forEach(uu => { const ex = uu as unknown as UserExtras; base[uu.id] = empSavedCapacity?.[uu.id] ?? (ex.capacity ?? ex.monthlyCapacity ?? 160) }); setEmpEditedCapacity(base) } }}>
                          {String(empEditedCapacity?.[u.id] ?? capacity)}h
                        </div>
                      )
                    ) : (
                      String(capacity) + 'h'
                    )}
                  </td>
                  <td className="px-4 py-3 text-center align-middle">{String(assigned) + 'h'}</td>
                  <td className={`px-4 py-3 text-center ${remaining >= 0 ? 'tp-positive' : 'tp-danger'} font-semibold`}>{remainingLabel}</td>
                  <td className="px-4 py-3 text-center">{String(loggedProj)}h</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      className="w-full text-sm tp-text"
                      onClick={async (e) => {
                        e.stopPropagation(); e.preventDefault();
                        const combined: WorkLog[] = worklogDetails[u.id] ? [...worklogDetails[u.id]] : []
                        showModal(<WorkLogsModal workLogs={combined} users={users} />)
                      }}
                    >{String(loggedTotal)}h</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
