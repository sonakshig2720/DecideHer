import { InitiativeCluster } from '../types';

/** Convert a technical cluster label into an action-oriented opportunity title. */
export const getOpportunityTitle = (initiative: InitiativeCluster): string => {
  const object = initiative.dataObject.toLowerCase();
  const capability = initiative.capabilityType.toLowerCase();

  if (capability.includes('classify') || capability.includes('route')) {
    return `Improve ${object} classification and routing`;
  }
  if (capability.includes('decide') || capability.includes('approve')) {
    return `Streamline ${object} decisions and approvals`;
  }
  if (capability.includes('draft') || capability.includes('generate')) {
    return `Accelerate ${object} content creation`;
  }
  if (capability.includes('predict') || capability.includes('score')) {
    return `Strengthen ${object} forecasting and scoring`;
  }
  if (capability.includes('schedule') || capability.includes('coordinate')) {
    return `Improve ${object} scheduling and coordination`;
  }
  if (capability.includes('transfer') || capability.includes('sync')) {
    return `Automate ${object} data synchronisation`;
  }
  if (capability.includes('summar')) {
    return `Accelerate ${object} summarisation`;
  }
  if (capability.includes('retrieve') || capability.includes('answer')) {
    return `Improve access to ${object} information`;
  }
  return `Improve ${object} data management`;
};
