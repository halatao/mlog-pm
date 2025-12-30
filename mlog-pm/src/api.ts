import type {
  Project,
  ProjectMilestone,
  PlannedCapacity,
  LoggedCapacity,
  User,
} from "./types";

const sleep = (ms = 250) => new Promise((res) => setTimeout(res, ms));

const mockUsers: User[] = [
  {
    id: 1,
    firstName: "Olga",
    lastName: "Havlíčková",
    shortName: "OH",
    isActivePM: true,
    isActiveCreative: false,
    costPerHour: 1200,
  },
  {
    id: 2,
    firstName: "Eva",
    lastName: "Nováková",
    shortName: "EN",
    isActivePM: true,
    isActiveCreative: false,
    costPerHour: 1200,
  },

  {
    id: 3,
    firstName: "Jan",
    lastName: "Novák",
    shortName: "JN",
    isActivePM: false,
    isActiveCreative: true,
    costPerHour: 900,
  },
  {
    id: 4,
    firstName: "Petr",
    lastName: "Svoboda",
    shortName: "PS",
    isActivePM: false,
    isActiveCreative: true,
    costPerHour: 900,
  },
  {
    id: 5,
    firstName: "Martin",
    lastName: "Král",
    shortName: "MK",
    isActivePM: false,
    isActiveCreative: true,
    costPerHour: 950,
  },
  {
    id: 6,
    firstName: "Alice",
    lastName: "Brown",
    shortName: "AB",
    isActivePM: false,
    isActiveCreative: true,
    costPerHour: 850,
  },
];

const mockProjects: Project[] = [
  { id: 1, name: "Redesign firemního webu", manager: mockUsers[0] },
  { id: 2, name: "Mobilní aplikace pro klienty", manager: mockUsers[1] },
  { id: 3, name: "Integrace CRM systému", manager: mockUsers[0] },
  { id: 4, name: "Interní dashboard managementu", manager: mockUsers[1] },
];

const mockProjectUsers: Record<number, number[]> = {
  1: [1, 3, 4, 5],
  2: [2, 3, 6],
  3: [1, 4],
  4: [2, 5],
};

const mockMilestones: ProjectMilestone[] = [
  {
    id: 101,
    projectId: 1,
    name: "Analýza a návrh řešení",
    incomeAmount: 200_000,
    donePercent: 100,
    startMonth: 10,
    startYear: 2025,
    endMonth: 11,
    endYear: 2025,
  },
  {
    id: 102,
    projectId: 1,
    name: "Implementace a testování",
    incomeAmount: 600_000,
    donePercent: 45,
    startMonth: 11,
    startYear: 2025,
    endMonth: 12,
    endYear: 2025,
  },

  {
    id: 201,
    projectId: 2,
    name: "Prototyp a UX návrh",
    incomeAmount: 150_000,
    donePercent: 100,
    startMonth: 10,
    startYear: 2025,
    endMonth: 11,
    endYear: 2025,
  },
  {
    id: 202,
    projectId: 2,
    name: "Vývoj aplikace",
    incomeAmount: 500_000,
    donePercent: 25,
    startMonth: 11,
    startYear: 2025,
    endMonth: 12,
    endYear: 2025,
  },

  {
    id: 301,
    projectId: 3,
    name: "Analýza integrace",
    incomeAmount: 100_000,
    donePercent: 80,
    startMonth: 10,
    startYear: 2025,
    endMonth: 11,
    endYear: 2025,
  },
  {
    id: 302,
    projectId: 3,
    name: "Implementace integrace",
    incomeAmount: 300_000,
    donePercent: 10,
    startMonth: 11,
    startYear: 2025,
    endMonth: 12,
    endYear: 2025,
  },

  {
    id: 401,
    projectId: 4,
    name: "UX / UI návrh",
    incomeAmount: 80_000,
    donePercent: 100,
    startMonth: 10,
    startYear: 2025,
    endMonth: 11,
    endYear: 2025,
  },
  {
    id: 402,
    projectId: 4,
    name: "Vývoj dashboardu",
    incomeAmount: 220_000,
    donePercent: 30,
    startMonth: 11,
    startYear: 2025,
    endMonth: 12,
    endYear: 2025,
  },
];

const mockPlannedCapacities: PlannedCapacity[] = [
  { userId: 1, milestoneId: 101, month: 10, year: 2025, plannedHours: 15 },
  { userId: 3, milestoneId: 101, month: 10, year: 2025, plannedHours: 20 },
  { userId: 4, milestoneId: 101, month: 10, year: 2025, plannedHours: 25 },
  { userId: 5, milestoneId: 101, month: 10, year: 2025, plannedHours: 10 },
  { userId: 1, milestoneId: 102, month: 11, year: 2025, plannedHours: 12 },
  { userId: 3, milestoneId: 102, month: 11, year: 2025, plannedHours: 40 },
  { userId: 4, milestoneId: 102, month: 11, year: 2025, plannedHours: 30 },
  { userId: 5, milestoneId: 102, month: 11, year: 2025, plannedHours: 20 },

  { userId: 2, milestoneId: 202, month: 11, year: 2025, plannedHours: 10 },
  { userId: 3, milestoneId: 202, month: 11, year: 2025, plannedHours: 35 },
  { userId: 6, milestoneId: 202, month: 11, year: 2025, plannedHours: 25 },

  { userId: 1, milestoneId: 302, month: 11, year: 2025, plannedHours: 8 },
  { userId: 4, milestoneId: 302, month: 11, year: 2025, plannedHours: 30 },

  { userId: 1, milestoneId: 102, month: 12, year: 2025, plannedHours: 10 },
  { userId: 3, milestoneId: 102, month: 12, year: 2025, plannedHours: 50 },
  { userId: 4, milestoneId: 102, month: 12, year: 2025, plannedHours: 40 },
];

