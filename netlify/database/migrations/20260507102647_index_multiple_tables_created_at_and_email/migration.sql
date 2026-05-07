CREATE INDEX "newsletter_subscribers_created_at_idx" ON "newsletter_subscribers" ("created_at");--> statement-breakpoint
CREATE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" ("email");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" ("created_at");--> statement-breakpoint
CREATE INDEX "orders_customer_email_idx" ON "orders" ("customer_email");--> statement-breakpoint
CREATE INDEX "stove_assistance_created_at_idx" ON "stove_assistance" ("created_at");