import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  iconClassName?: string
  href?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconClassName,
}: StatsCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg',
              iconClassName || 'bg-primary/10 text-primary'
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
