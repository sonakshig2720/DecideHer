export type ImpactBand = 'High' | 'Medium' | 'Low';
export type ReadinessBand = 'High' | 'Medium' | 'Low';
export type EvidenceBand = 'High' | 'Medium' | 'Low';

export type DecisionType = 'REDESIGN' | 'BUILD' | 'CONSOLIDATE' | 'BUY' | 'INVESTIGATE' | 'AVOID';

export type BlockerType =
  | 'Nobody agrees on the fix'
  | 'No time'
  | 'No skills in-house'
  | 'No authority'
  | 'No budget'
  | 'Don\'t know how';

export interface ReportItem {
  id: string;
  submitterId: string;
  submitterName: string;
  department: string;
  role: string;
  idea: string;
  whatHappensToday: string;
  whyWeWantThis: string;
  departmentsInvolved: string[];
  rootCauseStated: string;
  rootCauseDerived: string;
  taskType: string;
  frequency: string;
  timePerOccurrence: string;
  peopleAffected: string;
  dataUsed: string[];
  toolsUsed: string[];
  blockedBy: BlockerType;
  evidenceScore: number;
  capabilityType: string;
  dataObject: string;
  personalDataFlag: 'yes' | 'no' | 'unclear';
  volumeProxy: number;
  reachScore: number;
  clusterId: string;
}

export interface InitiativeCluster {
  id: number;
  clusterId: string;
  name: string;
  departments: string[];
  useCasesCount: number;
  decision: DecisionType;
  impact: ImpactBand;
  readiness: ReadinessBand;
  evidence: EvidenceBand;
  spans3PlusDepts: boolean;
  ownedSystemMatch: string | null;
  needsMoreEvidence: boolean;
  findingText: string;
  findingDrivers: string[];
  primaryBlocker: BlockerType;
  blockerDistribution: { [key in BlockerType]?: number };
  readinessBreakdown: {
    technology: ReadinessBand;
    people: ReadinessBand;
    data: ReadinessBand;
    process: ReadinessBand;
  };
  evidenceScore: number; // 0-10
  impactScore: number;
  evidenceConfidenceBand: EvidenceBand;
  verdictConfidenceScore: number;
  verdictConfidenceBand: EvidenceBand;
  verdictConfidenceBasis: string;
  evidenceSufficient: boolean;
  missingEvidence: string[];
  evidenceRefs: string[];
  capabilityType: string;
  dataObject: string;
  readinessSource: {
    technology: string;
    people: string;
    data: string;
    process: string;
  };
  readinessCapRule: string;
  ownedSystemUnusedFlag: 'yes' | 'no';
  reports: ReportItem[];
}

export interface DepartmentSummary {
  name: string;
  count: number;
  color: string;
  percentage: number;
}

export interface BlockerSummary {
  blocker: BlockerType;
  count: number;
  percentage: number;
  significance: string;
}

export interface PortfolioMetrics {
  reports: number;
  opportunities: number;
  departments: number;
  crossFunctional: number;
  existingSystems: number;
  needEvidence: number;
  primaryBlocker: BlockerSummary;
  rootCauseGap: { [key: string]: number };
}
