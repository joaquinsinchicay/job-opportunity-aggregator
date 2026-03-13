import {
  type CreateOpportunityInput,
  type ActivityItem,
  type Opportunity,
  type OpportunityStatus,
  type UpdateOpportunityInput,
} from '@/lib/types'
import {
  getSupabaseClientConfig,
  supabaseRestFetch,
  type SupabaseClientConfig,
} from '@/lib/supabase/client'
import type {
  CreateOpportunityResult,
  OpportunitiesRepository,
  UpdateStatusResult,
} from './opportunities-repository'

function getString(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'bigint') return String(value)
  }
  return ''
}

function getOptionalString(row: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string') return value
  }
  return undefined
}

function toOpportunity(row: Record<string, unknown>, followUpDate?: string): Opportunity {
  return {
    id: getString(row, 'id'),
    title: getString(row, 'title'),
    company: getString(row, 'company'),
    location: getString(row, 'location'),
    workMode: getString(row, 'work_mode', 'workMode') as Opportunity['workMode'],
    status: getString(row, 'status') as OpportunityStatus,
    sourceUrl: getString(row, 'source_url', 'sourceUrl'),
    notes: getString(row, 'notes'),
    createdAt: getString(row, 'created_at', 'createdAt'),
    appliedDate: getOptionalString(row, 'applied_date', 'appliedDate'),
    followUpDate,
  }
}

function toActivity(row: Record<string, unknown>): ActivityItem {
  const metadata = row.metadata as ActivityItem['metadata'] | null | undefined

  return {
    id: getString(row, 'id'),
    opportunityId: getString(row, 'opportunity_id', 'opportunityId'),
    type: getString(row, 'type') as ActivityItem['type'],
    description: getString(row, 'description'),
    timestamp: getString(row, 'created_at', 'timestamp'),
    metadata: metadata ?? undefined,
  }
}

function mapOpportunityInput(input: UpdateOpportunityInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  if (input.title !== undefined) payload.title = input.title
  if (input.company !== undefined) payload.company = input.company
  if (input.location !== undefined) payload.location = input.location
  if (input.workMode !== undefined) payload.work_mode = input.workMode
  if (input.status !== undefined) payload.status = input.status
  if (input.sourceUrl !== undefined) payload.source_url = input.sourceUrl
  if (input.notes !== undefined) payload.notes = input.notes
  if (input.appliedDate !== undefined) payload.applied_date = input.appliedDate

  return payload
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) qp.set(key, String(value))
  }
  return qp.toString()
}

function safeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`
}

type DbRow = Record<string, unknown>

export class SupabaseOpportunitiesRepository implements OpportunitiesRepository {
  private readonly config: SupabaseClientConfig

  constructor(config?: SupabaseClientConfig | null) {
    const resolved = config ?? getSupabaseClientConfig()
    if (!resolved) {
      throw new Error('Supabase configuration is missing')
    }
    this.config = resolved
  }

  private async listFollowUps(): Promise<Map<string, string>> {
    const rows = await supabaseRestFetch<DbRow[]>(
      this.config,
      `followups?${buildQuery({ select: 'opportunity_id,follow_up_date,due_at,scheduled_for' })}`
    )

    const map = new Map<string, string>()
    rows.forEach((row) => {
      const opportunityId = getString(row, 'opportunity_id', 'opportunityId')
      const date = getOptionalString(row, 'follow_up_date', 'scheduled_for', 'due_at')
      if (opportunityId && date) {
        map.set(opportunityId, date)
      }
    })

    return map
  }

  async listOpportunities(): Promise<Opportunity[]> {
    const [rows, followUps] = await Promise.all([
      supabaseRestFetch<DbRow[]>(
        this.config,
        `opportunities?${buildQuery({ select: '*', order: 'created_at.desc' })}`
      ),
      this.listFollowUps(),
    ])

    return rows.map((row) => toOpportunity(row, followUps.get(getString(row, 'id'))))
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    const rows = await supabaseRestFetch<DbRow[]>(
      this.config,
      `opportunities?${buildQuery({ select: '*', id: `eq.${id}`, limit: 1 })}`
    )

    const row = rows[0]
    if (!row) return null

    const followUpRows = await supabaseRestFetch<DbRow[]>(
      this.config,
      `followups?${buildQuery({
        select: 'follow_up_date,due_at,scheduled_for',
        opportunity_id: `eq.${id}`,
        limit: 1,
      })}`
    )

    const followUpDate = followUpRows[0]
      ? getOptionalString(followUpRows[0], 'follow_up_date', 'scheduled_for', 'due_at')
      : undefined

    return toOpportunity(row, followUpDate)
  }

  async createOpportunity(input: CreateOpportunityInput): Promise<CreateOpportunityResult> {
    const now = new Date().toISOString()
    const opportunityId = safeId()
    const activityId = safeId()

    const insertedOpportunities = await supabaseRestFetch<DbRow[]>(
      this.config,
      `opportunities?${buildQuery({ select: '*' })}`,
      {
        method: 'POST',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify([
          {
            id: opportunityId,
            title: input.title,
            company: input.company,
            location: input.location,
            work_mode: input.workMode,
            status: 'saved',
            source_url: input.sourceUrl ?? '',
            notes: input.notes ?? '',
            created_at: now,
          },
        ]),
      }
    )

    const insertedActivities = await supabaseRestFetch<DbRow[]>(
      this.config,
      `activities?${buildQuery({ select: '*' })}`,
      {
        method: 'POST',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify([
          {
            id: activityId,
            opportunity_id: opportunityId,
            type: 'created',
            description: 'Opportunity created',
            created_at: now,
          },
        ]),
      }
    )

    return {
      opportunity: toOpportunity(insertedOpportunities[0]),
      activity: toActivity(insertedActivities[0]),
    }
  }

  async updateOpportunity(id: string, input: UpdateOpportunityInput): Promise<Opportunity | null> {
    const payload = mapOpportunityInput(input)

    const rows = await supabaseRestFetch<DbRow[]>(
      this.config,
      `opportunities?${buildQuery({ select: '*', id: `eq.${id}` })}`,
      {
        method: 'PATCH',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
      }
    )

    const updated = rows[0]
    if (!updated) return null

    if (input.followUpDate !== undefined) {
      await this.upsertFollowUp(id, input.followUpDate)
    }

    const followUpDate = await this.getFollowUpDate(id)
    return toOpportunity(updated, followUpDate)
  }

  async updateOpportunityStatus(id: string, status: OpportunityStatus): Promise<UpdateStatusResult> {
    const current = await this.getOpportunityById(id)
    if (!current) return { opportunity: null }

    const now = new Date().toISOString()
    const nextAppliedDate = status === 'applied' && !current.appliedDate ? now : current.appliedDate

    const rows = await supabaseRestFetch<DbRow[]>(
      this.config,
      `opportunities?${buildQuery({ select: '*', id: `eq.${id}` })}`,
      {
        method: 'PATCH',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          status,
          applied_date: nextAppliedDate,
        }),
      }
    )

    const updatedRow = rows[0]
    if (!updatedRow) {
      return { opportunity: null }
    }

    const opportunity = toOpportunity(updatedRow, current.followUpDate)

    if (current.status === status) {
      return { opportunity }
    }

    const activityId = safeId()

    try {
      const activityRows = await supabaseRestFetch<DbRow[]>(
        this.config,
        `activities?${buildQuery({ select: '*' })}`,
        {
          method: 'POST',
          headers: {
            Prefer: 'return=representation',
          },
          body: JSON.stringify([
            {
              id: activityId,
              opportunity_id: id,
              type: 'status_changed',
              description: `Status changed from ${current.status} to ${status}`,
              created_at: now,
              metadata: {
                fromStatus: current.status,
                toStatus: status,
              },
            },
          ]),
        }
      )

      return {
        opportunity,
        activity: toActivity(activityRows[0]),
      }
    } catch {
      return { opportunity }
    }
  }

  async deleteOpportunity(id: string): Promise<boolean> {
    await Promise.all([
      supabaseRestFetch<null>(
        this.config,
        `followups?${buildQuery({ opportunity_id: `eq.${id}` })}`,
        { method: 'DELETE' }
      ),
      supabaseRestFetch<null>(
        this.config,
        `activities?${buildQuery({ opportunity_id: `eq.${id}` })}`,
        { method: 'DELETE' }
      ),
      supabaseRestFetch<null>(this.config, `opportunities?${buildQuery({ id: `eq.${id}` })}`, {
        method: 'DELETE',
      }),
    ])

    return true
  }

  async listActivitiesByOpportunityId(opportunityId: string): Promise<ActivityItem[]> {
    const rows = await supabaseRestFetch<DbRow[]>(
      this.config,
      `activities?${buildQuery({
        select: '*',
        opportunity_id: `eq.${opportunityId}`,
        order: 'created_at.desc',
      })}`
    )

    return rows.map(toActivity)
  }

  async listActivities(): Promise<ActivityItem[]> {
    const rows = await supabaseRestFetch<DbRow[]>(
      this.config,
      `activities?${buildQuery({ select: '*', order: 'created_at.desc' })}`
    )

    return rows.map(toActivity)
  }

  private async getFollowUpDate(opportunityId: string): Promise<string | undefined> {
    const rows = await supabaseRestFetch<DbRow[]>(
      this.config,
      `followups?${buildQuery({
        select: 'follow_up_date,due_at,scheduled_for',
        opportunity_id: `eq.${opportunityId}`,
        limit: 1,
      })}`
    )

    if (!rows[0]) return undefined
    return getOptionalString(rows[0], 'follow_up_date', 'scheduled_for', 'due_at')
  }

  private async upsertFollowUp(opportunityId: string, followUpDate?: string): Promise<void> {
    if (!followUpDate) {
      await supabaseRestFetch<null>(
        this.config,
        `followups?${buildQuery({ opportunity_id: `eq.${opportunityId}` })}`,
        { method: 'DELETE' }
      )
      return
    }

    await supabaseRestFetch<DbRow[]>(
      this.config,
      `followups?${buildQuery({ on_conflict: 'opportunity_id', select: '*' })}`,
      {
        method: 'POST',
        headers: {
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify([
          {
            opportunity_id: opportunityId,
            follow_up_date: followUpDate,
          },
        ]),
      }
    )
  }
}
