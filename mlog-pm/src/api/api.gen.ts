/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Address {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  addressCategoryID?: number | null;
  name?: string | null;
  streetAndNumber?: string | null;
  postNumber?: string | null;
  city?: string | null;
  addressCategory?: Codebook;
}

export interface BusinessFeature {
  /** @format int32 */
  id?: number;
  name?: string | null;
  /** @format int32 */
  projectID?: number | null;
  /** @format int32 */
  createdByID?: number;
  /** @format date-time */
  createdAt?: string;
  /** @format date */
  customerTerm?: string | null;
  /** @format double */
  turnover?: number;
  /** @format int64 */
  businessCaseNumber?: number | null;
  /** @format double */
  budgetHours?: number;
  businessFeatureBusinessFeatureChildren?:
    | BusinessFeatureBusinessFeature[]
    | null;
  businessFeatureBusinessFeatureParents?:
    | BusinessFeatureBusinessFeature[]
    | null;
  businessFeatureRequirements?: BusinessFeatureRequirement[] | null;
  createdBy?: User;
  project?: Project;
}

export interface BusinessFeatureBusinessFeature {
  /** @format int32 */
  parentID?: number;
  /** @format int32 */
  childID?: number;
  /** @format int32 */
  count?: number;
  /** @format int32 */
  order?: number | null;
  /** @format int32 */
  offset?: number;
  child?: BusinessFeature;
  parent?: BusinessFeature;
}

export interface BusinessFeatureRequirement {
  /** @format int32 */
  businessFeatureID?: number;
  /** @format int32 */
  requirementID?: number;
  /** @format int32 */
  requirementOrder?: number;
  businessFeature?: BusinessFeature;
  requirement?: Requirement;
}

export interface Category {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  categoryTypeID?: number;
  name?: string | null;
  /** @format int32 */
  ord?: number;
  color?: string | null;
  categoryType?: CategoryType;
  customerPriorities?: CustomerPriority[] | null;
  supplementCategories?: SupplementCategory[] | null;
  requirements?: Requirement[] | null;
}

export interface CategoryType {
  /** @format int32 */
  id?: number;
  name?: string | null;
  /** @format int32 */
  ord?: number;
  /** @format int32 */
  defaultCategoryID?: number | null;
  isRequired?: boolean;
  isForRequirement?: boolean;
  categories?: Category[] | null;
  supplementTypes?: SupplementType[] | null;
}

export interface ClientInstance {
  /** @format int32 */
  id?: number;
  systemIdentifier?: string | null;
  titleString?: string | null;
  canSetImportance?: boolean;
  instanceUrl?: string | null;
  /** @format int32 */
  version?: number | null;
  paidDeploy?: boolean;
  forbiddenRestore?: boolean;
  note?: string | null;
  active?: boolean;
  clientUsers?: ClientUser[] | null;
  deploys?: Deploy[] | null;
  projects?: Project[] | null;
  customers?: Customer[] | null;
  deploymentScripts?: DeploymentScript[] | null;
}

export interface ClientUser {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  clientInstanceID?: number;
  /** @format int32 */
  m2GUserID?: number;
  m2GName?: string | null;
  osobaJmeno?: string | null;
  osobaTelefon?: string | null;
  organizace?: string | null;
  clientInstance?: ClientInstance;
}

export interface Codebook {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  codebookCategoryID?: number;
  /** @format int32 */
  ord?: number;
  key?: string | null;
  value?: string | null;
  addresses?: Address[] | null;
  codebookCategory?: CodebookCategory;
  customerAssociationMembers?: Customer[] | null;
  customerCustomerCategories?: Customer[] | null;
  customerInsurances?: Customer[] | null;
  customerReservationSystems?: Customer[] | null;
  invoiceItems?: InvoiceItem[] | null;
  people?: Person[] | null;
  projects?: Project[] | null;
}

export interface CodebookCategory {
  /** @format int32 */
  id?: number;
  name?: string | null;
  valueType?: string | null;
  beforeDelete?: string | null;
  codebooks?: Codebook[] | null;
}

export interface Customer {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  customerCategoryID?: number | null;
  /** @format int32 */
  associationMemberID?: number | null;
  /** @format int32 */
  insuranceID?: number | null;
  /** @format int32 */
  reservationSystemID?: number | null;
  /** @format int32 */
  reservationSystemPrice?: number | null;
  name?: string | null;
  description?: string | null;
  field?: string | null;
  ic?: string | null;
  dic?: string | null;
  email?: string | null;
  phone?: string | null;
  fax?: string | null;
  web?: string | null;
  /** @format date-time */
  founded?: string | null;
  /** @format date-time */
  catalogReadyDate?: string | null;
  note?: string | null;
  /** @format int32 */
  m2gID?: number | null;
  associationMember?: Codebook;
  customerCategory?: Codebook;
  insurance?: Codebook;
  people?: Person[] | null;
  projects?: Project[] | null;
  reservationSystem?: Codebook;
  clientInstances?: ClientInstance[] | null;
  releaseNotes?: ReleaseNote[] | null;
}

export interface CustomerPriority {
  /** @format int32 */
  id?: number;
  name?: string | null;
  /** @format int32 */
  categoryID?: number | null;
  category?: Category;
  projectCustomerPriorities?: ProjectCustomerPriority[] | null;
}

