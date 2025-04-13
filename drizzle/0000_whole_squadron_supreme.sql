CREATE TABLE "invite_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" char(20) NOT NULL,
	"createDate" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"value" char(2) PRIMARY KEY NOT NULL,
	"label" varchar(40) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"language" char(2) NOT NULL,
	"createDate" timestamp DEFAULT now() NOT NULL,
	"updateDate" timestamp DEFAULT now() NOT NULL,
	"deleteDate" timestamp,
	"themeId" integer,
	"scenarioId" integer,
	"videoJobId" varchar(36),
	"data" json NOT NULL,
	"collaborationCode" varchar(6),
	"collaborationCodeExpiresAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" varchar(280) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"languageCode" char(2) NOT NULL,
	"scenarioId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"isDefault" boolean DEFAULT false,
	"names" json NOT NULL,
	"descriptions" json NOT NULL,
	"userId" integer,
	"themeId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"isDefault" boolean DEFAULT false,
	"imageUrl" varchar(2000),
	"names" json NOT NULL,
	"userId" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(150) NOT NULL,
	"name" varchar(150) NOT NULL,
	"passwordHash" char(100),
	"verificationHash" char(100),
	"accountRegistration" smallint DEFAULT 0 NOT NULL,
	"role" varchar(20) DEFAULT 'teacher' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_themeId_themes_id_fk" FOREIGN KEY ("themeId") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_scenarioId_scenarios_id_fk" FOREIGN KEY ("scenarioId") REFERENCES "public"."scenarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_scenarioId_scenarios_id_fk" FOREIGN KEY ("scenarioId") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_themeId_themes_id_fk" FOREIGN KEY ("themeId") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "themes" ADD CONSTRAINT "themes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;