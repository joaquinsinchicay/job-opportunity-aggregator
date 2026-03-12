import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import type { Opportunity } from '@/lib/types'
import { formatRelativeDate } from '@/lib/date-utils'
import { Building2, Calendar, ChevronRight } from 'lucide-react'

interface FollowUpItemProps {
  opportunity: Opportunity
}

export function FollowUpItem({ opportunity }: FollowUpItemProps) {
  return (
    <Link href={`/opportunities/${opportunity.id}`}>
      <Card className="transition-all hover:shadow-md hover:border-primary/20 group">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {opportunity.title}
                </h4>
                <StatusBadge status={opportunity.status} />
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{opportunity.company}</span>
                </div>
                {opportunity.followUpDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatRelativeDate(opportunity.followUpDate)}</span>
                  </div>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
