export type OpportunityStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'

export type WorkMode = 'remote' | 'hybrid' | 'onsite'

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

export interface ActivityItem {
  id: string
  opportunityId: string
  type: 'created' | 'status_changed' | 'pipeline_added' | 'note_added' | 'followup_set'
  description: string
  timestamp: string
  metadata?: {
    fromStatus?: OpportunityStatus
    toStatus?: OpportunityStatus
  }
}

export const STATUS_LABELS: Record<OpportunityStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'Onsite',
}

export const STATUS_COLORS: Record<OpportunityStatus, string> = {
  saved: 'bg-slate-100 text-slate-700 border-slate-200',
  applied: 'bg-blue-50 text-blue-700 border-blue-200',
  interview: 'bg-amber-50 text-amber-700 border-amber-200',
  offer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}
