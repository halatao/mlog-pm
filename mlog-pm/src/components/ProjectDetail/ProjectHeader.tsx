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
}

export default function ProjectHeader({ projectName, managerName, showPlan, showLogged, editMode, onTogglePlan, onToggleLogged, onToggleEdit }: Props) {
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
                        <PlanLoggedControls showPlan={showPlan} showLogged={showLogged} editMode={editMode} onTogglePlan={onTogglePlan} onToggleLogged={onToggleLogged} onToggleEdit={onToggleEdit} />
                    </div>
                </div>
            </div>
        </div>
    )
}
