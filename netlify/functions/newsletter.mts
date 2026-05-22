import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { newsletter_subscribers } from "../../db/schema.js";
import nodemailer from "nodemailer";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { email, name, surname, address, phone } = await req.json();
    if (!email) return new Response("Missing email", { status: 400 });

    const subscriberPhone = String(phone || "").trim();

    await db.insert(newsletter_subscribers).values({
      email,
      name,
      surname,
      address,
      phone: subscriberPhone || null
    }).onConflictDoNothing();
    
    // Send welcome email
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
          from: `"Newpellet" <${process.env["SMTP_USER"] || "newpellet2022@gmail.com"}>`,
          to: email,
          subject: "Iscrizione Newsletter Newpellet",
          html: `<p>Ciao!</p>
                 <p>Grazie per esserti iscritto alla nostra newsletter.</p>
                 <p>Riceverai presto le nostre migliori offerte e aggiornamenti.</p>
                 <br>
                 <p>A presto,<br>Il team di Newpellet</p>`
        });
        emailSent = true;
      } else {
        emailError = "SMTP_PASS non configurato nelle variabili d'ambiente di Netlify.";
        console.log("SMTP_PASS not set. Newsletter welcome email not sent.");
      }
    } catch (e: any) {
      emailError = e.message || String(e);
      console.error("Newsletter welcome email sending failed:", e);
    }

    // Send WhatsApp confirmation via Green API (if configured)
    let whatsappSent = false;
    let whatsappError: string | null = null;
    const greenApiIdInstance = process.env["GREEN_API_ID_INSTANCE"];
    const greenApiApiToken = process.env["GREEN_API_API_TOKEN"];
    const greenApiApiUrl = process.env["GREEN_API_API_URL"] || "https://api.green-api.com";

    if (greenApiIdInstance && greenApiApiToken && subscriberPhone) {
      try {
        let cleanedPhone = subscriberPhone.replace(/\D/g, "");
        if (cleanedPhone.startsWith("00")) {
          cleanedPhone = cleanedPhone.slice(2);
        }
        if (cleanedPhone.length === 10 && cleanedPhone.startsWith("3")) {
          cleanedPhone = "39" + cleanedPhone;
        } else if (cleanedPhone.length === 9 && cleanedPhone.startsWith("3")) {
          cleanedPhone = "39" + cleanedPhone;
        }

        const chatId = `${cleanedPhone}@c.us`;
        const messageText = `Grazie per esserti iscritto alla nostra newsletter a breve o nei primi mesi riceverai gli aggiornamenti`;

        const sendUrl = `${greenApiApiUrl}/waInstance${greenApiIdInstance}/sendMessage/${greenApiApiToken}`;
        const response = await fetch(sendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId,
            message: messageText
          })
        });

        if (response.ok) {
          whatsappSent = true;
          console.log(`Newsletter WhatsApp message sent successfully via Green API to ${chatId}`);
        } else {
          const errorText = await response.text();
          whatsappError = `Errore Green API: ${errorText} (Status: ${response.status})`;
          console.error(`Failed to send newsletter WhatsApp via Green API: ${whatsappError}`);
        }
      } catch (waErr: any) {
        whatsappError = waErr.message || String(waErr);
        console.error("Newsletter WhatsApp sending failed:", waErr);
      }
    }

    return Response.json({ success: true , emailSent, emailError, whatsappSent, whatsappError });
  } catch (error: any) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/newsletter",
};
