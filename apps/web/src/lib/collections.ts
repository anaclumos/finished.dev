import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { createCollection } from '@tanstack/react-db'
import { getQueryClient } from './query-client'

interface AgentTask {
  id: string
  userId: string
  apiKeyId: string
  title: string
  status: string
  duration: number | null
  metadata: unknown
  source: string | null
  machineId: string | null
  createdAt: string
}

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  lastUsedAt: string | null
  createdAt: string
}

interface UserSettings {
  id: string
  userId: string
  pushEnabled: boolean
  soundEnabled: boolean
}

export const agentTasksCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['agent-tasks'],
    queryFn: async () => {
      const res = await fetch('/api/agent-tasks?limit=50', {
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error('Failed to fetch tasks')
      }
      return res.json() as Promise<AgentTask[]>
    },
    queryClient: getQueryClient(),
    getKey: (item) => item.id,
  })
)

export const apiKeysCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await fetch('/api/api-keys', { credentials: 'include' })
      if (!res.ok) {
        throw new Error('Failed to fetch API keys')
      }
      return res.json() as Promise<ApiKey[]>
    },
    queryClient: getQueryClient(),
    getKey: (item) => item.id,
  })
)

export const userSettingsCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const res = await fetch('/api/user-settings', { credentials: 'include' })
      if (!res.ok) {
        throw new Error('Failed to fetch settings')
      }
      const data = (await res.json()) as UserSettings
      return [data]
    },
    queryClient: getQueryClient(),
    getKey: (item) => item.id,
  })
)
