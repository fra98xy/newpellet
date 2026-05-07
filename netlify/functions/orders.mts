import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { orders } from "../../db/schema.js";
import nodemailer from "nodemailer";

const STORE_EMAIL = "newpellet2022@gmail.com";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return escapeHtml(value);
  return number.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
}

function isValidEmail(value: unknown) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { name, phone, email, subscribe, address, notes, cart, cartDetails, total, isOver80 } = await req.json();

    const customerName = String(name || "").trim();
    const customerPhone = String(phone || "").trim();
    const customerEmail = String(email || "").trim();
    const customerAddress = String(address || "").trim();
    const customerNotes = String(notes || "").trim();
    const subjectCustomerName = customerName.replace(/[\r\n]+/g, " ").slice(0, 120);

    if (!customerName || !customerPhone || !customerAddress || !Array.isArray(cart) || cart.length === 0) {
      return new Response("Missing or invalid order fields", { status: 400 });
    }

    const [order] = await db.insert(orders).values({
      customerName,
      customerEmail: customerEmail || null,
      customerPhone,
      customerAddress,
      customerNotes,
      cartData: cart,
      totalPrice: total,
      distanceOver80km: isOver80
    }).returning();

    // Handle optional newsletter subscription
    if (subscribe && customerEmail && isValidEmail(customerEmail)) {
      try {
        // We need to import newsletter_subscribers if we didn't already, but we can also use fetch to our own endpoint or just insert directly.
        // For simplicity, we can fetch to the existing /api/newsletter endpoint.
        await fetch(new URL("/api/newsletter", req.url).toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: customerEmail,
            name: customerName,
            surname: "", // We only have full name from the order
            address: customerAddress
          })
        });
      } catch (err) {
        console.error("Failed to subscribe user to newsletter during order:", err);
      }
    }

    // Create Bolla di Trasporto HTML
    const orderDate = new Date().toLocaleDateString('it-IT');
    const orderId = order.id.toString().padStart(6, '0');
    
    let itemsHtml = '';
    let totalQty = 0;
    if (Array.isArray(cartDetails)) {
      cartDetails.forEach(item => {
        const qty = Number(item.qty) || 0;
        totalQty += qty;
        itemsHtml += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${escapeHtml(item.name)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${escapeHtml(qty)} ${escapeHtml(item.unit)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.price)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.total)}</td>
          </tr>
        `;
      });
    }

    if (!itemsHtml) {
      itemsHtml = `
        <tr>
          <td colspan="4" style="padding: 10px; border-bottom: 1px solid #ddd;">Dettagli prodotti presenti nell'ordine salvato.</td>
        </tr>
      `;
      totalQty = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0) : 0;
    }

    let totalPallets = 0;
    if (Array.isArray(cartDetails)) {
      cartDetails.forEach(item => {
        const qty = Number(item.qty) || 0;
        if (String(item.unit).includes("bancale")) {
          totalPallets += qty;
        } else {
          totalPallets += (qty / 70);
        }
      });
    } else {
      totalPallets = totalQty; // Fallback
    }

    const shippingCost = isOver80 ? (Math.ceil(totalPallets) * 15) : 0;
    if (isOver80) {
      itemsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;" colspan="2">Spedizione (Oltre 80km)</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">-</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">€ ${shippingCost.toFixed(2).replace('.', ',')}</td>
        </tr>
      `;
    }

    const bollaHtml = `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <title>Bolla di Trasporto - Ordine #${orderId}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #17351f; padding-bottom: 20px; }
          .header h1 { color: #17351f; margin: 0; }
          .company-details, .customer-details { width: 48%; }
          .details-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background-color: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .total-row { font-weight: bold; font-size: 1.2em; }
          .footer { text-align: center; margin-top: 50px; font-size: 0.9em; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1>Newpellet</h1>
              <p>Bolla di Trasporto / Conferma d'Ordine</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Data:</strong> ${orderDate}</p>
              <p><strong>Numero Ordine:</strong> #${orderId}</p>
            </div>
          </div>
          
          <div class="details-section">
            <div class="company-details">
              <h3>Mittente</h3>
              <p>
                <strong>Newpellet</strong><br>
                Cona (VE)<br>
                Email: ${STORE_EMAIL}
              </p>
            </div>
            <div class="customer-details">
              <h3>Destinatario</h3>
              <p>
                <strong>${escapeHtml(customerName)}</strong><br>
                ${escapeHtml(customerAddress)}<br>
                Telefono: ${escapeHtml(customerPhone)}<br>
                ${customerEmail ? `Email: ${escapeHtml(customerEmail)}<br>` : ''}
                Note: ${escapeHtml(customerNotes || 'Nessuna nota')}
              </p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Descrizione</th>
                <th style="text-align: center;">Quantità</th>
                <th style="text-align: right;">Prezzo Unit.</th>
                <th style="text-align: right;">Importo</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="3" style="padding: 15px 10px; text-align: right;">Totale Ordine</td>
                <td style="padding: 15px 10px; text-align: right;">${escapeHtml(total)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Grazie per aver scelto Newpellet!</p>
            <p>Il presente documento ha valenza di bolla di trasporto e riepilogo ordine.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send emails
    let emailSent = false;
    let ownerEmailSent = false;
    let customerEmailSent = false;
    let emailError: string | null = null;
    try {
      const smtpUser = process.env["SMTP_USER"] || STORE_EMAIL;
      const smtpPass = process.env["SMTP_PASS"] || "";
      const transporter = nodemailer.createTransport({
        host: process.env["SMTP_HOST"] || "smtp.gmail.com",
        port: Number(process.env["SMTP_PORT"] || 587),
        secure: Number(process.env["SMTP_PORT"] || 587) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      if (smtpPass) {
        const attachment = {
          filename: `Bolla_Trasporto_Ordine_${orderId}.html`,
          content: bollaHtml,
          contentType: "text/html"
        };

        await transporter.sendMail({
          from: `"Newpellet Ordini" <${smtpUser}>`,
          to: STORE_EMAIL,
          replyTo: customerEmail || smtpUser,
          subject: `Nuovo ordine #${orderId} - ${subjectCustomerName}`,
          html: `<p>Nuovo ordine ricevuto dal sito Newpellet.</p>
                 <ul>
                   <li><strong>Cliente:</strong> ${escapeHtml(customerName)}</li>
                   <li><strong>Telefono:</strong> ${escapeHtml(customerPhone)}</li>
                   ${customerEmail ? `<li><strong>Email:</strong> ${escapeHtml(customerEmail)}</li>` : ''}
                   <li><strong>Indirizzo:</strong> ${escapeHtml(customerAddress)}</li>
                   <li><strong>Totale indicativo:</strong> ${escapeHtml(total)}</li>
                   <li><strong>Distanza oltre 80 km:</strong> ${isOver80 ? "Sì" : "No"}</li>
                   <li><strong>Note:</strong> ${escapeHtml(customerNotes || "Nessuna nota")}</li>
                 </ul>
                 <p>La bolla di trasporto / conferma ordine è allegata.</p>`,
          attachments: [attachment]
        });
        ownerEmailSent = true;

        if (customerEmail) {
          await transporter.sendMail({
            from: `"Newpellet" <${smtpUser}>`,
            to: customerEmail,
            subject: `Conferma ordine #${orderId} - Newpellet`,
            html: `<p>Gentile ${escapeHtml(customerName)},</p>
                   <p>grazie per il tuo ordine. Newpellet ha ricevuto la richiesta e confermerà disponibilità e consegna.</p>
                   <p>In allegato trovi la bolla di trasporto con il riepilogo dell'ordine.</p>
                   <ul>
                     <li><strong>Totale indicativo:</strong> ${escapeHtml(total)}</li>
                     <li><strong>Indirizzo:</strong> ${escapeHtml(customerAddress)}</li>
                   </ul>
                   <p>A presto,<br>Newpellet</p>`,
            attachments: [attachment]
          });
          customerEmailSent = true;
        }
        emailSent = ownerEmailSent && (!customerEmail || customerEmailSent);
      } else {
        emailError = "Manca la 'Password per le app' di Google nelle variabili Netlify (SMTP_PASS). Attenzione: NON è la tua password di Netlify né la password normale di Gmail.";
        console.log("SMTP_PASS not set. Order emails not sent.");
      }
    } catch (e: any) {
      emailError = e.message || String(e);
      console.error("Email sending failed:", e);
    }

    return Response.json({ success: true, order, emailSent, ownerEmailSent, customerEmailSent, emailError });
  } catch (error: any) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/orders",
};
