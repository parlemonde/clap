ALTER TABLE "users" ADD COLUMN "plmId" integer;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_plmId_unique" UNIQUE("plmId");