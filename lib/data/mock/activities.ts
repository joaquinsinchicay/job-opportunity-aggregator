import type { ActivityItem } from '@/lib/types'

export const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'a1',
    opportunityId: '1',
    type: 'created',
    description: 'Opportunity created',
    timestamp: '2026-02-28T10:00:00Z',
  },
  {
    id: 'a2',
    opportunityId: '1',
    type: 'pipeline_added',
    description: 'Added to pipeline',
    timestamp: '2026-02-28T10:05:00Z',
  },
  {
    id: 'a3',
    opportunityId: '1',
    type: 'status_changed',
    description: 'Status changed from Saved to Applied',
    timestamp: '2026-03-01T14:30:00Z',
    metadata: {
      fromStatus: 'saved',
      toStatus: 'applied',
    },
  },
  {
    id: 'a4',
    opportunityId: '1',
    type: 'status_changed',
    description: 'Status changed from Applied to Interview',
    timestamp: '2026-03-10T09:00:00Z',
    metadata: {
      fromStatus: 'applied',
      toStatus: 'interview',
    },
  },
  {
    id: 'a5',
    opportunityId: '1',
    type: 'followup_set',
    description: 'Follow-up reminder set for March 15, 2026',
    timestamp: '2026-03-10T09:05:00Z',
  },
]
