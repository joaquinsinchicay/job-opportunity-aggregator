'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { WorkModeBadge } from '@/components/work-mode-badge'
import type { Opportunity } from '@/lib/types'
import { formatDate } from '@/lib/date-utils'
import { Building2, MapPin, Calendar, GripVertical } from 'lucide-react'

interface PipelineCardProps {
  opportunity: Opportunity
  onDragStart: (e: React.DragEvent, id: string) => void
}

export function PipelineCard({ opportunity, onDragStart }: PipelineCardProps) {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, opportunity.id)}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="min-w-0 flex-1">
            <Link
              href={`/opportunities/${opportunity.id}`}
              className="block hover:underline"
              draggable={false}
            >
              <h4 className="font-medium text-sm text-foreground truncate">
                {opportunity.title}
              </h4>
            </Link>
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{opportunity.company}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{opportunity.location}</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <WorkModeBadge workMode={opportunity.workMode} size="sm" />
              {opportunity.appliedDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(opportunity.appliedDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
