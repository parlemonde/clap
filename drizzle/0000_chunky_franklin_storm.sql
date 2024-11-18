CREATE TABLE IF NOT EXISTS "themes" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"isDefault" boolean DEFAULT false,
	"imageUrl" varchar(2000),
	"names" json NOT NULL,
	"userId" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(150) NOT NULL,
	"name" varchar(150) NOT NULL,
	"passwordHash" char(100) NOT NULL,
	"accountRegistration" smallint DEFAULT 0 NOT NULL,
	"role" varchar(150) DEFAULT 'teacher' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "themes" ADD CONSTRAINT "themes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
