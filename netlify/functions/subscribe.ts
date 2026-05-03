import { db } from "../../db/index.js";
import { push_subscriptions } from "../../db/schema.js";
import { sql } from "drizzle-orm";

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  
  try {
    const subscription = await req.json();
    
    if (!subscription.endpoint || !subscription.keys) {
      return new Response('Invalid subscription', { status: 400 });
    }

    await db.insert(push_subscriptions)
      .values({ 
        endpoint: subscription.endpoint, 
        keys: subscription.keys 
      })
      .onConflictDoUpdate({
        target: push_subscriptions.endpoint,
        set: { keys: subscription.keys }
      });
      
    const result = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(push_subscriptions);
    const total = result[0]?.count || 0;
    
    return new Response(JSON.stringify({ ok: true, total }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
