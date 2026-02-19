DROP TABLE "finished"."pushSubscriptions" CASCADE;--> statement-breakpoint
ALTER TABLE "finished"."userSettings" ADD COLUMN "pushEndpoint" text;--> statement-breakpoint
ALTER TABLE "finished"."userSettings" ADD COLUMN "pushP256dh" text;--> statement-breakpoint
ALTER TABLE "finished"."userSettings" ADD COLUMN "pushAuth" text;