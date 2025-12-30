import useTexts from '../../hooks/useTexts'
import PlanLoggedControls from '../shared/PlanLoggedControls'

interface Props {
    projectName: string
    managerName: string
    showPlan: boolean
    showLogged: boolean
    editMode: boolean
    onTogglePlan: () => void
    onToggleLogged: () => void
    onToggleEdit: () => void
    onManageUsers?: () => void
}

export default function ProjectHeader({ projectName, managerName, showPlan, showLogged, editMode, onTogglePlan, onToggleLogged, onToggleEdit, onManageUsers }: Props) {
    const texts = useTexts()
    return (
        <div className="w-full">
            <div className="flex items-center justify-between w-full">
                <div>
                    <h1 className="text-3xl font-semibold tp-text">{projectName}</h1>
                    <p className="tp-muted mt-1">{texts.projectHeader.responsible} {managerName}</p>
                </div>

                <div className="ml-4 flex-shrink-0">
                    <div className="flex gap-4 items-center tp-text">
                        {onManageUsers ? (
                            <button title={texts.projectHeader.manageUsers} onClick={onManageUsers} className="p-2 rounded border tp-border tp-card hover-accent">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path fillRule="evenodd" d="M5 13a4 4 0 018 0v1H5v-1zM15.293 14.293a1 1 0 011.414 0l1 1a1 1 0 010 1.414l-3 3a1 1 0 01-.707.293H12a1 1 0 01-1-1v-1.586a1 1 0 01.293-.707l3-3z" clipRule="evenodd" />
                                </svg>
                            </button>
                        ) : null}
                        <PlanLoggedControls showPlan={showPlan} showLogged={showLogged} editMode={editMode} onTogglePlan={onTogglePlan} onToggleLogged={onToggleLogged} onToggleEdit={onToggleEdit} />
                    </div>
                </div>
            </div>
        </div>
    )
}
