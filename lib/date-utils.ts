export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)
  const diffInMonths = Math.floor(diffInDays / 30)

  if (diffInSeconds < 60) {
    return 'just now'
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`
  }
  return `${diffInMonths}mo ago`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = date.getTime() - now.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} days ago`
  }
  if (diffInDays === 0) {
    return 'Today'
  }
  if (diffInDays === 1) {
    return 'Tomorrow'
  }
  if (diffInDays < 7) {
    return `In ${diffInDays} days`
  }
  return formatDate(dateString)
}
