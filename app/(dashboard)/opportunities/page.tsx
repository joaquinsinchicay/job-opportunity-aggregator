'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/page-header'
import { OpportunityCard } from '@/components/opportunity-card'
import { EmptyState } from '@/components/empty-state'
import { mockOpportunities } from '@/lib/mock-data'
import { WORK_MODE_LABELS, type WorkMode } from '@/lib/types'
import { Plus, Search, Briefcase } from 'lucide-react'

const LOCATIONS = [
  'All Locations',
  'San Francisco, CA',
  'New York, NY',
  'Toronto, Canada',
  'Oakland, CA',
  'Remote',
]

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('All Locations')
  const [workModeFilter, setWorkModeFilter] = useState<WorkMode | 'all'>('all')

  const filteredOpportunities = useMemo(() => {
    return mockOpportunities.filter((opp) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        searchQuery === '' ||
        opp.title.toLowerCase().includes(searchLower) ||
        opp.company.toLowerCase().includes(searchLower) ||
        opp.location.toLowerCase().includes(searchLower)

      // Location filter
      const matchesLocation =
        locationFilter === 'All Locations' || opp.location === locationFilter

      // Work mode filter
      const matchesWorkMode =
        workModeFilter === 'all' || opp.workMode === workModeFilter

      return matchesSearch && matchesLocation && matchesWorkMode
    })
  }, [searchQuery, locationFilter, workModeFilter])

  const hasFilters =
    searchQuery !== '' ||
    locationFilter !== 'All Locations' ||
    workModeFilter !== 'all'

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <PageHeader
        title="Opportunities"
        description={`${mockOpportunities.length} total opportunities`}
        actions={
          <Button asChild>
            <Link href="/opportunities/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Opportunity
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Select
            value={locationFilter}
            onValueChange={setLocationFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={workModeFilter}
            onValueChange={(value) => setWorkModeFilter(value as WorkMode | 'all')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Work Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              {(Object.entries(WORK_MODE_LABELS) as [WorkMode, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6">
        {filteredOpportunities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : hasFilters ? (
          <EmptyState
            icon={Search}
            title="No results found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setLocationFilter('All Locations')
                  setWorkModeFilter('all')
                }}
              >
                Clear filters
              </Button>
            }
          />
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
      </div>
    </div>
  )
}
