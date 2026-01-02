import { userApi } from "./api.client";
import type { AxiosResponse } from "axios";
import type {
  User,
  Project,
  Requirement,
  SubRequirement,
  WorkLog,
  ProjectWorker,
  ProjectMilestone,
  PlannedCapacity,
  LoggedCapacity,
} from "./api.gen";

function unwrap<T>(res: AxiosResponse<T> | null | undefined, ctx?: string): T {
  if (!res) throw new Error(`No response from API${ctx ? ` (${ctx})` : ""}`);
  const data = res.data;
  if (data === undefined || data === null)
    throw new Error(`API returned empty payload${ctx ? ` (${ctx})` : ""}`);
  return data as T;
}

export const Users = {
  list: async (): Promise<User[]> =>
    unwrap(await userApi.api.usersList(), "Users list"),
  get: async (id: number): Promise<User> =>
    unwrap(await userApi.api.usersDetail(id), `User ${id}`),
  create: async (payload: User): Promise<User> =>
    unwrap(await userApi.api.usersCreate(payload), "Create user"),
  update: async (id: number, payload: User): Promise<void> => {
    await userApi.api.usersUpdate(id, payload);
  },
  delete: async (id: number): Promise<void> => {
    await userApi.api.usersDelete(id);
  },
};

export const Projects = {
  list: async (): Promise<Project[]> =>
    unwrap(await userApi.api.projectsList(), "Projects list"),
  get: async (id: number): Promise<Project> =>
    unwrap(await userApi.api.projectsDetail(id), `Project ${id}`),
  create: async (payload: Project): Promise<Project> =>
    unwrap(await userApi.api.projectsCreate(payload), "Create project"),
  update: async (id: number, payload: Project): Promise<void> => {
    await userApi.api.projectsUpdate(id, payload);
  },
  delete: async (id: number): Promise<void> => {
    await userApi.api.projectsDelete(id);
  },
};

export const Requirements = {
  list: async (): Promise<Requirement[]> =>
    unwrap(await userApi.api.requirementsList(), "Requirements list"),
  get: async (id: number): Promise<Requirement> =>
    unwrap(await userApi.api.requirementsDetail(id), `Requirement ${id}`),
  create: async (payload: Requirement): Promise<Requirement> =>
    unwrap(await userApi.api.requirementsCreate(payload), "Create requirement"),
  update: async (id: number, payload: Requirement): Promise<void> => {
    await userApi.api.requirementsUpdate(id, payload);
  },
  delete: async (id: number): Promise<void> => {
    await userApi.api.requirementsDelete(id);
  },
};

export const SubRequirements = {
  list: async (): Promise<SubRequirement[]> =>
    unwrap(await userApi.api.subRequirementsList(), "SubRequirements list"),
  get: async (id: number): Promise<SubRequirement> =>
    unwrap(await userApi.api.subRequirementsDetail(id), `SubRequirement ${id}`),
  create: async (payload: SubRequirement): Promise<SubRequirement> =>
    unwrap(
      await userApi.api.subRequirementsCreate(payload),
      "Create subrequirement"
    ),
  update: async (id: number, payload: SubRequirement): Promise<void> => {
    await userApi.api.subRequirementsUpdate(id, payload);
  },
  delete: async (id: number): Promise<void> => {
    await userApi.api.subRequirementsDelete(id);
  },
};

export const WorkLogs = {
  list: async (): Promise<WorkLog[]> =>
    unwrap(await userApi.api.workLogsList(), "WorkLogs list"),
  get: async (id: number): Promise<WorkLog> =>
    unwrap(await userApi.api.workLogsDetail(id), `WorkLog ${id}`),
  create: async (payload: WorkLog): Promise<WorkLog> =>
    unwrap(await userApi.api.workLogsCreate(payload), "Create worklog"),
  update: async (id: number, payload: WorkLog): Promise<void> => {
    await userApi.api.workLogsUpdate(id, payload);
  },
  delete: async (id: number): Promise<void> => {
    await userApi.api.workLogsDelete(id);
  },
};

