'use client'

import { use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/status-badge'
import { WorkModeBadge } from '@/components/work-mode-badge'
import { PageContainer } from '@/components/layout/page-container'
import { useOpportunities } from '@/lib/contexts/opportunities-context'
import { getActivitiesByOpportunityId } from '@/lib/mock-data'
import { STATUS_CONFIG } from '@/lib/constants'
import type { OpportunityStatus } from '@/lib/types'
import { formatDate, formatDateTime } from '@/lib/date-utils'
import {
  ArrowLeft,
  Building2,
  MapPin,
  ExternalLink,
  Calendar,
  Clock,
  Pencil,
  Kanban,
  Bell,
  FileText,
  CircleDot,
  ArrowRightCircle,
  CheckCircle2,
} from 'lucide-react'

interface OpportunityDetailPageProps {
  params: Promise<{ id: string }>
}

const ACTIVITY_ICONS = {
  created: CircleDot,
  status_changed: ArrowRightCircle,
  pipeline_added: Kanban,
  note_added: FileText,
  followup_set: Bell,
}

export default function OpportunityDetailPage({
  params,
}: OpportunityDetailPageProps) {
  const { id } = use(params)
  const { getOpportunityById, updateOpportunityStatus } = useOpportunities()
  
  const opportunity = getOpportunityById(id)
  const activities = getActivitiesByOpportunityId(id)

  if (!opportunity) {
    notFound()
  }

  const handleStatusChange = (newStatus: OpportunityStatus) => {
    updateOpportunityStatus(id, newStatus)
  }

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/opportunities">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Opportunities
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {opportunity.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">{opportunity.company}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{opportunity.location}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge status={opportunity.status} />
                    <WorkModeBadge workMode={opportunity.workMode} />
                  </div>
                </div>
                {opportunity.sourceUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={opportunity.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Source
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Created
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(opportunity.createdAt)}
                  </dd>
                </div>
                {opportunity.appliedDate && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Applied
                    </dt>
                    <dd className="mt-1 flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      {formatDate(opportunity.appliedDate)}
                    </dd>
                  </div>
                )}
                {opportunity.followUpDate && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Follow-up
                    </dt>
                    <dd className="mt-1 flex items-center gap-2 text-foreground">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      {formatDate(opportunity.followUpDate)}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Work Mode
                  </dt>
                  <dd className="mt-1">
                    <WorkModeBadge workMode={opportunity.workMode} />
                  </dd>
                </div>
              </dl>

              {opportunity.notes && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Notes
                  </h4>
                  <p className="text-foreground whitespace-pre-wrap">
                    {opportunity.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <ul className="space-y-4">
                    {activities.map((activity) => {
                      const Icon = ACTIVITY_ICONS[activity.type] || CircleDot
                      return (
                        <li key={activity.id} className="relative pl-10">
                          <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(activity.timestamp)}
                            </p>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No activity recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Opportunity
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/pipeline">
                  <Kanban className="mr-2 h-4 w-4" />
                  View in Pipeline
                </Link>
              </Button>
              <Button className="w-full" variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                Set Follow-up
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Change Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={opportunity.status}
                onValueChange={(value) => handleStatusChange(value as OpportunityStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(STATUS_CONFIG) as [OpportunityStatus, { label: string }][]
                  ).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                Changing status will update the pipeline column.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
