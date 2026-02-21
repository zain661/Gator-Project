CREATE TABLE "feed" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "feed_url_unique" UNIQUE("url")
);
--> statement-breakpoint
ALTER TABLE "feed" ADD CONSTRAINT "feed_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;