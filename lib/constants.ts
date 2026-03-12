import type { OpportunityStatus, WorkMode } from './types'

// Status configuration with labels and colors
export const STATUS_CONFIG: Record<OpportunityStatus, {
  label: string
  color: string
  bgColor: string
  borderColor: string
}> = {
  saved: {
    label: 'Saved',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
  },
  applied: {
    label: 'Applied',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  interview: {
    label: 'Interview',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  offer: {
    label: 'Offer',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
}

// Work mode configuration
export const WORK_MODE_CONFIG: Record<WorkMode, {
  label: string
  color: string
  bgColor: string
}> = {
  remote: {
    label: 'Remote',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  hybrid: {
    label: 'Hybrid',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  onsite: {
    label: 'Onsite',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
}

// Pipeline column order
export const PIPELINE_STATUSES: OpportunityStatus[] = [
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
]

// Location options for filters
export const LOCATION_OPTIONS = [
  'All Locations',
  'San Francisco, CA',
  'New York, NY',
  'Toronto, Canada',
  'Oakland, CA',
  'Remote',
] as const

// Activity types with icons and labels
export const ACTIVITY_TYPE_CONFIG = {
  created: { label: 'Opportunity created' },
  status_changed: { label: 'Status changed' },
  pipeline_added: { label: 'Added to pipeline' },
  note_added: { label: 'Note added' },
  followup_set: { label: 'Follow-up set' },
} as const

// Navigation items
export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard' as const,
  },
  {
    name: 'Opportunities',
    href: '/opportunities',
    icon: 'Briefcase' as const,
  },
  {
    name: 'Pipeline',
    href: '/pipeline',
    icon: 'Kanban' as const,
  },
] as const
