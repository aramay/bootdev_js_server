ALTER TABLE "users" ADD COLUMN "hash_password" varchar DEFAULT 'unset' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "hashPassword";