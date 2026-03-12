'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { ActivityItem, Opportunity, OpportunityStatus, CreateOpportunityInput } from '../types'
import { getOpportunitiesRepository } from '@/lib/repositories'

interface OpportunitiesContextValue {
  opportunities: Opportunity[]
  activities: ActivityItem[]
  isLoading: boolean
  error: Error | null

  updateOpportunityStatus: (id: string, status: OpportunityStatus) => Promise<void>
  addOpportunity: (input: CreateOpportunityInput) => Promise<void>
  deleteOpportunity: (id: string) => Promise<void>
  refreshOpportunities: () => Promise<void>
}

const OpportunitiesContext = createContext<OpportunitiesContextValue | undefined>(undefined)

interface OpportunitiesProviderProps {
  children: ReactNode
  initialData?: Opportunity[]
}

export function OpportunitiesProvider({ children, initialData }: OpportunitiesProviderProps) {
  const repository = getOpportunitiesRepository()
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialData ?? [])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<Error | null>(null)

  const refreshOpportunities = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [nextOpportunities, nextActivities] = await Promise.all([
        repository.listOpportunities(),
        repository.listActivities(),
      ])
      setOpportunities(nextOpportunities)
      setActivities(nextActivities)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load opportunities'))
    } finally {
      setIsLoading(false)
    }
  }, [repository])

  useEffect(() => {
    if (!initialData) {
      void refreshOpportunities()
    }
  }, [initialData, refreshOpportunities])

  const updateOpportunityStatus = useCallback(
    async (id: string, status: OpportunityStatus) => {
      setError(null)
      const result = await repository.updateOpportunityStatus(id, status)
      if (!result.opportunity) return

      setOpportunities((prev) => prev.map((opp) => (opp.id === id ? result.opportunity! : opp)))
      if (!result.activity) return

      setActivities((prev) => [result.activity!, ...prev])
    },
    [repository]
  )

  const addOpportunity = useCallback(
    async (input: CreateOpportunityInput) => {
      setError(null)
      const result = await repository.createOpportunity(input)
      setOpportunities((prev) => [result.opportunity, ...prev])
      setActivities((prev) => [result.activity, ...prev])
    },
    [repository]
  )

  const deleteOpportunity = useCallback(
    async (id: string) => {
      setError(null)
      await repository.deleteOpportunity(id)
      setOpportunities((prev) => prev.filter((opp) => opp.id !== id))
      setActivities((prev) => prev.filter((activity) => activity.opportunityId !== id))
    },
    [repository]
  )

  const value: OpportunitiesContextValue = {
    opportunities,
    activities,
    isLoading,
    error,
    updateOpportunityStatus,
    addOpportunity,
    deleteOpportunity,
    refreshOpportunities,
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
