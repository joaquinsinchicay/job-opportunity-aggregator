'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { WorkModeBadge } from '@/components/work-mode-badge'
import type { Opportunity } from '@/lib/types'
import { formatDistanceToNow } from '@/lib/date-utils'
import { Building2, ExternalLink, MapPin, MoreHorizontal, Eye, Kanban, Pencil } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface OpportunityCardProps {
  opportunity: Opportunity
  variant?: 'default' | 'compact'
}

export function OpportunityCard({ opportunity, variant = 'default' }: OpportunityCardProps) {
  const isCompact = variant === 'compact'

  return (
    <Card className="group transition-all hover:shadow-md hover:border-primary/20">
      <CardHeader className={isCompact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/opportunities/${opportunity.id}`}
              className="block hover:underline"
            >
              <h3 className="font-semibold text-foreground truncate">
                {opportunity.title}
              </h3>
            </Link>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{opportunity.company}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/opportunities/${opportunity.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Kanban className="mr-2 h-4 w-4" />
                Add to pipeline
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className={isCompact ? 'pt-0' : ''}>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{opportunity.location}</span>
          </div>
          <WorkModeBadge workMode={opportunity.workMode} />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <StatusBadge status={opportunity.status} />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {opportunity.sourceUrl && (
              <a
                href={opportunity.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Source
              </a>
            )}
            <span>{formatDistanceToNow(opportunity.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
