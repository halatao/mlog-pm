import { useEffect, useState } from 'react'
import type { Requirement } from '../../types'
import { fetchCategories } from '../../api'
import ModalWrapper from './ModalWrapper'

interface Props {
    open: boolean
    onClose: () => void
    onSave: (req: Requirement) => Promise<void> | void
    projectId: number
    initial?: Requirement | null
}

export default function RequirementEditModal({ open, onClose, onSave, projectId, initial }: Props) {
    const [local, setLocal] = useState<Requirement | null>(initial ?? null)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([])

    useEffect(() => {
        setLocal(initial ? { ...initial } : { id: 0, projectId, name: '', priority: undefined, description: undefined, category: undefined, activity: undefined } as Requirement)
        if (open) {
            fetchCategories().then(setCategories).catch(() => setCategories([]))
        }
    }, [initial, projectId, open])

    if (!open || !local) return null

    async function handleSave() {
        if (!local) return
        setSaving(true)
        try {
            const payload: Requirement = {
                id: local.id ?? 0,
                projectId,
                name: local.name ?? '',
                priority: local.priority,
                description: local.description,
                category: local.category,
                activity: local.activity,
            }
            await onSave(payload)
            onClose()
        } finally {
            setSaving(false)
        }
    }

    return (
        <ModalWrapper open={open} onClose={onClose} title="Požadavek" maxWidth="max-w-md">
            <label className="text-sm block">Název
                <input className="w-full mt-1 p-2 tp-text rounded border tp-border" value={local.name} onChange={e => setLocal({ ...local, name: e.target.value })} />
            </label>

            <div className="grid grid-cols-3 gap-2 mt-3">
                <label className="text-sm">Činnost
                    <input className="w-full p-2 tp-text rounded border tp-border" value={local.activity || ''} onChange={e => setLocal({ ...local, activity: e.target.value })} />
                </label>
                <label className="text-sm">Priorita
                    <select className="w-full p-2 tp-text rounded border tp-border" value={local.priority ?? ''} onChange={e => setLocal({ ...local, priority: e.target.value || undefined })}>
                        <option value="">-</option>
                        <option value="vysoká">vysoká</option>
                        <option value="střední">střední</option>
                        <option value="nízká">nízká</option>
                    </select>
                </label>
                <label className="text-sm">Kategorie
                    {categories.length > 0 ? (
                        <select className="w-full p-2 tp-text rounded border tp-border" value={local.category ?? ''} onChange={e => setLocal({ ...local, category: e.target.value || undefined })}>
                            <option value="">-</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    ) : (
                        <input className="w-full p-2 tp-text rounded border tp-border" value={local.category || ''} onChange={e => setLocal({ ...local, category: e.target.value })} />
                    )}
                </label>
            </div>

            <label className="text-sm block mt-3">Popis
                <textarea className="w-full mt-1 p-2 tp-text rounded border tp-border" rows={6} value={local.description || ''} onChange={e => setLocal({ ...local, description: e.target.value })} />
            </label>

            <div className="mt-4 flex justify-end gap-2">
                <button className="tp-btn px-3 py-1 rounded" onClick={onClose} disabled={saving}>Zrušit</button>
                <button className="tp-btn-accent px-3 py-1 rounded" onClick={handleSave} disabled={saving}>{saving ? 'Ukládám...' : 'Uložit'}</button>
            </div>
        </ModalWrapper>
    )
}
