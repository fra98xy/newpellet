import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { username, password } = await req.json();

    if (username === "FRANCESCO1998" && password === "Frpa98636532@") {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Set-Cookie": "admin_bypass=c3VwZXJfc2VjcmV0X2FkbWluX3Rva2VuXzIwMjY=; Path=/; HttpOnly; Max-Age=86400",
          "Content-Type": "application/json"
        }
      });
    }

    return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/admin-login",
};
