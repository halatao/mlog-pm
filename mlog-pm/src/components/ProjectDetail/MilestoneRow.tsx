import type { ProjectMilestone } from '../../types'
import { Link } from 'react-router-dom'

interface Props {
  milestone: ProjectMilestone
  projectId?: number
}

export default function MilestoneRow({ milestone, projectId }: Props) {
  return (
    <tr>
      <td>
        {projectId ? (
          <Link to={`/projects/${projectId}/milestones/${milestone.id}`} className="tp-text underline">{milestone.name}</Link>
        ) : (
          milestone.name
        )}
      </td>
      <td>{milestone.startMonth}/{milestone.startYear}</td>
    </tr>
  )
}
