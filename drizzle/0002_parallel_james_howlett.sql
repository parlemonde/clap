CREATE TABLE IF NOT EXISTS "scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"isDefault" boolean DEFAULT false,
	"names" json NOT NULL,
	"descriptions" json NOT NULL,
	"userId" integer,
	"themeId" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_themeId_themes_id_fk" FOREIGN KEY ("themeId") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
