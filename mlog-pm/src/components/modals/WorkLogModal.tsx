import { useEffect, useState } from 'react'
import ModalWrapper from './ModalWrapper'
import TimeInput from '../shared/TimeInput'

interface Props {
    open: boolean
    onClose: () => void
    onSave: (payload: { subRequirementId: number; userId: number; seconds: number; date: string; description?: string }) => Promise<void> | void
    initialSubRequirementId?: number | null
    users: { id: number; firstName: string; lastName: string }[]
}

export default function WorkLogModal({ open, onClose, onSave, initialSubRequirementId, users }: Props) {
    const [subId, setSubId] = useState<number | null>(initialSubRequirementId ?? null)
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
    const [hoursValue, setHoursValue] = useState<number>(0)
    const [description, setDescription] = useState<string>('')
    const [userId, setUserId] = useState<number | undefined>(users.length ? users[0].id : undefined)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setSubId(initialSubRequirementId ?? null)
        setDate(new Date().toISOString().slice(0, 10))
        setHoursValue(0)
        setDescription('')
        setUserId(users.length ? users[0].id : undefined)
    }, [initialSubRequirementId, open, users])

    if (!open) return null

    async function handleSave() {
        if (!subId) {
            alert('Vyberte úkol (sub requirement) pro který zapisujete práci.')
            return
        }
        if (!userId) {
            alert('Vyberte uživatele.')
            return
        }
        const secs = Math.max(0, Math.round((Number(hoursValue) || 0) * 3600))
        setSaving(true)
        try {
            await onSave({ subRequirementId: subId, userId, seconds: secs, date, description: description || undefined })
            onClose()
        } finally {
            setSaving(false)
        }
    }

    return (
        <ModalWrapper open={open} onClose={onClose} title="Log práce" maxWidth="max-w-md">
            <div className="grid grid-cols-3 gap-2 items-end">
                <div>
                    <div className="text-xs tp-muted">Datum</div>
                    <input type="date" className="w-full mt-1 p-2 tp-text rounded border tp-border" value={date} onChange={e => setDate(e.target.value)} />
                </div>

                <div className="col-span-2">
                    <div className="text-xs tp-muted">Čas (hodiny)</div>
                    <div className="mt-1">
                        <TimeInput className="w-full p-2 tp-text rounded border tp-border text-right" value={hoursValue} onChange={(v) => setHoursValue(v)} />
                    </div>
                </div>
            </div>

            <div className="mt-3">
                <div className="text-xs tp-muted">činnost</div>
                <input className="w-full mt-1 p-3 tp-text rounded border tp-border" value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            {subId === null ? (
                <div className="mt-3 text-xs tp-muted">Úkol (id)
                    <input className="w-32 ml-2 p-1 tp-text rounded border tp-border inline-block" value={subId ?? ''} onChange={e => setSubId(e.target.value ? Number(e.target.value) : null)} />
                </div>
            ) : null}

            <div className="mt-4 flex justify-end gap-2">
                <button className="tp-btn px-3 py-1 rounded" onClick={onClose} disabled={saving}>Zrušit</button>
                <button className="tp-btn-accent px-3 py-1 rounded" onClick={handleSave} disabled={saving}>{saving ? 'Ukládám...' : 'Uložit'}</button>
            </div>
        </ModalWrapper>
    )
}
