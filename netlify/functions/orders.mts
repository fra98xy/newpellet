import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { orders } from "../../db/schema.js";
import nodemailer from "nodemailer";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { name, email, address, notes, cart, cartDetails, total, isOver80, rawTotal } = await req.json();

    const [order] = await db.insert(orders).values({
      customerName: name,
      customerEmail: email,
      customerAddress: address,
      customerNotes: notes,
      cartData: cart,
      totalPrice: total,
      distanceOver80km: isOver80
    }).returning();

    // Create Bolla di Trasporto HTML
    const orderDate = new Date().toLocaleDateString('it-IT');
    const orderId = order.id.toString().padStart(6, '0');
    
    let itemsHtml = '';
    let totalQty = 0;
    if (cartDetails && Array.isArray(cartDetails)) {
      cartDetails.forEach(item => {
        totalQty += item.qty;
        itemsHtml += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty} ${item.unit}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">€ ${item.price.toFixed(2).replace('.', ',')}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">€ ${item.total.toFixed(2).replace('.', ',')}</td>
          </tr>
        `;
      });
    }

    const shippingCost = isOver80 ? (totalQty * 15) : 0;
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
                Email: newpellet2022@gmail.com
              </p>
            </div>
            <div class="customer-details">
              <h3>Destinatario</h3>
              <p>
                <strong>${name}</strong><br>
                ${address}<br>
                Email: ${email || 'Non specificata'}<br>
                Note: ${notes || 'Nessuna nota'}
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
                <td style="padding: 15px 10px; text-align: right;">${total}</td>
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
        const mailOptions = {
          from: `"Newpellet Orders" <${Netlify.env.get("SMTP_USER") || "newpellet2022@gmail.com"}>`,
          to: ["newpellet2022@gmail.com", email].filter(Boolean).join(", "),
          subject: `Conferma Ordine #${orderId} - Newpellet`,
          html: `<p>Gentile ${name},</p>
                 <p>Grazie per il tuo ordine! Abbiamo ricevuto la tua richiesta e stiamo elaborando la spedizione.</p>
                 <p>In allegato trovi la bolla di trasporto con il riepilogo del tuo ordine.</p>
                 <br>
                 <p>Dettagli rapidi:</p>
                 <ul>
                   <li><strong>Totale indicativo:</strong> ${total}</li>
                   <li><strong>Indirizzo:</strong> ${address}</li>
                 </ul>
                 <p>A presto,<br>Il team di Newpellet</p>`,
          attachments: [
            {
              filename: `Bolla_Trasporto_Ordine_${orderId}.html`,
              content: bollaHtml,
              contentType: 'text/html'
            }
          ]
        };
        await transporter.sendMail(mailOptions);
      } else {
        console.log("SMTP_PASS not set. Email not sent. Order details:", order);
      }
    } catch(e) {
      console.error("Email sending failed:", e);
    }

    return Response.json({ success: true, order });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/orders",
};
