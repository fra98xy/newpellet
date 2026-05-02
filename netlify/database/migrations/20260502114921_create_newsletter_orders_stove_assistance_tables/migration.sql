CREATE TABLE "newsletter_subscribers" (
	"id" serial PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY,
	"customer_name" text NOT NULL,
	"customer_address" text NOT NULL,
	"customer_notes" text,
	"cart_data" jsonb NOT NULL,
	"total_price" text NOT NULL,
	"distance_over_80km" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stove_assistance" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"problem" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
