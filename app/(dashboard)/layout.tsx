import { AppShell } from '@/components/app-shell'
import { OpportunitiesProvider } from '@/lib/contexts/opportunities-context'
import { AuthGuard } from '@/components/auth-guard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <OpportunitiesProvider>
        <AppShell>{children}</AppShell>
      </OpportunitiesProvider>
    </AuthGuard>
  )
}
