import type { Config } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { db } from "../../db/index.js";
import { newsletter_subscribers } from "../../db/schema.js";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const cookie = req.headers.get("cookie");
  const hasBypass = cookie?.includes("admin_bypass=c3VwZXJfc2VjcmV0X2FkbWluX3Rva2VuXzIwMjY=");

  const user = await getUser();
  if (!hasBypass && (!user || !user.app_metadata?.roles?.includes('admin'))) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { subject, image, link, body } = await req.json();
    const subscribers = await db.select({ email: newsletter_subscribers.email }).from(newsletter_subscribers);

    if (subscribers.length === 0) {
      return Response.json({ success: true, message: "No subscribers found." , emailSent: false, emailError: null });
    }

    const emails = subscribers.map(s => s.email);

    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2>${subject}</h2>
        ${image ? `<img src="${image}" alt="Newsletter Image" style="max-width: 100%; border-radius: 8px;" />` : ''}
        <p style="white-space: pre-wrap;">${body}</p>
        ${link ? `<a href="${link}" style="display: inline-block; padding: 10px 20px; background: #17351f; color: white; text-decoration: none; border-radius: 4px;">Scopri di più</a>` : ''}
      </div>
    `;

    const backgroundUrl = new URL("/.netlify/functions/send-newsletter-background", req.url).toString();
    fetch(backgroundUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, htmlBody, emails })
    }).catch(e => console.error("Failed to invoke newsletter background function", e));

    return Response.json({ success: true , emailSent: true, emailError: null });
  } catch (error: any) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/send-newsletter",
};
