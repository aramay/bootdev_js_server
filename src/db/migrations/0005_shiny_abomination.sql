ALTER TABLE "users" ADD COLUMN "has_password" varchar DEFAULT 'unset' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "hash_password";