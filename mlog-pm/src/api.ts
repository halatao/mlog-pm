// Minimal API client wrapper using fetch. All business calculations must come from backend.

import type { Project, ProjectMilestone, PlannedCapacity, LoggedCapacity, User } from './types'

// Simple in-memory mock implementation for development before backend exists.
// All functions keep the same signatures as the real API client.

const sleep = (ms = 250) => new Promise((res) => setTimeout(res, ms))

// Mock data
const mockUsers: User[] = [
  { id: 1, firstName: 'Olga', lastName: 'Havlíčková', shortName: 'OH', isActivePM: true, isActiveCreative: false, costPerHour: 1000 },
  { id: 2, firstName: 'Jan', lastName: 'Novák', shortName: 'JN', isActivePM: false, isActiveCreative: true, costPerHour: 1000 },
  { id: 3, firstName: 'Petr', lastName: 'Svoboda', shortName: 'PS', isActivePM: false, isActiveCreative: true, costPerHour: 1000 },
  { id: 4, firstName: 'Alice', lastName: 'Brown', shortName: 'AB', isActivePM: false, isActiveCreative: false, costPerHour: 1000 },
  { id: 5, firstName: 'Martin', lastName: 'Král', shortName: 'MK', isActivePM: false, isActiveCreative: false, costPerHour: 1000 },
  { id: 6, firstName: 'Eva', lastName: 'Nováková', shortName: 'EN', isActivePM: true, isActiveCreative: false, costPerHour: 1000 },
  { id: 7, firstName: 'Lukáš', lastName: 'Marek', shortName: 'LM', isActivePM: false, isActiveCreative: false, costPerHour: 1000 },
]

const mockProjects: Project[] = [
  { id: 1, name: 'Website Redesign', manager: mockUsers[0] },
  { id: 2, name: 'Mobile App', manager: mockUsers[5] },
  { id: 3, name: 'CRM Integration', manager: mockUsers[4] },
]

const mockMilestones: ProjectMilestone[] = [
  // Project 1
  { id: 11, projectId: 1, name: 'Discovery', incomeAmount: 200000, donePercent: 100, startMonth: 9, startYear: 2025 },
  { id: 12, projectId: 1, name: 'Implementation', incomeAmount: 800000, donePercent: 30, startMonth: 10, startYear: 2025 },
  // Project 2
  { id: 21, projectId: 2, name: 'Prototype', incomeAmount: 150000, donePercent: 60, startMonth: 9, startYear: 2025 },
  { id: 22, projectId: 2, name: 'App Launch', incomeAmount: 450000, donePercent: 10, startMonth: 11, startYear: 2025 },
  // Project 3
  { id: 31, projectId: 3, name: 'Integration Spec', incomeAmount: 100000, donePercent: 20, startMonth: 10, startYear: 2025 },
  { id: 32, projectId: 3, name: 'Deployment', incomeAmount: 300000, donePercent: 0, startMonth: 12, startYear: 2025 },
]

const mockPlannedCapacities: PlannedCapacity[] = [
  // Project 1 - Implementation milestone (id:12)
  { userId: 1, milestoneId: 12, month: 10, year: 2025, plannedHours: 8 },
  { userId: 2, milestoneId: 12, month: 10, year: 2025, plannedHours: 40 },
  { userId: 3, milestoneId: 12, month: 10, year: 2025, plannedHours: 20 },
  { userId: 5, milestoneId: 12, month: 10, year: 2025, plannedHours: 30 },
  { userId: 2, milestoneId: 12, month: 11, year: 2025, plannedHours: 30 },
  { userId: 3, milestoneId: 12, month: 11, year: 2025, plannedHours: 60 },
  { userId: 5, milestoneId: 12, month: 11, year: 2025, plannedHours: 20 },
  { userId: 2, milestoneId: 12, month: 12, year: 2025, plannedHours: 20 },
  { userId: 3, milestoneId: 12, month: 12, year: 2025, plannedHours: 40 },
  // Project 1 - Discovery milestone (id:11)
  { userId: 2, milestoneId: 11, month: 9, year: 2025, plannedHours: 10 },
  { userId: 3, milestoneId: 11, month: 9, year: 2025, plannedHours: 5 },

  // Project 2 - Prototype (id:21)
  { userId: 4, milestoneId: 21, month: 9, year: 2025, plannedHours: 40 },
  { userId: 5, milestoneId: 21, month: 9, year: 2025, plannedHours: 30 },
  { userId: 7, milestoneId: 21, month: 9, year: 2025, plannedHours: 20 },
  // Project 2 - App Launch (id:22)
  { userId: 4, milestoneId: 22, month: 11, year: 2025, plannedHours: 80 },
  { userId: 5, milestoneId: 22, month: 11, year: 2025, plannedHours: 60 },

  // Project 3 - Integration (id:31)
  { userId: 6, milestoneId: 31, month: 10, year: 2025, plannedHours: 20 },
  { userId: 7, milestoneId: 31, month: 10, year: 2025, plannedHours: 15 },
  // Project 3 - Deployment (id:32)
  { userId: 6, milestoneId: 32, month: 12, year: 2025, plannedHours: 60 },
]

