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

    let emailSent = false;
    let emailError: string | null = null;
    try {
      const transporter = nodemailer.createTransport({
        host: process.env["SMTP_HOST"] || "smtp.gmail.com",
        port: Number(process.env["SMTP_PORT"] || 587),
        secure: Number(process.env["SMTP_PORT"] || 587) === 465,
        auth: {
          user: process.env["SMTP_USER"] || "newpellet2022@gmail.com",
          pass: process.env["SMTP_PASS"] || ""
        }
      });

      if (process.env["SMTP_PASS"]) {
        await transporter.sendMail({
          from: `"Newpellet Offerte" <${process.env["SMTP_USER"] || "newpellet2022@gmail.com"}>`,
          bcc: emails.join(","), // send as BCC to protect privacy
          subject: subject,
          html: htmlBody
        });
        emailSent = true;
      } else {
        emailError = "Manca la 'Password per le app' di Google nelle variabili Netlify (SMTP_PASS). Attenzione: NON è la tua password di Netlify."; console.log("SMTP_PASS not set. Email not sent. Would have sent to:", emails);
      }
    } catch (e: any) {
      emailError = e.message || String(e);
      console.error("Email sending failed:", e);
    }

    return Response.json({ success: true , emailSent, emailError });
  } catch (error: any) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/send-newsletter",
};
