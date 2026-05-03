import { db } from "./db/index.js";
import { push_subscriptions } from "./db/schema.js";

async function main() {
  const subs = await db.select().from(push_subscriptions);
  console.log("Subscriptions:", subs);
}

main().catch(console.error);