/* ============================================================
   ZALOGOVANÉ KAPACITY
============================================================ */

const mockLoggedCapacities: LoggedCapacity[] = [
  { userId: 3, milestoneId: 102, month: 11, year: 2025, loggedHours: 32 },
  { userId: 4, milestoneId: 102, month: 11, year: 2025, loggedHours: 26 },
  { userId: 5, milestoneId: 102, month: 11, year: 2025, loggedHours: 18 },

  { userId: 3, milestoneId: 102, month: 12, year: 2025, loggedHours: 18 },
  { userId: 4, milestoneId: 102, month: 12, year: 2025, loggedHours: 12 },
];

/* ============================================================
   API FUNKCE
============================================================ */

export async function fetchUsers(projectId?: number): Promise<User[]> {
  await sleep();
  if (typeof projectId === 'number') {
    const ids = mockProjectUsers[projectId] || []
    return mockUsers.filter(u => ids.includes(u.id))
  }
  return [...mockUsers];
}

export async function fetchProjects(): Promise<Project[]> {
  await sleep();
  return [...mockProjects];
}

export async function fetchProject(projectId: number): Promise<Project> {
  await sleep();
  const p = mockProjects.find((x) => x.id === projectId);
  if (!p) throw new Error("Projekt nenalezen");
  return p;
}

export async function fetchMilestones(
  projectId: number
): Promise<ProjectMilestone[]> {
  await sleep();
  return mockMilestones.filter((m) => m.projectId === projectId);
}

export async function fetchPlannedCapacities(
  projectId: number
): Promise<PlannedCapacity[]> {
  await sleep();
  const milestoneIds = mockMilestones
    .filter((m) => m.projectId === projectId)
    .map((m) => m.id);
  return mockPlannedCapacities.filter((p) =>
    milestoneIds.includes(p.milestoneId)
  );
}

export async function updateProjectUsers(projectId: number, userIds: number[]): Promise<void> {
  await sleep(200);
  mockProjectUsers[projectId] = [...userIds];
}

export async function fetchLoggedCapacities(
  projectId: number
): Promise<LoggedCapacity[]> {
  await sleep();
  const milestoneIds = mockMilestones
    .filter((m) => m.projectId === projectId)
    .map((m) => m.id);
  return mockLoggedCapacities.filter((l) =>
    milestoneIds.includes(l.milestoneId)
  );
}

export async function savePlannedCapacities(
  payload: PlannedCapacity[]
): Promise<void> {
  await sleep(400);
  payload.forEach((entry) => {
    const idx = mockPlannedCapacities.findIndex(
      (p) =>
        p.userId === entry.userId &&
        p.milestoneId === entry.milestoneId &&
        p.month === entry.month &&
        p.year === entry.year
    );
    if (idx >= 0) mockPlannedCapacities[idx] = entry;
    else mockPlannedCapacities.push(entry);
  });
}

/* ============================================================
   EDITACE MILNÍKU (E)
============================================================ */

export async function updateMilestone(
  milestone: ProjectMilestone
): Promise<void> {
  await sleep(200);
  const idx = mockMilestones.findIndex((m) => m.id === milestone.id);
  if (idx >= 0) {
    mockMilestones[idx] = { ...mockMilestones[idx], ...milestone };
  }
}

/* ============================================================
   PŘIDÁNÍ DALŠÍHO MĚSÍCE (+M)
============================================================ */

export async function addMilestoneMonth(milestoneId: number): Promise<void> {
  await sleep(150);

  const milestone = mockMilestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new Error("Milník nenalezen");

  const months: Array<{ year: number; month: number }> = [];

  mockPlannedCapacities
    .filter((p) => p.milestoneId === milestoneId)
    .forEach((p) => months.push({ year: p.year, month: p.month }));

  months.push({ year: milestone.startYear, month: milestone.startMonth });

  const latest = months.reduce((a, b) =>
    b.year > a.year || (b.year === a.year && b.month > a.month) ? b : a
  );

  const next =
    latest.month === 12
      ? { year: latest.year + 1, month: 1 }
      : { year: latest.year, month: latest.month + 1 };

  mockUsers.forEach((u) => {
    mockPlannedCapacities.push({
      userId: u.id,
      milestoneId,
      year: next.year,
      month: next.month,
      plannedHours: 0,
    });
  });
}

/* ============================================================
   ODSTRANĚNÍ MĚSÍCE MILNÍKU
============================================================ */
export async function removeMilestoneMonth(milestoneId: number, month: number, year: number): Promise<void> {
  await sleep(150);
  // remove planned capacities for that milestone/month/year
  for (let i = mockPlannedCapacities.length - 1; i >= 0; i--) {
    const p = mockPlannedCapacities[i]
    if (p.milestoneId === milestoneId && p.month === month && p.year === year) {
      mockPlannedCapacities.splice(i, 1)
    }
  }
  // remove logged capacities for that milestone/month/year
  for (let i = mockLoggedCapacities.length - 1; i >= 0; i--) {
    const l = mockLoggedCapacities[i]
    if (l.milestoneId === milestoneId && l.month === month && l.year === year) {
      mockLoggedCapacities.splice(i, 1)
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
  updateMilestone,
  addMilestoneMonth,
  removeMilestoneMonth,
  updateProjectUsers,
};
