/**
 * @deprecated This module is for legacy development scripts only.
 * Runtime application code should consume data through repositories/selectors.
 */

import { MOCK_ACTIVITIES } from './data/mock/activities'
import { MOCK_OPPORTUNITIES } from './data/mock/opportunities'

export const mockOpportunities = [...MOCK_OPPORTUNITIES]
export const mockActivities = [...MOCK_ACTIVITIES]
