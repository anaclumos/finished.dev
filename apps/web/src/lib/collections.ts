import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { createCollection } from '@tanstack/react-db'
import { getQueryClient } from './query-client'
import type {
  SelectAgentTask,
  SelectApiKey,
  SelectUserSettings,
} from './schema'

/** Converts Date fields to strings to match JSON-serialized API responses */
type Serialized<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
      ? string | null
      : T[K]
}

type AgentTask = Serialized<SelectAgentTask>
export type ApiKey = Serialized<
  Pick<SelectApiKey, 'id' | 'name' | 'keyPrefix' | 'lastUsedAt' | 'createdAt'>
>
type UserSettings = Serialized<
  Pick<SelectUserSettings, 'id' | 'userId' | 'pushEnabled' | 'soundEnabled'>
>

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
