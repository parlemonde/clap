ALTER TABLE "projects" ADD COLUMN "collaborationCode" varchar(6);--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "collaborationCodeHash";