const mockLoggedCapacities: LoggedCapacity[] = [
  // Project 1 - Discovery (id:11)
  { userId: 2, milestoneId: 11, month: 9, year: 2025, loggedHours: 35 },
  { userId: 3, milestoneId: 11, month: 9, year: 2025, loggedHours: 20 },
  // Project 1 - Implementation (id:12)
  { userId: 1, milestoneId: 12, month: 10, year: 2025, loggedHours: 4 },
  { userId: 2, milestoneId: 12, month: 10, year: 2025, loggedHours: 20 },
  { userId: 3, milestoneId: 12, month: 10, year: 2025, loggedHours: 10 },
  { userId: 5, milestoneId: 12, month: 10, year: 2025, loggedHours: 25 },
  { userId: 2, milestoneId: 12, month: 11, year: 2025, loggedHours: 15 },
  { userId: 3, milestoneId: 12, month: 11, year: 2025, loggedHours: 30 },

  // Project 2 - Prototype (id:21)
  { userId: 4, milestoneId: 21, month: 9, year: 2025, loggedHours: 35 },
  { userId: 5, milestoneId: 21, month: 9, year: 2025, loggedHours: 28 },
  { userId: 7, milestoneId: 21, month: 9, year: 2025, loggedHours: 18 },

  // Project 2 - App Launch (id:22)
  { userId: 4, milestoneId: 22, month: 11, year: 2025, loggedHours: 12 },
  { userId: 5, milestoneId: 22, month: 11, year: 2025, loggedHours: 40 },

  // Project 3 - Integration (id:31)
  { userId: 6, milestoneId: 31, month: 10, year: 2025, loggedHours: 18 },
  { userId: 7, milestoneId: 31, month: 10, year: 2025, loggedHours: 12 },
]

export async function fetchUsers(): Promise<User[]> {
  await sleep()
  return [...mockUsers]
}

export async function fetchProjects(): Promise<Project[]> {
  await sleep()
  return [...mockProjects]
}

export async function fetchProject(projectId: number): Promise<Project> {
  await sleep()
  const p = mockProjects.find((x) => x.id === projectId)
  if (!p) throw new Error('Project not found')
  return p
}

export async function fetchMilestones(projectId: number): Promise<ProjectMilestone[]> {
  await sleep()
  let ms = mockMilestones.filter((m) => m.projectId === projectId)
  if (ms.length === 0) {
    // auto-create default milestone "1. milník" when none exist for project
    const nextId = Math.max(...mockMilestones.map(m => m.id), 10) + 1
    const now = new Date()
    const defaultMilestone: ProjectMilestone = {
      id: nextId,
      projectId,
      name: '1. milník',
      incomeAmount: 0,
      donePercent: 0,
      startMonth: now.getMonth() + 1,
      startYear: now.getFullYear(),
    }
    mockMilestones.push(defaultMilestone)
    ms = [defaultMilestone]
  }
  return mockMilestones.filter((m) => m.projectId === projectId)
}

export async function fetchPlannedCapacities(projectId: number): Promise<PlannedCapacity[]> {
  await sleep()
  // In a real API this would filter by project via milestone relation.
  const milestoneIds = mockMilestones.filter(m => m.projectId === projectId).map(m => m.id)
  return mockPlannedCapacities.filter(p => milestoneIds.includes(p.milestoneId))
}

export async function fetchLoggedCapacities(projectId: number): Promise<LoggedCapacity[]> {
  await sleep()
  const milestoneIds = mockMilestones.filter(m => m.projectId === projectId).map(m => m.id)
  return mockLoggedCapacities.filter(l => milestoneIds.includes(l.milestoneId))
}

export async function savePlannedCapacities(payload: PlannedCapacity[]): Promise<void> {
  await sleep(400)
  // Replace or append entries matching milestoneId + userId + month/year
  for (const entry of payload) {
    const idx = mockPlannedCapacities.findIndex(p => p.userId === entry.userId && p.milestoneId === entry.milestoneId && p.month === entry.month && p.year === entry.year)
    if (idx >= 0) {
      mockPlannedCapacities[idx] = { ...mockPlannedCapacities[idx], plannedHours: entry.plannedHours }
    } else {
      mockPlannedCapacities.push({ ...entry })
    }
  }
}

export async function updateMilestone(milestone: ProjectMilestone): Promise<void> {
  await sleep(200)
  const idx = mockMilestones.findIndex(m => m.id === milestone.id)
  if (idx >= 0) {
    mockMilestones[idx] = { ...mockMilestones[idx], ...milestone }
  } else {
    mockMilestones.push({ ...milestone })
  }
}

export async function addMilestoneMonth(milestoneId: number): Promise<void> {
  await sleep(150)
  const m = mockMilestones.find(x => x.id === milestoneId)
  if (!m) throw new Error('Milestone not found')
  // determine latest month for this milestone from existing capacities
  const months: Array<{ year: number; month: number }> = []
  mockPlannedCapacities.filter(p => p.milestoneId === milestoneId).forEach(p => months.push({ year: p.year, month: p.month }))
  mockLoggedCapacities.filter(l => l.milestoneId === milestoneId).forEach(l => months.push({ year: l.year, month: l.month }))
  months.push({ year: m.startYear, month: m.startMonth })
  const latest = months.reduce((acc, cur) => {
    if (!acc) return cur
    if (cur.year > acc.year) return cur
    if (cur.year === acc.year && cur.month > acc.month) return cur
    return acc
  }, months[0])

  const next = latest.month === 12 ? { year: latest.year + 1, month: 1 } : { year: latest.year, month: latest.month + 1 }
  // create placeholder planned entries for visible users (or first user) so the UI shows the month
  const targetUsers = mockUsers.length ? mockUsers.map(u => u.id) : [1]
  for (const userId of targetUsers) {
    const exists = mockPlannedCapacities.find(p => p.userId === userId && p.milestoneId === milestoneId && p.month === next.month && p.year === next.year)
    if (!exists) {
      mockPlannedCapacities.push({ userId, milestoneId, month: next.month, year: next.year, plannedHours: 0 })
    }
  }
}

export default {
  fetchUsers,
  fetchProjects,
  fetchProject,
  fetchMilestones,
  fetchPlannedCapacities,
  fetchLoggedCapacities,
  savePlannedCapacities,
}
