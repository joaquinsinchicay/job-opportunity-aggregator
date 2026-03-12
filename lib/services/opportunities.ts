/**
 * Opportunities Service Layer
 * 
 * This service provides a clean interface for managing opportunities data.
 * Currently uses mock data, but is designed to be easily replaced with
 * Supabase or another backend service.
 * 
 * Future Supabase integration example:
 * 
 * import { createClient } from '@/lib/supabase/client'
 * 
 * export async function getOpportunities() {
 *   const supabase = createClient()
 *   const { data, error } = await supabase
 *     .from('opportunities')
 *     .select('*')
 *     .order('created_at', { ascending: false })
 *   
 *   if (error) throw error
 *   return data
 * }
 */

import type { Opportunity, ActivityItem, OpportunityStatus, WorkMode, CreateOpportunityInput, UpdateOpportunityInput } from '../types'
import { mockOpportunities, mockActivities } from '../mock-data'

// Simulated delay for realistic async behavior
const SIMULATED_DELAY = 100

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get all opportunities
 */
export async function getOpportunities(): Promise<Opportunity[]> {
  await delay(SIMULATED_DELAY)
  return [...mockOpportunities]
}

/**
 * Get a single opportunity by ID
 */
export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  await delay(SIMULATED_DELAY)
  return mockOpportunities.find(opp => opp.id === id) ?? null
}

/**
 * Get opportunities filtered by status
 */
export async function getOpportunitiesByStatus(status: OpportunityStatus): Promise<Opportunity[]> {
  await delay(SIMULATED_DELAY)
  return mockOpportunities.filter(opp => opp.status === status)
}

/**
 * Get opportunities with upcoming follow-ups
 */
export async function getUpcomingFollowUps(): Promise<Opportunity[]> {
  await delay(SIMULATED_DELAY)
  const now = new Date()
  return mockOpportunities
    .filter(opp => opp.followUpDate && new Date(opp.followUpDate) > now)
    .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime())
}

/**
 * Get most recently created opportunities
 */
export async function getRecentOpportunities(limit = 5): Promise<Opportunity[]> {
  await delay(SIMULATED_DELAY)
  return [...mockOpportunities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

/**
 * Get activity items for an opportunity
 */
export async function getActivitiesByOpportunityId(opportunityId: string): Promise<ActivityItem[]> {
  await delay(SIMULATED_DELAY)
  return mockActivities
    .filter(activity => activity.opportunityId === opportunityId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

/**
 * Create a new opportunity
 */
export async function createOpportunity(input: CreateOpportunityInput): Promise<Opportunity> {
  await delay(SIMULATED_DELAY)
  
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
  
  // In a real implementation, this would insert into the database
  // mockOpportunities.push(newOpportunity)
  
  return newOpportunity
}

/**
 * Update an opportunity
 */
export async function updateOpportunity(id: string, input: UpdateOpportunityInput): Promise<Opportunity | null> {
  await delay(SIMULATED_DELAY)
  
  const index = mockOpportunities.findIndex(opp => opp.id === id)
  if (index === -1) return null
  
  const updated = { ...mockOpportunities[index], ...input }
  
  // In a real implementation, this would update the database
  // mockOpportunities[index] = updated
  
  return updated
}

/**
 * Update opportunity status
 */
export async function updateOpportunityStatus(id: string, status: OpportunityStatus): Promise<Opportunity | null> {
  return updateOpportunity(id, { status })
}

/**
 * Delete an opportunity
 */
export async function deleteOpportunity(id: string): Promise<boolean> {
  await delay(SIMULATED_DELAY)
  
  const index = mockOpportunities.findIndex(opp => opp.id === id)
  if (index === -1) return false
  
  // In a real implementation, this would delete from the database
  // mockOpportunities.splice(index, 1)
  
  return true
}

/**
 * Search opportunities
 */
export async function searchOpportunities(query: string): Promise<Opportunity[]> {
  await delay(SIMULATED_DELAY)
  
  const searchLower = query.toLowerCase()
  return mockOpportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchLower) ||
    opp.company.toLowerCase().includes(searchLower) ||
    opp.location.toLowerCase().includes(searchLower)
  )
}

/**
 * Filter opportunities
 */
export interface FilterOptions {
  search?: string
  location?: string
  workMode?: WorkMode | 'all'
  status?: OpportunityStatus | 'all'
}

export async function filterOpportunities(options: FilterOptions): Promise<Opportunity[]> {
  await delay(SIMULATED_DELAY)
  
  return mockOpportunities.filter(opp => {
    // Search filter
    if (options.search) {
      const searchLower = options.search.toLowerCase()
      const matchesSearch =
        opp.title.toLowerCase().includes(searchLower) ||
        opp.company.toLowerCase().includes(searchLower) ||
        opp.location.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }
    
    // Location filter
    if (options.location && options.location !== 'All Locations') {
      if (opp.location !== options.location) return false
    }
    
    // Work mode filter
    if (options.workMode && options.workMode !== 'all') {
      if (opp.workMode !== options.workMode) return false
    }
    
    // Status filter
    if (options.status && options.status !== 'all') {
      if (opp.status !== options.status) return false
    }
    
    return true
  })
}

/**
 * Get opportunity statistics
 */
export interface OpportunityStats {
  total: number
  saved: number
  applied: number
  interview: number
  offer: number
  rejected: number
}

export async function getOpportunityStats(): Promise<OpportunityStats> {
  await delay(SIMULATED_DELAY)
  
  return {
    total: mockOpportunities.length,
    saved: mockOpportunities.filter(o => o.status === 'saved').length,
    applied: mockOpportunities.filter(o => o.status === 'applied').length,
    interview: mockOpportunities.filter(o => o.status === 'interview').length,
    offer: mockOpportunities.filter(o => o.status === 'offer').length,
    rejected: mockOpportunities.filter(o => o.status === 'rejected').length,
  }
}
