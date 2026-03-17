'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type {
  ActivityItem,
  Opportunity,
  OpportunityStatus,
  CreateOpportunityInput,
  UpdateOpportunityInput,
} from '../types'
import { getOpportunitiesRepository } from '@/lib/repositories'
import { toast } from '@/hooks/use-toast'

interface OpportunitiesContextValue {
  opportunities: Opportunity[]
  activities: ActivityItem[]
  isLoading: boolean
  error: Error | null

  updateOpportunityStatus: (id: string, status: OpportunityStatus) => Promise<void>
  addOpportunity: (input: CreateOpportunityInput) => Promise<void>
  updateOpportunity: (id: string, input: UpdateOpportunityInput) => Promise<Opportunity | null>
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

  const extractErrorMessage = useCallback((err: unknown, fallback: string) => {
    if (err instanceof Error && err.message.trim()) {
      return err.message
    }

    return fallback
  }, [])

  const handleCrudError = useCallback(
    (operation: string, err: unknown, fallbackMessage: string) => {
      const message = extractErrorMessage(err, fallbackMessage)
      const nextError = new Error(message)
      console.error(`[opportunities] ${operation} failed`, err)
      setError(nextError)
      toast({
        variant: 'destructive',
        title: 'Action failed',
        description: message,
      })
    },
    [extractErrorMessage]
  )

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
      try {
        const result = await repository.updateOpportunityStatus(id, status)
        const nextOpportunity = result.opportunity
        if (!nextOpportunity) {
          handleCrudError('updateOpportunityStatus', null, 'Could not update opportunity status.')
          return
        }

        setOpportunities((prev) => prev.map((opp) => (opp.id === id ? nextOpportunity : opp)))

        const nextActivity = result.activity
        if (!nextActivity) return

        setActivities((prev) => [nextActivity, ...prev])
      } catch (err) {
        handleCrudError('updateOpportunityStatus', err, 'Could not update opportunity status.')
      }
    },
    [handleCrudError, repository]
  )

  const addOpportunity = useCallback(
    async (input: CreateOpportunityInput) => {
      setError(null)
      try {
        const result = await repository.createOpportunity(input)
        setOpportunities((prev) => [result.opportunity, ...prev])
        setActivities((prev) => [result.activity, ...prev])
      } catch (err) {
        handleCrudError('addOpportunity', err, 'Could not create opportunity.')
      }
    },
    [handleCrudError, repository]
  )

  const updateOpportunity = useCallback(
    async (id: string, input: UpdateOpportunityInput): Promise<Opportunity | null> => {
      setError(null)
      try {
        const updated = await repository.updateOpportunity(id, input)
        if (!updated) {
          handleCrudError('updateOpportunity', null, 'Could not update opportunity.')
          return null
        }

        setOpportunities((prev) => prev.map((opp) => (opp.id === id ? updated : opp)))

        if (input.followUpDate !== undefined && input.followUpDate) {
          setActivities((prev) => [
            {
              id: `activity_${Date.now()}`,
              opportunityId: id,
              type: 'followup_set',
              description: 'Follow-up date updated',
              timestamp: new Date().toISOString(),
            },
            ...prev,
          ])
        }

        return updated
      } catch (err) {
        handleCrudError('updateOpportunity', err, 'Could not update opportunity.')
        return null
      }
    },
    [handleCrudError, repository]
  )

  const deleteOpportunity = useCallback(
    async (id: string) => {
      setError(null)
      try {
        const deleted = await repository.deleteOpportunity(id)
        if (!deleted) {
          handleCrudError('deleteOpportunity', null, 'Could not delete opportunity.')
          return
        }

        setOpportunities((prev) => prev.filter((opp) => opp.id !== id))
        setActivities((prev) => prev.filter((activity) => activity.opportunityId !== id))
      } catch (err) {
        handleCrudError('deleteOpportunity', err, 'Could not delete opportunity.')
      }
    },
    [handleCrudError, repository]
  )

  const value: OpportunitiesContextValue = {
    opportunities,
    activities,
    isLoading,
    error,
    updateOpportunityStatus,
    addOpportunity,
    updateOpportunity,
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
