import { AppShell } from '@/components/app-shell'
import { OpportunitiesProvider } from '@/lib/contexts/opportunities-context'
import { AuthGate } from '@/components/auth/auth-gate'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGate>
      <OpportunitiesProvider>
        <AppShell>{children}</AppShell>
      </OpportunitiesProvider>
    </AuthGate>
  )
}
