'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PipelineCard } from './pipeline-card'
import { STATUS_CONFIG } from '@/lib/constants'
import type { Opportunity, OpportunityStatus } from '@/lib/types'
import { Briefcase } from 'lucide-react'

interface PipelineColumnProps {
  status: OpportunityStatus
  opportunities: Opportunity[]
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: OpportunityStatus) => void
  dragOverStatus: OpportunityStatus | null
  isDragging?: boolean
}

export function PipelineColumn({
  status,
  opportunities,
  onDragStart,
  onDragOver,
  onDrop,
  dragOverStatus,
  isDragging = false,
}: PipelineColumnProps) {
  const config = STATUS_CONFIG[status]
  const isDropTarget = dragOverStatus === status

  return (
    <Card
      className={cn(
        'w-72 flex flex-col h-full transition-all duration-200',
        isDropTarget && isDragging && 'ring-2 ring-primary ring-offset-2 bg-primary/5'
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', config.bgColor)} />
            {config.label}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {opportunities.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {opportunities.length > 0 ? (
          <div className="space-y-3">
            {opportunities.map((opportunity) => (
              <PipelineCard
                key={opportunity.id}
                opportunity={opportunity}
                onDragStart={onDragStart}
              />
            ))}
          </div>
        ) : (
          <div className={cn(
            'flex flex-col items-center justify-center py-8 px-4 text-center border-2 border-dashed rounded-lg',
            isDropTarget && isDragging ? 'border-primary bg-primary/5' : 'border-muted'
          )}>
            <Briefcase className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {isDragging ? 'Drop here' : 'No opportunities'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
