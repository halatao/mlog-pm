import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useTexts from '../hooks/useTexts'
import { fetchProjects, fetchMilestones, fetchPlannedCapacities, fetchLoggedCapacities } from '../api'
import type { Project, ProjectMilestone, PlannedCapacity, LoggedCapacity } from '../types'

export default function HomePreview() {
    const texts = useTexts()
    const [loading, setLoading] = useState(true)
    const [previews, setPreviews] = useState<Array<{ project: Project; milestone?: ProjectMilestone; plannedHours: number; loggedHours: number }>>([])

    useEffect(() => {
        let mounted = true
        async function load() {
            try {
                const ps = await fetchProjects()
                const sample = ps.slice(0, 3)
                const results = await Promise.all(sample.map(async (p) => {
                    const ms = await fetchMilestones(p.id)
                    const pl = await fetchPlannedCapacities(p.id)
                    const lo = await fetchLoggedCapacities(p.id)
                    const plannedHours = (pl || []).reduce((s: number, it: PlannedCapacity) => s + (it.plannedHours || 0), 0)
                    const loggedHours = (lo || []).reduce((s: number, it: LoggedCapacity) => s + (it.loggedHours || 0), 0)
                    return { project: p, milestone: ms?.[0], plannedHours, loggedHours }
                }))
                if (!mounted) return
                setPreviews(results)
            } catch (e) {
                console.debug('HomePreview load failed', e)
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    const totalPlanned = previews.reduce((s, r) => s + r.plannedHours, 0)
    const totalLogged = previews.reduce((s, r) => s + r.loggedHours, 0)

    function fmtMoney(n: number) { return n === 0 ? '—' : n.toLocaleString('cs-CZ') + '\u00A0Kč' }

    return (
        <div className="space-y-6">
            <div className="prose">{texts.general.welcome}</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Overview preview */}
                <Link to="/overview/2025/12" className="tp-card p-4 hover:tp-border-accent">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold">{texts.general.nav.overview}</h3>
                            <p className="text-sm tp-muted">{texts.general?.previewOverviewDesc}</p>
                        </div>
                        <div className="text-xs tp-muted">{texts.general?.openLabel}</div>
                    </div>

                    <div className="mt-3">
                        <div className="w-full h-24 bg-gradient-to-r from-slate-800/10 to-slate-800/5 rounded tp-muted-bg p-2">
                            <div className="text-xs tp-muted">12/2025 • Náhled heatmapy kapacit</div>
                            <div className="mt-2 grid grid-cols-6 gap-1">
                                {Array.from({ length: 18 }).map((_, i) => (
                                    <div key={i} className={`h-3 rounded ${i % 5 === 0 ? 'tp-accent-bg' : 'tp-muted-bg'}`} />
                                ))}
                            </div>
                            <div className="text-xs tp-muted mt-2">Plán: {loading ? texts.general?.loadingShort : `${totalPlanned} h`} · Čerpáno: {loading ? texts.general?.loadingShort : `${totalLogged} h`}</div>
                        </div>
                    </div>
                </Link>

                {/* My Projects preview (first project) */}
                <Link to="/users/1/projects" className="tp-card p-4 hover:tp-border-accent">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold">{texts.general.nav.myProjects}</h3>
                            <p className="text-sm tp-muted">{texts.general?.previewMyProjectsDesc}</p>
                        </div>
                        <div className="text-xs tp-muted">{texts.general?.openLabel}</div>
                    </div>

                    <div className="mt-3 text-sm">
                        {loading && <div className="tp-muted">{texts.general?.loadingShort}</div>}
                        {!loading && previews[0] && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full tp-muted-bg flex items-center justify-center">{previews[0].project.name.split(' ').map(s => s[0]).slice(0, 2).join('')}</div>
                                <div>
                                    <div className="font-medium">{previews[0].project.name}</div>
                                    <div className="text-xs tp-muted">{previews[0].milestone?.name ?? '—'} • {previews[0].milestone?.donePercent ?? 0}%</div>
                                </div>
                            </div>
                        )}
                        {!loading && previews.length <= 0 && <div className="tp-muted">{texts.general?.noProjectsShort}</div>}
                        <div className="mt-2 text-xs tp-muted">{loading ? '' : `+ ${Math.max(0, previews.length - 1)} dalších`}</div>
                    </div>
                </Link>

                {/* Single project quick link (second preview if present) */}
                <Link to={previews[1] ? `/projects/${previews[1].project.id}` : '/projects/1'} className="tp-card p-4 hover:tp-border-accent">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold">{texts.general.nav.project}</h3>
                            <p className="text-sm tp-muted">{texts.general?.previewProjectDesc}</p>
                        </div>
                        <div className="text-xs tp-muted">{texts.general?.openLabel}</div>
                    </div>

                    <div className="mt-3 text-sm tp-muted">
                        {!loading && previews[1] ? (
                            <>
                                <div className="text-sm">{previews[1].project.name} — {previews[1].milestone?.name ?? '—'}</div>
                                <div className="text-xs mt-1">pred. zisk: {fmtMoney(Math.round((previews[1].milestone?.incomeAmount || 0) - 0))} • {previews[1].milestone?.donePercent ?? 0} %</div>
                            </>
                        ) : (
                            <div className="tp-muted">{texts.general?.loadingShort}</div>
                        )}
                    </div>
                </Link>
            </div>
        </div>
    )
}
