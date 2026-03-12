import { Badge } from '@/components/ui/badge'
import { WORK_MODE_LABELS, type WorkMode } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MapPin, Home, Building2 } from 'lucide-react'

interface WorkModeBadgeProps {
  workMode: WorkMode
  className?: string
}

const WORK_MODE_ICONS: Record<WorkMode, React.ReactNode> = {
  remote: <Home className="h-3 w-3" />,
  hybrid: <Building2 className="h-3 w-3" />,
  onsite: <MapPin className="h-3 w-3" />,
}

export function WorkModeBadge({ workMode, className }: WorkModeBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1 font-normal text-muted-foreground',
        className
      )}
    >
      {WORK_MODE_ICONS[workMode]}
      {WORK_MODE_LABELS[workMode]}
    </Badge>
  )
}
