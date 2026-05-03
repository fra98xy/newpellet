import { db } from './db/index.js';
import { push_subscriptions } from './db/schema.js';

async function run() {
  const subs = await db.select().from(push_subscriptions);
  console.log('Subscriptions:', subs.length);
  console.log(subs);
}
run();
