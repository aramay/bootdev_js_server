ALTER TABLE "users" ADD COLUMN "hashPassword" varchar DEFAULT 'unset' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "hash_password";