export interface Deploy {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  creatorUserID?: number;
  /** @format date-time */
  createDate?: string;
  /** @format int32 */
  clientInstanceID?: number;
  deployVersion?: string | null;
  deployRevision?: string | null;
  /** @format date-time */
  deployDate?: string;
  restore?: boolean;
  lastVersion?: string | null;
  afterVersion?: string | null;
  /** @format date-time */
  completionDate?: string | null;
  inProgress?: boolean;
  note?: string | null;
  done?: boolean;
  email?: string | null;
  emailSubject?: string | null;
  emailBody?: string | null;
  /** @format int32 */
  subRequirementID?: number | null;
  isInvoiced?: boolean;
  /** @format date-time */
  startDate?: string | null;
  thisVersion?: boolean;
  /** @format int32 */
  fromSubRequirementID?: number | null;
  /** @format int32 */
  deployerID?: number | null;
  isCustomRevision?: boolean | null;
  customRevision?: string | null;
  emailBefore?: string | null;
  emailBeforeSubject?: string | null;
  emailBeforeBody?: string | null;
  /** @format int32 */
  deployTimeEmail?: number | null;
  clientInstance?: ClientInstance;
  creatorUser?: User;
  deployer?: User;
  fromSubRequirement?: SubRequirement;
  subRequirement?: SubRequirement;
}

export interface DeploymentScript {
  /** @format int32 */
  id?: number;
  /** @format date-time */
  creationDateTime?: string;
  name?: string | null;
  /** @format int32 */
  userID?: number;
  executeOn?: string | null;
  executeWhen?: string | null;
  scriptText?: string | null;
  isExecutedRepeatedly?: boolean;
  isDeleted?: boolean;
  isRequiredForDevs?: boolean;
  isForRestore?: boolean;
  user?: User;
  clientInstances?: ClientInstance[] | null;
}

export interface DiscrepancyReport {
  /** @format int32 */
  id?: number;
  /** @format byte */
  version?: string | null;
  /** @format date-time */
  createdAt?: string;
  description?: string | null;
  /** @format int32 */
  createdByUserID?: number;
  createdByUser?: User;
  discrepancyReportItems?: DiscrepancyReportItem[] | null;
  discrepancyReportVersions?: DiscrepancyReportVersion[] | null;
}

export interface DiscrepancyReportItem {
  /** @format int32 */
  id?: number;
  /** @format byte */
  version?: string | null;
  /** @format int32 */
  discrepancyReportID?: number;
  /** @format int32 */
  requirementID?: number | null;
  /** @format int32 */
  subRequirementID?: number | null;
  /** @format int32 */
  userID?: number | null;
  /** @format int32 */
  discrepancyReportItemTypeID?: number;
  /** @format double */
  clientCost?: number | null;
  /** @format double */
  cost?: number | null;
  description?: string | null;
  /** @format date-time */
  createdAt?: string;
  discrepancyReport?: DiscrepancyReport;
  discrepancyReportItemType?: DiscrepancyReportItemType;
  requirement?: Requirement;
  subRequirement?: SubRequirement;
  user?: User;
}

export interface DiscrepancyReportItemType {
  /** @format int32 */
  id?: number;
  name?: string | null;
  /** @format int32 */
  ord?: number;
  identifier?: string | null;
  discrepancyReportItems?: DiscrepancyReportItem[] | null;
}

export interface DiscrepancyReportVersion {
  /** @format int32 */
  id?: number;
  version?: string | null;
  /** @format int32 */
  discrepancyReportID?: number;
  discrepancyReport?: DiscrepancyReport;
}

export interface Expense {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  projectID?: number;
  description?: string | null;
  /** @format date-time */
  createdDate?: string;
  /** @format int32 */
  amount?: number;
  expenseOrIncome?: boolean;
  project?: Project;
}

export interface FileDatum {
  /** @format int32 */
  fileID?: number;
  /** @format byte */
  data?: string | null;
  file?: FileObject;
}

export interface FileObject {
  /** @format int32 */
  id?: number;
  fileName?: string | null;
  fileDatum?: FileDatum;
  supplementFiles?: SupplementFile[] | null;
}

export interface HelpdeskRequestPath {
  /** @format int32 */
  id?: number;
  requestPath?: string | null;
  description?: string | null;
  requirementHelpdeskData?: RequirementHelpdeskDatum[] | null;
}

export interface Invoice {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  projectID?: number;
  /** @format int32 */
  createdByUserID?: number;
  number?: string | null;
  description?: string | null;
  /** @format int32 */
  isPaidOnTimeProbability?: number | null;
  /** @format date-time */
  expectedPayDate?: string | null;
  /** @format date-time */
  paidDate?: string | null;
  /** @format date-time */
  taxDate?: string | null;
  /** @format date-time */
  probableTaxDate?: string | null;
  /** @format date-time */
  createdDate?: string | null;
  /** @format date-time */
  published?: string | null;
  reversed?: boolean | null;
  createdByUser?: User;
  invoiceItems?: InvoiceItem[] | null;
  project?: Project;
}

export interface InvoiceItem {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  invoiceID?: number;
  /** @format int32 */
  invoiceTypeID?: number;
  /** @format int32 */
  userID?: number;
  description?: string | null;
  /** @format double */
  amount?: number | null;
  /** @format double */
  amountVAT?: number | null;
  /** @format double */
  paid?: number | null;
  invoice?: Invoice;
  invoiceType?: Codebook;
  user?: User;
}

