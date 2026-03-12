import type {
  Opportunity,
  OpportunityStats,
  OpportunityStatus,
  WorkMode,
} from '@/lib/types'

export interface OpportunityFilterOptions {
  search?: string
  location?: string
  workMode?: WorkMode | 'all'
  status?: OpportunityStatus | 'all'
}

export function filterOpportunities(
  opportunities: Opportunity[],
  options: OpportunityFilterOptions
): Opportunity[] {
  return opportunities.filter((opp) => {
    if (options.search) {
      const searchLower = options.search.toLowerCase()
      const matchesSearch =
        opp.title.toLowerCase().includes(searchLower) ||
        opp.company.toLowerCase().includes(searchLower) ||
        opp.location.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    if (options.location && options.location !== 'All Locations' && opp.location !== options.location) {
      return false
    }

    if (options.workMode && options.workMode !== 'all' && opp.workMode !== options.workMode) {
      return false
    }

    if (options.status && options.status !== 'all' && opp.status !== options.status) {
      return false
    }

    return true
  })
}

export function getOpportunityStats(opportunities: Opportunity[]): OpportunityStats {
  return {
    total: opportunities.length,
    saved: opportunities.filter((o) => o.status === 'saved').length,
    applied: opportunities.filter((o) => o.status === 'applied').length,
    interview: opportunities.filter((o) => o.status === 'interview').length,
    offer: opportunities.filter((o) => o.status === 'offer').length,
    rejected: opportunities.filter((o) => o.status === 'rejected').length,
  }
}

export function getUpcomingFollowUps(opportunities: Opportunity[]): Opportunity[] {
  const now = new Date()
  return opportunities
    .filter((opp) => opp.followUpDate && new Date(opp.followUpDate) > now)
    .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime())
}

export function getRecentOpportunities(opportunities: Opportunity[], limit = 5): Opportunity[] {
  return [...opportunities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}
