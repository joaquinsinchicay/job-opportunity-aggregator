'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type {
  ActivityItem,
  Opportunity,
  OpportunityStatus,
  CreateOpportunityInput,
  OpportunityStats,
} from '../types'
import { opportunitiesRepository } from '@/lib/repositories'
import {
  getOpportunityStats,
  getRecentOpportunities,
  getUpcomingFollowUps,
} from '@/lib/selectors/opportunities'

interface OpportunitiesContextValue {
  opportunities: Opportunity[]
  activities: ActivityItem[]
  isLoading: boolean
  error: Error | null

  // Actions
  updateOpportunityStatus: (id: string, status: OpportunityStatus) => Promise<void>
  addOpportunity: (input: CreateOpportunityInput) => Promise<Opportunity>
  deleteOpportunity: (id: string) => Promise<void>
  refreshOpportunities: () => Promise<void>

  // Computed values
  getOpportunityById: (id: string) => Opportunity | undefined
  getOpportunitiesByStatus: (status: OpportunityStatus) => Opportunity[]
  getActivitiesByOpportunityId: (opportunityId: string) => ActivityItem[]
  getUpcomingFollowUps: () => Opportunity[]
  getRecentOpportunities: (limit?: number) => Opportunity[]
  getStats: () => OpportunityStats
}

const OpportunitiesContext = createContext<OpportunitiesContextValue | undefined>(undefined)

interface OpportunitiesProviderProps {
  children: ReactNode
  initialData?: Opportunity[]
}

export function OpportunitiesProvider({ children, initialData }: OpportunitiesProviderProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialData ?? [])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<Error | null>(null)

  const refreshOpportunities = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [nextOpportunities, nextActivities] = await Promise.all([
        opportunitiesRepository.listOpportunities(),
        opportunitiesRepository.listActivities(),
      ])
      setOpportunities(nextOpportunities)
      setActivities(nextActivities)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load opportunities'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialData) {
      void refreshOpportunities()
    }
  }, [initialData, refreshOpportunities])

  const updateOpportunityStatus = useCallback(async (id: string, status: OpportunityStatus) => {
    setError(null)
    const updated = await opportunitiesRepository.updateOpportunityStatus(id, status)
    if (!updated) return

    setOpportunities((prev) => prev.map((opp) => (opp.id === id ? updated : opp)))
    const nextActivities = await opportunitiesRepository.listActivitiesByOpportunityId(id)
    setActivities((prev) => {
      const withoutCurrent = prev.filter((activity) => activity.opportunityId !== id)
      return [...nextActivities, ...withoutCurrent]
    })
  }, [])

  const addOpportunity = useCallback(async (input: CreateOpportunityInput): Promise<Opportunity> => {
    setError(null)
    const created = await opportunitiesRepository.createOpportunity(input)
    setOpportunities((prev) => [created, ...prev])
    const nextActivities = await opportunitiesRepository.listActivitiesByOpportunityId(created.id)
    setActivities((prev) => [...nextActivities, ...prev])
    return created
  }, [])

  const deleteOpportunity = useCallback(async (id: string) => {
    setError(null)
    await opportunitiesRepository.deleteOpportunity(id)
    setOpportunities((prev) => prev.filter((opp) => opp.id !== id))
    setActivities((prev) => prev.filter((activity) => activity.opportunityId !== id))
  }, [])

  const getOpportunityById = useCallback(
    (id: string) => opportunities.find((opp) => opp.id === id),
    [opportunities]
  )

  const getOpportunitiesByStatus = useCallback(
    (status: OpportunityStatus) => opportunities.filter((opp) => opp.status === status),
    [opportunities]
  )

  const getActivitiesByOpportunityId = useCallback(
    (opportunityId: string) =>
      activities
        .filter((activity) => activity.opportunityId === opportunityId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [activities]
  )

  const getUpcomingFollowUpsMemo = useCallback(() => getUpcomingFollowUps(opportunities), [opportunities])

  const getRecentOpportunitiesMemo = useCallback(
    (limit = 5) => getRecentOpportunities(opportunities, limit),
    [opportunities]
  )

  const getStatsMemo = useCallback(() => getOpportunityStats(opportunities), [opportunities])

  const value: OpportunitiesContextValue = {
    opportunities,
    activities,
    isLoading,
    error,
    updateOpportunityStatus,
    addOpportunity,
    deleteOpportunity,
    refreshOpportunities,
    getOpportunityById,
    getOpportunitiesByStatus,
    getActivitiesByOpportunityId,
    getUpcomingFollowUps: getUpcomingFollowUpsMemo,
    getRecentOpportunities: getRecentOpportunitiesMemo,
    getStats: getStatsMemo,
  }

  return <OpportunitiesContext.Provider value={value}>{children}</OpportunitiesContext.Provider>
}

export function useOpportunities() {
  const context = useContext(OpportunitiesContext)
  if (context === undefined) {
    throw new Error('useOpportunities must be used within an OpportunitiesProvider')
  }
  return context
}
