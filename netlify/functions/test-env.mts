export default async () => {
  return new Response(JSON.stringify({ 
    netlifyDbUrl: process.env.NETLIFY_DB_URL,
    databaseUrl: process.env.DATABASE_URL
  }));
}
