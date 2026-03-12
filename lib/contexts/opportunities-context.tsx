'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Opportunity, OpportunityStatus, CreateOpportunityInput } from '../types'
import { mockOpportunities } from '../mock-data'

/**
 * Opportunities Context
 * 
 * Provides global state management for opportunities data.
 * This context enables optimistic updates and state sharing across components.
 * 
 * In a real implementation, this would integrate with SWR or React Query
 * for server state management with Supabase.
 */

interface OpportunitiesContextValue {
  opportunities: Opportunity[]
  isLoading: boolean
  error: Error | null
  
  // Actions
  updateOpportunityStatus: (id: string, status: OpportunityStatus) => void
  addOpportunity: (input: CreateOpportunityInput) => Opportunity
  deleteOpportunity: (id: string) => void
  refreshOpportunities: () => void
  
  // Computed values
  getOpportunityById: (id: string) => Opportunity | undefined
  getOpportunitiesByStatus: (status: OpportunityStatus) => Opportunity[]
  getUpcomingFollowUps: () => Opportunity[]
  getRecentOpportunities: (limit?: number) => Opportunity[]
  getStats: () => {
    total: number
    saved: number
    applied: number
    interview: number
    offer: number
    rejected: number
  }
}

const OpportunitiesContext = createContext<OpportunitiesContextValue | undefined>(undefined)

interface OpportunitiesProviderProps {
  children: ReactNode
  initialData?: Opportunity[]
}

export function OpportunitiesProvider({ children, initialData }: OpportunitiesProviderProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialData ?? mockOpportunities)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateOpportunityStatus = useCallback((id: string, status: OpportunityStatus) => {
    setOpportunities(prev =>
      prev.map(opp =>
        opp.id === id
          ? {
              ...opp,
              status,
              appliedDate: status === 'applied' && !opp.appliedDate
                ? new Date().toISOString()
                : opp.appliedDate,
            }
          : opp
      )
    )
  }, [])

  const addOpportunity = useCallback((input: CreateOpportunityInput): Opportunity => {
    const newOpportunity: Opportunity = {
      id: `opp_${Date.now()}`,
      title: input.title,
      company: input.company,
      location: input.location,
      workMode: input.workMode,
      status: 'saved',
      sourceUrl: input.sourceUrl ?? '',
      notes: input.notes ?? '',
      createdAt: new Date().toISOString(),
    }
    
    setOpportunities(prev => [newOpportunity, ...prev])
    return newOpportunity
  }, [])

  const deleteOpportunity = useCallback((id: string) => {
    setOpportunities(prev => prev.filter(opp => opp.id !== id))
  }, [])

  const refreshOpportunities = useCallback(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setOpportunities(mockOpportunities)
      setIsLoading(false)
    }, 100)
  }, [])

  const getOpportunityById = useCallback((id: string) => {
    return opportunities.find(opp => opp.id === id)
  }, [opportunities])

  const getOpportunitiesByStatus = useCallback((status: OpportunityStatus) => {
    return opportunities.filter(opp => opp.status === status)
  }, [opportunities])

  const getUpcomingFollowUps = useCallback(() => {
    const now = new Date()
    return opportunities
      .filter(opp => opp.followUpDate && new Date(opp.followUpDate) > now)
      .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime())
  }, [opportunities])

  const getRecentOpportunities = useCallback((limit = 5) => {
    return [...opportunities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }, [opportunities])

  const getStats = useCallback(() => ({
    total: opportunities.length,
    saved: opportunities.filter(o => o.status === 'saved').length,
    applied: opportunities.filter(o => o.status === 'applied').length,
    interview: opportunities.filter(o => o.status === 'interview').length,
    offer: opportunities.filter(o => o.status === 'offer').length,
    rejected: opportunities.filter(o => o.status === 'rejected').length,
  }), [opportunities])

  const value: OpportunitiesContextValue = {
    opportunities,
    isLoading,
    error,
    updateOpportunityStatus,
    addOpportunity,
    deleteOpportunity,
    refreshOpportunities,
    getOpportunityById,
    getOpportunitiesByStatus,
    getUpcomingFollowUps,
    getRecentOpportunities,
    getStats,
  }

  return (
    <OpportunitiesContext.Provider value={value}>
      {children}
    </OpportunitiesContext.Provider>
  )
}

export function useOpportunities() {
  const context = useContext(OpportunitiesContext)
  if (context === undefined) {
    throw new Error('useOpportunities must be used within an OpportunitiesProvider')
  }
  return context
}
