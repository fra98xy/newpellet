import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { newsletter_subscribers } from "../../db/schema.js";
import nodemailer from "nodemailer";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { email } = await req.json();
    if (!email) return new Response("Missing email", { status: 400 });

    await db.insert(newsletter_subscribers).values({ email }).onConflictDoNothing();
    
    // Send welcome email
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
          from: `"Newpellet" <${Netlify.env.get("SMTP_USER") || "newpellet2022@gmail.com"}>`,
          to: email,
          subject: "Iscrizione Newsletter Newpellet",
          html: `<p>Ciao!</p>
                 <p>Grazie per esserti iscritto alla nostra newsletter.</p>
                 <p>Riceverai presto le nostre migliori offerte e aggiornamenti.</p>
                 <br>
                 <p>A presto,<br>Il team di Newpellet</p>`
        });
      } else {
        console.log("SMTP_PASS not set. Newsletter welcome email not sent.");
      }
    } catch (e) {
      console.error("Newsletter welcome email sending failed:", e);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/newsletter",
};
