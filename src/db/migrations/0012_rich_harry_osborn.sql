ALTER TABLE "refresh_tokens" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "expires_at" SET DEFAULT CURRENT_DATE + interval '60 days';--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "expires_at" DROP NOT NULL;