export const ProjectWorkers = {
  list: async (): Promise<ProjectWorker[]> =>
    unwrap(await userApi.api.projectWorkersList(), "ProjectWorkers list"),
  get: async (projectId: number, userId: number): Promise<ProjectWorker> =>
    unwrap(
      await userApi.api.projectWorkersDetail(projectId, userId),
      `ProjectWorker ${projectId}/${userId}`
    ),
  create: async (payload: ProjectWorker): Promise<ProjectWorker> =>
    unwrap(
      await userApi.api.projectWorkersCreate(payload),
      "Create projectWorker"
    ),
  update: async (
    projectId: number,
    userId: number,
    payload: ProjectWorker
  ): Promise<void> => {
    await userApi.api.projectWorkersUpdate(projectId, userId, payload);
  },
  delete: async (projectId: number, userId: number): Promise<void> => {
    await userApi.api.projectWorkersDelete(projectId, userId);
  },
};

export const ProjectMilestones = {
  list: async (): Promise<ProjectMilestone[]> =>
    unwrap(await userApi.api.projectMilestonesList(), "ProjectMilestones list"),
  get: async (id: number): Promise<ProjectMilestone> =>
    unwrap(
      await userApi.api.projectMilestonesDetail(id),
      `ProjectMilestone ${id}`
    ),
  create: async (payload: ProjectMilestone): Promise<ProjectMilestone> =>
    unwrap(
      await userApi.api.projectMilestonesCreate(payload),
      "Create projectMilestone"
    ),
  update: async (id: number, payload: ProjectMilestone): Promise<void> => {
    await userApi.api.projectMilestonesUpdate(id, payload);
  },
  delete: async (id: number): Promise<void> => {
    await userApi.api.projectMilestonesDelete(id);
  },
};

export const PlannedCapacities = {
  list: async (): Promise<PlannedCapacity[]> =>
    unwrap(await userApi.api.plannedCapacitiesList(), "PlannedCapacities list"),
  get: async (
    userId: number,
    milestoneId: number,
    month: number,
    year: number
  ): Promise<PlannedCapacity> =>
    unwrap(
      await userApi.api.plannedCapacitiesDetail(
        userId,
        milestoneId,
        month,
        year
      ),
      `PlannedCapacity ${userId}/${milestoneId}/${month}/${year}`
    ),
  create: async (payload: PlannedCapacity): Promise<PlannedCapacity> =>
    unwrap(
      await userApi.api.plannedCapacitiesCreate(payload),
      "Create plannedCapacity"
    ),
  update: async (
    userId: number,
    milestoneId: number,
    month: number,
    year: number,
    payload: PlannedCapacity
  ): Promise<void> => {
    await userApi.api.plannedCapacitiesUpdate(
      userId,
      milestoneId,
      month,
      year,
      payload
    );
  },
  delete: async (
    userId: number,
    milestoneId: number,
    month: number,
    year: number
  ): Promise<void> => {
    await userApi.api.plannedCapacitiesDelete(userId, milestoneId, month, year);
  },
};

export const LoggedCapacities = {
  list: async (): Promise<LoggedCapacity[]> =>
    unwrap(await userApi.api.loggedCapacitiesList(), "LoggedCapacities list"),
  get: async (
    userId: number,
    milestoneId: number,
    month: number,
    year: number
  ): Promise<LoggedCapacity> =>
    unwrap(
      await userApi.api.loggedCapacitiesDetail(
        userId,
        milestoneId,
        month,
        year
      ),
      `LoggedCapacity ${userId}/${milestoneId}/${month}/${year}`
    ),
  create: async (payload: LoggedCapacity): Promise<LoggedCapacity> =>
    unwrap(
      await userApi.api.loggedCapacitiesCreate(payload),
      "Create loggedCapacity"
    ),
  update: async (
    userId: number,
    milestoneId: number,
    month: number,
    year: number,
    payload: LoggedCapacity
  ): Promise<void> => {
    await userApi.api.loggedCapacitiesUpdate(
      userId,
      milestoneId,
      month,
      year,
      payload
    );
  },
  delete: async (
    userId: number,
    milestoneId: number,
    month: number,
    year: number
  ): Promise<void> => {
    await userApi.api.loggedCapacitiesDelete(userId, milestoneId, month, year);
  },
};

const ApiService = {
  Users,
  Projects,
  Requirements,
  SubRequirements,
  WorkLogs,
  ProjectWorkers,
  ProjectMilestones,
  PlannedCapacities,
  LoggedCapacities,
};

export default ApiService;
