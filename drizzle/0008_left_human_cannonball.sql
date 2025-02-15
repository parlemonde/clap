CREATE TABLE "invite_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" char(20) NOT NULL,
	"createDate" timestamp DEFAULT now() NOT NULL
);
