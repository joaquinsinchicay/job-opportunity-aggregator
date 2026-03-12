import { MOCK_ACTIVITIES } from '@/lib/data/mock/activities'
import { MOCK_OPPORTUNITIES } from '@/lib/data/mock/opportunities'
import type {
  ActivityItem,
  CreateOpportunityInput,
  Opportunity,
  OpportunityStatus,
  UpdateOpportunityInput,
} from '@/lib/types'

const SIMULATED_DELAY = 100

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

export interface OpportunitiesRepository {
  listOpportunities(): Promise<Opportunity[]>
  getOpportunityById(id: string): Promise<Opportunity | null>
  createOpportunity(input: CreateOpportunityInput): Promise<Opportunity>
  updateOpportunity(id: string, input: UpdateOpportunityInput): Promise<Opportunity | null>
  updateOpportunityStatus(id: string, status: OpportunityStatus): Promise<Opportunity | null>
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
    await delay(SIMULATED_DELAY)
    return clone(this.opportunities)
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    await delay(SIMULATED_DELAY)
    return clone(this.opportunities.find((opp) => opp.id === id) ?? null)
  }

  async createOpportunity(input: CreateOpportunityInput): Promise<Opportunity> {
    await delay(SIMULATED_DELAY)
    const now = new Date().toISOString()
    const created: Opportunity = {
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

    this.opportunities = [created, ...this.opportunities]
    this.activities = [
      {
        id: `activity_${Date.now()}`,
        opportunityId: created.id,
        type: 'created',
        description: 'Opportunity created',
        timestamp: now,
      },
      ...this.activities,
    ]

    return clone(created)
  }

  async updateOpportunity(id: string, input: UpdateOpportunityInput): Promise<Opportunity | null> {
    await delay(SIMULATED_DELAY)
    const index = this.opportunities.findIndex((opp) => opp.id === id)
    if (index === -1) return null

    const updated = { ...this.opportunities[index], ...input }
    this.opportunities[index] = updated
    return clone(updated)
  }

  async updateOpportunityStatus(id: string, status: OpportunityStatus): Promise<Opportunity | null> {
    await delay(SIMULATED_DELAY)
    const index = this.opportunities.findIndex((opp) => opp.id === id)
    if (index === -1) return null

    const current = this.opportunities[index]
    const nextAppliedDate =
      status === 'applied' && !current.appliedDate ? new Date().toISOString() : current.appliedDate

    const updated: Opportunity = {
      ...current,
      status,
      appliedDate: nextAppliedDate,
    }

    this.opportunities[index] = updated

    if (current.status !== status) {
      const timestamp = new Date().toISOString()
      this.activities = [
        {
          id: `activity_${Date.now()}`,
          opportunityId: id,
          type: 'status_changed',
          description: `Status changed from ${current.status} to ${status}`,
          timestamp,
          metadata: {
            fromStatus: current.status,
            toStatus: status,
          },
        },
        ...this.activities,
      ]
    }

    return clone(updated)
  }

  async deleteOpportunity(id: string): Promise<boolean> {
    await delay(SIMULATED_DELAY)
    const before = this.opportunities.length
    this.opportunities = this.opportunities.filter((opp) => opp.id !== id)
    this.activities = this.activities.filter((item) => item.opportunityId !== id)
    return this.opportunities.length < before
  }

  async listActivitiesByOpportunityId(opportunityId: string): Promise<ActivityItem[]> {
    await delay(SIMULATED_DELAY)
    return clone(
      this.activities
        .filter((item) => item.opportunityId === opportunityId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    )
  }

  async listActivities(): Promise<ActivityItem[]> {
    await delay(SIMULATED_DELAY)
    return clone(this.activities)
  }
}
