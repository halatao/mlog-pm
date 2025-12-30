import { useEffect, useState } from 'react'
import useTexts from '../../hooks/useTexts'
import type { ProjectMilestone } from '../../types'

interface Props {
    milestone: ProjectMilestone | null
    open: boolean
    onClose: () => void
    onSave: (m: ProjectMilestone) => Promise<void>
}

export default function MilestoneEditModal({ milestone, open, onClose, onSave }: Props) {
    const [local, setLocal] = useState<ProjectMilestone | null>(milestone ? { ...milestone } : null)
    useEffect(() => {
        setLocal(milestone ? { ...milestone } : null)
    }, [milestone, open])
    const [saving, setSaving] = useState(false)

    const texts = useTexts()

    if (!open || !local) return null

    async function handleSave() {
        setSaving(true)
        try {
            await onSave(local!)
            onClose()
        } finally {
            setSaving(false)
        }
    }

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative tp-text rounded shadow max-w-xl w-full p-4 bg-[var(--tp-modal-bg)] z-10">
                <h3 className="text-lg font-semibold mb-4">{texts.milestoneModal.title}</h3>

                <div className="grid grid-cols-2 gap-2">
                    <label className="text-sm">{texts.milestoneModal.nameLabel}
                        <input className="w-full mt-1 p-2 tp-text rounded border tp-border" value={local.name} onChange={e => setLocal({ ...local, name: e.target.value })} />
                    </label>

                    <label className="text-sm">{texts.milestoneModal.incomeLabel}
                        <input type="number" className="w-full mt-1 p-2 tp-text rounded border tp-border" value={local.incomeAmount ?? 0} onChange={e => setLocal({ ...local, incomeAmount: Number(e.target.value) })} />
                    </label>
                    <label className="text-sm">{texts.milestoneModal.startMonthLabel}
                        <div className="flex gap-2 mt-1">
                            <select
                                className="w-2/3 p-2 tp-text rounded border tp-border"
                                value={local.startMonth}
                                onChange={e => setLocal({ ...local, startMonth: Number(e.target.value) })}
                            >
                                <option value={1}>Leden</option>
                                <option value={2}>Únor</option>
                                <option value={3}>Březen</option>
                                <option value={4}>Duben</option>
                                <option value={5}>Květen</option>
                                <option value={6}>Červen</option>
                                <option value={7}>Červenec</option>
                                <option value={8}>Srpen</option>
                                <option value={9}>Září</option>
                                <option value={10}>Říjen</option>
                                <option value={11}>Listopad</option>
                                <option value={12}>Prosinec</option>
                            </select>

                            <input
                                type="number"
                                className="w-1/3 p-2 tp-text rounded border tp-border"
                                value={local.startYear}
                                min={1970}
                                max={2100}
                                onChange={e => setLocal({ ...local, startYear: Number(e.target.value) })}
                            />
                        </div>
                    </label>

                    <label className="text-sm">Konec
                        <div className="flex gap-2 mt-1">
                            <select
                                className="w-2/3 p-2 tp-text rounded border tp-border"
                                value={local.endMonth ?? local.startMonth}
                                onChange={e => setLocal({ ...local, endMonth: Number(e.target.value) })}
                            >
                                <option value={1}>Leden</option>
                                <option value={2}>Únor</option>
                                <option value={3}>Březen</option>
                                <option value={4}>Duben</option>
                                <option value={5}>Květen</option>
                                <option value={6}>Červen</option>
                                <option value={7}>Červenec</option>
                                <option value={8}>Srpen</option>
                                <option value={9}>Září</option>
                                <option value={10}>Říjen</option>
                                <option value={11}>Listopad</option>
                                <option value={12}>Prosinec</option>
                            </select>

                            <input
                                type="number"
                                className="w-1/3 p-2 tp-text rounded border tp-border"
                                value={local.endYear ?? local.startYear}
                                min={1970}
                                max={2100}
                                onChange={e => setLocal({ ...local, endYear: Number(e.target.value) })}
                            />
                        </div>
                    </label>
                    <label className="text-sm">Hotovo (%)
                        <input type="number" min={0} max={100} className="w-full mt-1 p-2 tp-text rounded border tp-border" value={local.donePercent ?? 0} onChange={e => setLocal({ ...local, donePercent: Number(e.target.value) })} />
                    </label>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button className="tp-btn px-3 py-1 rounded" onClick={onClose} disabled={saving}>
                        {texts.milestoneModal.cancel}
                    </button>
                    <button className="tp-btn-accent px-3 py-1 rounded" onClick={handleSave} disabled={saving}>
                        {saving ? texts.milestoneModal.saving : texts.milestoneModal.save}
                    </button>
                </div>
            </div>
        </div>
    )
}
