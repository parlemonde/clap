ALTER TABLE "projects" ADD COLUMN "collaborationCodeHash" varchar(100);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "collaborationCodeExpiresAt" timestamp;