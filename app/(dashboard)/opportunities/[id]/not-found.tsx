import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/page-container'
import { EmptyState } from '@/components/empty-state'
import { FileQuestion } from 'lucide-react'

export default function OpportunityNotFound() {
  return (
    <PageContainer className="flex items-center justify-center min-h-[60vh]">
      <EmptyState
        icon={FileQuestion}
        title="Opportunity not found"
        description="The opportunity you're looking for doesn't exist or may have been removed."
        action={
          <Button asChild>
            <Link href="/opportunities">Back to Opportunities</Link>
          </Button>
        }
      />
    </PageContainer>
  )
}
