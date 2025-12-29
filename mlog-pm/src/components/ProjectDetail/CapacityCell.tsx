import { useState } from 'react'

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

export default function CapacityCell({
  planned = 0,
  logged = 0,
  showPlan = true,
  showLogged = true,
  onChange,
  disabled = false,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(String(planned ?? ''))

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
                <span className="tp-muted">{logged ?? 0}</span>
              </>
            ) : onlyPlan ? (
              <span className="tp-text">{planned ?? 0}</span>
            ) : onlyLogged ? (
              <span className="tp-muted">{logged ?? 0}</span>
            ) : (
              <span className="tp-muted">-</span>
            )}
          </div>
          <div className={`w-2 h-2 mt-1 rounded-full ${((logged || 0) > (planned || 0)) ? 'status-over' : (logged ? 'status-logged' : 'status-none')}`} title={logged ? `Zalogováno: ${logged}h` : 'Bez logů'} />
        </div>
      )}
    </td>
  )
}
