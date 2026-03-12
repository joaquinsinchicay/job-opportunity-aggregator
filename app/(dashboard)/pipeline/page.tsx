import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { PipelineBoard } from '@/components/pipeline-board'
import { mockOpportunities } from '@/lib/mock-data'
import { Plus } from 'lucide-react'

export default function PipelinePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 h-screen flex flex-col">
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

      <div className="mt-6 flex-1 min-h-0">
        <div className="h-full overflow-x-auto">
          <PipelineBoard opportunities={mockOpportunities} />
        </div>
      </div>
    </div>
  )
}
