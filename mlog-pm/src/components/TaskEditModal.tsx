import { useEffect, useState } from 'react'
import type { SubRequirement, User } from '../types'
import TimeInput from './shared/TimeInput'

interface Props {
    open: boolean
    onClose: () => void
    onSave: (task: SubRequirement) => Promise<void> | void
    users: User[]
    initial?: SubRequirement | null
}

type LocalSub = SubRequirement & { description?: string }

export default function TaskEditModal({ open, onClose, onSave, users, initial }: Props) {
    const [local, setLocal] = useState<LocalSub | null>(initial ? { ...(initial as LocalSub) } : null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const init = initial ? { ...(initial as LocalSub) } : { id: 0, requirementId: 0, milestoneId: 0, name: '', estimateHours: 0, assignedToId: undefined }
        setLocal(init)
    }, [initial, open])

    if (!open || !local) return null

    async function handleSave() {
        if (!local) return
        setSaving(true)
        try {
            // ensure estimateHours is defined
            const merged: LocalSub = { ...local, estimateHours: local.estimateHours || 0 }
            // prepare payload by stripping local-only fields (description)
            const { description, ...payload } = merged as LocalSub
            void description
            await onSave(payload as SubRequirement)
            onClose()
        } finally {
            setSaving(false)
        }
    }

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />

            <div className="relative tp-text rounded shadow max-w-md w-full p-4 bg-[var(--tp-modal-bg)] z-10">
                <h3 className="text-lg font-semibold mb-3">Úkol</h3>

                <label className="text-sm block">Název
                    <input className="w-full mt-1 p-2 tp-text rounded border tp-border" value={local.name} onChange={e => setLocal({ ...local, name: e.target.value })} />
                </label>

                    <div className="grid grid-cols-3 gap-2 mt-3 items-end">
                        <label className="text-sm col-span-2">Osoba
                            <select className="w-full p-2 tp-text rounded border tp-border" value={local.assignedToId ?? ''} onChange={e => setLocal({ ...local, assignedToId: e.target.value ? Number(e.target.value) : undefined })}>
                                <option value="">-</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                            </select>
                        </label>

                        <label className="text-sm">Plán
                            <TimeInput className="w-full p-2 tp-text rounded border tp-border text-right" value={local.estimateHours ?? 0} onChange={(v) => setLocal({ ...local, estimateHours: v })} />
                        </label>
                    </div>

                <label className="text-sm block mt-3">Popis
                    <textarea className="w-full mt-1 p-2 tp-text rounded border tp-border" rows={6} value={local.description || ''} onChange={e => setLocal({ ...local, description: e.target.value })} />
                </label>

                <div className="mt-4 flex justify-end gap-2">
                    <button className="tp-btn px-3 py-1 rounded" onClick={onClose} disabled={saving}>Zrušit</button>
                    <button className="tp-btn-accent px-3 py-1 rounded" onClick={handleSave} disabled={saving}>{saving ? 'Ukládám...' : 'Uložit'}</button>
                </div>
            </div>
        </div>
    )
}
