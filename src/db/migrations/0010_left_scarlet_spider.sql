ALTER TABLE "refresh-tokens" RENAME TO "refresh_tokens";--> statement-breakpoint
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh-tokens_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "expires_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "revoked_at" timestamp;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;