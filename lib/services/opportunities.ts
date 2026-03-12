/**
 * Opportunities Service Layer
 *
 * A thin facade that delegates persistence to repository implementations
 * and pure list operations to selector helpers.
 */

import { getOpportunitiesRepository } from '@/lib/repositories'
import {
  filterOpportunities,
  getOpportunityStats,
  getRecentOpportunities as selectRecentOpportunities,
  getUpcomingFollowUps as selectUpcomingFollowUps,
  type OpportunityFilterOptions,
} from '@/lib/selectors/opportunities'
import type {
  ActivityItem,
  CreateOpportunityInput,
  Opportunity,
  OpportunityStats,
  OpportunityStatus,
  UpdateOpportunityInput,
} from '../types'

function repository() {
  return getOpportunitiesRepository()
}

export async function getOpportunities(): Promise<Opportunity[]> {
  return repository().listOpportunities()
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  return repository().getOpportunityById(id)
}

export async function getOpportunitiesByStatus(status: OpportunityStatus): Promise<Opportunity[]> {
  const opportunities = await repository().listOpportunities()
  return opportunities.filter((opp) => opp.status === status)
}

export async function getUpcomingFollowUps(): Promise<Opportunity[]> {
  const opportunities = await repository().listOpportunities()
  return selectUpcomingFollowUps(opportunities)
}

export async function getRecentOpportunities(limit = 5): Promise<Opportunity[]> {
  const opportunities = await repository().listOpportunities()
  return selectRecentOpportunities(opportunities, limit)
}

export async function getActivitiesByOpportunityId(opportunityId: string): Promise<ActivityItem[]> {
  return repository().listActivitiesByOpportunityId(opportunityId)
}

export async function createOpportunity(input: CreateOpportunityInput): Promise<Opportunity> {
  const result = await repository().createOpportunity(input)
  return result.opportunity
}

export async function updateOpportunity(
  id: string,
  input: UpdateOpportunityInput
): Promise<Opportunity | null> {
  return repository().updateOpportunity(id, input)
}

export async function updateOpportunityStatus(
  id: string,
  status: OpportunityStatus
): Promise<Opportunity | null> {
  const result = await repository().updateOpportunityStatus(id, status)
  return result.opportunity
}

export async function deleteOpportunity(id: string): Promise<boolean> {
  return repository().deleteOpportunity(id)
}

export interface FilterOptions extends OpportunityFilterOptions {}

export async function searchOpportunities(query: string): Promise<Opportunity[]> {
  const opportunities = await repository().listOpportunities()
  return filterOpportunities(opportunities, { search: query })
}

export async function filterOpportunitiesByOptions(options: FilterOptions): Promise<Opportunity[]> {
  const opportunities = await repository().listOpportunities()
  return filterOpportunities(opportunities, options)
}

export async function getOpportunityStatsSummary(): Promise<OpportunityStats> {
  const opportunities = await repository().listOpportunities()
  return getOpportunityStats(opportunities)
}
