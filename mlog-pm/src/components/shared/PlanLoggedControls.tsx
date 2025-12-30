import useTexts from '../../hooks/useTexts'

interface Props {
  showPlan?: boolean
  showLogged?: boolean
  editMode?: boolean
  onTogglePlan?: () => void
  onToggleLogged?: () => void
  onToggleEdit?: () => void
  showEditButton?: boolean
}

export default function PlanLoggedControls({ showPlan = true, showLogged = true, editMode = false, onTogglePlan, onToggleLogged, onToggleEdit, showEditButton = true }: Props) {
  const texts = useTexts()

  return (
    <div className="flex gap-4 items-center tp-card p-2 rounded shadow tp-text">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-pressed={showPlan}
          onClick={onTogglePlan}
          className={`px-3 py-1 text-sm rounded focus:outline-none ${showPlan ? 'tp-btn-accent' : 'tp-card border tp-border tp-text'}`}
        >
          {texts.projectHeader.plan}
        </button>

        <button
          type="button"
          aria-pressed={showLogged}
          onClick={onToggleLogged}
          className={`px-3 py-1 text-sm rounded focus:outline-none ${showLogged ? 'tp-btn-accent' : 'tp-card border tp-border tp-text'}`}
        >
          {texts.projectHeader.logged}
        </button>

        {showEditButton ? (
          <button
            type="button"
            aria-pressed={editMode}
            onClick={onToggleEdit}
            className={`px-3 py-1 text-sm rounded focus:outline-none ${editMode ? 'tp-btn-accent-alt' : 'tp-card border tp-border tp-text'}`}
          >
            {texts.projectHeader.edit}
          </button>
        ) : null}
      </div>
    </div>
  )
}
