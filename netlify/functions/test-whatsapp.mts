import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const idInstance = process.env["GREEN_API_ID_INSTANCE"];
  const apiTokenInstance = process.env["GREEN_API_API_TOKEN"];
  const apiUrl = process.env["GREEN_API_API_URL"] || "https://api.green-api.com";

  if (!idInstance || !apiTokenInstance) {
    return Response.json({
      success: false,
      error: "Mancano le credenziali GREEN_API_ID_INSTANCE e/o GREEN_API_API_TOKEN nelle variabili d'ambiente di Netlify."
    });
  }

  if (req.method === "POST") {
    try {
      const { phone, message } = await req.json();
      if (!phone || !message) {
        return Response.json({ success: false, error: "Telefono e messaggio sono richiesti." }, { status: 400 });
      }

      // Format phone number
      let cleaned = phone.replace(/\D/g, "");
      if (cleaned.startsWith("00")) {
        cleaned = cleaned.slice(2);
      }
      if (cleaned.length === 10 && cleaned.startsWith("3")) {
        cleaned = "39" + cleaned;
      } else if (cleaned.length === 9 && cleaned.startsWith("3")) {
        cleaned = "39" + cleaned;
      }

      const chatId = `${cleaned}@c.us`;

      const sendUrl = `${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
      const response = await fetch(sendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          message
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return Response.json({ success: false, error: `Errore Green API: ${errorText} (Status: ${response.status})` });
      }

      const data = await response.json();
      return Response.json({ success: true, data });
    } catch (e: any) {
      return Response.json({ success: false, error: e.message || String(e) });
    }
  }

  // GET request - Check status
  try {
    const statusUrl = `${apiUrl}/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`;
    const response = await fetch(statusUrl);
    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({
        success: false,
        error: `Errore Green API durante il controllo di stato: ${errorText} (Status: ${response.status})`
      });
    }

    const data = await response.json();
    return Response.json({
      success: true,
      idInstance,
      stateInstance: data.stateInstance
    });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message || String(e) });
  }
};

export const config: Config = {
  path: "/api/test-whatsapp",
};
