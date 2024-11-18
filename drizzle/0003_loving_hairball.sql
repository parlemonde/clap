CREATE TABLE IF NOT EXISTS "question-templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" varchar(280) NOT NULL,
	"index" integer DEFAULT 0 NOT NULL,
	"languageCode" char(2) NOT NULL,
	"scenarioId" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question-templates" ADD CONSTRAINT "question-templates_scenarioId_scenarios_id_fk" FOREIGN KEY ("scenarioId") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
