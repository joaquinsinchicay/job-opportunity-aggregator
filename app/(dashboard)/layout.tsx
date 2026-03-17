import { AppShell } from '@/components/app-shell'
import { OpportunitiesProvider } from '@/lib/contexts/opportunities-context'
import { AuthGate } from '@/components/auth/auth-gate'
import { Toaster } from '@/components/ui/toaster'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGate>
      <OpportunitiesProvider>
        <AppShell>{children}</AppShell>
        <Toaster />
      </OpportunitiesProvider>
    </AuthGate>
  )
}
