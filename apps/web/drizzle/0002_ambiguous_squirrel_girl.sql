CREATE TABLE "finished"."pushSubscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finished"."pushSubscriptions" ADD CONSTRAINT "pushSubscriptions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "finished"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_id_idx" ON "finished"."pushSubscriptions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "push_subscriptions_endpoint_idx" ON "finished"."pushSubscriptions" USING btree ("endpoint");--> statement-breakpoint
ALTER TABLE "finished"."userSettings" DROP COLUMN "pushEndpoint";--> statement-breakpoint
ALTER TABLE "finished"."userSettings" DROP COLUMN "pushP256dh";--> statement-breakpoint
ALTER TABLE "finished"."userSettings" DROP COLUMN "pushAuth";