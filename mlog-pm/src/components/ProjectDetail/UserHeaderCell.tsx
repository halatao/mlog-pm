import type { User } from '../../types'
import { getUserRole, getRoleColorClass, getInitials } from '../../hooks/useRoles'

interface Props {
  user: User
}

export default function UserHeaderCell({ user }: Props) {
  const role = getUserRole(user)
  const color = getRoleColorClass(role)
  return (
    <div title={`${user.firstName} ${user.lastName}`} aria-label={`user-${user.id}`}>
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${color}`}>
        {getInitials(user)}
      </span>
    </div>
  )
}
