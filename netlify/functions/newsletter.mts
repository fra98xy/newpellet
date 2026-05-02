import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { newsletter_subscribers } from "../../db/schema.js";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { email } = await req.json();
    if (!email) return new Response("Missing email", { status: 400 });

    await db.insert(newsletter_subscribers).values({ email }).onConflictDoNothing();
    
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/newsletter",
};
