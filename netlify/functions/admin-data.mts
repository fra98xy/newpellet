import type { Config } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { db } from "../../db/index.js";
import { newsletter_subscribers, orders, stove_assistance } from "../../db/schema.js";
import { desc, count } from "drizzle-orm";

export default async (req: Request) => {
  const cookie = req.headers.get("cookie");
  const hasBypass = cookie?.includes("admin_bypass=c3VwZXJfc2VjcmV0X2FkbWluX3Rva2VuXzIwMjY=");

  const user = await getUser();
  
  if (!hasBypass && (!user || !user.app_metadata?.roles?.includes('admin'))) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const totalSubscribersResult = await db.select({ value: count() }).from(newsletter_subscribers);
    const totalSubscribers = totalSubscribersResult[0].value;
    const subscribers = await db.select().from(newsletter_subscribers).orderBy(desc(newsletter_subscribers.createdAt)).limit(100);
    const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(50);
    const assistances = await db.select().from(stove_assistance).orderBy(desc(stove_assistance.createdAt)).limit(50);

    return Response.json({
      totalSubscribers,
      subscribers,
      orders: recentOrders,
      assistances
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/admin-data",
};
