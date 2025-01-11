CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"language" char(2) NOT NULL,
	"createDate" timestamp DEFAULT now() NOT NULL,
	"updateDate" timestamp DEFAULT now() NOT NULL,
	"deleteDate" timestamp,
	"themeId" integer,
	"themeName" varchar(200) NOT NULL,
	"scenarioId" integer,
	"scenarioName" varchar(200) NOT NULL,
	"videoJobId" varchar(36),
	"questions" json DEFAULT '[]'::json NOT NULL,
	"soundUrl" varchar(200),
	"soundVolume" integer,
	"soundBeginTime" integer
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_themeId_themes_id_fk" FOREIGN KEY ("themeId") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_scenarioId_scenarios_id_fk" FOREIGN KEY ("scenarioId") REFERENCES "public"."scenarios"("id") ON DELETE set null ON UPDATE no action;