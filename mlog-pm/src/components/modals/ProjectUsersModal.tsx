import { useEffect, useState } from 'react'
import type { User } from '../../types'
import { updateProjectUsers } from '../../api'
import ModalWrapper from './ModalWrapper'
import useTexts from '../../hooks/useTexts'

interface Props {
    open: boolean
    projectId: number
    users: User[]
    onClose: () => void
    onSaved?: () => void
}

export default function ProjectUsersModal({ open, projectId, users, onClose, onSaved }: Props) {
    const texts = useTexts()
    const [selected, setSelected] = useState<number[]>([])
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!open) return
        setSelected(users.map(u => u.id))
    }, [open, users])

    if (!open) return null

    async function handleSave() {
        setSaving(true)
        try {
            await updateProjectUsers(projectId, selected)
            if (onSaved) onSaved()
            onClose()
        } finally {
            setSaving(false)
        }
    }

    return (
        <ModalWrapper open={open} onClose={onClose} title={texts.projectUsersModal?.title} maxWidth="max-w-lg">
            <div className="space-y-2">
                {users.map(u => (
                    <label key={u.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={selected.includes(u.id)} onChange={e => setSelected(prev => e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id))} />
                        <span>{u.firstName} {u.lastName}</span>
                    </label>
                ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
                <button className="px-3 py-2 tp-muted-bg rounded border tp-border tp-text" onClick={onClose}>{texts.projectUsersModal?.cancel}</button>
                <button className="px-3 py-2 tp-btn-accent rounded" onClick={handleSave} disabled={saving}>{saving ? texts.projectUsersModal?.saving : texts.projectUsersModal?.save}</button>
            </div>
        </ModalWrapper>
    )
}
