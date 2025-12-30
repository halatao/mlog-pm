import useTexts from '../../hooks/useTexts'

interface Props {
  inline?: boolean
}

export default function CapacityLegend({ inline = false }: Props) {
  const texts = useTexts()

  const roles = (
    <div className="flex items-center gap-6 text-sm tp-muted">
      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full role-pm" /> {texts.capacityMatrix.roles.pm}</div>
      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full role-creative" /> {texts.capacityMatrix.roles.creative}</div>
      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full role-inactive" /> {texts.capacityMatrix.roles.inactive}</div>
    </div>
  )

  const status = (
    <div className="flex items-center gap-6 text-sm tp-muted">
      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full status-logged" /> <span>Zalogováno</span></div>
      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full status-none" /> <span>Bez logů</span></div>
      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full status-over" /> <span>Překročeno (logy &gt; plán)</span></div>
    </div>
  )

  if (inline) return <div className="flex items-center justify-between">{roles}{status}</div>

  return (
    <>
      {roles}
      {status}
    </>
  )
}
