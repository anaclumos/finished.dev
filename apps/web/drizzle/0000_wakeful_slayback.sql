CREATE SCHEMA IF NOT EXISTS "finished";
--> statement-breakpoint
CREATE TABLE "finished"."account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finished"."agentTasks" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"apiKeyId" text NOT NULL,
	"title" text NOT NULL,
	"status" text NOT NULL,
	"duration" integer,
	"metadata" jsonb,
	"source" text,
	"machineId" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finished"."apiKeys" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"keyHash" text NOT NULL,
	"keyPrefix" text NOT NULL,
	"lastUsedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "apiKeys_keyHash_unique" UNIQUE("keyHash")
);
--> statement-breakpoint
CREATE TABLE "finished"."pushSubscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"userAgent" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finished"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "finished"."user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "finished"."userSettings" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"pushEnabled" boolean DEFAULT true NOT NULL,
	"soundEnabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "userSettings_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "finished"."verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finished"."account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "finished"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finished"."agentTasks" ADD CONSTRAINT "agentTasks_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "finished"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finished"."agentTasks" ADD CONSTRAINT "agentTasks_apiKeyId_apiKeys_id_fk" FOREIGN KEY ("apiKeyId") REFERENCES "finished"."apiKeys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finished"."apiKeys" ADD CONSTRAINT "apiKeys_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "finished"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finished"."pushSubscriptions" ADD CONSTRAINT "pushSubscriptions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "finished"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finished"."session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "finished"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finished"."userSettings" ADD CONSTRAINT "userSettings_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "finished"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_tasks_user_id_idx" ON "finished"."agentTasks" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "agent_tasks_user_id_created_at_idx" ON "finished"."agentTasks" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "agent_tasks_api_key_id_idx" ON "finished"."agentTasks" USING btree ("apiKeyId");--> statement-breakpoint
CREATE INDEX "api_keys_user_id_idx" ON "finished"."apiKeys" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "api_keys_key_hash_idx" ON "finished"."apiKeys" USING btree ("keyHash");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_id_idx" ON "finished"."pushSubscriptions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "push_subscriptions_endpoint_idx" ON "finished"."pushSubscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "user_settings_user_id_idx" ON "finished"."userSettings" USING btree ("userId");