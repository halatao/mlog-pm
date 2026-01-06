// Frontend types / interfaces as specified in the technical zadání

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  shortName: string;
  isActivePM: boolean;
  isActiveCreative: boolean;
  costPerHour: number;
}

export interface Project {
  id: number;
  name: string;
  manager: User;
  isInternal?: boolean;
}

export interface ProjectMilestone {
  id: number;
  projectId: number;
  name: string;
  incomeAmount: number;
  donePercent: number;
  startMonth: number;
  startYear: number;
  endMonth?: number;
  endYear?: number;
}

export interface PlannedCapacity {
  userId: number;
  milestoneId: number;
  month: number;
  year: number;
  plannedHours: number;
}

export interface LoggedCapacity {
  userId: number;
  milestoneId: number;
  month: number;
  year: number;
  loggedHours: number;
}

export interface MilestoneMonthRow {
  milestone: ProjectMilestone;
  month: number;
  year: number;

  plannedByUser: Record<number, number>;
  loggedByUser: Record<number, number>;

  plannedCost: number;
  loggedCost: number;
  predictedCost: number;
  predictedProfit: number;
}

export interface Requirement {
  id: number;
  projectId: number;
  name: string;
  priority?: string;
  description?: string;
  category?: string;
  activity?: string;
}

export interface SubRequirement {
  id: number;
  requirementId: number;
  milestoneId: number;
  name: string;
  estimateHours?: number;
  assignedToId?: number;
}

export interface WorkLog {
  id: number;
  subRequirementId: number;
  userId: number;
  seconds: number;
  date: string;
  description?: string;
}

export interface DailyPlanItem {
  id: number
  date: string // YYYY-MM-DD
  userId: number
  subRequirementId: number
  checkedAt?: string // ISO timestamp when PM marked it
  loggedSeconds?: number
}

export interface ChangeHistoryEntry {
  userName: string;
  date: string; // formatted date/time
  from: number;
  to: number;
  note?: string;
}
