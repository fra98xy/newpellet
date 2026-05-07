import type { Context } from "@netlify/functions";
import nodemailer from "nodemailer";

export default async (req: Request, context: Context) => {
  const { subject, htmlBody, emails } = await req.json();

  try {
    const smtpUser = Netlify.env.get("SMTP_USER") || "newpellet2022@gmail.com";
    const smtpPass = Netlify.env.get("SMTP_PASS") || "";

    if (!smtpPass) {
      console.log("SMTP_PASS not set. Newsletter email not sent. Would have sent to:", emails);
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
      from: `"Newpellet Offerte" <${smtpUser}>`,
      bcc: emails.join(","), // send as BCC to protect privacy
      subject: subject,
      html: htmlBody
    });

    console.log(`Newsletter sent successfully to ${emails.length} subscribers`);
  } catch (e: any) {
    console.error("Newsletter email sending failed in background function:", e);
  }
};
