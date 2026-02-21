ALTER TABLE "feeds" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "feeds" DROP COLUMN "createdAt";