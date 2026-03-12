'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { PageContainer } from '@/components/layout/page-container'
import { StatsCard } from '@/components/stats-card'
import { OpportunityCard } from '@/components/opportunity-card'
import { FollowUpItem } from '@/components/follow-up-item'
import { EmptyState } from '@/components/empty-state'
import { useOpportunities } from '@/lib/contexts/opportunities-context'
import { getOpportunityStats, getRecentOpportunities, getUpcomingFollowUps } from '@/lib/selectors/opportunities'
import { useMemo } from 'react'
import {
  Plus,
  Briefcase,
  BookmarkCheck,
  Send,
  Users,
  Trophy,
  XCircle,
  Calendar,
  Clock,
} from 'lucide-react'

export default function DashboardPage() {
  const { opportunities } = useOpportunities()

  const stats = useMemo(() => getOpportunityStats(opportunities), [opportunities])
  const upcomingFollowUps = useMemo(() => getUpcomingFollowUps(opportunities), [opportunities])
  const recentOpportunities = useMemo(() => getRecentOpportunities(opportunities, 4), [opportunities])

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Track your job search progress"
        actions={
          <Button asChild>
            <Link href="/opportunities/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Opportunity
            </Link>
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Total"
          value={stats.total}
          icon={Briefcase}
          iconClassName="bg-slate-100 text-slate-700"
        />
        <StatsCard
          title="Saved"
          value={stats.saved}
          icon={BookmarkCheck}
          iconClassName="bg-slate-100 text-slate-700"
        />
        <StatsCard
          title="Applied"
          value={stats.applied}
          icon={Send}
          iconClassName="bg-blue-50 text-blue-700"
        />
        <StatsCard
          title="Interview"
          value={stats.interview}
          icon={Users}
          iconClassName="bg-amber-50 text-amber-700"
        />
        <StatsCard
          title="Offer"
          value={stats.offer}
          icon={Trophy}
          iconClassName="bg-emerald-50 text-emerald-700"
        />
        <StatsCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          iconClassName="bg-red-50 text-red-700"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Upcoming Follow-ups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingFollowUps.length > 0 ? (
              <div className="space-y-3">
                {upcomingFollowUps.slice(0, 4).map((opportunity) => (
                  <FollowUpItem key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No follow-ups scheduled"
                description="Set follow-up reminders for your opportunities to stay on top of your applications."
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Opportunities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-primary" />
              Recent Opportunities
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/opportunities">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOpportunities.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {recentOpportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    variant="compact"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Briefcase}
                title="No opportunities yet"
                description="Start tracking your job search by adding your first opportunity."
                action={
                  <Button asChild>
                    <Link href="/opportunities/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Opportunity
                    </Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