export interface Log {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  createdByUserID?: number;
  /** @format int32 */
  projectID?: number;
  /** @format date-time */
  createdDate?: string;
  description?: string | null;
  createdByUser?: User;
  project?: Project;
}

export interface LoggedCapacity {
  /** @format int32 */
  userID?: number;
  /** @format int32 */
  milestoneID?: number;
  /** @format int32 */
  month?: number;
  /** @format int32 */
  year?: number;
  /** @format double */
  loggedHours?: number;
  milestone?: ProjectMilestone;
  user?: User;
}

export interface MailQueue {
  /** @format int32 */
  id?: number;
  fromAddress?: string | null;
  subject?: string | null;
  body?: string | null;
  /** @format int32 */
  subRequirementID?: number | null;
  /** @format int32 */
  requirementID?: number | null;
  /** @format date-time */
  dateTimeSent?: string | null;
  /** @format date-time */
  dateTimeCreate?: string;
  fromAddressDisplayName?: string | null;
  /** @format int32 */
  mailQueueStateID?: number;
  hasAttachment?: boolean | null;
  mailQueueAddressTos?: MailQueueAddressTo[] | null;
  mailQueueAttachments?: MailQueueAttachment[] | null;
  mailQueueState?: MailQueueState;
}

export interface MailQueueAddressTo {
  /** @format int32 */
  id?: number;
  address?: string | null;
  displayName?: string | null;
  /** @format int32 */
  mailQueueID?: number;
  mailQueue?: MailQueue;
}

export interface MailQueueAttachment {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  serverFileID?: number;
  /** @format int32 */
  mailQueueID?: number;
  mailQueue?: MailQueue;
  serverFile?: ServerFile;
}

export interface MailQueueState {
  /** @format int32 */
  id?: number;
  name?: string | null;
  mailQueues?: MailQueue[] | null;
}

export interface Person {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  customerID?: number;
  /** @format int32 */
  positionID?: number | null;
  firstName?: string | null;
  lastName?: string | null;
  titlesBefore?: string | null;
  titlesAfter?: string | null;
  email?: string | null;
  description?: string | null;
  mobile?: string | null;
  phone?: string | null;
  skype?: string | null;
  web?: string | null;
  streetAndNumber?: string | null;
  postNumber?: string | null;
  city?: string | null;
  customer?: Customer;
  position?: Codebook;
}

export interface PlannedCapacity {
  /** @format int32 */
  userID?: number;
  /** @format int32 */
  milestoneID?: number;
  /** @format int32 */
  month?: number;
  /** @format int32 */
  year?: number;
  /** @format double */
  plannedHours?: number;
  milestone?: ProjectMilestone;
  user?: User;
}

export interface PredefinedFilter {
  /** @format int32 */
  id?: number;
  name?: string | null;
  /** @format int32 */
  userID?: number | null;
  /** @format int32 */
  ord?: number;
  filterDefinition?: string | null;
  user?: User;
}

export interface Project {
  /** @format int32 */
  id?: number;
  name?: string | null;
  priority?: string | null;
  /** @format int32 */
  deploymentRequirementID?: number | null;
  /** @format int32 */
  managerUserID?: number | null;
  /** @format int32 */
  customerID?: number | null;
  /** @format int32 */
  projectTypeCodebookID?: number | null;
  isHelpdesk?: boolean;
  /** @format int32 */
  prepaidHours?: number;
  instanceUrl?: string | null;
  /** @format double */
  worklogCoefficient?: number;
  /** @format int32 */
  clientInstanceID?: number | null;
  emails?: string | null;
  emailsForDeploy?: string | null;
  /** @format double */
  budgetHours?: number;
  /** @format double */
  budgetAmount?: number;
  /** @format double */
  budgetAmountAdditionalWork?: number;
  /** @format double */
  budgetAmountMagicware?: number;
  isInternal?: boolean;
  isActive?: boolean;
  goal?: string | null;
  isNinja?: boolean;
  showHelpdeskFirstReactionColumn?: boolean;
  showHelpdeskSolvingTimeColumn?: boolean;
  showHelpdeskWaitingTimeForClientTillLastChangeByHd?: boolean;
  /** @format int32 */
  workingHourFromMinutes?: number | null;
  /** @format int32 */
  workingHourToMinutes?: number | null;
  emailsForCriticalRequirements?: string | null;
  notePublic?: string | null;
  noteInternal?: string | null;
  isShowNoteEnabled?: boolean;
  emailsForRequirements?: string | null;
  businessFeatures?: BusinessFeature[] | null;
  clientInstance?: ClientInstance;
  customer?: Customer;
  expenses?: Expense[] | null;
  invoices?: Invoice[] | null;
  logs?: Log[] | null;
  managerUser?: User;
  projectAccessKeys?: ProjectAccessKey[] | null;
  projectBudgets?: ProjectBudget[] | null;
  projectCheckList?: ProjectCheckList;
  projectCustomerPriorities?: ProjectCustomerPriority[] | null;
  projectMilestones?: ProjectMilestone[] | null;
  projectTypeCodebook?: Codebook;
  requirements?: Requirement[] | null;
}

export interface ProjectAccessKey {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  projectID?: number;
  accessKey?: string | null;
  project?: Project;
}

