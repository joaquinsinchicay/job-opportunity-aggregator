import { AppSidebar } from '@/components/app-sidebar'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 lg:pl-0">
        <div className="h-full">{children}</div>
      </main>
    </div>
  )
}
