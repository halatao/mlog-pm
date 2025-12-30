import { useEffect, useState } from 'react'
import type { User } from '../../types'
import { fetchUsers, updateProjectUsers } from '../../api'

interface Props {
  open: boolean
  projectId: number
  users: User[]
  onClose: () => void
  onSaved?: () => void
}

export default function ProjectUsersModal({ open, projectId, users, onClose, onSaved }: Props) {
  const [assigned, setAssigned] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const assignedUsers = await fetchUsers(projectId)
        if (!mounted) return
        const assignedIds = new Set(assignedUsers.map(u => u.id))
        const map: Record<number, boolean> = {}
        users.forEach(u => map[u.id] = assignedIds.has(u.id))
        setAssigned(map)
      } catch {
        // ignore for now
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [open, projectId, users])

  if (!open) return null

  async function handleSave() {
    setSaving(true)
    try {
      const ids = Object.entries(assigned).filter(([, v]) => v).map(([k]) => Number(k))
      await updateProjectUsers(projectId, ids)
      onSaved?.()
      onClose()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="tp-backdrop" onClick={onClose} />
      <div style={{ zIndex: 100000 }} className="relative w-full max-w-2xl p-6 rounded-lg tp-card border tp-border tp-text">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold tp-text">Správa účastníků projektu</h3>
          <button aria-label="Zavřít" onClick={onClose} className="p-2 rounded tp-btn-ghost hover-accent">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="tp-text">Načítání…</div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {users.map(u => (
              <label key={u.id} className="flex items-center gap-3 p-2 hover-muted rounded">
                <input type="checkbox" checked={!!assigned[u.id]} onChange={e => setAssigned(prev => ({ ...prev, [u.id]: e.target.checked }))} className="form-checkbox h-4 w-4 tp-accent bg-transparent border tp-border rounded" />
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full role-inactive text-sm font-semibold">{u.shortName}</span>
                  <div>
                    <div className="font-medium tp-text">{`${u.firstName} ${u.lastName}`.trim() || u.shortName}</div>
                    <div className="text-xs tp-muted">{u.isActivePM ? 'PM' : u.isActiveCreative ? 'Creative' : ''}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 tp-muted-bg rounded border tp-border tp-text">Zrušit</button>
          <button onClick={handleSave} disabled={saving} className="px-3 py-2 tp-btn-accent rounded">{saving ? 'Ukládám…' : 'Uložit'}</button>
        </div>
      </div>
    </div>
  )
}
