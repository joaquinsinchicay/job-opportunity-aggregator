/**
 * @deprecated Use repositories and selectors instead.
 * This module is kept as a compatibility facade.
 */

import { MOCK_ACTIVITIES } from './data/mock/activities'
import { MOCK_OPPORTUNITIES } from './data/mock/opportunities'
import {
  getRecentOpportunities as selectRecentOpportunities,
  getUpcomingFollowUps as selectUpcomingFollowUps,
} from './selectors/opportunities'
import type { ActivityItem, Opportunity, OpportunityStatus } from './types'

export const mockOpportunities: Opportunity[] = [...MOCK_OPPORTUNITIES]
export const mockActivities: ActivityItem[] = [...MOCK_ACTIVITIES]

export function getOpportunityById(id: string): Opportunity | undefined {
  return mockOpportunities.find((opp) => opp.id === id)
}

export function getActivitiesByOpportunityId(opportunityId: string): ActivityItem[] {
  return mockActivities.filter((activity) => activity.opportunityId === opportunityId)
}

export function getOpportunitiesByStatus(status: OpportunityStatus): Opportunity[] {
  return mockOpportunities.filter((opp) => opp.status === status)
}

export function getUpcomingFollowUps(): Opportunity[] {
  return selectUpcomingFollowUps(mockOpportunities)
}

export function getRecentOpportunities(limit = 5): Opportunity[] {
  return selectRecentOpportunities(mockOpportunities, limit)
}