export interface ProjectBudget {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  projectID?: number;
  /** @format date-time */
  dateFrom?: string;
  /** @format date-time */
  dateTo?: string;
  /** @format double */
  amount?: number;
  /** @format double */
  amountAdditionalWork?: number;
  /** @format double */
  amountMagicware?: number;
  project?: Project;
}

export interface ProjectCheckList {
  /** @format int32 */
  id?: number;
  checkList?: string | null;
  idNavigation?: Project;
}

export interface ProjectCustomerPriority {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  projectID?: number;
  /** @format int32 */
  customerPriorityID?: number;
  /** @format int32 */
  reactionTime?: number;
  /** @format int32 */
  solutionTime?: number;
  customerPriority?: CustomerPriority;
  project?: Project;
  requirements?: Requirement[] | null;
}

export interface ProjectMilestone {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  projectID?: number;
  name?: string | null;
  /** @format double */
  incomeAmount?: number;
  /** @format double */
  donePercent?: number;
  /** @format int32 */
  startMonth?: number;
  /** @format int32 */
  startYear?: number;
  /** @format int32 */
  endMonth?: number | null;
  /** @format int32 */
  endYear?: number | null;
  loggedCapacities?: LoggedCapacity[] | null;
  plannedCapacities?: PlannedCapacity[] | null;
  project?: Project;
}

export interface ProjectWorker {
  /** @format int32 */
  projectID?: number;
  /** @format int32 */
  userID?: number;
  project?: Project;
  user?: User;
}

export interface RelationType {
  /** @format int32 */
  id?: number;
  name?: string | null;
  identifier?: string | null;
  requirementRelationships?: RequirementRelationship[] | null;
}

export interface ReleaseNote {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  requirementID?: number;
  subject?: string | null;
  descriptionXaml?: string | null;
  descriptionText?: string | null;
  isApproved?: boolean | null;
  isImportant?: boolean;
  releaseNoteProducts?: ReleaseNoteProduct[] | null;
  requirement?: Requirement;
  customers?: Customer[] | null;
}

export interface ReleaseNoteProduct {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  releaseNoteID?: number;
  /** @format int32 */
  productID?: number | null;
  releaseNote?: ReleaseNote;
}

export interface Requirement {
  /** @format int32 */
  id?: number;
  /** @format byte */
  version?: string | null;
  name?: string | null;
  /** @format int32 */
  projectID?: number;
  /** @format int32 */
  createdByID?: number;
  /** @format date-time */
  createdAt?: string;
  /** @format int32 */
  assignedToID?: number;
  isClosed?: boolean;
  /** @format int32 */
  onTimeID?: number | null;
  isInvoiced?: boolean;
  invoicedType?: string | null;
  isBugFix?: boolean;
  /** @format date */
  customerTerm?: string | null;
  /** @format int32 */
  projectCustomerPriorityID?: number | null;
  customerName?: string | null;
  /** @format int32 */
  assignedToCustomerUserID?: number | null;
  /** @format double */
  turnover?: number;
  processCheckListPublicDocs?: boolean;
  processCheckListTechDocs?: boolean;
  processCheckListTestScenario?: boolean;
  processCheckListTesting?: boolean;
  processCheckListCodereview?: boolean;
  processCheckListIgnore?: boolean;
  hasACommit?: boolean;
  /** @format int64 */
  businessCaseNumber?: number | null;
  /** @format double */
  progress?: number | null;
  assignedTo?: User;
  assignedToCustomerUser?: User;
  businessFeatureRequirements?: BusinessFeatureRequirement[] | null;
  createdBy?: User;
  discrepancyReportItems?: DiscrepancyReportItem[] | null;
  project?: Project;
  projectCustomerPriority?: ProjectCustomerPriority;
  releaseNote?: ReleaseNote;
  requirementComputedDatum?: RequirementComputedDatum;
  requirementCostCorrections?: RequirementCostCorrection[] | null;
  requirementFullText?: RequirementFullText;
  requirementHelpdeskDatum?: RequirementHelpdeskDatum;
  requirementLogs?: RequirementLog[] | null;
  requirementRelationshipRelatedRequirements?: RequirementRelationship[] | null;
  requirementRelationshipSourceRequirements?: RequirementRelationship[] | null;
  requirementUserNotes?: RequirementUserNote[] | null;
  subRequirements?: SubRequirement[] | null;
  categories?: Category[] | null;
}

export interface RequirementCategoryHistory {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  requirementID?: number;
  /** @format int32 */
  userID?: number;
  /** @format int32 */
  oldCategoryID?: number | null;
  /** @format int32 */
  newCategoryID?: number;
  /** @format date-time */
  changedDateTime?: string;
  /** @format int32 */
  subrequirementID?: number | null;
  subrequirement?: SubRequirement;
}

export interface RequirementComputedDatum {
  /** @format int32 */
  requirementID?: number;
  isDone?: boolean;
  /** @format date-time */
  lastModifiedAt?: string;
  /** @format int32 */
  totalWorkLogSeconds?: number;
  /** @format double */
  estimateTimeClient?: number;
  /** @format double */
  estimateTime?: number;
  /** @format double */
  estimateEffort?: number;
  /** @format date-time */
  respondedAt?: string | null;
  /** @format int32 */
  timeSpentOnSolution?: number;
  /** @format date-time */
  solutionStartAt?: string | null;
  /** @format date-time */
  resolvedAt?: string | null;
  /** @format double */
  totalCost?: number;
  /** @format int32 */
  totalWorkLogSecondsDev?: number;
  hasCommit?: boolean | null;
  /** @format double */
  helpdeskAcceptedTime?: number;
  /** @format double */
  mwResolvedTime?: number;
  /** @format double */
  clientApprovedTime?: number;
  isManualClientApprovedTime?: boolean;
  isManualHelpdeskAcceptedTime?: boolean;
  isManualMWResolvedTime?: boolean;
  lastModificationAuthor?: string | null;
  requirement?: Requirement;
}

