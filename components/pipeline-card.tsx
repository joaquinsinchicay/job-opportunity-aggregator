'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { Opportunity } from '@/lib/types'
import { formatDate } from '@/lib/date-utils'
import { Building2, MapPin, Calendar, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PipelineCardProps {
  opportunity: Opportunity
  isDragging?: boolean
}

export function PipelineCard({ opportunity, isDragging }: PipelineCardProps) {
  return (
    <Link href={`/opportunities/${opportunity.id}`}>
      <Card
        className={cn(
          'cursor-grab active:cursor-grabbing transition-all group',
          'hover:shadow-md hover:border-primary/20',
          isDragging && 'shadow-lg border-primary/30 rotate-2 scale-105'
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0 group-hover:text-muted-foreground transition-colors" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                {opportunity.title}
              </h4>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{opportunity.company}</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{opportunity.location}</span>
              </div>
              {opportunity.appliedDate && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span>Applied {formatDate(opportunity.appliedDate)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
