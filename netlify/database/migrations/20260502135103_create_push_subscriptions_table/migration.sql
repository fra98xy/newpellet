CREATE TABLE "push_subscriptions" (
	"id" serial PRIMARY KEY,
	"endpoint" text NOT NULL UNIQUE,
	"keys" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
