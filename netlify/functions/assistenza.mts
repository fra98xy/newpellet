import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { stove_assistance } from "../../db/schema.js";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { name, phone, problem } = await req.json();

    if (!name || !phone || !problem) return new Response("Missing fields", { status: 400 });

    await db.insert(stove_assistance).values({
      name,
      phone,
      problem
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/assistenza",
};
