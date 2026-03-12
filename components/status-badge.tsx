import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS, STATUS_COLORS, type OpportunityStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: OpportunityStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium',
        STATUS_COLORS[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}
