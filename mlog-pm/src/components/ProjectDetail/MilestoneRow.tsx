import type { ProjectMilestone } from '../../types'

interface Props {
  milestone: ProjectMilestone
}

export default function MilestoneRow({ milestone }: Props) {
  return (
    <tr>
      <td>{milestone.name}</td>
      <td>{milestone.startMonth}/{milestone.startYear}</td>
    </tr>
  )
}
