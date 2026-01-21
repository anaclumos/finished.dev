import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const agents = pgTable(
  "agents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("agents_user_name_unique").on(table.userId, table.name),
    index("agents_user_idx").on(table.userId),
  ],
);

export const agentEvents = pgTable(
  "agent_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    providerEventId: text("provider_event_id").notNull(),
    payload: jsonb("payload").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("agent_events_dedupe_unique").on(
      table.agentId,
      table.providerEventId,
    ),
    index("agent_events_agent_idx").on(table.agentId),
  ],
);

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("push_subscriptions_user_endpoint_unique").on(
      table.userId,
      table.endpoint,
    ),
    index("push_subscriptions_user_idx").on(table.userId),
  ],
);

export const webhookInbox = pgTable(
  "webhook_inbox",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    providerEventId: text("provider_event_id").notNull(),
    payload: jsonb("payload").notNull(),
    status: text("status").notNull().default("pending"),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("webhook_inbox_provider_event_unique").on(
      table.provider,
      table.providerEventId,
    ),
    index("webhook_inbox_provider_idx").on(table.provider),
  ],
);

export const notificationJobs = pgTable(
  "notification_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    sourceInboxId: uuid("source_inbox_id").references(() => webhookInbox.id, {
      onDelete: "set null",
    }),
    channel: text("channel").notNull(),
    dedupeKey: text("dedupe_key").notNull(),
    payload: jsonb("payload").notNull(),
    status: text("status").notNull().default("pending"),
    runAt: timestamp("run_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("notification_jobs_dedupe_unique").on(table.dedupeKey),
    index("notification_jobs_status_idx").on(table.status),
    index("notification_jobs_run_at_idx").on(table.runAt),
  ],
);