export interface RequirementCostCorrection {
  /** @format int32 */
  requirementID?: number;
  /** @format int32 */
  workerUserID?: number;
  /** @format int32 */
  value?: number;
  /** @format int32 */
  userID?: number;
  /** @format date-time */
  created?: string;
  /** @format int32 */
  id?: number;
  note?: string | null;
  requirement?: Requirement;
  user?: User;
  workerUser?: User;
}

export interface RequirementFullText {
  /** @format int32 */
  requirementID?: number;
  fulltextSearchableText?: string | null;
  isChanged?: boolean;
  requirement?: Requirement;
}

export interface RequirementHelpdeskDatum {
  /** @format int32 */
  requirementID?: number;
  /** @format int32 */
  helpdeskRequestPathID?: number;
  browser?: string | null;
  os?: string | null;
  helpdeskRequestPath?: HelpdeskRequestPath;
  requirement?: Requirement;
}

export interface RequirementLog {
  /** @format int32 */
  requirementID?: number;
  /** @format date-time */
  date?: string;
  changeType?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  /** @format int32 */
  userID?: number;
  /** @format int32 */
  id?: number;
  requirement?: Requirement;
  user?: User;
}

export interface RequirementRelationship {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  sourceRequirementID?: number;
  /** @format int32 */
  relatedRequirementID?: number;
  /** @format int32 */
  relationTypeID?: number;
  relatedRequirement?: Requirement;
  relationType?: RelationType;
  sourceRequirement?: Requirement;
}

export interface RequirementUserNote {
  /** @format int32 */
  requirementID?: number;
  /** @format int32 */
  userID?: number;
  noteText?: string | null;
  requirement?: Requirement;
  user?: User;
}

export interface Role {
  /** @format int32 */
  id?: number;
  key?: string | null;
  description?: string | null;
  users?: User[] | null;
}

export interface ScrumSprint {
  /** @format int32 */
  id?: number;
  /** @format date-time */
  startDate?: string;
  /** @format date-time */
  endDate?: string;
  /** @format double */
  totalEffort?: number;
  /** @format double */
  remainingEffort?: number;
  tasks?: SubRequirement[] | null;
}

export interface ServerFile {
  /** @format int32 */
  id?: number;
  filePath?: string | null;
  fileType?: string | null;
  /** @format date */
  insertedDate?: string;
  name?: string | null;
  /** @format int32 */
  sufixLength?: number;
  mailQueueAttachments?: MailQueueAttachment[] | null;
  supplementFiles?: SupplementFile[] | null;
}

export interface SubRequirement {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  parentID?: number | null;
  /** @format int32 */
  requirementID?: number;
  isDone?: boolean;
  isSolved?: boolean;
  type?: string | null;
  name?: string | null;
  /** @format int32 */
  createdByID?: number;
  /** @format date-time */
  createdAt?: string;
  /** @format int32 */
  assignedToID?: number | null;
  isInvoiced?: boolean | null;
  /** @format int32 */
  totalWorkLogSeconds?: number;
  isVisibleToClient?: boolean;
  isDeleted?: boolean;
  /** @format int32 */
  versionNo?: number;
  /** @format date-time */
  lastModifiedAt?: string;
  /** @format double */
  estimateTimeClient?: number | null;
  /** @format double */
  estimateTime?: number | null;
  /** @format double */
  totalEstimateTimeClient?: number;
  /** @format double */
  totalEstimateTime?: number;
  /** @format double */
  estimateEffort?: number | null;
  /** @format double */
  totalEstimateEffort?: number;
  isBugFix?: boolean | null;
  /** @format double */
  preEstimateTime?: number | null;
  /** @format double */
  preEstimateTimeClient?: number | null;
  /** @format double */
  preEstimateEffort?: number | null;
  /** @format int32 */
  totalWorkLogSecondsDev?: number;
  assignedTo?: User;
  createdBy?: User;
  deployFromSubRequirements?: Deploy[] | null;
  deploySubRequirements?: Deploy[] | null;
  discrepancyReportItems?: DiscrepancyReportItem[] | null;
  inverseParent?: SubRequirement[] | null;
  parent?: SubRequirement;
  requirement?: Requirement;
  requirementCategoryHistories?: RequirementCategoryHistory[] | null;
  subscriptions?: Subscription[] | null;
  supplements?: Supplement[] | null;
  workLogs?: WorkLog[] | null;
  sprints?: ScrumSprint[] | null;
}

export interface Subscription {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  taskID?: number;
  /** @format int32 */
  subscriberID?: number;
  subscriber?: User;
  task?: SubRequirement;
}

