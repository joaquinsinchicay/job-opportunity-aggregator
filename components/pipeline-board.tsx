'use client'

import { useState } from 'react'
import { PipelineColumn } from '@/components/pipeline-column'
import type { Opportunity, OpportunityStatus } from '@/lib/types'

const PIPELINE_STATUSES: OpportunityStatus[] = [
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
]

interface PipelineBoardProps {
  opportunities: Opportunity[]
}

export function PipelineBoard({ opportunities: initialOpportunities }: PipelineBoardProps) {
  const [opportunities, setOpportunities] = useState(initialOpportunities)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<OpportunityStatus | null>(null)

  const handleDragStart = (e: React.DragEvent, opportunityId: string) => {
    setDraggedId(opportunityId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', opportunityId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, newStatus: OpportunityStatus) => {
    e.preventDefault()
    const opportunityId = e.dataTransfer.getData('text/plain')

    if (opportunityId) {
      setOpportunities((prev) =>
        prev.map((opp) =>
          opp.id === opportunityId ? { ...opp, status: newStatus } : opp
        )
      )
    }

    setDraggedId(null)
    setDragOverStatus(null)
  }

  const handleDragEnter = (status: OpportunityStatus) => {
    setDragOverStatus(status)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverStatus(null)
  }

  const getOpportunitiesByStatus = (status: OpportunityStatus) => {
    return opportunities.filter((opp) => opp.status === status)
  }

  return (
    <div 
      className="flex gap-4 overflow-x-auto pb-4"
      onDragEnd={handleDragEnd}
    >
      {PIPELINE_STATUSES.map((status) => (
        <div
          key={status}
          onDragEnter={() => handleDragEnter(status)}
        >
          <PipelineColumn
            status={status}
            opportunities={getOpportunitiesByStatus(status)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            dragOverStatus={dragOverStatus}
          />
        </div>
      ))}
    </div>
  )
}
