import type { User } from '../types'

export type RoleKey = 'PM' | 'Creative' | 'Inactive'

export function getUserRole(u: User): RoleKey {
  if (u.isActivePM) return 'PM'
  if (u.isActiveCreative) return 'Creative'
  return 'Inactive'
}

export function getRoleColorClass(role: RoleKey): string {
  if (role === 'PM') return 'role-pm'
  if (role === 'Creative') return 'role-creative'
  return 'role-inactive'
}

export function roleToTextKey(role: RoleKey): 'pm' | 'creative' | 'inactive' {
  if (role === 'PM') return 'pm'
  if (role === 'Creative') return 'creative'
  return 'inactive'
}

export function getInitials(u: User) {
  if (u.shortName) return u.shortName
  const fn = (u.firstName || '').trim()
  const ln = (u.lastName || '').trim()
  if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase()
  const name = (fn || ln || '').replace(/\s+/g, '')
  return name.slice(0, 2).toUpperCase()
}

export function isActiveUser(u: User) {
  return Boolean(u.isActivePM || u.isActiveCreative)
}

export default function useRoles() {
  return {
    getUserRole,
    getRoleColorClass,
    roleToTextKey,
    getInitials,
    isActiveUser,
  }
}
