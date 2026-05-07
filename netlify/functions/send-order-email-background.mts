import type { Context } from "@netlify/functions";
import nodemailer from "nodemailer";

const STORE_EMAIL = "newpellet2022@gmail.com";

export default async (req: Request, context: Context) => {
  const payload = await req.json();
  const { orderId, customerName, customerEmail, customerAddress, total, isOver80, customerNotes, subjectCustomerName, bollaHtml } = payload;

  try {
    const smtpUser = Netlify.env.get("SMTP_USER") || STORE_EMAIL;
    const smtpPass = Netlify.env.get("SMTP_PASS") || "";
    
    if (!smtpPass) {
      console.log("SMTP_PASS not set. Order emails not sent.");
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

    const attachment = {
      filename: `Bolla_Trasporto_Ordine_${orderId}.html`,
      content: bollaHtml,
      contentType: "text/html"
    };

    await transporter.sendMail({
      from: `"Newpellet Ordini" <${smtpUser}>`,
      to: STORE_EMAIL,
      replyTo: customerEmail,
      subject: `Nuovo ordine #${orderId} - ${subjectCustomerName}`,
      html: `<p>Nuovo ordine ricevuto dal sito Newpellet.</p>
             <ul>
               <li><strong>Cliente:</strong> ${customerName}</li>
               <li><strong>Email:</strong> ${customerEmail}</li>
               <li><strong>Indirizzo:</strong> ${customerAddress}</li>
               <li><strong>Totale indicativo:</strong> ${total}</li>
               <li><strong>Distanza oltre 80 km:</strong> ${isOver80 ? "Sì" : "No"}</li>
               <li><strong>Note:</strong> ${customerNotes || "Nessuna nota"}</li>
             </ul>
             <p>La bolla di trasporto / conferma ordine è allegata.</p>`,
      attachments: [attachment]
    });

    await transporter.sendMail({
      from: `"Newpellet" <${smtpUser}>`,
      to: customerEmail,
      subject: `Conferma ordine #${orderId} - Newpellet`,
      html: `<p>Gentile ${customerName},</p>
             <p>grazie per il tuo ordine. Newpellet ha ricevuto la richiesta e confermerà disponibilità e consegna.</p>
             <p>In allegato trovi la bolla di trasporto con il riepilogo dell'ordine.</p>
             <ul>
               <li><strong>Totale indicativo:</strong> ${total}</li>
               <li><strong>Indirizzo:</strong> ${customerAddress}</li>
             </ul>
             <p>A presto,<br>Newpellet</p>`,
      attachments: [attachment]
    });

    console.log(`Order emails sent successfully for order ${orderId}`);
  } catch (e: any) {
    console.error("Email sending failed in background function:", e);
  }
};