export interface Supplement {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  subRequirementID?: number;
  /** @format int32 */
  typeID?: number;
  /** @format date-time */
  createdAt?: string;
  subRequirement?: SubRequirement;
  supplementCategory?: SupplementCategory;
  supplementDateTime?: SupplementDateTime;
  supplementDeploymentScript?: SupplementDeploymentScript;
  supplementFile?: SupplementFile;
  supplementGitCommit?: SupplementGitCommit;
  supplementText?: SupplementText;
  type?: SupplementType;
}

export interface SupplementCategory {
  /** @format int32 */
  supplementID?: number;
  /** @format int32 */
  categoryID?: number;
  category?: Category;
  supplement?: Supplement;
}

export interface SupplementDateTime {
  /** @format int32 */
  supplementID?: number;
  /** @format date-time */
  dateTimeValue?: string;
  supplement?: Supplement;
}

export interface SupplementDeploymentScript {
  /** @format int32 */
  supplementID?: number;
  /** @format int32 */
  deploymentScriptID?: number;
  isTerminating?: boolean;
  supplement?: Supplement;
}

export interface SupplementFile {
  /** @format int32 */
  supplementID?: number;
  /** @format int32 */
  fileID?: number | null;
  /** @format int32 */
  serverFileID?: number | null;
  file?: FileObject;
  serverFile?: ServerFile;
  supplement?: Supplement;
}

export interface SupplementGitCommit {
  /** @format int32 */
  supplementID?: number;
  commit?: string | null;
  shortCommit?: string | null;
  branch?: string | null;
  /** @format int32 */
  buildNumber?: number | null;
  supplement?: Supplement;
}

export interface SupplementText {
  /** @format int32 */
  supplementID?: number;
  text?: string | null;
  supplement?: Supplement;
}

export interface SupplementType {
  /** @format int32 */
  id?: number;
  fullName?: string | null;
  shortName?: string | null;
  valueType?: string | null;
  /** @format int32 */
  ord?: number;
  /** @format int32 */
  categoryTypeID?: number | null;
  isMultiValue?: boolean;
  categoryType?: CategoryType;
  supplements?: Supplement[] | null;
}

export interface User {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  roleID?: number | null;
  /** @format int32 */
  clientUserID?: number | null;
  firstName?: string | null;
  lastName?: string | null;
  shortName?: string | null;
  password?: string | null;
  settings?: string | null;
  emailAddress?: string | null;
  requiresSolvedTaskNotifications?: boolean;
  type?: string | null;
  /** @format int64 */
  notificationsData?: number;
  /** @format double */
  cost?: number;
  active?: boolean;
  businessFeatures?: BusinessFeature[] | null;
  deployCreatorUsers?: Deploy[] | null;
  deployDeployers?: Deploy[] | null;
  deploymentScripts?: DeploymentScript[] | null;
  discrepancyReportItems?: DiscrepancyReportItem[] | null;
  discrepancyReports?: DiscrepancyReport[] | null;
  invoiceItems?: InvoiceItem[] | null;
  invoices?: Invoice[] | null;
  loggedCapacities?: LoggedCapacity[] | null;
  logs?: Log[] | null;
  plannedCapacities?: PlannedCapacity[] | null;
  predefinedFilters?: PredefinedFilter[] | null;
  projects?: Project[] | null;
  requirementAssignedToCustomerUsers?: Requirement[] | null;
  requirementAssignedTos?: Requirement[] | null;
  requirementCostCorrectionUsers?: RequirementCostCorrection[] | null;
  requirementCostCorrectionWorkerUsers?: RequirementCostCorrection[] | null;
  requirementCreatedBies?: Requirement[] | null;
  requirementLogs?: RequirementLog[] | null;
  requirementUserNotes?: RequirementUserNote[] | null;
  role?: Role;
  subRequirementAssignedTos?: SubRequirement[] | null;
  subRequirementCreatedBies?: SubRequirement[] | null;
  subscriptions?: Subscription[] | null;
  workLogs?: WorkLog[] | null;
}

export interface WorkLog {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  workTypeID?: number | null;
  /** @format int32 */
  subRequirementID?: number;
  /** @format int32 */
  seconds?: number;
  description?: string | null;
  isInvoiced?: boolean | null;
  /** @format date-time */
  date?: string;
  /** @format int32 */
  userID?: number;
  wasInvoiced?: boolean;
  isBugFix?: boolean | null;
  /** @format date-time */
  createdDate?: string;
  /** @format int32 */
  createdUserID?: number;
  /** @format date-time */
  modifiedDate?: string | null;
  /** @format int32 */
  modifiedUserID?: number | null;
  subRequirement?: SubRequirement;
  user?: User;
  workType?: WorkType;
}

