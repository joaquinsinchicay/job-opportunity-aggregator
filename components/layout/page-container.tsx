import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  /** Use full width (no max-width constraint) */
  fullWidth?: boolean
  /** Remove default padding */
  noPadding?: boolean
}

/**
 * PageContainer provides consistent page layout structure.
 * Handles responsive padding and optional max-width constraints.
 */
export function PageContainer({
  children,
  className,
  fullWidth = false,
  noPadding = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'h-full',
        !noPadding && 'p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8',
        !fullWidth && 'max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  )
}
