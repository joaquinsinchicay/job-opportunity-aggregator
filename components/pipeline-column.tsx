'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PipelineCard } from '@/components/pipeline-card'
import { EmptyState } from '@/components/empty-state'
import type { Opportunity, OpportunityStatus } from '@/lib/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Inbox } from 'lucide-react'

interface PipelineColumnProps {
  status: OpportunityStatus
  opportunities: Opportunity[]
  onDragStart: (e: React.DragEvent, opportunityId: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: OpportunityStatus) => void
  dragOverStatus: OpportunityStatus | null
}

const COLUMN_HEADER_COLORS: Record<OpportunityStatus, string> = {
  saved: 'bg-slate-50 border-slate-200',
  applied: 'bg-blue-50 border-blue-200',
  interview: 'bg-amber-50 border-amber-200',
  offer: 'bg-emerald-50 border-emerald-200',
  rejected: 'bg-red-50 border-red-200',
}

export function PipelineColumn({
  status,
  opportunities,
  onDragStart,
  onDragOver,
  onDrop,
  dragOverStatus,
}: PipelineColumnProps) {
  const isDropTarget = dragOverStatus === status

  return (
    <Card
      className={cn(
        'flex flex-col min-w-[280px] max-w-[320px] h-full transition-all',
        isDropTarget && 'ring-2 ring-primary/50 bg-primary/5'
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <CardHeader
        className={cn(
          'py-3 px-4 border-b',
          COLUMN_HEADER_COLORS[status]
        )}
      >
        <CardTitle className="flex items-center justify-between text-sm font-semibold">
          <span className={cn('', STATUS_COLORS[status].replace('bg-', 'text-').replace('-50', '-700').replace('-100', '-700'))}>
            {STATUS_LABELS[status]}
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-medium">
            {opportunities.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3">
        {opportunities.length > 0 ? (
          <div className="space-y-3">
            {opportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                draggable
                onDragStart={(e) => onDragStart(e, opportunity.id)}
              >
                <PipelineCard opportunity={opportunity} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <EmptyState
              icon={Inbox}
              title="No items"
              description="Drag opportunities here"
              className="py-4"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
