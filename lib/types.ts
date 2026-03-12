// Core entity types
export type OpportunityStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'

export type WorkMode = 'remote' | 'hybrid' | 'onsite'

export type ActivityType = 'created' | 'status_changed' | 'pipeline_added' | 'note_added' | 'followup_set'

/**
 * Opportunity entity
 * Represents a job opportunity in the user's pipeline
 */
export interface Opportunity {
  id: string
  title: string
  company: string
  location: string
  workMode: WorkMode
  status: OpportunityStatus
  sourceUrl: string
  notes: string
  createdAt: string
  appliedDate?: string
  followUpDate?: string
}

/**
 * Activity item for tracking opportunity timeline
 */
export interface ActivityItem {
  id: string
  opportunityId: string
  type: ActivityType
  description: string
  timestamp: string
  metadata?: {
    fromStatus?: OpportunityStatus
    toStatus?: OpportunityStatus
  }
}

// Input types for creating/updating entities
// These prepare the codebase for future Supabase integration

/**
 * Input for creating a new opportunity
 */
export interface CreateOpportunityInput {
  title: string
  company: string
  location: string
  workMode: WorkMode
  sourceUrl?: string
  notes?: string
}

/**
 * Input for updating an opportunity
 */
export interface UpdateOpportunityInput {
  title?: string
  company?: string
  location?: string
  workMode?: WorkMode
  status?: OpportunityStatus
  sourceUrl?: string
  notes?: string
  appliedDate?: string
  followUpDate?: string
}


export interface OpportunityStats {
  total: number
  saved: number
  applied: number
  interview: number
  offer: number
  rejected: number
}

// Legacy exports for backward compatibility
// These are deprecated and will be removed in a future version
// Use STATUS_CONFIG and WORK_MODE_CONFIG from constants.ts instead

/** @deprecated Use STATUS_CONFIG from constants.ts */
export const STATUS_LABELS: Record<OpportunityStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

/** @deprecated Use WORK_MODE_CONFIG from constants.ts */
export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'Onsite',
}

/** @deprecated Use STATUS_CONFIG from constants.ts */
export const STATUS_COLORS: Record<OpportunityStatus, string> = {
  saved: 'bg-slate-100 text-slate-700 border-slate-200',
  applied: 'bg-blue-50 text-blue-700 border-blue-200',
  interview: 'bg-amber-50 text-amber-700 border-amber-200',
  offer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}
