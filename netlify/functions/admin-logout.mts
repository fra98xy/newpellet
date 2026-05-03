import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Set-Cookie": "admin_bypass=; Path=/; HttpOnly; Max-Age=0",
      "Content-Type": "application/json"
    }
  });
};

export const config: Config = {
  path: "/api/admin-logout",
};
