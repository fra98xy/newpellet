import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { stove_assistance } from "../../db/schema.js";
import nodemailer from "nodemailer";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { name, phone, problem } = await req.json();

    if (!name || !phone || !problem) return new Response("Missing fields", { status: 400 });

    await db.insert(stove_assistance).values({
      name,
      phone,
      problem
    });

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
          from: `"Newpellet Assistenza" <${process.env["SMTP_USER"] || "newpellet2022@gmail.com"}>`,
          to: process.env["SMTP_USER"] || "newpellet2022@gmail.com",
          subject: `Nuova richiesta di assistenza da ${name}`,
          html: `<p>Hai ricevuto una nuova richiesta di assistenza per stufa.</p>
                 <ul>
                   <li><strong>Nome:</strong> ${name}</li>
                   <li><strong>Telefono:</strong> ${phone}</li>
                   <li><strong>Problema:</strong> ${problem}</li>
                 </ul>`
        });
        emailSent = true;
      } else {
        emailError = "Manca la 'Password per le app' di Google nelle variabili Netlify (SMTP_PASS). Attenzione: NON è la tua password di Netlify.";
        console.log("SMTP_PASS not set. Assistance email not sent.");
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
  path: "/api/assistenza",
};
