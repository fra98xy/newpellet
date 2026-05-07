import type { Context } from "@netlify/functions";
import nodemailer from "nodemailer";

export default async (req: Request, context: Context) => {
  const { name, phone, problem } = await req.json();

  try {
    const smtpUser = Netlify.env.get("SMTP_USER") || "newpellet2022@gmail.com";
    const smtpPass = Netlify.env.get("SMTP_PASS") || "";

    if (!smtpPass) {
      console.log("SMTP_PASS not set. Assistance email not sent.");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: Netlify.env.get("SMTP_HOST") || "smtp.gmail.com",
      port: Number(Netlify.env.get("SMTP_PORT") || 587),
      secure: Number(Netlify.env.get("SMTP_PORT") || 587) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: `"Newpellet Assistenza" <${smtpUser}>`,
      to: smtpUser,
      subject: `Nuova richiesta di assistenza da ${name}`,
      html: `<p>Hai ricevuto una nuova richiesta di assistenza per stufa.</p>
             <ul>
               <li><strong>Nome:</strong> ${name}</li>
               <li><strong>Telefono:</strong> ${phone}</li>
               <li><strong>Problema:</strong> ${problem}</li>
             </ul>`
    });

    console.log(`Assistance email sent successfully for ${name}`);
  } catch (e: any) {
    console.error("Assistance email sending failed in background function:", e);
  }
};
