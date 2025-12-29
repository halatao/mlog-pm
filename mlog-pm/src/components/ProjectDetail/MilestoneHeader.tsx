import type { ProjectMilestone } from '../../types'
import useTexts from '../../hooks/useTexts'

interface Props {
  m: ProjectMilestone
  onEditMilestone?: (m: ProjectMilestone) => void
  onAddMonth?: (m: ProjectMilestone) => void
}

export default function MilestoneHeader({ m, onEditMilestone, onAddMonth }: Props) {
  const texts = useTexts()
  const t = texts.capacityMatrix.milestoneHeader

  return (
    <tr className="tp-muted-bg">
      <td colSpan={999} className="p-3 font-semibold tp-text">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1">
              <div className="font-semibold tp-text text-base">{m.name}</div>
            </div>

            <div className="flex items-center gap-8 text-sm">

              <div>
                <div className="text-xs tp-muted">{t.incomeLabel}</div>
                <div className="font-semibold tp-text">{(m.incomeAmount || 0).toLocaleString('cs-CZ') + '\u00A0Kč'}</div>
              </div>

              <div className="min-w-[220px]">
                <div className="flex justify-between text-xs tp-muted mb-1">
                  <span>{t.doneLabel}</span>
                  {typeof m.donePercent === 'number' && m.donePercent > 100 ? (
                    <span className="tp-danger font-semibold">{t.overflowPrefix} {m.donePercent} %</span>
                  ) : (
                    <span className="tp-text font-semibold">{m.donePercent ?? 0} %</span>
                  )}
                </div>
                <div className="h-2 tp-muted-bg rounded overflow-hidden">
                  <div
                    className={`h-2 ${typeof m.donePercent === 'number' && m.donePercent > 100 ? 'status-over' : 'tp-accent-bg'} rounded`}
                    style={{ width: `${Math.min(100, Math.max(0, m.donePercent ?? 0))}%` }}
                  />
                </div>
              </div>

                  <div className="flex gap-2">
                <button
                  type="button"
                  className="px-2 py-1 text-xs border rounded hover:bg-slate-600 tp-text"
                  title={t.editButton}
                  onClick={(e) => { e.stopPropagation(); onEditMilestone?.(m) }}
                >
                  {t.editButton}
                </button>
                <button
                  type="button"
                      className="px-2 py-1 text-xs border rounded hover-accent tp-text"
                  title={t.addMonthButton}
                  onClick={(e) => { e.stopPropagation(); onAddMonth?.(m) }}
                >
                  {t.addMonthButton}
                </button>
              </div>

            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}
