import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const newsletter_subscribers = pgTable("newsletter_subscribers", {
  id: serial().primaryKey(),
  email: text().notNull().unique(),
  name: text(),
  surname: text(),
  address: text(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial().primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerAddress: text("customer_address").notNull(),
  customerNotes: text("customer_notes"),
  cartData: jsonb("cart_data").notNull(),
  totalPrice: text("total_price").notNull(),
  distanceOver80km: boolean("distance_over_80km").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stove_assistance = pgTable("stove_assistance", {
  id: serial().primaryKey(),
  name: text().notNull(),
  phone: text().notNull(),
  problem: text().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
