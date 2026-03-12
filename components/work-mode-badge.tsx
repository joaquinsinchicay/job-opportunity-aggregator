import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { WORK_MODE_CONFIG } from '@/lib/constants'
import type { WorkMode } from '@/lib/types'
import { Home, Building2, MapPin } from 'lucide-react'

interface WorkModeBadgeProps {
  workMode: WorkMode
  size?: 'default' | 'sm'
  className?: string
}

const ICONS = {
  remote: Home,
  hybrid: Building2,
  onsite: MapPin,
}

export function WorkModeBadge({ workMode, size = 'default', className }: WorkModeBadgeProps) {
  const config = WORK_MODE_CONFIG[workMode]
  const Icon = ICONS[workMode]
  const isSmall = size === 'sm'

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-normal border gap-1',
        config.bgColor,
        config.color,
        isSmall && 'text-xs px-1.5 py-0',
        className
      )}
    >
      <Icon className={cn(isSmall ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
      {config.label}
    </Badge>
  )
}
