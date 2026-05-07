import type { Context } from "@netlify/functions";
import nodemailer from "nodemailer";

export default async (req: Request, context: Context) => {
  const { email } = await req.json();

  try {
    const smtpUser = Netlify.env.get("SMTP_USER") || "newpellet2022@gmail.com";
    const smtpPass = Netlify.env.get("SMTP_PASS") || "";

    if (!smtpPass) {
      console.log("SMTP_PASS not set. Newsletter welcome email not sent.");
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
      from: `"Newpellet" <${smtpUser}>`,
      to: email,
      subject: "Iscrizione Newsletter Newpellet",
      html: `<p>Ciao!</p>
             <p>Grazie per esserti iscritto alla nostra newsletter.</p>
             <p>Riceverai presto le nostre migliori offerte e aggiornamenti.</p>
             <br>
             <p>A presto,<br>Il team di Newpellet</p>`
    });

    console.log(`Newsletter welcome email sent to ${email}`);
  } catch (e: any) {
    console.error("Newsletter welcome email sending failed in background function:", e);
  }
};
