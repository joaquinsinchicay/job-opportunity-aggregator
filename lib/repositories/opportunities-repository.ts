import { MOCK_ACTIVITIES } from '@/lib/data/mock/activities'
import { MOCK_OPPORTUNITIES } from '@/lib/data/mock/opportunities'
import type {
  ActivityItem,
  CreateOpportunityInput,
  Opportunity,
  OpportunityStatus,
  UpdateOpportunityInput,
} from '@/lib/types'

function clone<T>(value: T): T {
  return structuredClone(value)
}

export interface CreateOpportunityResult {
  opportunity: Opportunity
  activity: ActivityItem
}

export interface UpdateStatusResult {
  opportunity: Opportunity | null
  activity?: ActivityItem
}

export interface OpportunitiesRepository {
  listOpportunities(): Promise<Opportunity[]>
  getOpportunityById(id: string): Promise<Opportunity | null>
  createOpportunity(input: CreateOpportunityInput): Promise<CreateOpportunityResult>
  updateOpportunity(id: string, input: UpdateOpportunityInput): Promise<Opportunity | null>
  updateOpportunityStatus(id: string, status: OpportunityStatus): Promise<UpdateStatusResult>
  deleteOpportunity(id: string): Promise<boolean>
  listActivitiesByOpportunityId(opportunityId: string): Promise<ActivityItem[]>
  listActivities(): Promise<ActivityItem[]>
}

export class InMemoryOpportunitiesRepository implements OpportunitiesRepository {
  private opportunities: Opportunity[]
  private activities: ActivityItem[]

  constructor(seed?: { opportunities?: Opportunity[]; activities?: ActivityItem[] }) {
    this.opportunities = clone(seed?.opportunities ?? MOCK_OPPORTUNITIES)
    this.activities = clone(seed?.activities ?? MOCK_ACTIVITIES)
  }

  async listOpportunities(): Promise<Opportunity[]> {
    return clone(this.opportunities)
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    return clone(this.opportunities.find((opp) => opp.id === id) ?? null)
  }

  async createOpportunity(input: CreateOpportunityInput): Promise<CreateOpportunityResult> {
    const now = new Date().toISOString()
    const opportunity: Opportunity = {
      id: `opp_${Date.now()}`,
      title: input.title,
      company: input.company,
      location: input.location,
      workMode: input.workMode,
      status: 'saved',
      sourceUrl: input.sourceUrl ?? '',
      notes: input.notes ?? '',
      createdAt: now,
    }

    const activity: ActivityItem = {
      id: `activity_${Date.now()}`,
      opportunityId: opportunity.id,
      type: 'created',
      description: 'Opportunity created',
      timestamp: now,
    }

    this.opportunities = [opportunity, ...this.opportunities]
    this.activities = [activity, ...this.activities]

    return clone({ opportunity, activity })
  }

  async updateOpportunity(id: string, input: UpdateOpportunityInput): Promise<Opportunity | null> {
    const index = this.opportunities.findIndex((opp) => opp.id === id)
    if (index === -1) return null

    const updated = { ...this.opportunities[index], ...input }
    this.opportunities[index] = updated
    return clone(updated)
  }

  async updateOpportunityStatus(id: string, status: OpportunityStatus): Promise<UpdateStatusResult> {
    const index = this.opportunities.findIndex((opp) => opp.id === id)
    if (index === -1) return { opportunity: null }

    const current = this.opportunities[index]
    const nextAppliedDate =
      status === 'applied' && !current.appliedDate ? new Date().toISOString() : current.appliedDate

    const opportunity: Opportunity = {
      ...current,
      status,
      appliedDate: nextAppliedDate,
    }

    this.opportunities[index] = opportunity

    if (current.status === status) {
      return clone({ opportunity })
    }

    const activity: ActivityItem = {
      id: `activity_${Date.now()}`,
      opportunityId: id,
      type: 'status_changed',
      description: `Status changed from ${current.status} to ${status}`,
      timestamp: new Date().toISOString(),
      metadata: {
        fromStatus: current.status,
        toStatus: status,
      },
    }

    this.activities = [activity, ...this.activities]

    return clone({ opportunity, activity })
  }

  async deleteOpportunity(id: string): Promise<boolean> {
    const before = this.opportunities.length
    this.opportunities = this.opportunities.filter((opp) => opp.id !== id)
    this.activities = this.activities.filter((item) => item.opportunityId !== id)
    return this.opportunities.length < before
  }

  async listActivitiesByOpportunityId(opportunityId: string): Promise<ActivityItem[]> {
    return clone(
      this.activities
        .filter((item) => item.opportunityId === opportunityId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    )
  }

  async listActivities(): Promise<ActivityItem[]> {
    return clone(this.activities)
  }
}
