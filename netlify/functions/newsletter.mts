import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { newsletter_subscribers } from "../../db/schema.js";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { email, name, surname, address } = await req.json();
    if (!email) return new Response("Missing email", { status: 400 });

    await db.insert(newsletter_subscribers).values({ email, name, surname, address }).onConflictDoNothing();
    
    const backgroundUrl = new URL("/.netlify/functions/send-newsletter-welcome-email-background", req.url).toString();
    fetch(backgroundUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    }).catch(e => console.error("Failed to invoke newsletter welcome background function", e));

    return Response.json({ success: true , emailSent: true, emailError: null });
  } catch (error: any) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/newsletter",
};
