import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { STATUS_CONFIG } from '@/lib/constants'
import type { OpportunityStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: OpportunityStatus
  size?: 'default' | 'sm'
  className?: string
}

export function StatusBadge({ status, size = 'default', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const isSmall = size === 'sm'

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
        config.bgColor,
        config.color,
        config.borderColor,
        isSmall && 'text-xs px-1.5 py-0',
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
