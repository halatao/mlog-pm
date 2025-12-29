// Frontend types / interfaces as specified in the technical zadání

export interface User {
  id: number
  firstName: string
  lastName: string
  shortName: string
  isActivePM: boolean
  isActiveCreative: boolean
  costPerHour: number
}

export interface Project {
  id: number
  name: string
  manager: User
}

export interface ProjectMilestone {
  id: number
  projectId: number
  name: string
  incomeAmount: number
  donePercent: number
  startMonth: number
  startYear: number
}

export interface PlannedCapacity {
  userId: number
  milestoneId: number
  month: number
  year: number
  plannedHours: number
}

export interface LoggedCapacity {
  userId: number
  milestoneId: number
  month: number
  year: number
  loggedHours: number
}

export interface MilestoneMonthRow {
  milestone: ProjectMilestone
  month: number
  year: number

  plannedByUser: Record<number, number>
  loggedByUser: Record<number, number>

  plannedCost: number
  loggedCost: number
  predictedCost: number
  predictedProfit: number
}
