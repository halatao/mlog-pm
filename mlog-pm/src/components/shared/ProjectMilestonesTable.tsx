import type { Project, ProjectMilestone, User } from '../../types'
import useTexts from '../../hooks/useTexts'
import { getUserRole, getRoleColorClass, getInitials } from '../../hooks/useRoles'
import { Link } from 'react-router-dom'

interface Row {
    project: Project
    milestone: ProjectMilestone
    plannedByUser: Record<number, number>
    loggedByUser: Record<number, number>
    incomeForMonth: number
    valueForMonth: number
    predictedCost: number
    predictedProfit: number
}

interface Props {
    project: Project
    rows: Row[]
    users: User[]
    participants: User[]
    showPlan: boolean
    showLogged: boolean
    fmtNumber: (n: number) => string
}

export default function ProjectMilestonesTable({ project, rows, users, participants, showPlan, showLogged, fmtNumber }: Props) {
    const texts = useTexts()

    const incomeTotal = rows.reduce((s, it) => s + (it.incomeForMonth || 0), 0)
    const valueTotal = rows.reduce((s, it) => s + (it.valueForMonth || 0), 0)
    const planCzkTotal = rows.reduce((s, it) => {
        const rowPlan = Object.entries(it.plannedByUser).reduce((s2, [uidStr, hrs]) => {
            const user = users.find(u => u.id === Number(uidStr))
            return s2 + (hrs || 0) * (user?.costPerHour || 0)
        }, 0)
        return s + rowPlan
    }, 0)
    const loggedCostTotal = rows.reduce((s, it) => {
        const rowLogged = Object.entries(it.loggedByUser).reduce((s2, [uidStr, hrs]) => {
            const user = users.find(u => u.id === Number(uidStr))
            return s2 + (hrs || 0) * (user?.costPerHour || 0)
        }, 0)
        return s + rowLogged
    }, 0)
    const predictedCostTotal = rows.reduce((s, it) => s + (it.predictedCost || 0), 0)
    const predictedProfitTotal = rows.reduce((s, it) => s + (it.predictedProfit || 0), 0)

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <colgroup>
                    <col style={{ width: '16rem' }} />
                    {participants.map(p => (
                        <col key={`col-${project.id}-${p.id}`} style={{ width: '5rem' }} />
                    ))}
                    <col style={{ width: '9rem' }} />
                    <col style={{ width: '10rem' }} />
                    <col style={{ width: '9rem' }} />
                    <col style={{ width: '9rem' }} />
                    <col style={{ width: '9rem' }} />
                    <col style={{ width: '9rem' }} />
                </colgroup>
                <tbody>
                    <tr className="tp-muted-bg text-xs tp-muted border-b tp-border">
                        <th scope="col" className="px-4 py-2 text-left">{texts.capacityMatrix.headers.milestone}</th>
                        {participants.map(p => (
                            <th key={`hdr-${project.id}-${p.id}`} scope="col" className="text-center font-semibold">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${getRoleColorClass(getUserRole(p))}`} aria-label={getUserRole(p)}>
                                    {getInitials(p)}
                                </span>
                            </th>
                        ))}
                        <th scope="col" className='px-3 py-2 text-right'>
                            <div className="flex flex-col items-end">
                                <span>{texts.capacityMatrix.milestoneHeader.incomeLabel}</span>
                                <span className="text-xs tp-muted">(Kč)</span>
                            </div>
                        </th>
                        <th scope="col" className='px-3 py-2 text-right'>
                            <div className="flex flex-col items-end">
                                <span>{texts.capacityMatrix.headers.value}</span>
                                <span className="text-xs tp-muted">(Kč)</span>
                            </div>
                        </th>
                        <th scope="col" className="px-3 py-2 text-right">
                            <div className="flex flex-col items-end">
                                <span>{texts.capacityMatrix.headers.planned}</span>
                                <span className="text-xs tp-muted">(Kč)</span>
                            </div>
                        </th>
                        <th scope="col" className="px-3 py-2 text-right">
                            <div className="flex flex-col items-end">
                                <span>{texts.capacityMatrix.headers.logged}</span>
                                <span className="text-xs tp-muted">(Kč)</span>
                            </div>
                        </th>
                        <th scope="col" className="px-3 py-2 pr-6 text-right">
                            <div className="flex flex-col items-end">
                                <span>{texts.capacityMatrix.headers.predictedCost}</span>
                                <span className="text-xs tp-muted">(Kč)</span>
                            </div>
                        </th>
                        <th scope="col" className="px-3 py-2 pr-6 text-right">
                            <div className="flex flex-col items-end">
                                <span>{texts.capacityMatrix.headers.predictedProfit}</span>
                                <span className="text-xs tp-muted">(Kč)</span>
                            </div>
                        </th>
                    </tr>

                    {rows.map((rr, idx2) => {
                        const planCzk = Object.entries(rr.plannedByUser).reduce((s, [uidStr, hrs]) => {
                            const user = users.find(u => u.id === Number(uidStr))
                            return s + (hrs || 0) * (user?.costPerHour || 0)
                        }, 0)

                        const loggedCost = Object.entries(rr.loggedByUser).reduce((s, [uidStr, hrs]) => {
                            const user = users.find(u => u.id === Number(uidStr))
                            return s + (hrs || 0) * (user?.costPerHour || 0)
                        }, 0)

                        return (
                            <tr key={`m-${project.id}-${idx2}`} className="border-t tp-border">
                                <td className="px-4 py-3 font-medium">
                                    <Link to={`/projects/${project.id}/milestones/${rr.milestone.id}`} className="tp-text underline">{rr.milestone.name}</Link>
                                </td>
                                {participants.map(p => (
                                    <td key={`cell-${project.id}-${rr.milestone.id}-${p.id}`} className="text-center">
                                        <div className="font-medium">{showPlan ? String(rr.plannedByUser[p.id] || 0) : ''}{(showPlan && showLogged) ? ' / ' : ''}{showLogged ? String(rr.loggedByUser[p.id] || 0) : ''}</div>
                                        <div className={`w-2 h-2 mx-auto mt-1 rounded-full ${((rr.loggedByUser[p.id] || 0) > (rr.plannedByUser[p.id] || 0)) ? 'status-over' : (rr.loggedByUser[p.id] ? 'status-logged' : 'status-none')}`} title={rr.loggedByUser[p.id] ? (texts.capacityMatrix.loggedTooltip ? texts.capacityMatrix.loggedTooltip.replace('{hours}', String(rr.loggedByUser[p.id])) : `Zalogováno: ${rr.loggedByUser[p.id]}h`) : (texts.capacityMatrix.noLogs || 'Bez logů')} />
                                    </td>
                                ))}
                                <td className="text-right">{rr.incomeForMonth ? fmtNumber(rr.incomeForMonth) : '—'}</td>
                                <td className="text-right">{rr.valueForMonth ? fmtNumber(rr.valueForMonth) : '—'}</td>
                                <td className="text-right">{planCzk ? fmtNumber(planCzk) : '—'}</td>
                                <td className="text-right">{loggedCost ? fmtNumber(loggedCost) : '—'}</td>
                                <td className="text-right pr-6">{rr.predictedCost ? fmtNumber(rr.predictedCost) : '—'}</td>
                                <td className={`text-right ${typeof rr.predictedProfit === 'number' && rr.predictedProfit < 0 ? 'tp-danger' : 'tp-positive'} font-semibold pr-6`}>{typeof rr.predictedProfit === 'number' ? fmtNumber(rr.predictedProfit) : '—'}</td>
                            </tr>
                        )
                    })}

                    {rows.length > 1 ? (
                        <tr className="border-t tp-border tp-muted-bg font-semibold">
                            <td className="px-4 py-3">Celkem</td>
                            {participants.map(p => (
                                <td key={`tot-${project.id}-${p.id}`} className="text-center">
                                    <div>{String(0)}</div>
                                </td>
                            ))}
                            <td className="text-right">{incomeTotal ? fmtNumber(incomeTotal) : '—'}</td>
                            <td className="text-right">{valueTotal ? fmtNumber(valueTotal) : '—'}</td>
                            <td className="text-right">{planCzkTotal ? fmtNumber(planCzkTotal) : '—'}</td>
                            <td className="text-right">{loggedCostTotal ? fmtNumber(loggedCostTotal) : '—'}</td>
                            <td className="text-right pr-6">{predictedCostTotal ? fmtNumber(predictedCostTotal) : '—'}</td>
                            <td className={`text-right ${predictedProfitTotal < 0 ? 'tp-danger' : 'tp-positive'} pr-6`}>{predictedProfitTotal ? fmtNumber(predictedProfitTotal) : '—'}</td>
                        </tr>
                    ) : null}
                </tbody>
            </table>
        </div>
    )
}
