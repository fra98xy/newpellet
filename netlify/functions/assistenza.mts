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
          from: `"Newpellet Assistenza" <${Netlify.env.get("SMTP_USER") || "newpellet2022@gmail.com"}>`,
          to: Netlify.env.get("SMTP_USER") || "newpellet2022@gmail.com",
          subject: `Nuova richiesta di assistenza da ${name}`,
          html: `<p>Hai ricevuto una nuova richiesta di assistenza per stufa.</p>
                 <ul>
                   <li><strong>Nome:</strong> ${name}</li>
                   <li><strong>Telefono:</strong> ${phone}</li>
                   <li><strong>Problema:</strong> ${problem}</li>
                 </ul>`
        });
      } else {
        console.log("SMTP_PASS not set. Assistance email not sent.");
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
  path: "/api/assistenza",
};
