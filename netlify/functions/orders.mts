import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { orders } from "../../db/schema.js";
import nodemailer from "nodemailer";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { name, address, notes, cart, total, isOver80 } = await req.json();

    const [order] = await db.insert(orders).values({
      customerName: name,
      customerAddress: address,
      customerNotes: notes,
      cartData: cart,
      totalPrice: total,
      distanceOver80km: isOver80
    }).returning();

    // Send email to newpellet2022@gmail.com
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
          from: '"Newpellet Orders" <noreply@newpellet.it>',
          to: "newpellet2022@gmail.com",
          subject: `Nuovo Ordine da ${name}`,
          text: `Nuovo ordine ricevuto!\n\nNome: ${name}\nIndirizzo: ${address}\nNote: ${notes}\nTotale: ${total}\nSpedizione oltre 80km: ${isOver80 ? "Si" : "No"}`
        });
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
