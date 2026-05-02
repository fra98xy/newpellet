import type { Config } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { db } from "../../db/index.js";
import { newsletter_subscribers } from "../../db/schema.js";
import nodemailer from "nodemailer";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const user = await getUser();
  if (!user || !user.app_metadata?.roles?.includes('admin')) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { subject, image, link, body } = await req.json();
    const subscribers = await db.select({ email: newsletter_subscribers.email }).from(newsletter_subscribers);

    if (subscribers.length === 0) {
      return Response.json({ success: true, message: "No subscribers found." });
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

    try {
      const transporter = nodemailer.createTransport({
        host: Netlify.env.get("SMTP_HOST") || "smtp.gmail.com",
        port: Number(Netlify.env.get("SMTP_PORT") || 465),
        secure: true,
        auth: {
          user: Netlify.env.get("SMTP_USER") || "newpellet2022@gmail.com",
          pass: Netlify.env.get("SMTP_PASS") || ""
        }
      });

      if (Netlify.env.get("SMTP_PASS")) {
        await transporter.sendMail({
          from: `"Newpellet Offerte" <${Netlify.env.get("SMTP_USER") || "newpellet2022@gmail.com"}>`,
          bcc: emails.join(","), // send as BCC to protect privacy
          subject: subject,
          html: htmlBody
        });
      } else {
        console.log("SMTP_PASS not set. Email not sent. Would have sent to:", emails);
      }
    } catch(e) {
      console.error("Email sending failed:", e);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/send-newsletter",
};
