import type { Config } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { db } from "../../db/index.js";
import { newsletter_subscribers } from "../../db/schema.js";
import { count } from "drizzle-orm";

export default async (req: Request) => {
  const cookie = req.headers.get("cookie");
  const hasBypass = cookie?.includes("admin_bypass=c3VwZXJfc2VjcmV0X2FkbWluX3Rva2VuXzIwMjY=");

  const user = await getUser();
  
  if (!hasBypass && (!user || !user.app_metadata?.roles?.includes('admin'))) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const totalSubscribersResult = await db.select({ value: count() }).from(newsletter_subscribers);
    return Response.json({
      totalSubscribers: totalSubscribersResult[0].value,
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/admin-live-count",
};
