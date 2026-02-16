import { format, formatDistanceToNowStrict } from 'date-fns'

const SECONDS_RE = / seconds?/
const MINUTES_RE = / minutes?/
const HOURS_RE = / hours?/
const DAYS_RE = / days?/

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < 60_000) {
    return 'just now'
  }

  const distance = formatDistanceToNowStrict(timestamp, { addSuffix: true })
  return distance
    .replace(SECONDS_RE, 's')
    .replace(MINUTES_RE, 'm')
    .replace(HOURS_RE, 'h')
    .replace(DAYS_RE, 'd')
}

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(1)}s`
  }
  if (ms < 3_600_000) {
    return `${(ms / 60_000).toFixed(1)}m`
  }
  return `${(ms / 3_600_000).toFixed(1)}h`
}

export function formatDate(timestamp: string | number | Date): string {
  return format(new Date(timestamp), 'MMM d, yyyy')
}
