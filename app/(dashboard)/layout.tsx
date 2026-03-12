import { AppShell } from '@/components/app-shell'
import { OpportunitiesProvider } from '@/lib/contexts/opportunities-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OpportunitiesProvider>
      <AppShell>{children}</AppShell>
    </OpportunitiesProvider>
  )
}
