'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { PageContainer } from '@/components/layout/page-container'
import { PipelineBoard } from '@/components/pipeline/pipeline-board'
import { useOpportunities } from '@/lib/contexts/opportunities-context'
import { Plus } from 'lucide-react'

export default function PipelinePage() {
  const { opportunities, updateOpportunityStatus } = useOpportunities()

  return (
    <PageContainer fullWidth className="flex flex-col h-screen">
      <div className="px-4 sm:px-6 lg:px-8 pt-16 lg:pt-8">
        <PageHeader
          title="Pipeline"
          description="Manage your job applications with drag and drop"
          actions={
            <Button asChild>
              <Link href="/opportunities/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Opportunity
              </Link>
            </Button>
          }
        />
      </div>

      <div className="mt-6 flex-1 min-h-0 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="h-full overflow-x-auto">
          <PipelineBoard 
            opportunities={opportunities}
            onStatusChange={updateOpportunityStatus}
          />
        </div>
      </div>
    </PageContainer>
  )
}
