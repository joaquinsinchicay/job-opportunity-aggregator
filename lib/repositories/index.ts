import type { ActivityItem, Opportunity } from '@/lib/types'
import {
  InMemoryOpportunitiesRepository,
  type OpportunitiesRepository,
} from './opportunities-repository'

export type OpportunitiesRepositoryKind = 'memory'

export interface CreateOpportunitiesRepositoryOptions {
  kind?: OpportunitiesRepositoryKind
  seed?: {
    opportunities?: Opportunity[]
    activities?: ActivityItem[]
  }
}

export function createOpportunitiesRepository(
  options: CreateOpportunitiesRepositoryOptions = {}
): OpportunitiesRepository {
  const kind = options.kind ?? 'memory'

  if (kind === 'memory') {
    return new InMemoryOpportunitiesRepository(options.seed)
  }

  return new InMemoryOpportunitiesRepository(options.seed)
}

let repositoryInstance: OpportunitiesRepository | undefined

export function getOpportunitiesRepository(): OpportunitiesRepository {
  if (!repositoryInstance) {
    repositoryInstance = createOpportunitiesRepository({
      kind: (process.env.NEXT_PUBLIC_OPPORTUNITIES_REPOSITORY_KIND as OpportunitiesRepositoryKind | undefined) ??
        'memory',
    })
  }

  return repositoryInstance
}

export function setOpportunitiesRepository(repository: OpportunitiesRepository) {
  repositoryInstance = repository
}
