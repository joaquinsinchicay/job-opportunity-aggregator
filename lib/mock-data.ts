/**
 * Mock Data
 * 
 * This file contains mock data for development and testing.
 * In production, this data would come from a database (e.g., Supabase).
 * 
 * The mock data is designed to showcase various states and scenarios
 * that users might encounter while using the application.
 */

import type { Opportunity, ActivityItem } from './types'

export const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Senior Product Manager',
    company: 'Stripe',
    location: 'San Francisco, CA',
    workMode: 'hybrid',
    status: 'interview',
    sourceUrl: 'https://stripe.com/jobs/senior-pm',
    notes: 'Great culture, focus on developer tools. Had initial call with recruiter.',
    createdAt: '2026-02-28T10:00:00Z',
    appliedDate: '2026-03-01T14:30:00Z',
    followUpDate: '2026-03-15T09:00:00Z',
  },
  {
    id: '2',
    title: 'Product Owner',
    company: 'Shopify',
    location: 'Toronto, Canada',
    workMode: 'remote',
    status: 'applied',
    sourceUrl: 'https://shopify.com/careers/product-owner',
    notes: 'E-commerce platform, strong product culture.',
    createdAt: '2026-03-02T09:00:00Z',
    appliedDate: '2026-03-05T11:00:00Z',
    followUpDate: '2026-03-18T10:00:00Z',
  },
  {
    id: '3',
    title: 'Business Analyst',
    company: 'Plaid',
    location: 'New York, NY',
    workMode: 'onsite',
    status: 'saved',
    sourceUrl: 'https://plaid.com/careers/ba',
    notes: 'Fintech company, interesting API products.',
    createdAt: '2026-03-08T15:00:00Z',
  },
  {
    id: '4',
    title: 'Senior Project Manager',
    company: 'Figma',
    location: 'San Francisco, CA',
    workMode: 'hybrid',
    status: 'offer',
    sourceUrl: 'https://figma.com/careers/pm',
    notes: 'Amazing design tool company. Received verbal offer!',
    createdAt: '2026-02-15T08:00:00Z',
    appliedDate: '2026-02-18T10:00:00Z',
  },
  {
    id: '5',
    title: 'Product Manager',
    company: 'Notion',
    location: 'San Francisco, CA',
    workMode: 'remote',
    status: 'rejected',
    sourceUrl: 'https://notion.so/careers/pm',
    notes: 'Did not pass final round. Good experience though.',
    createdAt: '2026-02-01T12:00:00Z',
    appliedDate: '2026-02-03T09:00:00Z',
  },
  {
    id: '6',
    title: 'Associate Product Manager',
    company: 'Vercel',
    location: 'Remote',
    workMode: 'remote',
    status: 'applied',
    sourceUrl: 'https://vercel.com/careers/apm',
    notes: 'Developer platform, exciting space. Focus on DX.',
    createdAt: '2026-03-06T14:00:00Z',
    appliedDate: '2026-03-07T16:00:00Z',
    followUpDate: '2026-03-20T10:00:00Z',
  },
  {
    id: '7',
    title: 'Technical Program Manager',
    company: 'Linear',
    location: 'San Francisco, CA',
    workMode: 'hybrid',
    status: 'saved',
    sourceUrl: 'https://linear.app/careers/tpm',
    notes: 'Modern project management tool. Small team.',
    createdAt: '2026-03-10T11:00:00Z',
  },
  {
    id: '8',
    title: 'Product Manager - Payments',
    company: 'Square',
    location: 'Oakland, CA',
    workMode: 'onsite',
    status: 'interview',
    sourceUrl: 'https://squareup.com/careers/pm-payments',
    notes: 'Focus on payments infrastructure. Second round scheduled.',
    createdAt: '2026-02-25T10:00:00Z',
    appliedDate: '2026-02-28T09:00:00Z',
    followUpDate: '2026-03-14T14:00:00Z',
  },
]

export const mockActivities: ActivityItem[] = [
  {
    id: 'a1',
    opportunityId: '1',
    type: 'created',
    description: 'Opportunity created',
    timestamp: '2026-02-28T10:00:00Z',
  },
  {
    id: 'a2',
    opportunityId: '1',
    type: 'pipeline_added',
    description: 'Added to pipeline',
    timestamp: '2026-02-28T10:05:00Z',
  },
  {
    id: 'a3',
    opportunityId: '1',
    type: 'status_changed',
    description: 'Status changed from Saved to Applied',
    timestamp: '2026-03-01T14:30:00Z',
    metadata: {
      fromStatus: 'saved',
      toStatus: 'applied',
    },
  },
  {
    id: 'a4',
    opportunityId: '1',
    type: 'status_changed',
    description: 'Status changed from Applied to Interview',
    timestamp: '2026-03-10T09:00:00Z',
    metadata: {
      fromStatus: 'applied',
      toStatus: 'interview',
    },
  },
  {
    id: 'a5',
    opportunityId: '1',
    type: 'followup_set',
    description: 'Follow-up reminder set for March 15, 2026',
    timestamp: '2026-03-10T09:05:00Z',
  },
]

export function getOpportunityById(id: string): Opportunity | undefined {
  return mockOpportunities.find((opp) => opp.id === id)
}

export function getActivitiesByOpportunityId(opportunityId: string): ActivityItem[] {
  return mockActivities.filter((activity) => activity.opportunityId === opportunityId)
}

export function getOpportunitiesByStatus(status: string): Opportunity[] {
  return mockOpportunities.filter((opp) => opp.status === status)
}

export function getUpcomingFollowUps(): Opportunity[] {
  const now = new Date()
  return mockOpportunities
    .filter((opp) => opp.followUpDate && new Date(opp.followUpDate) > now)
    .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime())
}

export function getRecentOpportunities(limit = 5): Opportunity[] {
  return [...mockOpportunities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}
