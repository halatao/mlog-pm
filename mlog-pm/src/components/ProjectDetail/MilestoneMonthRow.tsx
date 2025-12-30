import type { ProjectMilestone, PlannedCapacity, LoggedCapacity, User } from '../../types'
import CapacityCell from './CapacityCell';

interface Props {
  m: ProjectMilestone
  row: { month: number; year: number }
  visibleUsers: User[]
  planned: PlannedCapacity[]
  logged: LoggedCapacity[]
  edits: Record<string, number>
  keyFor: (userId: number, milestoneId: number, month: number, year: number) => string
  onChange: (userId: number, milestoneId: number, month: number, year: number, hours: number) => void
  showPlan?: boolean
  showLogged?: boolean
  editMode?: boolean
  onEditMonth?: (m: ProjectMilestone, row: { month: number; year: number }) => void
}

export default function MilestoneMonthRow({ m, row, visibleUsers, planned, logged, edits, keyFor, onChange, showPlan = true, showLogged = true, editMode = false, onEditMonth }: Props) {
  let sumPlanned = 0
  let sumPlannedCost = 0
  let sumLoggedCost = 0

  visibleUsers.forEach(u => {
    const plannedEntry = planned.find(p => p.userId === u.id && p.milestoneId === m.id && p.month === row.month && p.year === row.year)
    const loggedEntry = logged.find(l => l.userId === u.id && l.milestoneId === m.id && l.month === row.month && l.year === row.year)
    const key = keyFor(u.id, m.id, row.month, row.year)
    const edited = edits[key]
    const displayPlanned = edited !== undefined ? edited : (plannedEntry ? plannedEntry.plannedHours : 0)
    const displayLogged = loggedEntry ? loggedEntry.loggedHours : 0
    sumPlanned += displayPlanned
    sumPlannedCost += displayPlanned * (u.costPerHour || 0)
    sumLoggedCost += displayLogged * (u.costPerHour || 0)
  })

  function fmtMoney(n: number) {
    return n === 0 ? '—' : n.toLocaleString('cs-CZ')
  }

  const incomeForMonth = (m.endMonth === row.month && m.endYear === row.year) ? Math.round(m.incomeAmount || 0) : 0
  const predictedCost = Math.round(sumPlannedCost)
  const predictedProfit = Math.round(incomeForMonth - predictedCost)

  const totalPlannedForMilestone = planned.filter(p => p.milestoneId === m.id).reduce((s, it) => s + (it.plannedHours || 0), 0)
  const monthValue = totalPlannedForMilestone > 0 ? Math.round(((m.incomeAmount || 0) * (sumPlanned / totalPlannedForMilestone))) : 0

  return (
    <tr className="border-t tp-border">
      <td className="px-4 py-3 pl-6">{String(row.month).padStart(2, '0')} / {row.year}</td>
      {visibleUsers.map(u => {
        const plannedEntry = planned.find(p => p.userId === u.id && p.milestoneId === m.id && p.month === row.month && p.year === row.year)
        const loggedEntry = logged.find(l => l.userId === u.id && l.milestoneId === m.id && l.month === row.month && l.year === row.year)
        const key = keyFor(u.id, m.id, row.month, row.year)
        const edited = edits[key]
        const displayPlanned = edited !== undefined ? edited : (plannedEntry ? plannedEntry.plannedHours : 0)
        const displayLogged = loggedEntry ? loggedEntry.loggedHours : 0
        return (
          <CapacityCell
            key={`${u.id}-${m.id}-${row.year}-${row.month}`}
            userId={u.id}
            milestoneId={m.id}
            month={row.month}
            year={row.year}
            planned={displayPlanned}
            logged={displayLogged}
            showPlan={showPlan}
            showLogged={showLogged}
            onChange={(hours) => onChange(u.id, m.id, row.month, row.year, hours)}
            disabled={!editMode}
          />
        )
      })}

      <td className="px-4 py-3 text-right">{fmtMoney(incomeForMonth)}</td>
      <td className="px-4 py-3 text-right font-semibold tp-text">{fmtMoney(monthValue)}</td>
      <td className="px-4 py-3 text-right">{fmtMoney(sumPlannedCost)}</td>
      <td className="px-4 py-3 text-right">{fmtMoney(sumLoggedCost)}</td>
      <td className="px-4 py-3 text-right">{fmtMoney(predictedCost)}</td>
      <td className={`px-4 py-3 text-right ${predictedProfit < 0 ? 'tp-danger font-semibold' : ''}`}>{fmtMoney(predictedProfit)}</td>
      <td className="px-4 py-3 text-center">
        <button
          title="Upravit kapacity"
          className="px-2 py-1 text-xs border tp-border rounded hover-accent"
          onClick={(e) => { e.stopPropagation(); onEditMonth?.(m, row) }}
        >
          E
        </button>
      </td>
    </tr>
  )
}
