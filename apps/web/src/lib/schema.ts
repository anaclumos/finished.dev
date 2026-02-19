import {
  boolean,
  index,
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'

export const finished = pgSchema('finished')

export const user = finished.table('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const session = finished.table('session', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const account = finished.table('account', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt', {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', {
    withTimezone: true,
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const verification = finished.table('verification', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const apiKeys = finished.table(
  'apiKeys',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text('userId')
      .notNull()
      .references(() => user.id),
    name: text('name').notNull(),
    keyHash: text('keyHash').notNull().unique(),
    keyPrefix: text('keyPrefix').notNull(),
    lastUsedAt: timestamp('lastUsedAt', { withTimezone: true }),
    createdAt: timestamp('createdAt', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index('api_keys_user_id_idx').on(table.userId),
    keyHashIdx: index('api_keys_key_hash_idx').on(table.keyHash),
  })
)

export const agentTasks = finished.table(
  'agentTasks',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text('userId')
      .notNull()
      .references(() => user.id),
    apiKeyId: text('apiKeyId')
      .notNull()
      .references(() => apiKeys.id),
    title: text('title').notNull(),
    status: text('status').notNull(),
    duration: integer('duration'),
    metadata: jsonb('metadata'),
    source: text('source'),
    machineId: text('machineId'),
    createdAt: timestamp('createdAt', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index('agent_tasks_user_id_idx').on(table.userId),
    userIdCreatedAtIdx: index('agent_tasks_user_id_created_at_idx').on(
      table.userId,
      table.createdAt
    ),
    apiKeyIdIdx: index('agent_tasks_api_key_id_idx').on(table.apiKeyId),
  })
)

export const userSettings = finished.table(
  'userSettings',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text('userId')
      .notNull()
      .references(() => user.id)
      .unique(),
    pushEnabled: boolean('pushEnabled').notNull().default(true),
    soundEnabled: boolean('soundEnabled').notNull().default(true),
    createdAt: timestamp('createdAt', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index('user_settings_user_id_idx').on(table.userId),
  })
)

export const pushSubscriptions = finished.table(
  'pushSubscriptions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index('push_subscriptions_user_id_idx').on(table.userId),
    endpointIdx: index('push_subscriptions_endpoint_idx').on(table.endpoint),
  })
)

export const schema = {
  user,
  session,
  account,
  verification,
  apiKeys,
  agentTasks,
  userSettings,
  pushSubscriptions,
}

export type InsertApiKey = typeof apiKeys.$inferInsert
export type SelectApiKey = typeof apiKeys.$inferSelect

export type InsertAgentTask = typeof agentTasks.$inferInsert
export type SelectAgentTask = typeof agentTasks.$inferSelect

export type InsertUserSettings = typeof userSettings.$inferInsert
export type SelectUserSettings = typeof userSettings.$inferSelect

export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert
export type SelectPushSubscription = typeof pushSubscriptions.$inferSelect