export interface WorkType {
  /** @format int32 */
  id?: number;
  name?: string | null;
  workLogs?: WorkLog[] | null;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title MlogPmApi
 * @version 1.0
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags LoggedCapacities
     * @name LoggedCapacitiesList
     * @request GET:/api/LoggedCapacities
     */
    loggedCapacitiesList: (params: RequestParams = {}) =>
      this.request<LoggedCapacity[], any>({
        path: `/api/LoggedCapacities`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LoggedCapacities
     * @name LoggedCapacitiesCreate
     * @request POST:/api/LoggedCapacities
     */
    loggedCapacitiesCreate: (
      data: LoggedCapacity,
      params: RequestParams = {},
    ) =>
      this.request<LoggedCapacity, any>({
        path: `/api/LoggedCapacities`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LoggedCapacities
     * @name LoggedCapacitiesDetail
     * @request GET:/api/LoggedCapacities/{userId}/{milestoneId}/{month}/{year}
     */
    loggedCapacitiesDetail: (
      userId: number,
      milestoneId: number,
      month: number,
      year: number,
      params: RequestParams = {},
    ) =>
      this.request<LoggedCapacity, any>({
        path: `/api/LoggedCapacities/${userId}/${milestoneId}/${month}/${year}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LoggedCapacities
     * @name LoggedCapacitiesUpdate
     * @request PUT:/api/LoggedCapacities/{userId}/{milestoneId}/{month}/{year}
     */
    loggedCapacitiesUpdate: (
      userId: number,
      milestoneId: number,
      month: number,
      year: number,
      data: LoggedCapacity,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/LoggedCapacities/${userId}/${milestoneId}/${month}/${year}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags LoggedCapacities
     * @name LoggedCapacitiesDelete
     * @request DELETE:/api/LoggedCapacities/{userId}/{milestoneId}/{month}/{year}
     */
    loggedCapacitiesDelete: (
      userId: number,
      milestoneId: number,
      month: number,
      year: number,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/LoggedCapacities/${userId}/${milestoneId}/${month}/${year}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags PlannedCapacities
     * @name PlannedCapacitiesList
     * @request GET:/api/PlannedCapacities
     */
    plannedCapacitiesList: (params: RequestParams = {}) =>
      this.request<PlannedCapacity[], any>({
        path: `/api/PlannedCapacities`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags PlannedCapacities
     * @name PlannedCapacitiesCreate
     * @request POST:/api/PlannedCapacities
     */
    plannedCapacitiesCreate: (
      data: PlannedCapacity,
      params: RequestParams = {},
    ) =>
      this.request<PlannedCapacity, any>({
        path: `/api/PlannedCapacities`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags PlannedCapacities
     * @name PlannedCapacitiesDetail
     * @request GET:/api/PlannedCapacities/{userId}/{milestoneId}/{month}/{year}
     */
    plannedCapacitiesDetail: (
      userId: number,
      milestoneId: number,
      month: number,
      year: number,
      params: RequestParams = {},
    ) =>
      this.request<PlannedCapacity, any>({
        path: `/api/PlannedCapacities/${userId}/${milestoneId}/${month}/${year}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags PlannedCapacities
     * @name PlannedCapacitiesUpdate
     * @request PUT:/api/PlannedCapacities/{userId}/{milestoneId}/{month}/{year}
     */
    plannedCapacitiesUpdate: (
      userId: number,
      milestoneId: number,
      month: number,
      year: number,
      data: PlannedCapacity,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/PlannedCapacities/${userId}/${milestoneId}/${month}/${year}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags PlannedCapacities
     * @name PlannedCapacitiesDelete
     * @request DELETE:/api/PlannedCapacities/{userId}/{milestoneId}/{month}/{year}
     */
    plannedCapacitiesDelete: (
      userId: number,
      milestoneId: number,
      month: number,
      year: number,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/PlannedCapacities/${userId}/${milestoneId}/${month}/${year}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ProjectMilestones
     * @name ProjectMilestonesList
     * @request GET:/api/ProjectMilestones
     */
    projectMilestonesList: (params: RequestParams = {}) =>
      this.request<ProjectMilestone[], any>({
        path: `/api/ProjectMilestones`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ProjectMilestones
     * @name ProjectMilestonesCreate
     * @request POST:/api/ProjectMilestones
     */
    projectMilestonesCreate: (
      data: ProjectMilestone,
      params: RequestParams = {},
    ) =>
      this.request<ProjectMilestone, any>({
        path: `/api/ProjectMilestones`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ProjectMilestones
     * @name ProjectMilestonesDetail
     * @request GET:/api/ProjectMilestones/{id}
     */
    projectMilestonesDetail: (id: number, params: RequestParams = {}) =>
      this.request<ProjectMilestone, any>({
        path: `/api/ProjectMilestones/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ProjectMilestones
     * @name ProjectMilestonesUpdate
     * @request PUT:/api/ProjectMilestones/{id}
     */
    projectMilestonesUpdate: (
      id: number,
      data: ProjectMilestone,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/ProjectMilestones/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags ProjectMilestones
     * @name ProjectMilestonesDelete
     * @request DELETE:/api/ProjectMilestones/{id}
     */
    projectMilestonesDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/ProjectMilestones/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name ProjectsList
     * @request GET:/api/Projects
     */
    projectsList: (params: RequestParams = {}) =>
      this.request<Project[], any>({
        path: `/api/Projects`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name ProjectsCreate
     * @request POST:/api/Projects
     */
    projectsCreate: (data: Project, params: RequestParams = {}) =>
      this.request<Project, any>({
        path: `/api/Projects`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name ProjectsDetail
     * @request GET:/api/Projects/{id}
     */
    projectsDetail: (id: number, params: RequestParams = {}) =>
      this.request<Project, any>({
        path: `/api/Projects/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name ProjectsUpdate
     * @request PUT:/api/Projects/{id}
     */
    projectsUpdate: (id: number, data: Project, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Projects/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name ProjectsDelete
     * @request DELETE:/api/Projects/{id}
     */
    projectsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Projects/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ProjectWorkers
     * @name ProjectWorkersList
     * @request GET:/api/ProjectWorkers
     */
    projectWorkersList: (params: RequestParams = {}) =>
      this.request<ProjectWorker[], any>({
        path: `/api/ProjectWorkers`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ProjectWorkers
     * @name ProjectWorkersCreate
     * @request POST:/api/ProjectWorkers
     */
    projectWorkersCreate: (data: ProjectWorker, params: RequestParams = {}) =>
      this.request<ProjectWorker, any>({
        path: `/api/ProjectWorkers`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ProjectWorkers
     * @name ProjectWorkersDetail
     * @request GET:/api/ProjectWorkers/{projectId}/{userId}
     */
    projectWorkersDetail: (
      projectId: number,
      userId: number,
      params: RequestParams = {},
    ) =>
      this.request<ProjectWorker, any>({
        path: `/api/ProjectWorkers/${projectId}/${userId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ProjectWorkers
     * @name ProjectWorkersUpdate
     * @request PUT:/api/ProjectWorkers/{projectId}/{userId}
     */
    projectWorkersUpdate: (
      projectId: number,
      userId: number,
      data: ProjectWorker,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/ProjectWorkers/${projectId}/${userId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags ProjectWorkers
     * @name ProjectWorkersDelete
     * @request DELETE:/api/ProjectWorkers/{projectId}/{userId}
     */
    projectWorkersDelete: (
      projectId: number,
      userId: number,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/ProjectWorkers/${projectId}/${userId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Requirements
     * @name RequirementsList
     * @request GET:/api/Requirements
     */
    requirementsList: (params: RequestParams = {}) =>
      this.request<Requirement[], any>({
        path: `/api/Requirements`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Requirements
     * @name RequirementsCreate
     * @request POST:/api/Requirements
     */
    requirementsCreate: (data: Requirement, params: RequestParams = {}) =>
      this.request<Requirement, any>({
        path: `/api/Requirements`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Requirements
     * @name RequirementsDetail
     * @request GET:/api/Requirements/{id}
     */
    requirementsDetail: (id: number, params: RequestParams = {}) =>
      this.request<Requirement, any>({
        path: `/api/Requirements/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Requirements
     * @name RequirementsUpdate
     * @request PUT:/api/Requirements/{id}
     */
    requirementsUpdate: (
      id: number,
      data: Requirement,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/Requirements/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Requirements
     * @name RequirementsDelete
     * @request DELETE:/api/Requirements/{id}
     */
    requirementsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Requirements/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags SubRequirements
     * @name SubRequirementsList
     * @request GET:/api/SubRequirements
     */
    subRequirementsList: (params: RequestParams = {}) =>
      this.request<SubRequirement[], any>({
        path: `/api/SubRequirements`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags SubRequirements
     * @name SubRequirementsCreate
     * @request POST:/api/SubRequirements
     */
    subRequirementsCreate: (data: SubRequirement, params: RequestParams = {}) =>
      this.request<SubRequirement, any>({
        path: `/api/SubRequirements`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags SubRequirements
     * @name SubRequirementsDetail
     * @request GET:/api/SubRequirements/{id}
     */
    subRequirementsDetail: (id: number, params: RequestParams = {}) =>
      this.request<SubRequirement, any>({
        path: `/api/SubRequirements/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags SubRequirements
     * @name SubRequirementsUpdate
     * @request PUT:/api/SubRequirements/{id}
     */
    subRequirementsUpdate: (
      id: number,
      data: SubRequirement,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/SubRequirements/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags SubRequirements
     * @name SubRequirementsDelete
     * @request DELETE:/api/SubRequirements/{id}
     */
    subRequirementsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/SubRequirements/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersList
     * @request GET:/api/Users
     */
    usersList: (params: RequestParams = {}) =>
      this.request<User[], any>({
        path: `/api/Users`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersCreate
     * @request POST:/api/Users
     */
    usersCreate: (data: User, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/api/Users`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersDetail
     * @request GET:/api/Users/{id}
     */
    usersDetail: (id: number, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/api/Users/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersUpdate
     * @request PUT:/api/Users/{id}
     */
    usersUpdate: (id: number, data: User, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Users/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersDelete
     * @request DELETE:/api/Users/{id}
     */
    usersDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Users/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags WorkLogs
     * @name WorkLogsList
     * @request GET:/api/WorkLogs
     */
    workLogsList: (params: RequestParams = {}) =>
      this.request<WorkLog[], any>({
        path: `/api/WorkLogs`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags WorkLogs
     * @name WorkLogsCreate
     * @request POST:/api/WorkLogs
     */
    workLogsCreate: (data: WorkLog, params: RequestParams = {}) =>
      this.request<WorkLog, any>({
        path: `/api/WorkLogs`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags WorkLogs
     * @name WorkLogsDetail
     * @request GET:/api/WorkLogs/{id}
     */
    workLogsDetail: (id: number, params: RequestParams = {}) =>
      this.request<WorkLog, any>({
        path: `/api/WorkLogs/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags WorkLogs
     * @name WorkLogsUpdate
     * @request PUT:/api/WorkLogs/{id}
     */
    workLogsUpdate: (id: number, data: WorkLog, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/WorkLogs/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags WorkLogs
     * @name WorkLogsDelete
     * @request DELETE:/api/WorkLogs/{id}
     */
    workLogsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/WorkLogs/${id}`,
        method: "DELETE",
        ...params,
      }),
  };
}
