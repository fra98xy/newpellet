import nodemailer from "nodemailer";

export default async () => {
  try {
    const pass = process.env["SMTP_PASS"];
    if (!pass) {
      return Response.json({ success: false, error: "SMTP_PASS is not set in environment variables" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env["SMTP_HOST"] || "smtp.gmail.com",
      port: Number(process.env["SMTP_PORT"] || 587),
      secure: Number(process.env["SMTP_PORT"] || 587) === 465,
      auth: {
        user: process.env["SMTP_USER"] || "newpellet2022@gmail.com",
        pass: pass
      }
    });

    const verify = await transporter.verify();
    return Response.json({ success: true, verify, user: process.env["SMTP_USER"] || "newpellet2022@gmail.com" });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message });
  }
}

export const config = {
  path: "/api/test-smtp",
};
