'use client'

import { useState } from 'react'
import { PipelineColumn } from './pipeline-column'
import { PIPELINE_STATUSES } from '@/lib/constants'
import type { Opportunity, OpportunityStatus } from '@/lib/types'

interface PipelineBoardProps {
  opportunities: Opportunity[]
  onStatusChange: (id: string, status: OpportunityStatus) => void
}

export function PipelineBoard({ opportunities, onStatusChange }: PipelineBoardProps) {
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
      onStatusChange(opportunityId, newStatus)
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
      className="flex gap-4 h-full min-w-max pb-4"
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
            isDragging={draggedId !== null}
          />
        </div>
      ))}
    </div>
  )
}
