import { drizzle } from "drizzle-orm/netlify-db";
import * as schema from "./schema.js";

const dbUrl = process.env.NETLIFY_DB_URL?.replace(/^postgres:\/\//, 'postgresql://');

export const db = drizzle({ schema, connectionString: dbUrl });
