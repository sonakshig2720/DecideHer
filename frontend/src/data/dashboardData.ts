import { InitiativeCluster, DepartmentSummary, BlockerSummary, PortfolioMetrics } from '../types';

interface DashboardPayload {
  initiatives: InitiativeCluster[];
  departments: DepartmentSummary[];
  blockers: BlockerSummary[];
  metrics: PortfolioMetrics;
  advisorKnowledgeBase: { [key: string]: string };
}

const emptyPayload: DashboardPayload = {
  initiatives: [],
  departments: [],
  blockers: [],
  metrics: {
    reports: 0,
    opportunities: 0,
    departments: 0,
    crossFunctional: 0,
    existingSystems: 0,
    needEvidence: 0,
    primaryBlocker: { blocker: "Don't know how", count: 0, percentage: 0, significance: '' },
    rootCauseGap: {},
  },
  advisorKnowledgeBase: {},
};

async function loadDashboard(): Promise<DashboardPayload> {
  try {
    const response = await fetch('./dashboard.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Dashboard data unavailable (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return emptyPayload;
  }
}

export const DASHBOARD = await loadDashboard();
export const INITIATIVE_CLUSTERS = DASHBOARD.initiatives;
export const DEPARTMENT_DATA = DASHBOARD.departments;
export const BLOCKER_DATA = DASHBOARD.blockers;
export const PORTFOLIO_METRICS = DASHBOARD.metrics;
export const ADVISOR_KNOWLEDGE_BASE = DASHBOARD.advisorKnowledgeBase;
